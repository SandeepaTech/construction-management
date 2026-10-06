package backend.auth;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
	private static final String RESERVED_ADMIN_EMAIL = "admin@gmail.com";

	private final AppUserRepository users;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;

	public AuthService(
			AppUserRepository users,
			PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
	}

	@Transactional
	public AuthResponse register(AuthRequests.Register request) {
		String email = normalizeEmail(request.email());
		if (RESERVED_ADMIN_EMAIL.equals(email) || users.existsByEmailIgnoreCase(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
		}
		if (!request.password().equals(request.confirmPassword())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
		}

		AppUser user = new AppUser(
				request.fullName().trim(),
				email,
				request.phoneNumber().trim(),
				passwordEncoder.encode(request.password()),
				UserRole.CLIENT);
		try {
			return AuthResponse.from(users.save(user));
		} catch (DataIntegrityViolationException exception) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.", exception);
		}
	}

	public Authentication authenticate(AuthRequests.Login request) {
		if (request.role() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose an account role.");
		}
		try {
			Authentication authentication = authenticationManager.authenticate(
					UsernamePasswordAuthenticationToken.unauthenticated(
							normalizeEmail(request.email()), request.password()));
			boolean matchesRole = authentication.getAuthorities().stream().anyMatch(authority -> {
				String grantedAuthority = authority.getAuthority();
				return grantedAuthority.equals("ROLE_" + request.role().name())
						|| (request.role() == UserRole.ADMIN_PROJECT_MANAGER
								&& grantedAuthority.equals("ROLE_ADMIN"))
						|| (request.role() == UserRole.CLIENT
								&& grantedAuthority.equals("ROLE_CLIENT_BUILDING_OWNER"));
			});
			if (!matchesRole) {
				throw new BadCredentialsException("Invalid email, password, or role.");
			}
			return authentication;
		} catch (BadCredentialsException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email, password, or role.");
		}
	}

	@Transactional(readOnly = true)
	public AuthResponse currentUser(String email) {
		return users.findByEmailIgnoreCase(email)
				.map(AuthResponse::from)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found."));
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}
}
