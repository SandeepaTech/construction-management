package backend.auth;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
	private final AppUserRepository users;

	public AdminController(AppUserRepository users) {
		this.users = users;
	}

	@GetMapping("/users")
	public List<AuthResponse> users() {
		return users.findAll(Sort.by(Sort.Direction.DESC, "id"))
				.stream()
				.map(AuthResponse::from)
				.toList();
	}
}
