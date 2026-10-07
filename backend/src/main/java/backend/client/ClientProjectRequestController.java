package backend.client;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({ "/api/client/project-requests", "/api/client/requests" })
public class ClientProjectRequestController {
	private final ClientProjectRequestService projectRequests;

	public ClientProjectRequestController(ClientProjectRequestService projectRequests) {
		this.projectRequests = projectRequests;
	}

	@GetMapping
	public List<ProjectRequestResponse> list(Authentication authentication) {
		return projectRequests.listForClient(authentication.getName());
	}

	@GetMapping("/{id}")
	public ProjectRequestResponse getById(@PathVariable Long id, Authentication authentication) {
		return projectRequests.getForClient(id, authentication.getName());
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public ProjectRequestResponse submitJson(
			@Valid @RequestBody ProjectRequestPayload payload,
			Authentication authentication) {
		return projectRequests.submit(authentication.getName(), payload);
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public ProjectRequestResponse submitMultipart(
			@ModelAttribute ProjectRequestPayload payload,
			@RequestParam(value = "files", required = false) List<MultipartFile> files,
			Authentication authentication) {
		return projectRequests.submitWithFiles(authentication.getName(), payload, files);
	}

	@PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ProjectRequestResponse updateJson(
			@PathVariable Long id,
			@Valid @RequestBody ProjectRequestPayload payload,
			Authentication authentication) {
		return projectRequests.update(id, authentication.getName(), payload, null);
	}

	@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ProjectRequestResponse updateMultipart(
			@PathVariable Long id,
			@ModelAttribute ProjectRequestPayload payload,
			@RequestParam(value = "files", required = false) List<MultipartFile> files,
			Authentication authentication) {
		return projectRequests.update(id, authentication.getName(), payload, files);
	}

	@org.springframework.web.bind.annotation.DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id, Authentication authentication) {
		projectRequests.delete(id, authentication.getName());
	}
}
