package backend.client;

public enum ProjectRequestStatus {
	PENDING,
	UNDER_REVIEW,
	UNDER_ADMIN_REVIEW,
	SENT_TO_SITE_ENGINEER,
	ENGINEER_REVIEW_COMPLETED,
	NEEDS_REVISION,
	APPROVED,
	REJECTED;

	public static ProjectRequestStatus fromString(String value) {
		if (value == null || value.isBlank()) {
			return PENDING;
		}
		try {
			return ProjectRequestStatus.valueOf(value.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			return PENDING;
		}
	}
}
