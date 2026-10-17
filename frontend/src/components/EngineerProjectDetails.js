import React, { useState, useEffect } from 'react';
import { EngineerTaskCreateForm } from './EngineerTaskCreateForm';
import { EngineerTaskReviewModal } from './EngineerTaskReviewModal';

export function EngineerProjectDetails({ projectId, apiUrl, getCsrfToken, onBack }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch(`${apiUrl}/api/engineer/projects/${projectId}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load project details.');
        const projData = await res.json();
        
        // Fetch tasks
        const tasksRes = await fetch(`${apiUrl}/api/engineer/projects/${projectId}/tasks`, { credentials: 'include' });
        let tasksData = [];
        if (tasksRes.ok) {
          tasksData = await tasksRes.json();
        }

        // Fetch attendance
        const attRes = await fetch(`${apiUrl}/api/engineer/projects/${projectId}/attendance/today`, { credentials: 'include' });
        let attData = [];
        if (attRes.ok) {
          attData = await attRes.json();
        }
        
        return { projData, tasksData, attData };
      })
      .then(({ projData, tasksData, attData }) => {
        if (mounted) {
          setProject(projData);
          setTasks(tasksData);
          setAttendance(attData);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [apiUrl, projectId]);

  if (loading) {
    return (
      <div className="client-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error-banner" role="alert">
        {error}
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, fontWeight: 500 }}>
          ← Back to My Projects
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a' }}>{project.name}</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Project ID: #{project.id}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>PROJECT PROGRESS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '120px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${project.progress || 0}%`, height: '100%', background: (project.progress || 0) === 100 ? '#10b981' : '#3b82f6' }}></div>
              </div>
              <strong style={{ fontSize: '18px', color: '#0f172a' }}>{project.progress || 0}%</strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>STATUS:</span>
            <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
              {project.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="client-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>1</span>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Client Information</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Client Name</span>
              <strong style={{ color: '#0f172a' }}>{project.clientName}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / span 2' }}>
              <span style={{ color: '#64748b' }}>Project Description</span>
              <strong style={{ color: '#0f172a' }}>{project.description || 'N/A'}</strong>
            </div>
          </div>
        </div>

        <div className="client-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>2</span>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Site & Timeline</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Site Name</span>
              <strong style={{ color: '#0f172a' }}>{project.siteName || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Location</span>
              <strong style={{ color: '#0f172a' }}>{project.siteLocation || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Start Date</span>
              <strong style={{ color: '#0f172a' }}>{project.startDate || 'TBD'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Expected End Date</span>
              <strong style={{ color: '#0f172a' }}>{project.expectedEndDate || 'TBD'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / span 2' }}>
              <span style={{ color: '#64748b' }}>Address</span>
              <strong style={{ color: '#0f172a' }}>{project.siteAddress || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="client-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>3</span>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Progress Overview</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <strong style={{ color: '#0f172a' }}>Overall Progress</strong>
              <strong style={{ color: '#3b82f6' }}>{project.progress || 0}%</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${project.progress || 0}%`, height: '100%', background: '#3b82f6' }}></div>
            </div>
          </div>
        </div>

        <div className="client-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>4</span>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Today's Worker Attendance</h3>
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {attendance.length === 0 ? (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No workers have clocked in today.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', fontWeight: '600' }}>{a.worker?.fullName}</td>
                      <td style={{ padding: '8px 0' }}>
                        <span className={`status-badge status-${a.status.toLowerCase()}`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: '#64748b' }}>
                        {new Date(a.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {a.clockOutTime && ` - ${new Date(a.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '48px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Project Tasks</h2>
        {!showCreateTask && (
          <button className="primary-button" onClick={() => setShowCreateTask(true)}>
            + Create Task
          </button>
        )}
      </div>

      {showCreateTask && (
        <EngineerTaskCreateForm 
          projectId={projectId}
          apiUrl={apiUrl}
          getCsrfToken={getCsrfToken}
          onCancel={() => setShowCreateTask(false)}
          onSuccess={(newTask) => {
            setTasks(prev => [newTask, ...prev]);
            setShowCreateTask(false);
          }}
        />
      )}

      {!showCreateTask && tasks.length === 0 && (
        <div className="client-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No tasks have been created for this project yet.</p>
        </div>
      )}

      {!showCreateTask && tasks.length > 0 && (
        <div className="table-responsive client-panel">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>TASK</th>
                <th>LEAD WORKER</th>
                <th>WORKERS</th>
                <th>START DATE</th>
                <th>DUE DATE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>PROGRESS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                  </td>
                  <td>{task.leadWorker?.fullName || 'Unassigned'}</td>
                  <td>{task.assignedWorkers?.length || 0}</td>
                  <td>{task.startDate || '—'}</td>
                  <td>{task.dueDate || '—'}</td>
                  <td>
                    <span className={`status-badge priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${task.status.toLowerCase()}`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{task.progress}%</td>
                  <td>
                    <button className="table-action-btn" onClick={() => setReviewTaskId(task.id)}>View / Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewTaskId && (
        <EngineerTaskReviewModal
          taskId={reviewTaskId}
          apiUrl={apiUrl}
          getCsrfToken={getCsrfToken}
          onClose={() => setReviewTaskId(null)}
          onReviewed={(updatedTask) => {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            setReviewTaskId(null);
          }}
        />
      )}
    </div>
  );
}
