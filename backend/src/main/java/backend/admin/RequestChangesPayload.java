package backend.admin;

import jakarta.validation.constraints.NotBlank;

public record RequestChangesPayload(
		@NotBlank(message = "Revision reason is required")
		String revisionReason) {
}
