package backend.auth;

public record AuthResponse(Long id, String fullName, String email, String phoneNumber, UserRole role) {
	public static AuthResponse from(AppUser user) {
		return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), user.getRole());
	}
}
