package backend.project;

import java.time.Instant;

import backend.auth.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sites")
public class Site {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 150)
	private String name;

	@Column(nullable = false, length = 250)
	private String location;

	@Column(length = 350)
	private String address;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "assigned_engineer_id")
	private AppUser assignedEngineer;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	protected Site() {
	}

	public Site(String name, String location, String address, AppUser assignedEngineer) {
		this.name = name;
		this.location = location;
		this.address = address;
		this.assignedEngineer = assignedEngineer;
		this.createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public AppUser getAssignedEngineer() {
		return assignedEngineer;
	}

	public void setAssignedEngineer(AppUser assignedEngineer) {
		this.assignedEngineer = assignedEngineer;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
