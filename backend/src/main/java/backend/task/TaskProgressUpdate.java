package backend.task;

import java.time.Instant;

import backend.auth.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "task_progress_updates")
public class TaskProgressUpdate {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "task_id", nullable = false)
	private Task task;

	@Column(nullable = false)
	private Integer progress;

	@Column(length = 2000)
	private String note;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "updated_by_id", nullable = false)
	private AppUser updatedBy;

	@Column(nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	protected TaskProgressUpdate() {
	}

	public TaskProgressUpdate(Task task, Integer progress, String note, AppUser updatedBy) {
		this.task = task;
		this.progress = progress;
		this.note = note;
		this.updatedBy = updatedBy;
	}

	public Long getId() { return id; }
	public Task getTask() { return task; }
	public Integer getProgress() { return progress; }
	public String getNote() { return note; }
	public AppUser getUpdatedBy() { return updatedBy; }
	public Instant getCreatedAt() { return createdAt; }
}
