package backend.project;

import java.time.Instant;
import java.time.LocalDate;

public record ProjectResponse(
		Long id,
		String name,
		Long clientId,
		String clientName,
		String clientEmail,
		String clientPhone,
		String approvedBudget,
		LocalDate startDate,
		LocalDate expectedEndDate,
		String status,
		Long siteId,
		String siteName,
		String siteLocation,
		String siteAddress,
		Long assignedEngineerId,
		String assignedEngineerName,
		Long projectRequestId,
		Integer progress,
		Instant createdAt) {

	public static ProjectResponse from(Project project) {
		Site site = project.getSite();
		return new ProjectResponse(
				project.getId(),
				project.getName(),
				project.getClient() != null ? project.getClient().getId() : null,
				project.getClient() != null ? project.getClient().getFullName() : null,
				project.getClient() != null ? project.getClient().getEmail() : null,
				project.getClient() != null ? project.getClient().getPhoneNumber() : null,
				project.getApprovedBudget(),
				project.getStartDate(),
				project.getExpectedEndDate(),
				project.getStatus(),
				site != null ? site.getId() : null,
				site != null ? site.getName() : null,
				site != null ? site.getLocation() : null,
				site != null ? site.getAddress() : null,
				site != null && site.getAssignedEngineer() != null ? site.getAssignedEngineer().getId() : null,
				site != null && site.getAssignedEngineer() != null ? site.getAssignedEngineer().getFullName() : null,
				project.getProjectRequestId(),
				project.getProgress(),
				project.getCreatedAt());
	}
}
