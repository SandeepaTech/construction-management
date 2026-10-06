package backend.client;

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
@Table(name = "project_requests")
public class ProjectRequest {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120)
	private String projectName;

	@Column(nullable = false, length = 40)
	private String projectType;

	@Column(nullable = false, length = 240)
	private String location;

	@Column(nullable = false, length = 3000)
	private String description;

	@Column(nullable = false, length = 30)
	private String status;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "client_id", nullable = false)
	private AppUser client;

	protected ProjectRequest() {
	}

	public ProjectRequest(
			String projectName,
			String projectType,
			String location,
			String description,
			AppUser client) {
		this.projectName = projectName;
		this.projectType = projectType;
		this.location = location;
		this.description = description;
		this.client = client;
		this.status = "PENDING";
		this.createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public String getProjectName() {
		return projectName;
	}

	public String getProjectType() {
		return projectType;
	}

	public String getLocation() {
		return location;
	}

	public String getDescription() {
		return description;
	}

	public String getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public AppUser getClient() {
		return client;
	}
}
