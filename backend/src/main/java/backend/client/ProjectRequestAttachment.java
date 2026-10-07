package backend.client;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "project_request_attachments")
public class ProjectRequestAttachment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "project_request_id", nullable = false)
	private ProjectRequest projectRequest;

	@Column(nullable = false, length = 255)
	private String originalFileName;

	@Column(nullable = false, length = 255)
	private String storedFileName;

	@Column(nullable = false, length = 100)
	private String fileType;

	@Column(nullable = false)
	private Long fileSize;

	@Column(nullable = false, length = 500)
	private String filePath;

	@Column(nullable = false, updatable = false)
	private Instant uploadedAt;

	protected ProjectRequestAttachment() {
	}

	public ProjectRequestAttachment(
			ProjectRequest projectRequest,
			String originalFileName,
			String storedFileName,
			String fileType,
			Long fileSize,
			String filePath) {
		this.projectRequest = projectRequest;
		this.originalFileName = originalFileName;
		this.storedFileName = storedFileName;
		this.fileType = fileType;
		this.fileSize = fileSize;
		this.filePath = filePath;
		this.uploadedAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public ProjectRequest getProjectRequest() {
		return projectRequest;
	}

	public void setProjectRequest(ProjectRequest projectRequest) {
		this.projectRequest = projectRequest;
	}

	public String getOriginalFileName() {
		return originalFileName;
	}

	public String getStoredFileName() {
		return storedFileName;
	}

	public String getFileType() {
		return fileType;
	}

	public Long getFileSize() {
		return fileSize;
	}

	public String getFilePath() {
		return filePath;
	}

	public Instant getUploadedAt() {
		return uploadedAt;
	}
}
