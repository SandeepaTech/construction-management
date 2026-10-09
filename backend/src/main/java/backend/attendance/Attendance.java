package backend.attendance;

import java.time.Instant;
import java.time.LocalDate;

import backend.auth.AppUser;
import backend.project.Project;
import backend.project.Site;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"worker_id", "attendance_date"})
})
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "worker_id", nullable = false)
    private AppUser worker;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column
    private Instant clockInTime;

    @Column
    private Instant clockOutTime;

    @Column
    private Integer totalMinutes;

    @Column(length = 50)
    private String status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column
    private Instant updatedAt = Instant.now();

    protected Attendance() {}

    public Attendance(AppUser worker, Project project, Site site, LocalDate attendanceDate, Instant clockInTime, String status) {
        this.worker = worker;
        this.project = project;
        this.site = site;
        this.attendanceDate = attendanceDate;
        this.clockInTime = clockInTime;
        this.status = status;
    }

    public Long getId() { return id; }
    public AppUser getWorker() { return worker; }
    public Project getProject() { return project; }
    public Site getSite() { return site; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public Instant getClockInTime() { return clockInTime; }
    public void setClockInTime(Instant clockInTime) { this.clockInTime = clockInTime; }
    public Instant getClockOutTime() { return clockOutTime; }
    public void setClockOutTime(Instant clockOutTime) { this.clockOutTime = clockOutTime; }
    public Integer getTotalMinutes() { return totalMinutes; }
    public void setTotalMinutes(Integer totalMinutes) { this.totalMinutes = totalMinutes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
