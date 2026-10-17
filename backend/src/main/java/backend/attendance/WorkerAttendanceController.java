package backend.attendance;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.project.Project;
import backend.project.ProjectRepository;
import backend.project.ProjectResponse;
import backend.task.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/worker/attendance")
public class WorkerAttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final AppUserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public WorkerAttendanceController(AttendanceRepository attendanceRepository, AppUserRepository userRepository, ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    private AppUser getAuthenticatedWorker(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping("/today")
    public AttendanceDashboardResponse getTodayAttendance(Authentication authentication) {
        AppUser worker = getAuthenticatedWorker(authentication);
        LocalDate today = LocalDate.now();

        Optional<Attendance> todayRecord = attendanceRepository.findByWorker_IdAndAttendanceDate(worker.getId(), today);
        AttendanceResponse todayRes = todayRecord.map(AttendanceResponse::from).orElse(null);

        // Find available projects where the worker has an assigned task
        List<ProjectResponse> availableProjects = taskRepository.findByAssignedWorkers_IdOrderByCreatedAtDesc(worker.getId())
                .stream()
                .map(backend.task.Task::getProject)
                .distinct()
                .map(ProjectResponse::from)
                .collect(Collectors.toList());

        return new AttendanceDashboardResponse(todayRes, availableProjects);
    }

    @PostMapping("/clock-in")
    public AttendanceResponse clockIn(@RequestBody ClockInRequest request, Authentication authentication) {
        AppUser worker = getAuthenticatedWorker(authentication);
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository.findByWorker_IdAndAttendanceDate(worker.getId(), today);
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already clocked in today.");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (project.getSite() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project does not have an active site");
        }

        // Verify assignment
        boolean isAssigned = taskRepository.findByAssignedWorkers_IdOrderByCreatedAtDesc(worker.getId())
                .stream().anyMatch(t -> t.getProject().getId().equals(project.getId()));
        
        if (!isAssigned) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not assigned to any task in this project");
        }

        Attendance attendance = new Attendance(worker, project, project.getSite(), today, Instant.now(), "CLOCKED_IN");
        return AttendanceResponse.from(attendanceRepository.save(attendance));
    }

    @PostMapping("/clock-out")
    public AttendanceResponse clockOut(Authentication authentication) {
        AppUser worker = getAuthenticatedWorker(authentication);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByWorker_IdAndAttendanceDate(worker.getId(), today)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not clocked in today."));

        if (attendance.getClockOutTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already clocked out today.");
        }

        Instant now = Instant.now();
        attendance.setClockOutTime(now);
        attendance.setStatus("CLOCKED_OUT");
        attendance.setUpdatedAt(now);

        long minutes = Duration.between(attendance.getClockInTime(), now).toMinutes();
        attendance.setTotalMinutes((int) minutes);

        return AttendanceResponse.from(attendanceRepository.save(attendance));
    }

    @GetMapping("/history")
    public List<AttendanceResponse> getHistory(Authentication authentication) {
        AppUser worker = getAuthenticatedWorker(authentication);
        return attendanceRepository.findByWorker_IdOrderByAttendanceDateDesc(worker.getId())
                .stream().map(AttendanceResponse::from).toList();
    }
}
