import React, { useState, useEffect } from 'react';

export function WorkerTaskDetails({ taskId, apiUrl, getCsrfToken, onBack, user }) {
  const [task, setTask] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Progress form state
  const [progressUpdate, setProgressUpdate] = useState('');
  const [progressNote, setProgressNote] = useState('');

  const fetchData = async () => {
    try {
      const [taskRes, histRes] = await Promise.all([
        fetch(`${apiUrl}/api/worker/tasks/${taskId}`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/worker/tasks/${taskId}/progress`, { credentials: 'include' })
      ]);

      if (!taskRes.ok) throw new Error('Failed to load task details');
      
      const taskData = await taskRes.json();
      setTask(taskData);
      setProgressUpdate(taskData.progress.toString());

      if (histRes.ok) {
        setHistory(await histRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [taskId, apiUrl]);

  const handleStartTask = async () => {
    setBusy(true);
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/worker/tasks/${taskId}/start`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.detail || 'Failed to start task');
      }
      const updatedTask = await res.json();
      setTask(updatedTask);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/worker/tasks/${taskId}/progress`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
          progress: parseInt(progressUpdate, 10),
          note: progressNote
        })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.detail || 'Failed to update progress');
      }
      
      const updatedTask = await res.json();
      setTask(updatedTask);
      setProgressNote('');
      
      // Refresh history
      const histRes = await fetch(`${apiUrl}/api/worker/tasks/${taskId}/progress`, { credentials: 'include' });
      if (histRes.ok) setHistory(await histRes.json());
      
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="client-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading task details...</div>;
  if (!task) return <div className="client-panel" style={{ padding: '40px' }}>Task not found or you do not have permission.</div>;

  const isLead = task.leadWorker.id === user.id;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <button className="secondary-button" onClick={onBack} style={{ marginBottom: '24px' }}>← Back to Tasks</button>
      
      {error && <div className="form-error-banner" style={{ marginBottom: '24px' }}>{error}</div>}

      <div className="client-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#0f172a' }}>{task.title}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`status-badge status-${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Priority: <strong>{task.priority}</strong></span>
              {isLead && <span style={{ padding: '4px 8px', fontSize: '12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', fontWeight: '600' }}>LEAD WORKER</span>}
            </div>
          </div>
          {isLead && task.status === 'READY' && (
            <button className="primary-button" onClick={handleStartTask} disabled={busy}>
              {busy ? 'Starting...' : 'Start Task'}
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Task Details</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6' }}>{task.description || 'No description provided.'}</p>
            {task.notes && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '13px', borderLeft: '3px solid #3b82f6', marginBottom: '16px' }}>
                <strong>Special Instructions:</strong><br/>{task.notes}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Start Date:</span>
              <strong>{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</strong>
              <span style={{ color: '#64748b' }}>Due Date:</span>
              <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</strong>
              <span style={{ color: '#64748b' }}>Est. Hours:</span>
              <strong>{task.estimatedHours || 'N/A'}</strong>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Team & Environment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '13px', marginBottom: '24px' }}>
              <span style={{ color: '#64748b' }}>Project ID:</span>
              <strong>{task.projectId}</strong>
              <span style={{ color: '#64748b' }}>Site Engineer:</span>
              <strong>{task.assignedSiteEngineer?.fullName || 'Unassigned'}</strong>
              <span style={{ color: '#64748b' }}>Lead Worker:</span>
              <strong>{task.leadWorker?.fullName}</strong>
            </div>

            <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Assigned Workers ({task.assignedWorkers?.length || 0})</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
              {task.assignedWorkers?.map(w => (
                <li key={w.id}>{w.fullName} {w.id === task.leadWorker?.id ? '(Lead)' : ''}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="client-panel" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '18px' }}>Task Progress</h3>
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600' }}>Current Progress</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{task.progress}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${task.progress}%`, height: '100%', background: task.progress === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {isLead ? (
          task.status === 'READY' ? (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', color: '#64748b', textAlign: 'center' }}>
              You must <strong>Start Task</strong> before updating progress.
            </div>
          ) : task.status === 'COMPLETED' ? (
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', color: '#166534', textAlign: 'center' }}>
              This task is completed. Progress can no longer be updated.
            </div>
          ) : (
            <form onSubmit={handleUpdateProgress} style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Update Progress</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '100px' }}>
                  <label htmlFor="progress" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>% Complete</label>
                  <input 
                    id="progress" 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={progressUpdate} 
                    onChange={e => setProgressUpdate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="progressNote" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Progress Note (Optional)</label>
                  <input 
                    id="progressNote" 
                    type="text"
                    value={progressNote}
                    onChange={e => setProgressNote(e.target.value)}
                    placeholder="e.g. Completed front trenches"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ paddingTop: '24px' }}>
                  <button type="submit" className="primary-button" disabled={busy}>Update</button>
                </div>
              </div>
            </form>
          )
        ) : (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', color: '#64748b', textAlign: 'center' }}>
            This task progress is managed by the Lead Worker ({task.leadWorker?.fullName}).
          </div>
        )}

        {history.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#475569' }}>Progress History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map(record => (
                <div key={record.id} style={{ display: 'flex', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ minWidth: '40px', fontWeight: 'bold', color: '#3b82f6' }}>{record.progress}%</div>
                  <div style={{ flex: 1 }}>
                    {record.note && <div style={{ fontSize: '14px', marginBottom: '4px', color: '#1e293b' }}>{record.note}</div>}
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Updated by {record.updatedBy?.fullName} on {new Date(record.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
