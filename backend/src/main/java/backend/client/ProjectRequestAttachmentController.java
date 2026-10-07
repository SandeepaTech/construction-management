package backend.client;

import java.util.List;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.auth.UserRole;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/project-requests/{requestId}/attachments")
public class ProjectRequestAttachmentController {
	private final ProjectRequestRepository requestRepository;
	private final ProjectRequestAttachmentRepository attachmentRepository;
	private final FileStorageService fileStorageService;
	private final AppUserRepository userRepository;

	public ProjectRequestAttachmentController(
			ProjectRequestRepository requestRepository,
			ProjectRequestAttachmentRepository attachmentRepository,
			FileStorageService fileStorageService,
			AppUserRepository userRepository) {
		this.requestRepository = requestRepository;
		this.attachmentRepository = attachmentRepository;
		this.fileStorageService = fileStorageService;
		this.userRepository = userRepository;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ProjectRequestAttachmentDto uploadAttachment(
			@PathVariable Long requestId,
			@RequestParam("file") MultipartFile file,
			Authentication authentication) {
		ProjectRequest request = getRequestAndAuthorize(requestId, authentication);

		if (request.getAttachments().size() >= 5) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 5 attachments allowed per request.");
		}

		ProjectRequestAttachment attachment = fileStorageService.storeFile(request, file);
		request.addAttachment(attachment);
		requestRepository.save(request);

		return ProjectRequestAttachmentDto.from(attachment);
	}

	@GetMapping
	public List<ProjectRequestAttachmentDto> listAttachments(
			@PathVariable Long requestId,
			Authentication authentication) {
		ProjectRequest request = getRequestAndAuthorize(requestId, authentication);
		return request.getAttachments().stream().map(ProjectRequestAttachmentDto::from).toList();
	}

	@GetMapping("/{attachmentId}")
	public ResponseEntity<Resource> downloadAttachment(
			@PathVariable Long requestId,
			@PathVariable Long attachmentId,
			@RequestParam(required = false, defaultValue = "false") boolean download,
			Authentication authentication) {
		getRequestAndAuthorize(requestId, authentication);

		ProjectRequestAttachment attachment = attachmentRepository.findById(attachmentId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found: " + attachmentId));

		if (!attachment.getProjectRequest().getId().equals(requestId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachment does not belong to specified project request.");
		}

		Resource resource = fileStorageService.loadFileAsResource(attachment);

		String disposition = download ? "attachment" : "inline";
		String filename = attachment.getOriginalFileName();
		MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
		if (attachment.getFileType() != null && !attachment.getFileType().isBlank()) {
			try {
				mediaType = MediaType.parseMediaType(attachment.getFileType());
			} catch (Exception ignored) {
			}
		}

		return ResponseEntity.ok()
				.contentType(mediaType)
				.header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + filename + "\"")
				.body(resource);
	}

	private ProjectRequest getRequestAndAuthorize(Long requestId, Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
		}

		ProjectRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project request not found: " + requestId));

		AppUser user = userRepository.findByEmailIgnoreCase(authentication.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

		boolean isAdmin = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.ADMIN_PROJECT_MANAGER;
		boolean isOwner = request.getClient().getId().equals(user.getId());

		if (!isAdmin && !isOwner) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to access attachments for this request.");
		}

		return request;
	}
}
