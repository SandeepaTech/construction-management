package backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {
	@Mock
	private AppUserRepository users;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private AuthenticationManager authenticationManager;

	@InjectMocks
	private AuthService authService;

	@Test
	void publicRegistrationAlwaysCreatesClientAccounts() {
		when(users.existsByEmailIgnoreCase("client@example.com")).thenReturn(false);
		when(passwordEncoder.encode("client-password")).thenReturn("encoded-password");
		when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

		AuthResponse registered = authService.register(new AuthRequests.Register(
				"Example Client",
				" Client@Example.com ",
				"5551234567",
				"client-password",
				"client-password"));

		assertEquals("client@example.com", registered.email());
		assertEquals(UserRole.CLIENT, registered.role());
		verify(users).save(any(AppUser.class));
	}

	@Test
	void publicRegistrationCannotClaimTheReservedAdminEmail() {
		ResponseStatusException exception = assertThrows(
				ResponseStatusException.class,
				() -> authService.register(new AuthRequests.Register(
						"Admin",
						"ADMIN@GMAIL.COM",
						"5551234567",
						"admin123",
						"admin123")));

		assertEquals(409, exception.getStatusCode().value());
	}

	@Test
	void publicRegistrationRejectsExistingEmailRegardlessOfCase() {
		when(users.existsByEmailIgnoreCase("person@example.com")).thenReturn(true);

		ResponseStatusException exception = assertThrows(
				ResponseStatusException.class,
				() -> authService.register(new AuthRequests.Register(
						"Person",
						"PERSON@EXAMPLE.COM",
						"5551234567",
						"client-password",
						"client-password")));

		assertEquals(409, exception.getStatusCode().value());
	}

	@Test
	void adminProjectManagerCanAuthenticateUsingItsLoginDropdownRole() {
		var expectedAuthentication = UsernamePasswordAuthenticationToken.authenticated(
				"admin@gmail.com",
				"",
				List.of(new SimpleGrantedAuthority("ROLE_ADMIN_PROJECT_MANAGER")));
		when(authenticationManager.authenticate(any())).thenReturn(expectedAuthentication);

		var authentication = authService.authenticate(new AuthRequests.Login(
				"admin@gmail.com",
				"admin123",
				UserRole.ADMIN_PROJECT_MANAGER));

		assertEquals("admin@gmail.com", authentication.getName());
	}

	@Test
	void clientLoginSupportsAccountsCreatedBeforeTheClientRoleWasRenamed() {
		var expectedAuthentication = UsernamePasswordAuthenticationToken.authenticated(
				"client@example.com",
				"",
				List.of(new SimpleGrantedAuthority("ROLE_CLIENT_BUILDING_OWNER")));
		when(authenticationManager.authenticate(any())).thenReturn(expectedAuthentication);

		var authentication = authService.authenticate(new AuthRequests.Login(
				"client@example.com",
				"client-password",
				UserRole.CLIENT));

		assertEquals("client@example.com", authentication.getName());
	}
}
