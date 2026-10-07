package backend.client;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRequestAttachmentRepository extends JpaRepository<ProjectRequestAttachment, Long> {
	List<ProjectRequestAttachment> findByProjectRequestId(Long projectRequestId);
}
