package backend.engineer;

import java.time.Instant;
import java.util.List;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.client.ProjectRequest;
import backend.client.ProjectRequestRepository;
import backend.client.ProjectRequestResponse;
import backend.client.ProjectRequestStatus;
import backend.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EngineerProjectRequestService {

	private final ProjectRequestRepository requests;
	private final TechnicalAssessmentRepository assessments;
	private final AppUserRepository users;
	private final NotificationService notificationService;

	public EngineerProjectRequestService(
			ProjectRequestRepository requests,
			TechnicalAssessmentRepository assessments,
			AppUserRepository users,
			NotificationService notificationService) {
		this.requests = requests;
		this.assessments = assessments;
		this.users = users;
		this.notificationService = notificationService;
	}

	private AppUser getEngineer(String email) {
		AppUser user = users.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Engineer not found."));
		if (user.getRole() != backend.auth.UserRole.SITE_ENGINEER) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only site engineers can access this.");
		}
		return user;
	}

	@Transactional(readOnly = true)
	public List<ProjectRequestResponse> listAssignedRequests(String email) {
		AppUser engineer = getEngineer(email);
		return requests.findAll().stream()
				.filter(r -> r.getAssignedSiteEngineer() != null && r.getAssignedSiteEngineer().getId().equals(engineer.getId()))
				.map(ProjectRequestResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public ProjectRequestResponse getAssignedRequest(Long id, String email) {
		AppUser engineer = getEngineer(email);
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found."));

		if (request.getAssignedSiteEngineer() == null || !request.getAssignedSiteEngineer().getId().equals(engineer.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This request is not assigned to you.");
		}

		return ProjectRequestResponse.from(request);
	}

	@Transactional
	public ProjectRequestResponse submitTechnicalAssessment(Long id, String email, TechnicalAssessmentPayload payload) {
		AppUser engineer = getEngineer(email);
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found."));

		if (request.getAssignedSiteEngineer() == null || !request.getAssignedSiteEngineer().getId().equals(engineer.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This request is not assigned to you.");
		}

		if (request.getStatus() != ProjectRequestStatus.SENT_TO_SITE_ENGINEER && request.getStatus() != ProjectRequestStatus.ENGINEER_REVIEW_COMPLETED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment cannot be submitted for request in status: " + request.getStatus());
		}

		SiteFeasibility feasibility;
		TechnicalRisk risk;
		TechnicalRecommendation recommendation;

		try {
			feasibility = SiteFeasibility.valueOf(payload.siteFeasibility());
			risk = TechnicalRisk.valueOf(payload.technicalRisk());
			recommendation = TechnicalRecommendation.valueOf(payload.recommendation());
		} catch (IllegalArgumentException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid enum values for assessment.");
		}

		TechnicalAssessment assessment = request.getTechnicalAssessment();
		if (assessment == null) {
			assessment = new TechnicalAssessment(
					request,
					engineer,
					feasibility,
					payload.estimatedDuration(),
					risk,
					payload.siteConditions(),
					payload.recommendedConstructionNotes(),
					payload.majorMaterialRequirements(),
					payload.safetyEngineeringConcerns(),
					recommendation,
					payload.engineerComments());
		} else {
			assessment.setSiteFeasibility(feasibility);
			assessment.setEstimatedDuration(payload.estimatedDuration());
			assessment.setTechnicalRisk(risk);
			assessment.setSiteConditions(payload.siteConditions());
			assessment.setRecommendedConstructionNotes(payload.recommendedConstructionNotes());
			assessment.setMajorMaterialRequirements(payload.majorMaterialRequirements());
			assessment.setSafetyEngineeringConcerns(payload.safetyEngineeringConcerns());
			assessment.setRecommendation(recommendation);
			assessment.setEngineerComments(payload.engineerComments());
			assessment.setReviewedAt(Instant.now());
			assessment.setUpdatedAt(Instant.now());
		}

		assessment = assessments.save(assessment);
		request.setTechnicalAssessment(assessment);
		request.setStatus(ProjectRequestStatus.ENGINEER_REVIEW_COMPLETED);
		request = requests.save(request);

		// Notify Admin that review is complete
		notificationService.notifyAdmins(
				"Technical Review Completed",
				String.format("Site Engineer %s has completed the technical review for project request: '%s'.", engineer.getFullName(), request.getProjectName()),
				"/admin/requests/" + request.getId()); // Adjust URL if needed, frontend might use /admin/project-requests/{id} but they navigate to correct place usually. Or we can just use /admin/project-requests. We'll use /admin/project-requests

		return ProjectRequestResponse.from(request);
	}
}
