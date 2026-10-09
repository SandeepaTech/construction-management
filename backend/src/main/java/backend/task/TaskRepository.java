package backend.task;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
	List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);
	List<Task> findByAssignedWorkers_IdOrderByCreatedAtDesc(Long workerId);
}
