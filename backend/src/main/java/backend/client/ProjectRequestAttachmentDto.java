package backend.client;

import java.time.Instant;

public record ProjectRequestAttachmentDto(
		Long id,
		String originalFileName,
		String storedFileName,
		String fileType,
		Long fileSize,
		Instant uploadedAt,
		String downloadUrl) {

	public static ProjectRequestAttachmentDto from(ProjectRequestAttachment attachment) {
		String url = "/api/project-requests/" + attachment.getProjectRequest().getId() + "/attachments/" + attachment.getId();
		return new ProjectRequestAttachmentDto(
				attachment.getId(),
				attachment.getOriginalFileName(),
				attachment.getStoredFileName(),
				attachment.getFileType(),
				attachment.getFileSize(),
				attachment.getUploadedAt(),
				url);
	}
}
