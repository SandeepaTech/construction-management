package backend.task;

import java.time.Instant;
import java.util.List;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.notification.NotificationService;
import backend.project.Project;
import backend.project.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/worker/tasks")
public class WorkerTaskController {
	private final TaskRepository taskRepository;
	private final TaskProgressUpdateRepository progressRepository;
	private final AppUserRepository userRepository;
	private final ProjectRepository projectRepository;
	private final NotificationService notificationService;

	public WorkerTaskController(TaskRepository taskRepository, TaskProgressUpdateRepository progressRepository,
			AppUserRepository userRepository, ProjectRepository projectRepository, NotificationService notificationService) {
		this.taskRepository = taskRepository;
		this.progressRepository = progressRepository;
		this.userRepository = userRepository;
		this.projectRepository = projectRepository;
		this.notificationService = notificationService;
	}

	private AppUser getAuthenticatedWorker(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		return userRepository.findByEmailIgnoreCase(authentication.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
	}

	@GetMapping
	public List<TaskResponse> getMyTasks(Authentication authentication) {
		AppUser worker = getAuthenticatedWorker(authentication);
		return taskRepository.findByAssignedWorkers_IdOrderByCreatedAtDesc(worker.getId())
				.stream().map(TaskResponse::from).toList();
	}

	@GetMapping("/{id}")
	public TaskResponse getTask(@PathVariable Long id, Authentication authentication) {
		AppUser worker = getAuthenticatedWorker(authentication);
		Task task = taskRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

		// Must be an assigned worker
		if (task.getAssignedWorkers().stream().noneMatch(w -> w.getId().equals(worker.getId()))) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not assigned to this task");
		}

		return TaskResponse.from(task);
	}

	@GetMapping("/{id}/progress")
	public List<TaskProgressUpdateResponse> getTaskProgress(@PathVariable Long id, Authentication authentication) {
		AppUser worker = getAuthenticatedWorker(authentication);
		Task task = taskRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

		if (task.getAssignedWorkers().stream().noneMatch(w -> w.getId().equals(worker.getId()))) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not assigned to this task");
		}

		return progressRepository.findByTaskIdOrderByCreatedAtDesc(id)
				.stream().map(TaskProgressUpdateResponse::from).toList();
	}

	@PostMapping("/{id}/start")
	public TaskResponse startTask(@PathVariable Long id, Authentication authentication) {
		AppUser worker = getAuthenticatedWorker(authentication);
		Task task = taskRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

		if (!task.getLeadWorker().getId().equals(worker.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the Lead Worker can start the task");
		}

		if (task.getStatus() != TaskStatus.READY) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task is already started or completed");
		}

		task.setStatus(TaskStatus.IN_PROGRESS);
		task.setActualStartTime(Instant.now());
		task.setUpdatedAt(Instant.now());

		Project project = task.getProject();
		if ("PLANNING".equals(project.getStatus())) {
			project.setStatus("ACTIVE");
			projectRepository.save(project);
		}

		Task savedTask = taskRepository.save(task);

		// Notify site engineer
		AppUser engineer = task.getAssignedSiteEngineer();
		if (engineer != null) {
			notificationService.notifyUser(engineer, "Task Started", 
					task.getTitle() + " has been started by " + worker.getFullName() + ".", 
					"/engineer/projects/" + project.getId());
		}

		return TaskResponse.from(savedTask);
	}

	@PostMapping("/{id}/progress")
	public TaskResponse updateProgress(@PathVariable Long id, @RequestBody TaskProgressRequest request, Authentication authentication) {
		AppUser worker = getAuthenticatedWorker(authentication);
		Task task = taskRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

		if (!task.getLeadWorker().getId().equals(worker.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the Lead Worker can update progress");
		}

		if (task.getStatus() == TaskStatus.READY) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update progress for a READY task. Start the task first.");
		}

		if (task.getStatus() == TaskStatus.COMPLETED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update progress for a COMPLETED task.");
		}

		int progress = request.getProgress() != null ? request.getProgress() : task.getProgress();
		if (progress < 0 || progress > 100) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress must be between 0 and 100");
		}

		task.setProgress(progress);
		task.setUpdatedAt(Instant.now());
		Task savedTask = taskRepository.save(task);

		TaskProgressUpdate history = new TaskProgressUpdate(savedTask, progress, request.getNote(), worker);
		progressRepository.save(history);

		return TaskResponse.from(savedTask);
	}
}
