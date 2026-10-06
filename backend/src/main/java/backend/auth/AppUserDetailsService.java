package backend.auth;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {
	private final AppUserRepository users;

	public AppUserDetailsService(AppUserRepository users) {
		this.users = users;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		AppUser user = users.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new UsernameNotFoundException("Account not found"));
		return User.withUsername(user.getEmail())
				.password(user.getPassword())
				.authorities("ROLE_" + user.getRole().name())
				.build();
	}
}
