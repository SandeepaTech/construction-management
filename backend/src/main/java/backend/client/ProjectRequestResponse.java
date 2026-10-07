package backend.client;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

public record ProjectRequestResponse(
		Long id,
		Long clientId,
		String clientName,
		String clientEmail,
		String clientPhone,
		String projectName,
		String projectType,
		String propertyType,
		String location,
		String estimatedBudget,
		LocalDate preferredStartDate,
		LocalDate expectedCompletionDate,
		String approximateProjectSize,
		String numberOfFloors,
		String projectDetails,
		String description,
		String specialRequirements,
		String preferredContactMethod,
		String status,
		String revisionReason,
		String rejectionReason,
		Long approvedProjectId,
		Instant submittedAt,
		Instant createdAt,
		Instant updatedAt,
		List<ProjectRequestAttachmentDto> attachments,
		int attachmentCount,
		Long assignedSiteEngineerId,
		String assignedSiteEngineerName,
		String adminNoteForEngineer,
		backend.engineer.TechnicalAssessmentDto technicalAssessment) {

	public static ProjectRequestResponse from(ProjectRequest request) {
		List<ProjectRequestAttachmentDto> attachmentDtos = request.getAttachments() != null
				? request.getAttachments().stream().map(ProjectRequestAttachmentDto::from).toList()
				: Collections.emptyList();

		Long clientId = request.getClient() != null ? request.getClient().getId() : null;
		String clientName = request.getClient() != null ? request.getClient().getFullName() : null;
		String clientEmail = request.getClient() != null ? request.getClient().getEmail() : null;
		String clientPhone = request.getClient() != null ? request.getClient().getPhoneNumber() : null;
		Long approvedProjectId = request.getApprovedProject() != null ? request.getApprovedProject().getId() : null;
		Long assignedSiteEngineerId = request.getAssignedSiteEngineer() != null ? request.getAssignedSiteEngineer().getId() : null;
		String assignedSiteEngineerName = request.getAssignedSiteEngineer() != null ? request.getAssignedSiteEngineer().getFullName() : null;

		return new ProjectRequestResponse(
				request.getId(),
				clientId,
				clientName,
				clientEmail,
				clientPhone,
				request.getProjectName(),
				request.getProjectType(),
				request.getPropertyType(),
				request.getLocation(),
				request.getEstimatedBudget(),
				request.getPreferredStartDate(),
				request.getExpectedCompletionDate(),
				request.getApproximateProjectSize(),
				request.getNumberOfFloors(),
				request.getProjectDetails(),
				request.getDescription(),
				request.getSpecialRequirements(),
				request.getPreferredContactMethod(),
				request.getStatus() != null ? request.getStatus().name() : "PENDING",
				request.getRevisionReason(),
				request.getRejectionReason(),
				approvedProjectId,
				request.getSubmittedAt(),
				request.getCreatedAt(),
				request.getUpdatedAt(),
				attachmentDtos,
				attachmentDtos.size(),
				assignedSiteEngineerId,
				assignedSiteEngineerName,
				request.getAdminNoteForEngineer(),
				backend.engineer.TechnicalAssessmentDto.from(request.getTechnicalAssessment()));
	}
}
