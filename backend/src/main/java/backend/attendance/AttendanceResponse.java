package backend.attendance;

import java.time.Instant;
import java.time.LocalDate;

import backend.auth.AuthResponse;
import backend.project.ProjectResponse;
import backend.project.SiteResponse;

public class AttendanceResponse {
    private Long id;
    private AuthResponse worker;
    private ProjectResponse project;
    private SiteResponse site;
    private LocalDate attendanceDate;
    private Instant clockInTime;
    private Instant clockOutTime;
    private Integer totalMinutes;
    private String status;
    private Instant createdAt;

    public static AttendanceResponse from(Attendance attendance) {
        AttendanceResponse res = new AttendanceResponse();
        res.id = attendance.getId();
        res.worker = AuthResponse.from(attendance.getWorker());
        res.project = ProjectResponse.from(attendance.getProject());
        res.site = SiteResponse.from(attendance.getSite());
        res.attendanceDate = attendance.getAttendanceDate();
        res.clockInTime = attendance.getClockInTime();
        res.clockOutTime = attendance.getClockOutTime();
        res.totalMinutes = attendance.getTotalMinutes();
        res.status = attendance.getStatus();
        res.createdAt = attendance.getCreatedAt();
        return res;
    }

    public Long getId() { return id; }
    public AuthResponse getWorker() { return worker; }
    public ProjectResponse getProject() { return project; }
    public SiteResponse getSite() { return site; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public Instant getClockInTime() { return clockInTime; }
    public Instant getClockOutTime() { return clockOutTime; }
    public Integer getTotalMinutes() { return totalMinutes; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
