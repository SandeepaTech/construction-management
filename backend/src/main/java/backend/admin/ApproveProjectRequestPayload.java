package backend.admin;

import java.time.LocalDate;

public record ApproveProjectRequestPayload(
		String projectName,
		String approvedBudget,
		LocalDate startDate,
		LocalDate expectedEndDate,
		String siteName,
		String siteLocation,
		String siteAddress,
		Long assignedSiteEngineerId) {
}
