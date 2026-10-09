package backend.project;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
	List<Project> findByClientIdOrderByCreatedAtDesc(Long clientId);
	List<Project> findBySiteAssignedEngineerIdOrderByCreatedAtDesc(Long assignedEngineerId);
	Optional<Project> findByProjectRequestId(Long projectRequestId);
}
