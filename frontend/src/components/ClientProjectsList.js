import React, { useState, useEffect } from 'react';

export function ClientProjectsList({ apiUrl, onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch(`${apiUrl}/api/client/projects`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load your projects.');
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
        <h3 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '8px' }}>No Active Projects</h3>
        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
          Once your project request is approved by the admin, your construction project will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="client-page-heading">
        <span className="eyebrow">PROJECTS</span>
        <h1>My Projects</h1>
        <p>Monitor your active and completed construction projects.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {projects.map((project) => (
          <div key={project.id} className="client-panel" style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.2s', borderTop: '4px solid #3b82f6' }} onClick={() => onNavigate(`/client/projects/${project.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{project.name}</h3>
              <span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status.replace(/_/g, ' ')}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
              <div><strong>Location:</strong> {project.siteLocation || 'Not set'}</div>
              <div><strong>Budget:</strong> {project.approvedBudget || 'Not specified'}</div>
              <div><strong>Start Date:</strong> {project.startDate || 'TBD'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Engineer: {project.assignedEngineerName || 'Pending'}
              </span>
              <button 
                className="client-primary-button" 
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={(e) => { e.stopPropagation(); onNavigate(`/client/projects/${project.id}`); }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
