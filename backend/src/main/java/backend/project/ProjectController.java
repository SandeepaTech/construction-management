package backend.project;

import java.util.List;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.auth.AuthResponse;
import backend.auth.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping
public class ProjectController {
	private final ProjectRepository projectRepository;
	private final AppUserRepository userRepository;

	public ProjectController(ProjectRepository projectRepository, AppUserRepository userRepository) {
		this.projectRepository = projectRepository;
		this.userRepository = userRepository;
	}

	@GetMapping({ "/api/admin/projects/{id}", "/api/projects/{id}" })
	public ProjectResponse getAdminProject(@PathVariable Long id) {
		Project project = projectRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found: " + id));
		return ProjectResponse.from(project);
	}

	@GetMapping({ "/api/admin/projects", "/api/projects" })
	public List<ProjectResponse> listAllProjects() {
		return projectRepository.findAll().stream().map(ProjectResponse::from).toList();
	}

	@GetMapping("/api/admin/site-engineers")
	public List<AuthResponse> listSiteEngineers() {
		return userRepository.findAll().stream()
				.filter(u -> u.getRole() == UserRole.SITE_ENGINEER)
				.map(AuthResponse::from)
				.toList();
	}

	@GetMapping("/api/client/projects")
	public List<ProjectResponse> listClientProjects(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		AppUser user = userRepository.findByEmailIgnoreCase(authentication.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
		return projectRepository.findByClientIdOrderByCreatedAtDesc(user.getId())
				.stream()
				.map(ProjectResponse::from)
				.toList();
	}

	@GetMapping("/api/client/projects/{id}")
	public ProjectResponse getClientProject(@PathVariable Long id, Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		AppUser user = userRepository.findByEmailIgnoreCase(authentication.getName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
		Project project = projectRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found: " + id));
		if (!project.getClient().getId().equals(user.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN);
		}
		return ProjectResponse.from(project);
	}
}
