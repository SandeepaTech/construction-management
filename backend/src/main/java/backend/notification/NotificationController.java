package backend.notification;

import java.util.List;
import java.util.Map;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping({ "/api/notifications", "/api/client/notifications", "/api/admin/notifications" })
public class NotificationController {
	private final NotificationService notificationService;
	private final AppUserRepository userRepository;

	public NotificationController(NotificationService notificationService, AppUserRepository userRepository) {
		this.notificationService = notificationService;
		this.userRepository = userRepository;
	}

	@GetMapping
	public List<Notification> list(Authentication authentication) {
		AppUser user = getUser(authentication);
		return notificationService.listForUser(user);
	}

	@GetMapping("/unread-count")
	public Map<String, Long> unreadCount(Authentication authentication) {
		AppUser user = getUser(authentication);
		long count = notificationService.unreadCount(user);
		return Map.of("unreadCount", count);
	}

	@PatchMapping("/{id}/read")
	public Map<String, Boolean> markRead(@PathVariable Long id, Authentication authentication) {
		getUser(authentication);
		notificationService.markRead(id);
		return Map.of("success", true);
	}

	@PatchMapping("/read-all")
	public Map<String, Boolean> markAllRead(Authentication authentication) {
		AppUser user = getUser(authentication);
		notificationService.markAllRead(user);
		return Map.of("success", true);
	}

	private AppUser getUser(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
		}
		return userRepository.findByEmailIgnoreCase(authentication.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
	}
}
