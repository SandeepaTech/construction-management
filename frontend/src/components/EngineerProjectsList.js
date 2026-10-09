import React, { useState, useEffect } from 'react';

export function EngineerProjectsList({ apiUrl, onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch(`${apiUrl}/api/engineer/projects`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load your assigned projects.');
        }
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setProjects(data);
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
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="client-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading your projects...</p>
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

  if (projects.length === 0) {
    return (
      <div className="client-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', color: '#94a3b8' }}>🏢</div>
        <h3 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '8px' }}>No Assigned Projects</h3>
        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
          You have not been assigned to any active construction projects yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">PROJECTS</span>
          <h1>My Projects</h1>
          <p>Monitor your assigned construction projects and update their progress.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {projects.map((project) => (
          <div key={project.id} className="client-panel" style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.2s', borderTop: '4px solid #3b82f6' }} onClick={() => onNavigate(`/engineer/projects/${project.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{project.name}</h3>
              <span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status.replace(/_/g, ' ')}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
              <div><strong>Client:</strong> {project.clientName}</div>
              <div><strong>Site Location:</strong> {project.siteLocation || 'Not set'}</div>
              <div><strong>Start Date:</strong> {project.startDate || 'TBD'}</div>
              <div><strong>End Date:</strong> {project.expectedEndDate || 'TBD'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Progress: 0%
              </span>
              <button 
                className="client-primary-button" 
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={(e) => { e.stopPropagation(); onNavigate(`/engineer/projects/${project.id}`); }}
              >
                View Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
