package backend.client;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {
	List<ProjectRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);

	@Query("SELECT r FROM ProjectRequest r WHERE r.client.id = :clientId ORDER BY COALESCE(r.submittedAt, r.createdAt) DESC")
	List<ProjectRequest> findByClientIdOrderByLatest(@Param("clientId") Long clientId);

	@Query("SELECT r FROM ProjectRequest r " +
			"JOIN r.client c " +
			"WHERE (:status IS NULL OR r.status = :status) " +
			"AND (:projectType IS NULL OR :projectType = '' OR LOWER(r.projectType) = LOWER(:projectType)) " +
			"AND (:query IS NULL OR :query = '' OR " +
			"     LOWER(r.projectName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
			"     LOWER(c.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
			"     LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
			"     LOWER(r.location) LIKE LOWER(CONCAT('%', :query, '%'))) " +
			"ORDER BY " +
			"CASE WHEN :sortAsc = true THEN COALESCE(r.submittedAt, r.createdAt) END ASC, " +
			"CASE WHEN :sortAsc = false THEN COALESCE(r.submittedAt, r.createdAt) END DESC")
	List<ProjectRequest> searchAndFilter(
			@Param("status") ProjectRequestStatus status,
			@Param("projectType") String projectType,
			@Param("query") String query,
			@Param("sortAsc") boolean sortAsc);
}
