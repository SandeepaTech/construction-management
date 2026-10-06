package backend.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_users")
public class AppUser {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120)
	private String fullName;

	@Column(nullable = false, unique = true, length = 254)
	private String email;

	@Column(nullable = false, length = 30)
	private String phoneNumber;

	@Column(nullable = false)
	private String password;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private UserRole role;

	protected AppUser() {
	}

	public AppUser(String fullName, String email, String phoneNumber, String password, UserRole role) {
		this.fullName = fullName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.password = password;
		this.role = role;
	}

	public Long getId() {
		return id;
	}

	public String getFullName() {
		return fullName;
	}

	public String getEmail() {
		return email;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public String getPassword() {
		return password;
	}

	public UserRole getRole() {
		return role;
	}

	void configureAdminProjectManager(String email, String encodedPassword) {
		this.fullName = "Admin";
		this.email = email;
		this.phoneNumber = "0000000000";
		this.password = encodedPassword;
		this.role = UserRole.ADMIN_PROJECT_MANAGER;
	}
}
