package backend.admin;

import java.util.List;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.client.ProjectRequest;
import backend.client.ProjectRequestRepository;
import backend.client.ProjectRequestResponse;
import backend.client.ProjectRequestStatus;
import backend.notification.NotificationService;
import backend.project.Project;
import backend.project.ProjectRepository;
import backend.project.ProjectResponse;
import backend.project.Site;
import backend.project.SiteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminProjectRequestService {
	private final ProjectRequestRepository requests;
	private final ProjectRepository projects;
	private final SiteRepository sites;
	private final AppUserRepository users;
	private final NotificationService notificationService;

	public AdminProjectRequestService(
			ProjectRequestRepository requests,
			ProjectRepository projects,
			SiteRepository sites,
			AppUserRepository users,
			NotificationService notificationService) {
		this.requests = requests;
		this.projects = projects;
		this.sites = sites;
		this.users = users;
		this.notificationService = notificationService;
	}

	@Transactional(readOnly = true)
	public List<ProjectRequestResponse> listRequests(String status, String projectType, String query, String sort) {
		ProjectRequestStatus statusEnum = null;
		if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
			try {
				statusEnum = ProjectRequestStatus.valueOf(status.trim().toUpperCase());
			} catch (IllegalArgumentException ignored) {
			}
		}

		boolean sortAsc = "oldest".equalsIgnoreCase(sort);
		return requests.searchAndFilter(statusEnum, projectType, query, sortAsc)
				.stream()
				.map(ProjectRequestResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public ProjectRequestResponse getRequest(Long id) {
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found: " + id));
		return ProjectRequestResponse.from(request);
	}

	@Transactional
	public ProjectRequestResponse markUnderReview(Long id) {
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found: " + id));
		request.setStatus(ProjectRequestStatus.UNDER_ADMIN_REVIEW);
		request = requests.save(request);

		notificationService.notifyClient(
				request.getClient(),
				"Project Request Under Review",
				String.format("Your project request '%s' is now under review by our project management team.", request.getProjectName()),
				"/client/requests");

		return ProjectRequestResponse.from(request);
	}

	@Transactional
	public ProjectRequestResponse sendToEngineer(Long id, SendToEngineerPayload payload) {
		if (payload == null || payload.siteEngineerId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Site Engineer ID is required.");
		}
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found: " + id));

		AppUser engineer = users.findById(payload.siteEngineerId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site Engineer not found."));

		if (engineer.getRole() != backend.auth.UserRole.SITE_ENGINEER) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user is not a Site Engineer.");
		}

		request.setAssignedSiteEngineer(engineer);
		request.setAdminNoteForEngineer(payload.adminNote());
		request.setStatus(ProjectRequestStatus.SENT_TO_SITE_ENGINEER);
		request = requests.save(request);

		notificationService.notifyClient(
				request.getClient(),
				"Project Request Sent for Technical Review",
				String.format("Your project request '%s' has been sent to a site engineer for technical feasibility review.", request.getProjectName()),
				"/client/requests");

		notificationService.notifyUser(
				engineer,
				"New Technical Review Assigned",
				String.format("You have been assigned to perform a technical assessment for project request: '%s'.", request.getProjectName()),
				"/engineer/project-requests/" + request.getId());

		return ProjectRequestResponse.from(request);
	}

	@Transactional
	public ProjectRequestResponse requestChanges(Long id, RequestChangesPayload payload) {
		if (payload == null || payload.revisionReason() == null || payload.revisionReason().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Revision reason is required.");
		}
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found: " + id));

		request.setStatus(ProjectRequestStatus.NEEDS_REVISION);
		request.setRevisionReason(payload.revisionReason().trim());
		request = requests.save(request);

		notificationService.notifyClient(
				request.getClient(),
				"Changes Requested for " + request.getProjectName(),
				String.format("Please review the following revision request: %s", request.getRevisionReason()),
				"/client/requests");

		return ProjectRequestResponse.from(request);
	}

	@Transactional
	public ProjectResponse approveRequest(Long id, ApproveProjectRequestPayload payload) {
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found: " + id));

		if (request.getStatus() == ProjectRequestStatus.APPROVED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "This request has already been approved.");
		}

		if (request.getTechnicalAssessment() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot approve request before a Technical Assessment is completed by a Site Engineer.");
		}

		String projectName = (payload != null && payload.projectName() != null && !payload.projectName().isBlank())
				? payload.projectName().trim()
				: request.getProjectName();

		String approvedBudget = (payload != null && payload.approvedBudget() != null && !payload.approvedBudget().isBlank())
				? payload.approvedBudget().trim()
				: request.getEstimatedBudget();

		AppUser assignedEngineer = null;
		if (payload != null && payload.assignedSiteEngineerId() != null) {
			assignedEngineer = users.findById(payload.assignedSiteEngineerId()).orElse(null);
		}

		String siteName = (payload != null && payload.siteName() != null && !payload.siteName().isBlank())
				? payload.siteName().trim()
				: projectName + " Site";

		String siteLocation = (payload != null && payload.siteLocation() != null && !payload.siteLocation().isBlank())
				? payload.siteLocation().trim()
				: request.getLocation();

		String siteAddress = (payload != null && payload.siteAddress() != null && !payload.siteAddress().isBlank())
				? payload.siteAddress().trim()
				: request.getLocation();

		Site site = new Site(siteName, siteLocation, siteAddress, assignedEngineer);
		site = sites.save(site);

		Project project = new Project(
				projectName,
				request.getClient(),
				approvedBudget,
				payload != null ? payload.startDate() : request.getPreferredStartDate(),
				payload != null ? payload.expectedEndDate() : request.getExpectedCompletionDate(),
				site,
				request.getId());
		project = projects.save(project);

		request.setApprovedProject(project);
		request.setStatus(ProjectRequestStatus.APPROVED);
		requests.save(request);

		notificationService.notifyClient(
				request.getClient(),
				"Project Request Approved: " + projectName,
				String.format("Congratulations! Your request '%s' was approved and Project '%s' has been created.", request.getProjectName(), projectName),
				"/client/projects");

		return ProjectResponse.from(project);
	}

	@Transactional
	public ProjectRequestResponse rejectRequest(Long id, RejectRequestPayload payload) {
		if (payload == null || payload.rejectionReason() == null || payload.rejectionReason().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required.");
		}
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found: " + id));

		request.setStatus(ProjectRequestStatus.REJECTED);
		request.setRejectionReason(payload.rejectionReason().trim());
		request = requests.save(request);

		notificationService.notifyClient(
				request.getClient(),
				"Project Request Update: " + request.getProjectName(),
				String.format("Your project request was not approved. Reason: %s", request.getRejectionReason()),
				"/client/requests");

		return ProjectRequestResponse.from(request);
	}
}
