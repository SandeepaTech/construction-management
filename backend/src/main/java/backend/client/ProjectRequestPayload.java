package backend.client;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectRequestPayload(
		@NotBlank @Size(max = 120) String projectName,
		@NotBlank @Size(max = 40) String projectType,
		@NotBlank @Size(max = 240) String location,
		@NotBlank @Size(max = 3000) String description) {
}
