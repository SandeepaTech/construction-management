package backend.admin;

import java.util.List;

import backend.client.ProjectRequestResponse;
import backend.project.ProjectResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/project-requests")
public class AdminProjectRequestController {
	private final AdminProjectRequestService adminService;

	public AdminProjectRequestController(AdminProjectRequestService adminService) {
		this.adminService = adminService;
	}

	@GetMapping
	public List<ProjectRequestResponse> list(
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String projectType,
			@RequestParam(required = false) String query,
			@RequestParam(required = false, defaultValue = "newest") String sort) {
		return adminService.listRequests(status, projectType, query, sort);
	}

	@GetMapping("/{id}")
	public ProjectRequestResponse getById(@PathVariable Long id) {
		return adminService.getRequest(id);
	}

	@PatchMapping("/{id}/under-review")
	public ProjectRequestResponse markUnderReview(@PathVariable Long id) {
		return adminService.markUnderReview(id);
	}

	@PostMapping("/{id}/send-to-engineer")
	public ProjectRequestResponse sendToEngineer(
			@PathVariable Long id,
			@Valid @RequestBody SendToEngineerPayload payload) {
		return adminService.sendToEngineer(id, payload);
	}

	@PatchMapping("/{id}/request-changes")
	public ProjectRequestResponse requestChanges(
			@PathVariable Long id,
			@Valid @RequestBody RequestChangesPayload payload) {
		return adminService.requestChanges(id, payload);
	}

	@PostMapping("/{id}/approve")
	public ProjectResponse approve(
			@PathVariable Long id,
			@RequestBody(required = false) ApproveProjectRequestPayload payload) {
		return adminService.approveRequest(id, payload);
	}

	@PatchMapping("/{id}/reject")
	public ProjectRequestResponse reject(
			@PathVariable Long id,
			@Valid @RequestBody RejectRequestPayload payload) {
		return adminService.rejectRequest(id, payload);
	}
}
