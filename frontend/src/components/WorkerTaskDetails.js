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
  
  // Submit for review state
  const [finalNote, setFinalNote] = useState('');

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/worker/tasks/${taskId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ note: finalNote })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.detail || 'Failed to submit for review');
      }
      
      const updatedTask = await res.json();
      setTask(updatedTask);
      
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <button className="secondary-button" onClick={onBack} style={{ marginBottom: '24px', background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>← Back to Tasks</button>
      
      {error && <div className="form-error-banner" style={{ marginBottom: '24px', padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px', border: '1px solid #f1f5f9' }}>🚜</div>
          <div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '28px', color: '#0f172a', fontWeight: '700' }}>{task.title}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ padding: '6px 12px', background: task.status === 'READY' ? '#dcfce7' : '#e0e7ff', color: task.status === 'READY' ? '#166534' : '#3730a3', borderRadius: '4px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>{task.status.replace('_', ' ')}</span>
              <span style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Priority: <strong style={{ fontWeight: '800' }}>{task.priority}</strong></span>
              {isLead && <span style={{ padding: '6px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>LEAD WORKER</span>}
            </div>
          </div>
        </div>
        {isLead && task.status === 'READY' && (
          <button onClick={handleStartTask} disabled={busy} style={{ background: '#facc15', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: busy ? 0.7 : 1 }}>
            <span style={{ fontSize: '18px' }}>▶</span> {busy ? 'Starting...' : 'Start Task'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Task Details */}
          <div className="client-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#eff6ff', color: '#3b82f6', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>📄</div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Task Details</h3>
            </div>
            <p style={{ margin: '0 0 24px 0', fontSize: '15px', lineHeight: '1.6', color: '#334155' }}>{task.description || 'No description provided.'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 24px', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>🏢 Project</div>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{task.projectId} ({task.project?.name || 'Project'})</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>📅 Start Date</div>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>📅 Due Date</div>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>⏱️ Estimated Hours</div>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{task.estimatedHours || 'N/A'}</strong>
            </div>
          </div>

          {/* Safety / Special Instructions */}
          {task.notes ? (
            <div className="client-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: '#fef3c7', color: '#d97706', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>🛡️</div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Safety / Special Instructions</h3>
              </div>
              <div style={{ background: '#fef9c3', padding: '24px', borderRadius: '8px', borderLeft: '4px solid #facc15', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px', color: '#ca8a04' }}>⚠️</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '15px', color: '#854d0e', marginBottom: '8px' }}>Special Instructions:</strong>
                  <div style={{ fontSize: '14px', color: '#713f12', lineHeight: '1.6' }}>{task.notes}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="client-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: '#fef3c7', color: '#d97706', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>🛡️</div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Safety / Special Instructions</h3>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>No special instructions provided.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Team & Environment */}
          <div className="client-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>👥</div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Team & Environment</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px 24px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>👤 Site Engineer</div>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{task.assignedSiteEngineer?.fullName || 'Unassigned'}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>👤 Lead Worker</div>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{task.leadWorker?.fullName}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>🏢 Project ID</div>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{task.projectId}</strong>
            </div>
          </div>

          {/* Assigned Workers */}
          <div className="client-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f3e8ff', color: '#9333ea', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>👥</div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Assigned Workers ({task.assignedWorkers?.length || 0})</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {task.assignedWorkers?.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: '#0f172a', fontSize: '20px' }}>👤</div>
                  <strong style={{ fontSize: '15px', color: '#334155', flex: 1 }}>{w.fullName}</strong>
                  {w.id === task.leadWorker?.id ? (
                    <span style={{ padding: '6px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Lead Worker</span>
                  ) : (
                    <span style={{ padding: '6px 12px', background: '#f1f5f9', color: '#64748b', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Worker</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="client-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', background: '#eff6ff', color: '#3b82f6', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>📊</div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Task Progress</h3>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#334155' }}>Current Progress</span>
            <span style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>{task.progress}%</span>
          </div>
          <div style={{ width: '100%', height: '16px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${task.progress}%`, height: '100%', background: task.progress === 100 ? '#10b981' : '#334155', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {isLead ? (
          task.status === 'READY' ? (
            <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', color: '#1e3a8a', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '20px', color: '#3b82f6' }}>ℹ️</span> You must <strong>Start Task</strong> before updating progress.
            </div>
          ) : task.status === 'COMPLETED' ? (
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', color: '#166534', textAlign: 'center' }}>
              This task is completed. Progress can no longer be updated.
            </div>
          ) : task.status === 'UNDER_REVIEW' ? (
            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '8px', color: '#b45309', border: '1px solid #fef3c7', textAlign: 'center' }}>
              Waiting for Site Engineer review. You cannot change progress right now.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

              {task.progress === 100 && (
                <form onSubmit={handleSubmitReview} style={{ background: '#f0fdfa', padding: '24px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f766e' }}>Submit for Review</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#0f766e' }}>The work is marked as 100% complete. Add a final work note and submit it to the Site Engineer.</p>
                  
                  <label htmlFor="finalNote" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f766e' }}>Final Work Note (Required)</label>
                  <textarea 
                    id="finalNote" 
                    value={finalNote}
                    onChange={e => setFinalNote(e.target.value)}
                    placeholder="Enter details about the completed work..."
                    required
                    rows="3"
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #99f6e4', marginBottom: '16px', resize: 'vertical' }}
                  />
                  <button type="submit" className="primary-button" style={{ background: '#0f766e' }} disabled={busy}>
                    {busy ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </form>
              )}
            </div>
          )
        ) : (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', color: '#64748b', textAlign: 'center' }}>
            {task.status === 'UNDER_REVIEW' ? 'Waiting for Site Engineer review.' : `This task progress is managed by the Lead Worker (${task.leadWorker?.fullName}).`}
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
