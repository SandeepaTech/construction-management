package backend.client;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {
	List<ProjectRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);
}
