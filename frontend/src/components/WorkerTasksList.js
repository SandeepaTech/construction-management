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
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a', fontWeight: '700' }}>My Assigned Tasks</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>View and manage all your ongoing construction tasks and assignments.</p>
      </div>
      
      {error && <div className="form-error-banner" style={{ marginBottom: '24px', padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '14px' }}>{error}</div>}

      <div className="client-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {tasks.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', backgroundColor: '#f8fafc', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>No tasks assigned yet</h3>
            <p style={{ margin: 0, fontSize: '15px' }}>When you are assigned to a task, it will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task Name</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</th>
                  <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const isLead = task.leadWorker.id === user.id;
                  return (
                    <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>🚜</div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>{task.title}</strong>
                            {task.priority === 'HIGH' || task.priority === 'CRITICAL' ? (
                              <span style={{ padding: '4px 8px', fontSize: '11px', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                                {task.priority} PRIORITY
                              </span>
                            ) : (
                              <span style={{ padding: '4px 8px', fontSize: '11px', background: '#f1f5f9', color: '#64748b', borderRadius: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                                NORMAL PRIORITY
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{task.project?.name || `Project #${task.projectId}`}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Eng: {task.assignedSiteEngineer?.fullName || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        {isLead ? (
                          <span style={{ padding: '6px 12px', fontSize: '12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', fontWeight: '700' }}>
                            Lead Worker
                          </span>
                        ) : (
                          <span style={{ padding: '6px 12px', fontSize: '12px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontWeight: '600' }}>
                            Team Member
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ padding: '6px 12px', background: task.status === 'READY' ? '#dcfce7' : task.status === 'COMPLETED' ? '#f1f5f9' : '#fef9c3', color: task.status === 'READY' ? '#166534' : task.status === 'COMPLETED' ? '#475569' : '#854d0e', borderRadius: '4px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${task.progress}%`, height: '100%', background: task.progress === 100 ? '#10b981' : '#3b82f6' }}></div>
                          </div>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{task.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button 
                          style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
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
    </div>
  );
}
