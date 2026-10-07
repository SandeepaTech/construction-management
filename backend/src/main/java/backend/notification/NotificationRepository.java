package backend.notification;

import java.util.List;

import backend.auth.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
	List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

	@Query("SELECT n FROM Notification n WHERE n.recipient.id = :userId OR n.targetRole IN :roles ORDER BY n.createdAt DESC")
	List<Notification> findForUserOrRoles(@Param("userId") Long userId, @Param("roles") List<UserRole> roles);

	@Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipient.id = :userId OR n.targetRole IN :roles) AND n.isRead = false")
	long countUnreadForUserOrRoles(@Param("userId") Long userId, @Param("roles") List<UserRole> roles);

	@Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :userId AND n.isRead = false")
	long countUnreadForUser(@Param("userId") Long userId);
}
