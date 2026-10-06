package backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthRequests {
	private AuthRequests() {
	}

	public record Register(
			@NotBlank @Size(max = 120) String fullName,
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Pattern(regexp = "^[+()0-9 .-]{7,30}$") String phoneNumber,
			@NotBlank @Size(min = 8, max = 72) String password,
			@NotBlank String confirmPassword) {
	}

	public record Login(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank String password,
			UserRole role) {
	}
}
