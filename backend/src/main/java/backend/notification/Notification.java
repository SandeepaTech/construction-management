package backend.notification;

import java.time.Instant;

import backend.auth.AppUser;
import backend.auth.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "recipient_id")
	private AppUser recipient;

	@Enumerated(EnumType.STRING)
	@Column(length = 50)
	private UserRole targetRole;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(nullable = false, length = 2000)
	private String message;

	@Column(length = 255)
	private String link;

	@Column(nullable = false)
	private boolean isRead;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	protected Notification() {
	}

	public Notification(AppUser recipient, UserRole targetRole, String title, String message, String link) {
		this.recipient = recipient;
		this.targetRole = targetRole;
		this.title = title;
		this.message = message;
		this.link = link;
		this.isRead = false;
		this.createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public AppUser getRecipient() {
		return recipient;
	}

	public void setRecipient(AppUser recipient) {
		this.recipient = recipient;
	}

	public UserRole getTargetRole() {
		return targetRole;
	}

	public void setTargetRole(UserRole targetRole) {
		this.targetRole = targetRole;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public boolean isRead() {
		return isRead;
	}

	public void setRead(boolean read) {
		isRead = read;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
