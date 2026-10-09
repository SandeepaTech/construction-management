package backend.attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByWorker_IdAndAttendanceDate(Long workerId, LocalDate attendanceDate);
    
    List<Attendance> findByWorker_IdOrderByAttendanceDateDesc(Long workerId);

    @Query("SELECT a FROM Attendance a JOIN a.project p WHERE p.id = :projectId AND a.attendanceDate = :date ORDER BY a.clockInTime ASC")
    List<Attendance> findByProjectIdAndDate(@Param("projectId") Long projectId, @Param("date") LocalDate date);
}
