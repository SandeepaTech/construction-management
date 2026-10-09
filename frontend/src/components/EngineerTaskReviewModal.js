import React, { useState, useEffect } from 'react';

export function EngineerTaskReviewModal({ taskId, apiUrl, getCsrfToken, onClose, onReviewed }) {
  const [task, setTask] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reworkReason, setReworkReason] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${apiUrl}/api/worker/tasks/${taskId}`, { credentials: 'include' }),
      fetch(`${apiUrl}/api/worker/tasks/${taskId}/progress`, { credentials: 'include' })
    ]).then(async ([taskRes, histRes]) => {
      if (!taskRes.ok) throw new Error('Failed to load task details');
      setTask(await taskRes.json());
      if (histRes.ok) setHistory(await histRes.json());
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, [taskId, apiUrl]);

  const handleApprove = async () => {
    setBusy(true);
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/engineer/tasks/${taskId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to approve task');
      }
      onReviewed(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRework = async (e) => {
    e.preventDefault();
    if (!reworkReason.trim()) {
      setError('Rework reason is required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/engineer/tasks/${taskId}/rework`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ note: reworkReason })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to return for rework');
      }
      onReviewed(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="modal-overlay"><div className="modal-content"><p>Loading...</p></div></div>;
  if (!task) return <div className="modal-overlay"><div className="modal-content"><p>Error loading task.</p><button onClick={onClose}>Close</button></div></div>;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="client-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#b45309', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Review</span>
            <h2 style={{ margin: '4px 0 8px 0', fontSize: '22px' }}>{task.title}</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span className={`status-badge status-${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Progress: <strong>{task.progress}%</strong></span>
            </div>
          </div>
          <button className="secondary-button" onClick={onClose} disabled={busy}>✕ Close</button>
        </div>

        {error && <div className="form-error-banner" style={{ marginBottom: '24px' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', fontSize: '13px' }}>
          <div>
            <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Lead Worker:</span> <strong>{task.leadWorker?.fullName}</strong></div>
            <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Assigned Team:</span> <strong>{task.assignedWorkers?.length} workers</strong></div>
          </div>
          <div>
            <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Start Time:</span> <strong>{task.actualStartTime ? new Date(task.actualStartTime).toLocaleString() : 'N/A'}</strong></div>
            <div style={{ marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Submitted Time:</span> <strong>{task.submittedForReviewAt ? new Date(task.submittedForReviewAt).toLocaleString() : 'N/A'}</strong></div>
          </div>
        </div>

        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Progress History & Notes</h4>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '32px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0' }}>
          {history.length > 0 ? history.map(record => (
            <div key={record.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a' }}>{record.progress}%</strong>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(record.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#334155', fontWeight: record.note?.startsWith('FINAL WORK NOTE') ? '600' : 'normal' }}>
                {record.note || <em>No note provided</em>}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>By {record.updatedBy?.fullName}</div>
            </div>
          )) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No progress history available.</p>
          )}
        </div>

        {task.status === 'UNDER_REVIEW' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#166534' }}>Approve Completion</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#15803d' }}>Mark this task as fully completed. This will update the overall project progress.</p>
              <button className="primary-button" style={{ background: '#16a34a' }} onClick={handleApprove} disabled={busy}>
                {busy ? 'Processing...' : 'Approve & Complete Task'}
              </button>
            </div>

            <form onSubmit={handleRework} style={{ background: '#fff1f2', padding: '24px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#9f1239' }}>Return for Rework</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#be123c' }}>Reject the completion and send the task back to the workers.</p>
              
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#9f1239' }}>Rework Reason (Required)</label>
              <textarea 
                value={reworkReason}
                onChange={e => setReworkReason(e.target.value)}
                placeholder="e.g. Rear foundation trench depth is insufficient..."
                required
                rows="3"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #fda4af', marginBottom: '16px', resize: 'vertical' }}
              />
              <button type="submit" className="primary-button" style={{ background: '#e11d48' }} disabled={busy}>
                {busy ? 'Processing...' : 'Return for Rework'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
