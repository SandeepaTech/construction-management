package backend.client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.auth.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ClientProjectRequestServiceTests {
	@Mock
	private AppUserRepository users;

	@Mock
	private ProjectRequestRepository requests;

	@Mock
	private AppUser client;

	@Mock
	private AppUser nonClient;

	@InjectMocks
	private ClientProjectRequestService service;

	@Test
	void submittedRequestIsAssociatedWithTheSignedInClient() {
		when(users.findByEmailIgnoreCase("client@example.com")).thenReturn(Optional.of(client));
		when(client.getRole()).thenReturn(UserRole.CLIENT);
		when(requests.save(any(ProjectRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

		ProjectRequestResponse response = service.submit(
				"client@example.com",
				new ProjectRequestPayload("Home build", "Residential", "Colombo", "Two-storey family home"));

		ArgumentCaptor<ProjectRequest> savedRequest = ArgumentCaptor.forClass(ProjectRequest.class);
		verify(requests).save(savedRequest.capture());
		assertEquals(client, savedRequest.getValue().getClient());
		assertEquals("PENDING", response.status());
		assertEquals("Home build", response.projectName());
	}

	@Test
	void staffAccountCannotSubmitClientProjectRequests() {
		when(users.findByEmailIgnoreCase("staff@example.com")).thenReturn(Optional.of(nonClient));
		when(nonClient.getRole()).thenReturn(UserRole.SITE_ENGINEER);

		assertThrows(ResponseStatusException.class, () -> service.submit(
				"staff@example.com",
				new ProjectRequestPayload("Home build", "Residential", "Colombo", "Two-storey family home")));
		verify(requests, never()).save(any(ProjectRequest.class));
	}
}
