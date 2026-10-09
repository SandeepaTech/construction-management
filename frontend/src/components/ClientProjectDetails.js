import React, { useState, useEffect } from 'react';

export function ClientProjectDetails({ projectId, apiUrl, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch(`${apiUrl}/api/client/projects/${projectId}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load project details.');
        }
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setProject(data);
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
        <button type="button" className="client-secondary-button" onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#3b82f6', padding: 0, fontWeight: 600 }}>
          ← Back to Projects
        </button>
      </div>

      <div className="client-page-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="eyebrow">PROJECT #{project.id}</span>
            <h1 style={{ marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ margin: 0 }}>Project Type: {project.projectType || 'Not specified'}</p>
          </div>
          <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
            {project.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Overview Card */}
        <div className="client-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            Project Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Location</div>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>{project.siteLocation || 'Not set'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Approved Budget</div>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>{project.approvedBudget || 'Not specified'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Start Date</div>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>{project.startDate || 'TBD'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Expected End Date</div>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>{project.expectedEndDate || 'TBD'}</div>
            </div>
          </div>
        </div>

        {/* Team & Site Information */}
        <div className="client-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            Site Information & Team
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Site Name</div>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>{project.siteName || 'Not set'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Assigned Site Engineer</div>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>
                {project.assignedEngineerName || 'Pending Assignment'}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Site Address</div>
              <div style={{ color: '#1e293b', fontWeight: 500 }}>{project.siteAddress || 'Not set'}</div>
            </div>
          </div>
        </div>

        {/* Progress & Notifications (Placeholder for now) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="client-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              Overall Progress
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
              <div style={{ fontSize: '48px', color: '#3b82f6', fontWeight: 700, marginBottom: '8px' }}>0%</div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Planning Phase</div>
            </div>
          </div>

          <div className="client-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              Current Tasks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Tasks will appear here once construction begins.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
