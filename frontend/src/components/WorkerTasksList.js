import React, { useState, useEffect } from 'react';

export function WorkerTasksList({ apiUrl, onNavigate, user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${apiUrl}/api/worker/tasks`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to load tasks');
        return res.json();
      })
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <div className="client-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading tasks...</div>;

  return (
    <div className="client-panel" style={{ padding: '32px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a' }}>My Assigned Tasks</h2>
      
      {error && <div className="form-error-banner" style={{ marginBottom: '24px' }}>{error}</div>}

      {tasks.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
          You have no assigned tasks.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Project</th>
                <th>Site Engineer</th>
                <th>Role</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const isLead = task.leadWorker.id === user.id;
                return (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.title}</strong>
                      {task.priority === 'HIGH' || task.priority === 'CRITICAL' ? (
                        <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '11px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontWeight: 'bold' }}>
                          {task.priority}
                        </span>
                      ) : null}
                    </td>
                    <td>{task.projectId} (Project)</td>
                    <td>{task.assignedSiteEngineer?.fullName || 'N/A'}</td>
                    <td>
                      {isLead ? (
                        <span style={{ padding: '4px 8px', fontSize: '12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', fontWeight: '600' }}>
                          LEAD WORKER
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Team Member</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${task.status.toLowerCase()}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${task.progress}%`, height: '100%', background: task.progress === 100 ? '#10b981' : '#3b82f6' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{task.progress}%</span>
                      </div>
                    </td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <button 
                        className="secondary-button" 
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => onNavigate(`/worker/tasks/${task.id}`)}
                      >
                        View Task
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
