package backend.client;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client/requests")
public class ClientProjectRequestController {
	private final ClientProjectRequestService projectRequests;

	public ClientProjectRequestController(ClientProjectRequestService projectRequests) {
		this.projectRequests = projectRequests;
	}

	@GetMapping
	public List<ProjectRequestResponse> list(Authentication authentication) {
		return projectRequests.listForClient(authentication.getName());
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ProjectRequestResponse submit(
			@Valid @RequestBody ProjectRequestPayload payload,
			Authentication authentication) {
		return projectRequests.submit(authentication.getName(), payload);
	}
}
