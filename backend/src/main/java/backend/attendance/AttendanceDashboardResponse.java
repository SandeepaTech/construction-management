package backend.attendance;

import java.util.List;
import backend.project.ProjectResponse;

public class AttendanceDashboardResponse {
    private AttendanceResponse todayAttendance;
    private List<ProjectResponse> availableProjects;

    public AttendanceDashboardResponse(AttendanceResponse todayAttendance, List<ProjectResponse> availableProjects) {
        this.todayAttendance = todayAttendance;
        this.availableProjects = availableProjects;
    }

    public AttendanceResponse getTodayAttendance() { return todayAttendance; }
    public List<ProjectResponse> getAvailableProjects() { return availableProjects; }
}
