package backend.engineer;

import java.time.Instant;

public record TechnicalAssessmentDto(
		Long id,
		Long siteEngineerId,
		String siteEngineerName,
		String siteFeasibility,
		String estimatedDuration,
		String technicalRisk,
		String siteConditions,
		String recommendedConstructionNotes,
		String majorMaterialRequirements,
		String safetyEngineeringConcerns,
		String recommendation,
		String engineerComments,
		Instant reviewedAt) {

	public static TechnicalAssessmentDto from(TechnicalAssessment ta) {
		if (ta == null) {
			return null;
		}
		return new TechnicalAssessmentDto(
				ta.getId(),
				ta.getSiteEngineer() != null ? ta.getSiteEngineer().getId() : null,
				ta.getSiteEngineer() != null ? ta.getSiteEngineer().getFullName() : null,
				ta.getSiteFeasibility() != null ? ta.getSiteFeasibility().name() : null,
				ta.getEstimatedDuration(),
				ta.getTechnicalRisk() != null ? ta.getTechnicalRisk().name() : null,
				ta.getSiteConditions(),
				ta.getRecommendedConstructionNotes(),
				ta.getMajorMaterialRequirements(),
				ta.getSafetyEngineeringConcerns(),
				ta.getRecommendation() != null ? ta.getRecommendation().name() : null,
				ta.getEngineerComments(),
				ta.getReviewedAt()
		);
	}
}
