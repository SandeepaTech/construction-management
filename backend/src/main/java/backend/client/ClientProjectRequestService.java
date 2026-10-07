package backend.client;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.auth.UserRole;
import backend.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClientProjectRequestService {
	private final AppUserRepository users;
	private final ProjectRequestRepository requests;
	private final FileStorageService fileStorageService;
	private final NotificationService notificationService;

	@Autowired
	public ClientProjectRequestService(
			AppUserRepository users,
			ProjectRequestRepository requests,
			FileStorageService fileStorageService,
			NotificationService notificationService) {
		this.users = users;
		this.requests = requests;
		this.fileStorageService = fileStorageService;
		this.notificationService = notificationService;
	}

	public ClientProjectRequestService(AppUserRepository users, ProjectRequestRepository requests) {
		this(users, requests, null, null);
	}

	@Transactional(readOnly = true)
	public List<ProjectRequestResponse> listForClient(String email) {
		AppUser client = getClient(email);
		return requests.findByClientIdOrderByLatest(client.getId())
				.stream()
				.map(ProjectRequestResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public ProjectRequestResponse getForClient(Long id, String email) {
		AppUser client = getClient(email);
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found."));
		if (!request.getClient().getId().equals(client.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this project request.");
		}
		return ProjectRequestResponse.from(request);
	}

	@Transactional
	public ProjectRequestResponse submit(String email, ProjectRequestPayload payload) {
		return submitWithFiles(email, payload, null);
	}

	@Transactional
	public ProjectRequestResponse submitWithFiles(String email, ProjectRequestPayload payload, List<MultipartFile> files) {
		AppUser client = getClient(email);
		ProjectRequest request = new ProjectRequest(
				client,
				payload.getProjectName().trim(),
				payload.getProjectType().trim(),
				payload.getPropertyType() != null ? payload.getPropertyType().trim() : null,
				payload.getLocation().trim(),
				payload.getEstimatedBudget() != null ? payload.getEstimatedBudget().trim() : null,
				payload.getPreferredStartDate(),
				payload.getExpectedCompletionDate(),
				payload.getApproximateProjectSize() != null ? payload.getApproximateProjectSize().trim() : null,
				payload.getNumberOfFloors() != null ? payload.getNumberOfFloors().trim() : null,
				payload.getProjectDetails() != null ? payload.getProjectDetails().trim() : "",
				payload.getSpecialRequirements() != null ? payload.getSpecialRequirements().trim() : null,
				payload.getPreferredContactMethod() != null ? payload.getPreferredContactMethod().trim() : null);

		request = requests.save(request);

		if (files != null && !files.isEmpty() && fileStorageService != null) {
			if (files.size() > 5) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 5 files allowed.");
			}
			for (MultipartFile file : files) {
				if (file != null && !file.isEmpty()) {
					ProjectRequestAttachment attachment = fileStorageService.storeFile(request, file);
					request.addAttachment(attachment);
				}
			}
			request = requests.save(request);
		}

		if (notificationService != null) {
			String title = "New project request submitted by " + client.getFullName();
			String message = String.format("Project '%s' was submitted by %s (%s).",
					request.getProjectName(), client.getFullName(), client.getEmail());
			String link = "/admin/project-requests/" + request.getId();
			notificationService.notifyAdmins(title, message, link);
		}

		return ProjectRequestResponse.from(request);
	}

	@Transactional
	public ProjectRequestResponse update(Long id, String email, ProjectRequestPayload payload, List<MultipartFile> files) {
		AppUser client = getClient(email);
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found."));

		if (!request.getClient().getId().equals(client.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to edit this project request.");
		}

		if (payload.getProjectName() != null && !payload.getProjectName().isBlank()) {
			request.setProjectName(payload.getProjectName().trim());
		}
		if (payload.getProjectType() != null && !payload.getProjectType().isBlank()) {
			request.setProjectType(payload.getProjectType().trim());
		}
		if (payload.getPropertyType() != null) {
			request.setPropertyType(payload.getPropertyType().trim());
		}
		if (payload.getLocation() != null && !payload.getLocation().isBlank()) {
			request.setLocation(payload.getLocation().trim());
		}
		if (payload.getEstimatedBudget() != null) {
			request.setEstimatedBudget(payload.getEstimatedBudget().trim());
		}
		if (payload.getPreferredStartDate() != null) {
			request.setPreferredStartDate(payload.getPreferredStartDate());
		}
		if (payload.getExpectedCompletionDate() != null) {
			request.setExpectedCompletionDate(payload.getExpectedCompletionDate());
		}
		if (payload.getApproximateProjectSize() != null) {
			request.setApproximateProjectSize(payload.getApproximateProjectSize().trim());
		}
		if (payload.getNumberOfFloors() != null) {
			request.setNumberOfFloors(payload.getNumberOfFloors().trim());
		}
		if (payload.getProjectDetails() != null) {
			request.setProjectDetails(payload.getProjectDetails().trim());
		}
		if (payload.getSpecialRequirements() != null) {
			request.setSpecialRequirements(payload.getSpecialRequirements().trim());
		}
		if (payload.getPreferredContactMethod() != null) {
			request.setPreferredContactMethod(payload.getPreferredContactMethod().trim());
		}

		// When resubmitted after revision: status = PENDING
		request.setStatus(ProjectRequestStatus.PENDING);
		request.setUpdatedAt(Instant.now());

		if (files != null && !files.isEmpty() && fileStorageService != null) {
			int currentCount = request.getAttachments().size();
			if (currentCount + files.size() > 5) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Total attachments cannot exceed 5 files.");
			}
			for (MultipartFile file : files) {
				if (file != null && !file.isEmpty()) {
					ProjectRequestAttachment attachment = fileStorageService.storeFile(request, file);
					request.addAttachment(attachment);
				}
			}
		}

		request = requests.save(request);

		if (notificationService != null) {
			String title = "Project request resubmitted by " + client.getFullName();
			String message = String.format("Client resubmitted project request '%s' after revision.", request.getProjectName());
			String link = "/admin/project-requests/" + request.getId();
			notificationService.notifyAdmins(title, message, link);
		}

		return ProjectRequestResponse.from(request);
	}

	public AppUser getClient(String email) {
		AppUser user = users.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client account not found."));
		if (user.getRole() != UserRole.CLIENT && user.getRole() != UserRole.CLIENT_BUILDING_OWNER) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only client accounts can manage project requests.");
		}
		return user;
	}

	@Transactional
	public void delete(Long id, String email) {
		AppUser client = getClient(email);
		ProjectRequest request = requests.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found."));

		if (!request.getClient().getId().equals(client.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this project request.");
		}

		if (request.getStatus() != ProjectRequestStatus.PENDING 
				&& request.getStatus() != ProjectRequestStatus.NEEDS_REVISION
				&& request.getStatus() != ProjectRequestStatus.REJECTED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending, needs-revision, or rejected project requests can be deleted.");
		}

		requests.delete(request);
	}
}
