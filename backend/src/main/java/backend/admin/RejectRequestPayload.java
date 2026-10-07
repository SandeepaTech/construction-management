package backend.admin;

import jakarta.validation.constraints.NotBlank;

public record RejectRequestPayload(
		@NotBlank(message = "Rejection reason is required")
		String rejectionReason) {
}
