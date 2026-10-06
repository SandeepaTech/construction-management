package backend;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.auth.UserRole;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BackendApplicationTests {
	@Autowired
	private AppUserRepository users;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
		AppUser admin = users.findByEmailIgnoreCase("admin@gmail.com").orElseThrow();

		Assertions.assertEquals("Admin", admin.getFullName());
		Assertions.assertEquals(UserRole.ADMIN_PROJECT_MANAGER, admin.getRole());
		Assertions.assertTrue(passwordEncoder.matches("admin123", admin.getPassword()));
	}

}
