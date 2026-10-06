package backend.client;

import java.time.Instant;

public record ProjectRequestResponse(
		Long id,
		String projectName,
		String projectType,
		String location,
		String description,
		String status,
		Instant createdAt) {

	public static ProjectRequestResponse from(ProjectRequest request) {
		return new ProjectRequestResponse(
				request.getId(),
				request.getProjectName(),
				request.getProjectType(),
				request.getLocation(),
				request.getDescription(),
				request.getStatus(),
				request.getCreatedAt());
	}
}
