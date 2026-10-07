package backend.auth;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class SecurityConfig {
	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.cors(Customizer.withDefaults())
				.csrf(csrf -> csrf
						.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
						.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/api/auth/csrf", "/api/auth/register", "/api/auth/login").permitAll()
						.requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
						.requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "ADMIN_PROJECT_MANAGER")
						.requestMatchers("/api/client/**").hasAnyRole("CLIENT", "CLIENT_BUILDING_OWNER")
						.requestMatchers("/api/engineer/**").hasRole("SITE_ENGINEER")
						.requestMatchers("/api/project-requests/**").authenticated()
						.requestMatchers("/api/notifications/**").authenticated()
						.anyRequest().permitAll())
				.formLogin(form -> form.disable())
				.httpBasic(basic -> basic.disable())
				.build();
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://127.0.0.1:3000"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN", "Accept", "Authorization", "X-Requested-With"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", configuration);
		return source;
	}
}
