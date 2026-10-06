package backend.client;

import java.util.List;
import java.util.Locale;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.auth.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClientProjectRequestService {
	private final AppUserRepository users;
	private final ProjectRequestRepository requests;

	public ClientProjectRequestService(AppUserRepository users, ProjectRequestRepository requests) {
		this.users = users;
		this.requests = requests;
	}

	@Transactional(readOnly = true)
	public List<ProjectRequestResponse> listForClient(String email) {
		AppUser client = getClient(email);
		return requests.findByClientIdOrderByCreatedAtDesc(client.getId())
				.stream()
				.map(ProjectRequestResponse::from)
				.toList();
	}

	@Transactional
	public ProjectRequestResponse submit(String email, ProjectRequestPayload payload) {
		AppUser client = getClient(email);
		ProjectRequest request = new ProjectRequest(
				payload.projectName().trim(),
				payload.projectType().trim(),
				payload.location().trim(),
				payload.description().trim(),
				client);
		return ProjectRequestResponse.from(requests.save(request));
	}

	private AppUser getClient(String email) {
		AppUser user = users.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client account not found."));
		if (user.getRole() != UserRole.CLIENT && user.getRole() != UserRole.CLIENT_BUILDING_OWNER) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only client accounts can manage project requests.");
		}
		return user;
	}
}
