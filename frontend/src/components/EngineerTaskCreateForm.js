import React, { useState, useEffect } from 'react';

export function EngineerTaskCreateForm({ projectId, apiUrl, getCsrfToken, onCancel, onSuccess }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'MEDIUM',
    estimatedHours: '',
    notes: '',
    leadWorkerId: '',
    assignedWorkerIds: []
  });

  useEffect(() => {
    let mounted = true;
    fetch(`${apiUrl}/api/engineer/workers`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load field workers');
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setWorkers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [apiUrl]);

  const updateField = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions, option => option.value);
      setForm(prev => ({ ...prev, [name]: values }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleWorkerSelection = (workerId) => {
    setForm(prev => {
      const currentIds = prev.assignedWorkerIds;
      if (currentIds.includes(workerId)) {
        const newIds = currentIds.filter(id => id !== workerId);
        // If lead worker is removed, reset lead worker
        return { 
          ...prev, 
          assignedWorkerIds: newIds,
          leadWorkerId: prev.leadWorkerId === workerId ? '' : prev.leadWorkerId
        };
      } else {
        return { ...prev, assignedWorkerIds: [...currentIds, workerId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.assignedWorkerIds.length === 0) {
      setError('Please select at least one assigned worker.');
      return;
    }
    if (!form.leadWorkerId) {
      setError('Please select a lead worker from the assigned workers.');
      return;
    }

    setBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`${apiUrl}/api/engineer/projects/${projectId}/tasks`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          startDate: form.startDate,
          dueDate: form.dueDate,
          priority: form.priority,
          estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours, 10) : null,
          notes: form.notes,
          leadWorkerId: parseInt(form.leadWorkerId, 10),
          assignedWorkerIds: form.assignedWorkerIds.map(id => parseInt(id, 10))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || 'Failed to create task');
      }

      const savedTask = await response.json();
      onSuccess(savedTask);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading worker directory...</div>;
  }

  const selectedWorkers = workers.filter(w => form.assignedWorkerIds.includes(w.id.toString()));

  return (
    <div className="client-panel" style={{ padding: '32px', marginBottom: '24px' }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: '20px' }}>Create New Task</h3>
      
      {error && <div className="form-error-banner" style={{ marginBottom: '24px' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="client-request-form">
        <div className="form-section-card">
          <div className="section-card-header">
            <span className="section-badge">1</span>
            <div>
              <h3>Task Details</h3>
              <p>Basic information and scheduling for the new task</p>
            </div>
          </div>
          
          <div className="section-grid">
            <div className="form-field full-width">
              <label htmlFor="title">Task Title <span className="req">*</span></label>
              <input id="title" name="title" type="text" value={form.title} onChange={updateField} required maxLength={200} placeholder="e.g. Foundation Excavation" />
            </div>

            <div className="form-field full-width">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={updateField} rows={3} placeholder="Detailed instructions for the task..." />
            </div>

            <div className="form-field">
              <label htmlFor="startDate">Start Date</label>
              <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={updateField} />
            </div>

            <div className="form-field">
              <label htmlFor="dueDate">Due Date</label>
              <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={updateField} />
            </div>

            <div className="form-field">
              <label htmlFor="priority">Priority <span className="req">*</span></label>
              <select id="priority" name="priority" value={form.priority} onChange={updateField} required>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="estimatedHours">Estimated Hours</label>
              <input id="estimatedHours" name="estimatedHours" type="number" min="1" value={form.estimatedHours} onChange={updateField} placeholder="e.g. 24" />
            </div>
          </div>
        </div>

        <div className="form-section-card">
          <div className="section-card-header">
            <span className="section-badge">2</span>
            <div>
              <h3>Workforce Assignment</h3>
              <p>Assign field workers and designate a lead worker</p>
            </div>
          </div>
          
          <div className="section-grid">
            <div className="form-field full-width">
              <label>Assigned Workers <span className="req">*</span></label>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', padding: '12px', background: '#fff' }}>
                {workers.length === 0 ? (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>No field workers available.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {workers.map(worker => (
                      <label key={worker.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                        <input 
                          type="checkbox" 
                          checked={form.assignedWorkerIds.includes(worker.id.toString())}
                          onChange={() => handleWorkerSelection(worker.id.toString())}
                          style={{ margin: 0, width: 'auto' }}
                        />
                        {worker.fullName}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ display: 'block', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                Selected: {form.assignedWorkerIds.length} worker(s)
              </span>
            </div>

            <div className="form-field full-width">
              <label htmlFor="leadWorkerId">Lead Worker <span className="req">*</span></label>
              <select id="leadWorkerId" name="leadWorkerId" value={form.leadWorkerId} onChange={updateField} required disabled={selectedWorkers.length === 0}>
                <option value="" disabled>Select a lead worker from assigned workers</option>
                {selectedWorkers.map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.fullName}</option>
                ))}
              </select>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>The lead worker is responsible for updating task progress.</p>
            </div>

            <div className="form-field full-width">
              <label htmlFor="notes">Notes / Special Instructions</label>
              <textarea id="notes" name="notes" value={form.notes} onChange={updateField} rows={3} placeholder="Any additional notes for the workers..." />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="primary-button" disabled={busy || form.assignedWorkerIds.length === 0 || !form.leadWorkerId}>
            {busy ? 'Creating Task...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
