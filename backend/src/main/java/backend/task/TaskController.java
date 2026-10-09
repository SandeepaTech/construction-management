package backend.task;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.auth.AuthResponse;
import backend.auth.UserRole;
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
@RequestMapping("/api/engineer")
public class TaskController {
	private final TaskRepository taskRepository;
	private final ProjectRepository projectRepository;
	private final AppUserRepository userRepository;
	private final NotificationService notificationService;

	public TaskController(TaskRepository taskRepository, ProjectRepository projectRepository,
			AppUserRepository userRepository, NotificationService notificationService) {
		this.taskRepository = taskRepository;
		this.projectRepository = projectRepository;
		this.userRepository = userRepository;
		this.notificationService = notificationService;
	}

	@GetMapping("/workers")
	public List<AuthResponse> listFieldWorkers(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		return userRepository.findAll().stream()
				.filter(u -> u.getRole() == UserRole.FIELD_WORKER)
				.map(AuthResponse::from)
				.toList();
	}

	@GetMapping("/projects/{projectId}/tasks")
	public List<TaskResponse> listProjectTasks(@PathVariable Long projectId, Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		AppUser user = userRepository.findByEmailIgnoreCase(authentication.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
		
		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

		if (project.getSite() == null || project.getSite().getAssignedEngineer() == null 
				|| !project.getSite().getAssignedEngineer().getId().equals(user.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view tasks for this project");
		}

		return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
				.map(TaskResponse::from)
				.toList();
	}

	@PostMapping("/projects/{projectId}/tasks")
	public TaskResponse createTask(@PathVariable Long projectId, @RequestBody TaskCreateRequest request, Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		AppUser user = userRepository.findByEmailIgnoreCase(authentication.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

		if (project.getSite() == null || project.getSite().getAssignedEngineer() == null 
				|| !project.getSite().getAssignedEngineer().getId().equals(user.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to create tasks for this project");
		}

		AppUser leadWorker = userRepository.findById(request.getLeadWorkerId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lead worker not found"));

		Set<AppUser> assignedWorkers = new HashSet<>();
		for (Long workerId : request.getAssignedWorkerIds()) {
			AppUser worker = userRepository.findById(workerId)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Worker not found: " + workerId));
			assignedWorkers.add(worker);
		}
		
		if (!assignedWorkers.contains(leadWorker)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lead worker must be one of the assigned workers");
		}

		Task task = new Task(
				request.getTitle(),
				request.getDescription(),
				project,
				project.getSite(),
				user, // Assigned Site Engineer
				leadWorker,
				assignedWorkers,
				request.getStartDate(),
				request.getDueDate(),
				request.getPriority(),
				request.getEstimatedHours(),
				request.getNotes()
		);

		Task savedTask = taskRepository.save(task);

		for (AppUser worker : assignedWorkers) {
			notificationService.notifyUser(worker, "New Task Assigned", 
					"You have been assigned to: " + task.getTitle() + " for project " + project.getName(), 
					"/worker/tasks/" + savedTask.getId());
		}

		return TaskResponse.from(savedTask);
	}
}
