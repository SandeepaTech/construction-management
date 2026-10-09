package backend.task;

import java.time.Instant;
import backend.auth.AuthResponse;

public class TaskProgressUpdateResponse {
	private Long id;
	private Integer progress;
	private String note;
	private AuthResponse updatedBy;
	private Instant createdAt;

	public static TaskProgressUpdateResponse from(TaskProgressUpdate update) {
		TaskProgressUpdateResponse res = new TaskProgressUpdateResponse();
		res.id = update.getId();
		res.progress = update.getProgress();
		res.note = update.getNote();
		res.updatedBy = AuthResponse.from(update.getUpdatedBy());
		res.createdAt = update.getCreatedAt();
		return res;
	}

	public Long getId() { return id; }
	public Integer getProgress() { return progress; }
	public String getNote() { return note; }
	public AuthResponse getUpdatedBy() { return updatedBy; }
	public Instant getCreatedAt() { return createdAt; }
}
