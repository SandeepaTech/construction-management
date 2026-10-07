package backend.notification;

import java.util.List;

import backend.auth.AppUser;
import backend.auth.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
	private final NotificationRepository notifications;

	public NotificationService(NotificationRepository notifications) {
		this.notifications = notifications;
	}

	@Transactional
	public Notification notifyAdmins(String title, String message, String link) {
		Notification notification = new Notification(null, UserRole.ADMIN_PROJECT_MANAGER, title, message, link);
		return notifications.save(notification);
	}

	@Transactional
	public Notification notifyClient(AppUser client, String title, String message, String link) {
		return notifyUser(client, title, message, link);
	}

	@Transactional
	public Notification notifyUser(AppUser user, String title, String message, String link) {
		Notification notification = new Notification(user, null, title, message, link);
		return notifications.save(notification);
	}

	@Transactional(readOnly = true)
	public List<Notification> listForUser(AppUser user) {
		if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.ADMIN_PROJECT_MANAGER) {
			return notifications.findForUserOrRoles(user.getId(), List.of(UserRole.ADMIN, UserRole.ADMIN_PROJECT_MANAGER));
		}
		return notifications.findByRecipientIdOrderByCreatedAtDesc(user.getId());
	}

	@Transactional(readOnly = true)
	public long unreadCount(AppUser user) {
		if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.ADMIN_PROJECT_MANAGER) {
			return notifications.countUnreadForUserOrRoles(user.getId(), List.of(UserRole.ADMIN, UserRole.ADMIN_PROJECT_MANAGER));
		}
		return notifications.countUnreadForUser(user.getId());
	}

	@Transactional
	public void markRead(Long id) {
		notifications.findById(id).ifPresent(n -> {
			n.setRead(true);
			notifications.save(n);
		});
	}

	@Transactional
	public void markAllRead(AppUser user) {
		List<Notification> list = listForUser(user);
		for (Notification n : list) {
			if (!n.isRead()) {
				n.setRead(true);
			}
		}
		notifications.saveAll(list);
	}
}
