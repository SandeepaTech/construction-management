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
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a', fontWeight: '700' }}>Time & Attendance</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Track your work hours by clocking in and out at your assigned project site.</p>
      </div>
      
      {error && <div className="form-error-banner" style={{ marginBottom: '24px', padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '14px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="client-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Today's Attendance</h3>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontSize: '16px' }}>📅</span> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {isClockedOut ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <span style={{ display: 'inline-block', padding: '4px 12px', background: '#94a3b8', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '24px' }}>CLOCKED OUT</span>
                <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>Work Completed for Today</strong>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>You have successfully clocked out.</p>
              </div>
            ) : isClockedIn ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span style={{ display: 'inline-block', padding: '4px 12px', background: '#3b82f6', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>CLOCKED IN</span>
                <strong style={{ display: 'block', fontSize: '24px', color: '#0f172a', marginBottom: '4px' }}>{formatTime(today.clockInTime)}</strong>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>Currently working on {today.project?.name}</p>
                <button 
                  onClick={handleClockOut} 
                  disabled={busy}
                  style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '700', cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: busy ? 0.7 : 1 }}
                >
                  <span style={{ fontSize: '18px' }}>🕒</span> {busy ? 'Processing...' : 'Clock Out'}
                </button>
              </div>
            ) : (
              <>
                <span style={{ display: 'inline-block', padding: '4px 12px', background: '#94a3b8', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '24px' }}>NOT CLOCKED IN</span>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>Select Assigned Project / Site</label>
                <select 
                  value={selectedProjectId} 
                  onChange={e => setSelectedProjectId(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '24px', fontSize: '14px', backgroundColor: 'white' }}
                >
                  <option value="">-- Choose a project --</option>
                  {dashboard?.availableProjects?.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.siteName ? `(${p.siteName})` : ''}</option>
                  ))}
                </select>
                <button 
                  onClick={handleClockIn} 
                  disabled={busy || !selectedProjectId}
                  style={{ width: '100%', padding: '12px', background: '#facc15', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '700', cursor: (busy || !selectedProjectId) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: (busy || !selectedProjectId) ? 0.7 : 1 }}
                >
                  <span style={{ fontSize: '18px' }}>🕒</span> {busy ? 'Processing...' : 'Clock In'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="client-panel" style={{ padding: '32px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Assigned Project & Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', border: '1px solid #e2e8f0' }}>🏢</div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Assigned Project / Site</div>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{today?.project?.name || (selectedProjectId ? dashboard?.availableProjects?.find(p => p.id === parseInt(selectedProjectId))?.name : '--')}</strong>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', border: '1px solid #e2e8f0' }}>👷</div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Site Engineer</div>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{today?.project?.assignedEngineerName || (selectedProjectId ? dashboard?.availableProjects?.find(p => p.id === parseInt(selectedProjectId))?.assignedEngineerName : '--')}</strong>
              </div>
            </div>

            <div style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', color: '#64748b' }}>📅</span>
                <strong style={{ fontSize: '14px', color: '#334155' }}>Today's Summary</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Clock In</div>
                  <strong style={{ fontSize: '15px', color: '#334155' }}>{today?.clockInTime ? formatTime(today.clockInTime) : '--:--'}</strong>
                </div>
                <div style={{ flex: 1, borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Clock Out</div>
                  <strong style={{ fontSize: '15px', color: '#334155' }}>{today?.clockOutTime ? formatTime(today.clockOutTime) : '--:--'}</strong>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Total Hours</div>
                  <strong style={{ fontSize: '15px', color: '#334155' }}>{today?.totalMinutes ? (today.totalMinutes / 60).toFixed(2) : '0.00'} hrs</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="client-panel" style={{ padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Attendance History</h3>
        
        {history.length === 0 ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', background: '#f8fafc', borderRadius: '8px', marginBottom: '32px', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
              <span style={{ flex: 1 }}>Date</span>
              <span style={{ flex: 2 }}>Project / Site</span>
              <span style={{ flex: 1 }}>Clock In</span>
              <span style={{ flex: 1 }}>Clock Out</span>
              <span style={{ flex: 1 }}>Total Hours</span>
              <span style={{ flex: 1 }}>Status</span>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', margin: '0 auto 16px auto', color: '#64748b' }}>📄</div>
              <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>No attendance records found.</strong>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px', maxWidth: '300px', marginInline: 'auto' }}>Your clock in/out records will appear here once you start tracking your attendance.</p>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#334155', borderRadius: '8px 0 0 8px', borderBottom: 'none' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: 'none' }}>Project / Site</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: 'none' }}>Clock In</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: 'none' }}>Clock Out</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: 'none' }}>Total Hours</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#334155', borderRadius: '0 8px 8px 0', borderBottom: 'none' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(record => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>{record.attendanceDate}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{record.project?.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{record.site?.name}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>{formatTime(record.clockInTime)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>{formatTime(record.clockOutTime)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>{record.totalMinutes ? (record.totalMinutes / 60).toFixed(2) : '0.00'} hrs</td>
                    <td style={{ padding: '16px 24px' }}>
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
