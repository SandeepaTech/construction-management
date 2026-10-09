import React, { useState, useEffect } from 'react';

export function AdminProjectDetails({
  projectId,
  apiUrl = 'http://localhost:8080',
  onBack,
  onViewRequest,
}) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${apiUrl}/api/admin/projects/${projectId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Project #${projectId} not found.`);
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setProject(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [apiUrl, projectId]);

  if (loading) {
    return <div className="client-panel client-loading-state">Loading project details…</div>;
  }

  if (error || !project) {
    return (
      <div className="client-panel">
        <p className="dashboard-error">{error || 'Project not found.'}</p>
        <button type="button" className="client-primary-button" onClick={onBack}>
          ← Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="admin-project-details-view">
      <div className="details-header-bar">
        <button type="button" className="back-link-btn" onClick={onBack}>
          ← Back to Project Requests
        </button>
        <div className="header-status-group" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>PROJECT PROGRESS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${project.progress || 0}%`, height: '100%', background: (project.progress || 0) === 100 ? '#10b981' : '#3b82f6' }}></div>
              </div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{project.progress || 0}%</strong>
            </div>
          </div>
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>PROJECT STATUS</span>
            <span className={`status-badge status-${project.status ? project.status.toLowerCase() : 'planned'}`}>{project.status || 'PLANNED'}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">PROJECT #{project.id}</span>
          <h1>{project.name}</h1>
          <p>
            Official construction project created from approved client request.
          </p>
        </div>
        {project.projectRequestId && (
          <button
            type="button"
            className="btn-action-view"
            onClick={() => onViewRequest(project.projectRequestId)}
          >
            View Originating Request #{project.projectRequestId} →
          </button>
        )}
      </div>

      <div className="approval-alert-box" style={{ marginBottom: '24px' }}>
        <div className="approval-alert-icon">✓</div>
        <div>
          <strong>Project Successfully Created</strong>
          <p>
            This project was generated from approved Request #{project.projectRequestId}. The client has been notified.
          </p>
        </div>
      </div>

      <div className="admin-details-sections-grid">
        <div className="details-card">
          <div className="card-header-styled">
            <span className="card-sec-badge">1</span>
            <h3>PROJECT OVERVIEW</h3>
          </div>
          <div className="detail-rows">
            <div className="info-row">
              <span className="info-lbl">Project ID</span>
              <span className="info-val"><strong>#{project.id}</strong></span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Project Name</span>
              <span className="info-val">{project.name}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Approved Budget</span>
              <span className="info-val highlight-budget">{project.approvedBudget || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Start Date</span>
              <span className="info-val">{project.startDate || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Expected End Date</span>
              <span className="info-val">{project.expectedEndDate || '—'}</span>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header-styled">
            <span className="card-sec-badge">2</span>
            <h3>CLIENT INFORMATION</h3>
          </div>
          <div className="detail-rows">
            <div className="info-row">
              <span className="info-lbl">Client Name</span>
              <span className="info-val"><strong>{project.clientName}</strong></span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Email</span>
              <span className="info-val">{project.clientEmail}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Phone</span>
              <span className="info-val">{project.clientPhone || '—'}</span>
            </div>
          </div>
        </div>

        <div className="details-card full-width">
          <div className="card-header-styled">
            <span className="card-sec-badge">3</span>
            <h3>CONSTRUCTION SITE INFORMATION</h3>
          </div>
          <div className="detail-rows">
            <div className="info-row">
              <span className="info-lbl">Site Name</span>
              <span className="info-val"><strong>{project.siteName || '—'}</strong></span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Location (City)</span>
              <span className="info-val">{project.siteLocation || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Site Physical Address</span>
              <span className="info-val">{project.siteAddress || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Assigned Site Engineer</span>
              <span className="info-val">
                {project.assignedEngineerName ? (
                  <span className="engineer-tag">👷 {project.assignedEngineerName}</span>
                ) : (
                  'Not yet assigned'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
