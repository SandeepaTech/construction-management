package backend.admin;

import jakarta.validation.constraints.NotNull;

public record SendToEngineerPayload(
		@NotNull(message = "Site Engineer ID is required")
		Long siteEngineerId,
		String adminNote
) {
}
