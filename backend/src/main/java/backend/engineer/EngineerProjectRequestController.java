package backend.engineer;

import java.util.List;

import backend.client.ProjectRequestResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/engineer/project-requests")
public class EngineerProjectRequestController {

	private final EngineerProjectRequestService engineerService;

	public EngineerProjectRequestController(EngineerProjectRequestService engineerService) {
		this.engineerService = engineerService;
	}

	@GetMapping
	public List<ProjectRequestResponse> list(Authentication authentication) {
		return engineerService.listAssignedRequests(authentication.getName());
	}

	@GetMapping("/{id}")
	public ProjectRequestResponse getById(@PathVariable Long id, Authentication authentication) {
		return engineerService.getAssignedRequest(id, authentication.getName());
	}

	@PostMapping("/{id}/technical-assessment")
	public ProjectRequestResponse submitTechnicalAssessment(
			@PathVariable Long id,
			@Valid @RequestBody TechnicalAssessmentPayload payload,
			Authentication authentication) {
		return engineerService.submitTechnicalAssessment(id, authentication.getName(), payload);
	}

	@PutMapping("/{id}/technical-assessment")
	public ProjectRequestResponse updateTechnicalAssessment(
			@PathVariable Long id,
			@Valid @RequestBody TechnicalAssessmentPayload payload,
			Authentication authentication) {
		return engineerService.submitTechnicalAssessment(id, authentication.getName(), payload);
	}
}
