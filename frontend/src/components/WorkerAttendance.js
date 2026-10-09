import React, { useState, useEffect } from 'react';

export function WorkerAttendance({ apiUrl, getCsrfToken, user }) {
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const fetchAttendance = async () => {
    try {
      const [dashRes, histRes] = await Promise.all([
        fetch(`${apiUrl}/api/worker/attendance/today`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/worker/attendance/history`, { credentials: 'include' })
      ]);
      
      if (!dashRes.ok) throw new Error('Failed to load today attendance');
      const dashData = await dashRes.json();
      setDashboard(dashData);
      
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
    fetchAttendance();
  }, [apiUrl]);

  const handleClockIn = async () => {
    if (!selectedProjectId) {
      setError('Please select a project to clock into.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/worker/attendance/clock-in`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ projectId: parseInt(selectedProjectId, 10) })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to clock in');
      }

      await fetchAttendance();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleClockOut = async () => {
    setBusy(true);
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/worker/attendance/clock-out`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to clock out');
      }

      await fetchAttendance();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="client-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading attendance...</div>;

  const today = dashboard?.todayAttendance;
  const isClockedIn = today && today.status === 'CLOCKED_IN';
  const isClockedOut = today && today.status === 'CLOCKED_OUT';

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (mins) => {
    if (mins == null) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#0f172a' }}>Time & Attendance</h2>
      
      {error && <div className="form-error-banner" style={{ marginBottom: '24px' }}>{error}</div>}

      <div className="client-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Today's Attendance</h3>
        
        {isClockedOut ? (
          <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '18px' }}>Work Completed for Today</h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', margin: '24px 0' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#15803d', fontWeight: '600' }}>Clock In</div>
                <strong style={{ fontSize: '18px', color: '#166534' }}>{formatTime(today.clockInTime)}</strong>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#15803d', fontWeight: '600' }}>Clock Out</div>
                <strong style={{ fontSize: '18px', color: '#166534' }}>{formatTime(today.clockOutTime)}</strong>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#15803d', fontWeight: '600' }}>Total Time</div>
                <strong style={{ fontSize: '18px', color: '#166534' }}>{formatDuration(today.totalMinutes)}</strong>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#15803d' }}>Project: {today.project?.name}</p>
          </div>
        ) : isClockedIn ? (
          <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>CLOCKED IN</span>
              <h4 style={{ margin: '12px 0 4px 0', color: '#1e3a8a', fontSize: '20px' }}>{formatTime(today.clockInTime)}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#1e40af' }}>Project: {today.project?.name} | Site: {today.site?.name}</p>
            </div>
            <button className="primary-button" style={{ background: '#ef4444' }} onClick={handleClockOut} disabled={busy}>
              {busy ? 'Processing...' : 'Clock Out'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ padding: '4px 8px', background: '#94a3b8', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>NOT CLOCKED IN</span>
            <div style={{ marginTop: '24px', maxWidth: '400px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Select Assigned Project / Site</label>
              <select 
                value={selectedProjectId} 
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '16px' }}
              >
                <option value="">-- Choose a project --</option>
                {dashboard?.availableProjects?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.siteName || 'No site'})</option>
                ))}
              </select>
              <button className="primary-button" style={{ width: '100%' }} onClick={handleClockIn} disabled={busy || !selectedProjectId}>
                {busy ? 'Processing...' : 'Clock In'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="client-panel" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Attendance History</h3>
        
        {history.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>No attendance records found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project & Site</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(record => (
                  <tr key={record.id}>
                    <td><strong>{record.attendanceDate}</strong></td>
                    <td>
                      <div>{record.project?.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{record.site?.name}</div>
                    </td>
                    <td>{formatTime(record.clockInTime)}</td>
                    <td>{formatTime(record.clockOutTime)}</td>
                    <td><strong>{formatDuration(record.totalMinutes)}</strong></td>
                    <td>
                      <span className={`status-badge status-${record.status.toLowerCase()}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
