package backend.client;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import backend.auth.AppUser;
import backend.project.Project;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_requests")
public class ProjectRequest {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "client_id", nullable = false)
	private AppUser client;

	@Column(nullable = false, length = 120)
	private String projectName;

	@Column(nullable = false, length = 60)
	private String projectType;

	@Column(length = 60)
	private String propertyType;

	@Column(nullable = false, length = 240)
	private String location;

	@Column(length = 60)
	private String estimatedBudget;

	private LocalDate preferredStartDate;

	private LocalDate expectedCompletionDate;

	@Column(length = 60)
	private String approximateProjectSize;

	@Column(length = 30)
	private String numberOfFloors;

	@Column(name = "project_details", columnDefinition = "TEXT")
	private String projectDetails;

	// Keep existing column mapping optional for compatibility
	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(columnDefinition = "TEXT")
	private String specialRequirements;

	@Column(length = 40)
	private String preferredContactMethod;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private ProjectRequestStatus status;

	@Column(columnDefinition = "TEXT")
	private String revisionReason;

	@Column(columnDefinition = "TEXT")
	private String rejectionReason;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "approved_project_id")
	private Project approvedProject;

	@Column(name = "submitted_at")
	private Instant submittedAt;

	// Keep created_at mapped for database compatibility
	@Column(name = "created_at")
	private Instant createdAt;

	private Instant updatedAt;

	@OneToMany(mappedBy = "projectRequest", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProjectRequestAttachment> attachments = new ArrayList<>();

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "assigned_site_engineer_id")
	private AppUser assignedSiteEngineer;

	@Column(columnDefinition = "TEXT")
	private String adminNoteForEngineer;

	@OneToOne(mappedBy = "projectRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	private backend.engineer.TechnicalAssessment technicalAssessment;

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
		this.projectDetails = description;
		this.description = description;
		this.client = client;
		this.status = ProjectRequestStatus.PENDING;
		Instant now = Instant.now();
		this.submittedAt = now;
		this.createdAt = now;
		this.updatedAt = now;
	}

	public ProjectRequest(
			AppUser client,
			String projectName,
			String projectType,
			String propertyType,
			String location,
			String estimatedBudget,
			LocalDate preferredStartDate,
			LocalDate expectedCompletionDate,
			String approximateProjectSize,
			String numberOfFloors,
			String projectDetails,
			String specialRequirements,
			String preferredContactMethod) {
		this.client = client;
		this.projectName = projectName;
		this.projectType = projectType;
		this.propertyType = propertyType;
		this.location = location;
		this.estimatedBudget = estimatedBudget;
		this.preferredStartDate = preferredStartDate;
		this.expectedCompletionDate = expectedCompletionDate;
		this.approximateProjectSize = approximateProjectSize;
		this.numberOfFloors = numberOfFloors;
		this.projectDetails = projectDetails;
		this.description = projectDetails;
		this.specialRequirements = specialRequirements;
		this.preferredContactMethod = preferredContactMethod;
		this.status = ProjectRequestStatus.PENDING;
		Instant now = Instant.now();
		this.submittedAt = now;
		this.createdAt = now;
		this.updatedAt = now;
	}

	public Long getId() {
		return id;
	}

	public AppUser getClient() {
		return client;
	}

	public String getProjectName() {
		return projectName;
	}

	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}

	public String getProjectType() {
		return projectType;
	}

	public void setProjectType(String projectType) {
		this.projectType = projectType;
	}

	public String getPropertyType() {
		return propertyType;
	}

	public void setPropertyType(String propertyType) {
		this.propertyType = propertyType;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getEstimatedBudget() {
		return estimatedBudget;
	}

	public void setEstimatedBudget(String estimatedBudget) {
		this.estimatedBudget = estimatedBudget;
	}

	public LocalDate getPreferredStartDate() {
		return preferredStartDate;
	}

	public void setPreferredStartDate(LocalDate preferredStartDate) {
		this.preferredStartDate = preferredStartDate;
	}

	public LocalDate getExpectedCompletionDate() {
		return expectedCompletionDate;
	}

	public void setExpectedCompletionDate(LocalDate expectedCompletionDate) {
		this.expectedCompletionDate = expectedCompletionDate;
	}

	public String getApproximateProjectSize() {
		return approximateProjectSize;
	}

	public void setApproximateProjectSize(String approximateProjectSize) {
		this.approximateProjectSize = approximateProjectSize;
	}

	public String getNumberOfFloors() {
		return numberOfFloors;
	}

	public void setNumberOfFloors(String numberOfFloors) {
		this.numberOfFloors = numberOfFloors;
	}

	public String getProjectDetails() {
		return projectDetails != null ? projectDetails : description;
	}

	public void setProjectDetails(String projectDetails) {
		this.projectDetails = projectDetails;
		this.description = projectDetails;
	}

	public String getDescription() {
		return getProjectDetails();
	}

	public String getSpecialRequirements() {
		return specialRequirements;
	}

	public void setSpecialRequirements(String specialRequirements) {
		this.specialRequirements = specialRequirements;
	}

	public String getPreferredContactMethod() {
		return preferredContactMethod;
	}

	public void setPreferredContactMethod(String preferredContactMethod) {
		this.preferredContactMethod = preferredContactMethod;
	}

	public ProjectRequestStatus getStatus() {
		return status;
	}

	public void setStatus(ProjectRequestStatus status) {
		this.status = status;
		this.updatedAt = Instant.now();
	}

	public String getRevisionReason() {
		return revisionReason;
	}

	public void setRevisionReason(String revisionReason) {
		this.revisionReason = revisionReason;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}

	public Project getApprovedProject() {
		return approvedProject;
	}

	public void setApprovedProject(Project approvedProject) {
		this.approvedProject = approvedProject;
	}

	public Instant getSubmittedAt() {
		return submittedAt != null ? submittedAt : createdAt;
	}

	public Instant getCreatedAt() {
		return getSubmittedAt();
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}

	public List<ProjectRequestAttachment> getAttachments() {
		return attachments;
	}

	public void addAttachment(ProjectRequestAttachment attachment) {
		attachments.add(attachment);
		attachment.setProjectRequest(this);
	}

	public void removeAttachment(ProjectRequestAttachment attachment) {
		attachments.remove(attachment);
		attachment.setProjectRequest(null);
	}

	public AppUser getAssignedSiteEngineer() {
		return assignedSiteEngineer;
	}

	public void setAssignedSiteEngineer(AppUser assignedSiteEngineer) {
		this.assignedSiteEngineer = assignedSiteEngineer;
	}

	public String getAdminNoteForEngineer() {
		return adminNoteForEngineer;
	}

	public void setAdminNoteForEngineer(String adminNoteForEngineer) {
		this.adminNoteForEngineer = adminNoteForEngineer;
	}

	public backend.engineer.TechnicalAssessment getTechnicalAssessment() {
		return technicalAssessment;
	}

	public void setTechnicalAssessment(backend.engineer.TechnicalAssessment technicalAssessment) {
		this.technicalAssessment = technicalAssessment;
		if (technicalAssessment != null) {
			// Just in case it's set bi-directionally
		}
	}
}
