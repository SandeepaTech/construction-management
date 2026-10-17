package backend.task;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskProgressUpdateRepository extends JpaRepository<TaskProgressUpdate, Long> {
	List<TaskProgressUpdate> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}
