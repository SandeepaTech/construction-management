package backend.auth;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminAccountInitializer implements ApplicationRunner {
	private static final Logger logger = LoggerFactory.getLogger(AdminAccountInitializer.class);
	private static final String ADMIN_EMAIL = "admin@gmail.com";

	private final AppUserRepository users;
	private final PasswordEncoder passwordEncoder;

	public AdminAccountInitializer(AppUserRepository users, PasswordEncoder passwordEncoder) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		String email = ADMIN_EMAIL.toLowerCase(Locale.ROOT);
		AppUser existingAdmin = users.findByEmailIgnoreCase(email).orElse(null);
		if (existingAdmin != null
				&& existingAdmin.getRole() == UserRole.ADMIN_PROJECT_MANAGER
				&& "Admin".equals(existingAdmin.getFullName())
				&& "0000000000".equals(existingAdmin.getPhoneNumber())
				&& passwordEncoder.matches("admin123", existingAdmin.getPassword())) {
			return;
		}

		if (existingAdmin == null) {
			existingAdmin = new AppUser(
					"Admin",
					email,
					"0000000000",
					passwordEncoder.encode("admin123"),
					UserRole.ADMIN_PROJECT_MANAGER);
		} else {
			existingAdmin.configureAdminProjectManager(email, passwordEncoder.encode("admin123"));
		}
		users.save(existingAdmin);
		logger.warn("Ensured the initial admin/project manager account exists. Change its default password before deployment.");
	}
}
