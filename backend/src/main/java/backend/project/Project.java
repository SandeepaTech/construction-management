package backend.project;

import java.time.Instant;
import java.time.LocalDate;

import backend.auth.AppUser;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "projects")
public class Project {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 150)
	private String name;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "client_id", nullable = false)
	private AppUser client;

	@Column(length = 100)
	private String approvedBudget;

	private LocalDate startDate;

	private LocalDate expectedEndDate;

	@Column(nullable = false, length = 50)
	private String status;

	@OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	@JoinColumn(name = "site_id")
	private Site site;

	@Column(name = "project_request_id")
	private Long projectRequestId;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	protected Project() {
	}

	public Project(
			String name,
			AppUser client,
			String approvedBudget,
			LocalDate startDate,
			LocalDate expectedEndDate,
			Site site,
			Long projectRequestId) {
		this.name = name;
		this.client = client;
		this.approvedBudget = approvedBudget;
		this.startDate = startDate;
		this.expectedEndDate = expectedEndDate;
		this.status = "PLANNING";
		this.site = site;
		this.projectRequestId = projectRequestId;
		this.createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public AppUser getClient() {
		return client;
	}

	public void setClient(AppUser client) {
		this.client = client;
	}

	public String getApprovedBudget() {
		return approvedBudget;
	}

	public void setApprovedBudget(String approvedBudget) {
		this.approvedBudget = approvedBudget;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getExpectedEndDate() {
		return expectedEndDate;
	}

	public void setExpectedEndDate(LocalDate expectedEndDate) {
		this.expectedEndDate = expectedEndDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Site getSite() {
		return site;
	}

	public void setSite(Site site) {
		this.site = site;
	}

	public Long getProjectRequestId() {
		return projectRequestId;
	}

	public void setProjectRequestId(Long projectRequestId) {
		this.projectRequestId = projectRequestId;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
