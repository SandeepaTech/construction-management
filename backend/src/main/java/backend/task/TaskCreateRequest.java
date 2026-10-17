package backend.task;

import java.time.LocalDate;
import java.util.List;

public class TaskCreateRequest {
	private String title;
	private String description;
	private LocalDate startDate;
	private LocalDate dueDate;
	private TaskPriority priority;
	private Integer estimatedHours;
	private String notes;
	private Long leadWorkerId;
	private List<Long> assignedWorkerIds;

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public LocalDate getStartDate() { return startDate; }
	public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
	public LocalDate getDueDate() { return dueDate; }
	public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
	public TaskPriority getPriority() { return priority; }
	public void setPriority(TaskPriority priority) { this.priority = priority; }
	public Integer getEstimatedHours() { return estimatedHours; }
	public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
	public String getNotes() { return notes; }
	public void setNotes(String notes) { this.notes = notes; }
	public Long getLeadWorkerId() { return leadWorkerId; }
	public void setLeadWorkerId(Long leadWorkerId) { this.leadWorkerId = leadWorkerId; }
	public List<Long> getAssignedWorkerIds() { return assignedWorkerIds; }
	public void setAssignedWorkerIds(List<Long> assignedWorkerIds) { this.assignedWorkerIds = assignedWorkerIds; }
}
