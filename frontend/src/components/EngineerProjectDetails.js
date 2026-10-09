import React, { useState, useEffect } from 'react';

export function EngineerProjectDetails({ projectId, apiUrl, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch(`${apiUrl}/api/engineer/projects/${projectId}`, { credentials: 'include' })
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
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, fontWeight: 500 }}>
          ← Back to My Projects
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a' }}>{project.name}</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Project ID: #{project.id}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>STATUS:</span>
          <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
            {project.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="client-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>1</span>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Client Information</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Client Name</span>
              <strong style={{ color: '#0f172a' }}>{project.clientName}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / span 2' }}>
              <span style={{ color: '#64748b' }}>Project Description</span>
              <strong style={{ color: '#0f172a' }}>{project.description || 'N/A'}</strong>
            </div>
          </div>
        </div>

        <div className="client-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>2</span>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Site & Timeline</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Site Name</span>
              <strong style={{ color: '#0f172a' }}>{project.siteName || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Location</span>
              <strong style={{ color: '#0f172a' }}>{project.siteLocation || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Start Date</span>
              <strong style={{ color: '#0f172a' }}>{project.startDate || 'TBD'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#64748b' }}>Expected End Date</span>
              <strong style={{ color: '#0f172a' }}>{project.expectedEndDate || 'TBD'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / span 2' }}>
              <span style={{ color: '#64748b' }}>Address</span>
              <strong style={{ color: '#0f172a' }}>{project.siteAddress || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>
      
      <div className="client-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>3</span>
          <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Progress Overview</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <strong style={{ color: '#0f172a' }}>Overall Progress</strong>
            <strong style={{ color: '#3b82f6' }}>0%</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '0%', height: '100%', background: '#3b82f6' }}></div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b' }}>Task and material management modules will be available soon.</p>
        </div>
      </div>
    </div>
  );
}
