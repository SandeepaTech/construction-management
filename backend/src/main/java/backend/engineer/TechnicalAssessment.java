package backend.engineer;

import java.time.Instant;

import backend.auth.AppUser;
import backend.client.ProjectRequest;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "technical_assessments")
public class TechnicalAssessment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_request_id", nullable = false)
	private ProjectRequest projectRequest;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "site_engineer_id", nullable = false)
	private AppUser siteEngineer;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private SiteFeasibility siteFeasibility;

	@Column(length = 100)
	private String estimatedDuration;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private TechnicalRisk technicalRisk;

	@Column(columnDefinition = "TEXT")
	private String siteConditions;

	@Column(columnDefinition = "TEXT")
	private String recommendedConstructionNotes;

	@Column(columnDefinition = "TEXT")
	private String majorMaterialRequirements;

	@Column(columnDefinition = "TEXT")
	private String safetyEngineeringConcerns;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private TechnicalRecommendation recommendation;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String engineerComments;

	private Instant reviewedAt;
	private Instant createdAt;
	private Instant updatedAt;

	public TechnicalAssessment() {
	}

	public TechnicalAssessment(ProjectRequest projectRequest, AppUser siteEngineer, SiteFeasibility siteFeasibility,
			String estimatedDuration, TechnicalRisk technicalRisk, String siteConditions,
			String recommendedConstructionNotes, String majorMaterialRequirements, String safetyEngineeringConcerns,
			TechnicalRecommendation recommendation, String engineerComments) {
		this.projectRequest = projectRequest;
		this.siteEngineer = siteEngineer;
		this.siteFeasibility = siteFeasibility;
		this.estimatedDuration = estimatedDuration;
		this.technicalRisk = technicalRisk;
		this.siteConditions = siteConditions;
		this.recommendedConstructionNotes = recommendedConstructionNotes;
		this.majorMaterialRequirements = majorMaterialRequirements;
		this.safetyEngineeringConcerns = safetyEngineeringConcerns;
		this.recommendation = recommendation;
		this.engineerComments = engineerComments;
		Instant now = Instant.now();
		this.createdAt = now;
		this.updatedAt = now;
		this.reviewedAt = now;
	}

	public Long getId() {
		return id;
	}

	public ProjectRequest getProjectRequest() {
		return projectRequest;
	}

	public AppUser getSiteEngineer() {
		return siteEngineer;
	}

	public SiteFeasibility getSiteFeasibility() {
		return siteFeasibility;
	}

	public void setSiteFeasibility(SiteFeasibility siteFeasibility) {
		this.siteFeasibility = siteFeasibility;
	}

	public String getEstimatedDuration() {
		return estimatedDuration;
	}

	public void setEstimatedDuration(String estimatedDuration) {
		this.estimatedDuration = estimatedDuration;
	}

	public TechnicalRisk getTechnicalRisk() {
		return technicalRisk;
	}

	public void setTechnicalRisk(TechnicalRisk technicalRisk) {
		this.technicalRisk = technicalRisk;
	}

	public String getSiteConditions() {
		return siteConditions;
	}

	public void setSiteConditions(String siteConditions) {
		this.siteConditions = siteConditions;
	}

	public String getRecommendedConstructionNotes() {
		return recommendedConstructionNotes;
	}

	public void setRecommendedConstructionNotes(String recommendedConstructionNotes) {
		this.recommendedConstructionNotes = recommendedConstructionNotes;
	}

	public String getMajorMaterialRequirements() {
		return majorMaterialRequirements;
	}

	public void setMajorMaterialRequirements(String majorMaterialRequirements) {
		this.majorMaterialRequirements = majorMaterialRequirements;
	}

	public String getSafetyEngineeringConcerns() {
		return safetyEngineeringConcerns;
	}

	public void setSafetyEngineeringConcerns(String safetyEngineeringConcerns) {
		this.safetyEngineeringConcerns = safetyEngineeringConcerns;
	}

	public TechnicalRecommendation getRecommendation() {
		return recommendation;
	}

	public void setRecommendation(TechnicalRecommendation recommendation) {
		this.recommendation = recommendation;
	}

	public String getEngineerComments() {
		return engineerComments;
	}

	public void setEngineerComments(String engineerComments) {
		this.engineerComments = engineerComments;
	}

	public Instant getReviewedAt() {
		return reviewedAt;
	}

	public void setReviewedAt(Instant reviewedAt) {
		this.reviewedAt = reviewedAt;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}
