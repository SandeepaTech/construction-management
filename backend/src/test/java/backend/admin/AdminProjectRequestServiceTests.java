package backend.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.client.ProjectRequest;
import backend.client.ProjectRequestRepository;
import backend.client.ProjectRequestResponse;
import backend.client.ProjectRequestStatus;
import backend.notification.NotificationService;
import backend.project.Project;
import backend.project.ProjectRepository;
import backend.project.ProjectResponse;
import backend.project.Site;
import backend.project.SiteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AdminProjectRequestServiceTests {
	@Mock
	private ProjectRequestRepository requests;

	@Mock
	private ProjectRepository projects;

	@Mock
	private SiteRepository sites;

	@Mock
	private AppUserRepository users;

	@Mock
	private NotificationService notificationService;

	@Mock
	private AppUser client;

	private AdminProjectRequestService service;

	@BeforeEach
	void setUp() {
		service = new AdminProjectRequestService(requests, projects, sites, users, notificationService);
	}

	@Test
	void markUnderReviewUpdatesStatus() {
		ProjectRequest request = new ProjectRequest("Villa", "Home Construction", "Colombo", "Luxury Villa", client);
		when(requests.findById(1L)).thenReturn(Optional.of(request));
		when(requests.save(any(ProjectRequest.class))).thenAnswer(i -> i.getArgument(0));

		ProjectRequestResponse response = service.markUnderReview(1L);

		assertEquals("UNDER_REVIEW", response.status());
		verify(notificationService).notifyClient(any(), any(), any(), any());
	}

	@Test
	void requestChangesSetsNeedsRevisionAndReason() {
		ProjectRequest request = new ProjectRequest("Villa", "Home Construction", "Colombo", "Luxury Villa", client);
		when(requests.findById(1L)).thenReturn(Optional.of(request));
		when(requests.save(any(ProjectRequest.class))).thenAnswer(i -> i.getArgument(0));

		ProjectRequestResponse response = service.requestChanges(1L, new RequestChangesPayload("Please upload land plan"));

		assertEquals("NEEDS_REVISION", response.status());
		assertEquals("Please upload land plan", response.revisionReason());
		verify(notificationService).notifyClient(any(), any(), any(), any());
	}

	@Test
	void approveRequestCreatesProjectAndSite() {
		ProjectRequest request = new ProjectRequest("Villa", "Home Construction", "Colombo", "Luxury Villa", client);
		when(requests.findById(1L)).thenReturn(Optional.of(request));
		when(sites.save(any(Site.class))).thenAnswer(i -> i.getArgument(0));
		when(projects.save(any(Project.class))).thenAnswer(i -> i.getArgument(0));
		when(requests.save(any(ProjectRequest.class))).thenAnswer(i -> i.getArgument(0));

		ApproveProjectRequestPayload payload = new ApproveProjectRequestPayload(
				"Villa Project",
				"LKR 20M - 50M",
				LocalDate.of(2026, 11, 1),
				LocalDate.of(2027, 11, 1),
				"Villa Construction Site",
				"Colombo 07",
				"123 Flower Road",
				null);

		ProjectResponse response = service.approveRequest(1L, payload);

		assertNotNull(response);
		assertEquals("Villa Project", response.name());
		assertEquals(ProjectRequestStatus.APPROVED, request.getStatus());
		verify(notificationService).notifyClient(any(), any(), any(), any());
	}

	@Test
	void rejectRequestRequiresReasonAndSetsRejected() {
		ProjectRequest request = new ProjectRequest("Villa", "Home Construction", "Colombo", "Luxury Villa", client);
		when(requests.findById(1L)).thenReturn(Optional.of(request));
		when(requests.save(any(ProjectRequest.class))).thenAnswer(i -> i.getArgument(0));

		ProjectRequestResponse response = service.rejectRequest(1L, new RejectRequestPayload("Budget infeasible"));

		assertEquals("REJECTED", response.status());
		assertEquals("Budget infeasible", response.rejectionReason());
		verify(notificationService).notifyClient(any(), any(), any(), any());
	}

	@Test
	void rejectRequestWithEmptyReasonFails() {
		assertThrows(ResponseStatusException.class, () -> service.rejectRequest(1L, new RejectRequestPayload("")));
	}
}
