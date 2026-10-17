package backend.attendance;

import java.time.LocalDate;
import java.util.List;

import backend.auth.AppUser;
import backend.auth.AppUserRepository;
import backend.project.Project;
import backend.project.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/engineer/projects/{projectId}/attendance")
public class EngineerAttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final AppUserRepository userRepository;
    private final ProjectRepository projectRepository;

    public EngineerAttendanceController(AttendanceRepository attendanceRepository, AppUserRepository userRepository, ProjectRepository projectRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping("/today")
    public List<AttendanceResponse> getTodayAttendance(@PathVariable Long projectId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        AppUser engineer = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (project.getSite() == null || project.getSite().getAssignedEngineer() == null 
                || !project.getSite().getAssignedEngineer().getId().equals(engineer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view attendance for this project");
        }

        LocalDate today = LocalDate.now();
        return attendanceRepository.findByProjectIdAndDate(projectId, today)
                .stream().map(AttendanceResponse::from).toList();
    }
}
