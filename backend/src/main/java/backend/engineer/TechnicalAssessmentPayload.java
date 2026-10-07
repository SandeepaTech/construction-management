package backend.engineer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TechnicalAssessmentPayload(
		@NotNull(message = "Site feasibility is required")
		String siteFeasibility,

		String estimatedDuration,

		@NotNull(message = "Technical risk is required")
		String technicalRisk,

		String siteConditions,
		String recommendedConstructionNotes,
		String majorMaterialRequirements,
		String safetyEngineeringConcerns,

		@NotNull(message = "Technical recommendation is required")
		String recommendation,

		@NotBlank(message = "Engineer comments are required")
		String engineerComments
) {
}
