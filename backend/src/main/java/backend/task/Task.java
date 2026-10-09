package backend.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

import backend.auth.AppUser;
import backend.project.Project;
import backend.project.Site;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tasks")
public class Task {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(length = 2000)
	private String description;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "site_id", nullable = false)
	private Site site;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_engineer_id", nullable = false)
	private AppUser assignedSiteEngineer;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lead_worker_id", nullable = false)
	private AppUser leadWorker;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
			name = "task_workers",
			joinColumns = @JoinColumn(name = "task_id"),
			inverseJoinColumns = @JoinColumn(name = "worker_id")
	)
	private Set<AppUser> assignedWorkers;

	@Column
	private LocalDate startDate;

	@Column
	private LocalDate dueDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TaskPriority priority;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TaskStatus status = TaskStatus.READY;

	@Column(nullable = false)
	private Integer progress = 0;

	@Column
	private Integer estimatedHours;

	@Column(length = 2000)
	private String notes;

	@Column
	private Instant actualStartTime;

	@Column
	private Instant submittedForReviewAt;

	@Column
	private Instant completedAt;

	@Column(nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	@Column
	private Instant updatedAt = Instant.now();

	protected Task() {
	}

	public Task(String title, String description, Project project, Site site, AppUser assignedSiteEngineer,
			AppUser leadWorker, Set<AppUser> assignedWorkers, LocalDate startDate, LocalDate dueDate,
			TaskPriority priority, Integer estimatedHours, String notes) {
		this.title = title;
		this.description = description;
		this.project = project;
		this.site = site;
		this.assignedSiteEngineer = assignedSiteEngineer;
		this.leadWorker = leadWorker;
		this.assignedWorkers = assignedWorkers;
		this.startDate = startDate;
		this.dueDate = dueDate;
		this.priority = priority;
		this.estimatedHours = estimatedHours;
		this.notes = notes;
	}

	public Long getId() { return id; }
	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public Project getProject() { return project; }
	public void setProject(Project project) { this.project = project; }
	public Site getSite() { return site; }
	public void setSite(Site site) { this.site = site; }
	public AppUser getAssignedSiteEngineer() { return assignedSiteEngineer; }
	public void setAssignedSiteEngineer(AppUser assignedSiteEngineer) { this.assignedSiteEngineer = assignedSiteEngineer; }
	public AppUser getLeadWorker() { return leadWorker; }
	public void setLeadWorker(AppUser leadWorker) { this.leadWorker = leadWorker; }
	public Set<AppUser> getAssignedWorkers() { return assignedWorkers; }
	public void setAssignedWorkers(Set<AppUser> assignedWorkers) { this.assignedWorkers = assignedWorkers; }
	public LocalDate getStartDate() { return startDate; }
	public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
	public LocalDate getDueDate() { return dueDate; }
	public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
	public TaskPriority getPriority() { return priority; }
	public void setPriority(TaskPriority priority) { this.priority = priority; }
	public TaskStatus getStatus() { return status; }
	public void setStatus(TaskStatus status) { this.status = status; }
	public Integer getProgress() { return progress; }
	public void setProgress(Integer progress) { this.progress = progress; }
	public Integer getEstimatedHours() { return estimatedHours; }
	public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
	public String getNotes() { return notes; }
	public void setNotes(String notes) { this.notes = notes; }
	public Instant getActualStartTime() { return actualStartTime; }
	public void setActualStartTime(Instant actualStartTime) { this.actualStartTime = actualStartTime; }
	public Instant getSubmittedForReviewAt() { return submittedForReviewAt; }
	public void setSubmittedForReviewAt(Instant submittedForReviewAt) { this.submittedForReviewAt = submittedForReviewAt; }
	public Instant getCompletedAt() { return completedAt; }
	public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
	public Instant getCreatedAt() { return createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
