package backend.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import backend.auth.AuthResponse;

public class TaskResponse {
	private Long id;
	private String title;
	private String description;
	private Long projectId;
	private Long siteId;
	private AuthResponse assignedSiteEngineer;
	private AuthResponse leadWorker;
	private List<AuthResponse> assignedWorkers;
	private LocalDate startDate;
	private LocalDate dueDate;
	private TaskPriority priority;
	private TaskStatus status;
	private Integer progress;
	private Integer estimatedHours;
	private String notes;
	private Instant createdAt;

	public static TaskResponse from(Task task) {
		TaskResponse response = new TaskResponse();
		response.id = task.getId();
		response.title = task.getTitle();
		response.description = task.getDescription();
		response.projectId = task.getProject().getId();
		response.siteId = task.getSite().getId();
		response.assignedSiteEngineer = AuthResponse.from(task.getAssignedSiteEngineer());
		response.leadWorker = AuthResponse.from(task.getLeadWorker());
		response.assignedWorkers = task.getAssignedWorkers().stream().map(AuthResponse::from).toList();
		response.startDate = task.getStartDate();
		response.dueDate = task.getDueDate();
		response.priority = task.getPriority();
		response.status = task.getStatus();
		response.progress = task.getProgress();
		response.estimatedHours = task.getEstimatedHours();
		response.notes = task.getNotes();
		response.createdAt = task.getCreatedAt();
		return response;
	}

	public Long getId() { return id; }
	public String getTitle() { return title; }
	public String getDescription() { return description; }
	public Long getProjectId() { return projectId; }
	public Long getSiteId() { return siteId; }
	public AuthResponse getAssignedSiteEngineer() { return assignedSiteEngineer; }
	public AuthResponse getLeadWorker() { return leadWorker; }
	public List<AuthResponse> getAssignedWorkers() { return assignedWorkers; }
	public LocalDate getStartDate() { return startDate; }
	public LocalDate getDueDate() { return dueDate; }
	public TaskPriority getPriority() { return priority; }
	public TaskStatus getStatus() { return status; }
	public Integer getProgress() { return progress; }
	public Integer getEstimatedHours() { return estimatedHours; }
	public String getNotes() { return notes; }
	public Instant getCreatedAt() { return createdAt; }
}
