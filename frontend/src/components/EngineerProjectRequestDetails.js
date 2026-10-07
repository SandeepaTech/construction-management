import React, { useState, useEffect } from 'react';
import { AttachmentViewer } from './AttachmentViewer';

export function EngineerProjectRequestDetails({
  requestId,
  apiUrl = 'http://localhost:8080',
  getCsrfToken,
  onBack,
}) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    siteFeasibility: 'SUITABLE',
    estimatedDuration: '',
    technicalRisk: 'LOW',
    siteConditions: '',
    recommendedConstructionNotes: '',
    majorMaterialRequirements: '',
    safetyEngineeringConcerns: '',
    recommendation: 'RECOMMEND_APPROVAL',
    engineerComments: '',
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${apiUrl}/api/engineer/project-requests/${requestId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request #${requestId} could not be loaded.`);
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setRequest(data);
          if (data.technicalAssessment) {
            setForm({
              siteFeasibility: data.technicalAssessment.siteFeasibility || 'SUITABLE',
              estimatedDuration: data.technicalAssessment.estimatedDuration || '',
              technicalRisk: data.technicalAssessment.technicalRisk || 'LOW',
              siteConditions: data.technicalAssessment.siteConditions || '',
              recommendedConstructionNotes: data.technicalAssessment.recommendedConstructionNotes || '',
              majorMaterialRequirements: data.technicalAssessment.majorMaterialRequirements || '',
              safetyEngineeringConcerns: data.technicalAssessment.safetyEngineeringConcerns || '',
              recommendation: data.technicalAssessment.recommendation || 'RECOMMEND_APPROVAL',
              engineerComments: data.technicalAssessment.engineerComments || '',
            });
          }
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
  }, [apiUrl, requestId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      const csrfToken = await getCsrfToken();
      const method = request.technicalAssessment ? 'PUT' : 'POST';
      const res = await fetch(`${apiUrl}/api/engineer/project-requests/${requestId}/technical-assessment`, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || 'Could not submit technical assessment.');
      }

      const updated = await res.json();
      setRequest(updated);
      setNotice('Technical assessment submitted successfully.');
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="client-panel client-loading-state">Loading request details…</div>;
  }

  if (error && !request) {
    return (
      <div className="client-panel">
        <p className="dashboard-error">{error}</p>
        <button type="button" className="client-primary-button" onClick={onBack}>
          ← Back to Requests
        </button>
      </div>
    );
  }

  const isEditable = request.status === 'SENT_TO_SITE_ENGINEER' || request.status === 'ENGINEER_REVIEW_COMPLETED';

  return (
    <div className="admin-details-view">
      <div className="details-header-bar">
        <button type="button" className="back-link-btn" onClick={onBack}>
          ← Back to Requests
        </button>
        <div className="header-status-group">
          <span className="eyebrow">STATUS:</span>
          <span className="status-badge status-under-review">
            {request.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">TECHNICAL REVIEW FOR #{request.id}</span>
          <h1>{request.projectName}</h1>
          <p>
            Client: <strong>{request.clientName}</strong>
          </p>
        </div>
      </div>

      {notice && <div className="client-success-message" role="status">{notice}</div>}
      {error && <div className="form-error-banner" role="alert">{error}</div>}

      {request.adminNoteForEngineer && (
        <div className="revision-alert-box" style={{ backgroundColor: '#e3f2fd', borderLeftColor: '#1976d2' }}>
          <div className="revision-alert-icon" style={{ color: '#1976d2' }}>ℹ️</div>
          <div>
            <strong style={{ color: '#1976d2' }}>Admin / Project Manager Note:</strong>
            <p>{request.adminNoteForEngineer}</p>
          </div>
        </div>
      )}

      <div className="admin-details-sections-grid">
        <div className="details-card">
          <div className="card-header-styled">
            <span className="card-sec-badge">1</span>
            <h3>CLIENT INFORMATION</h3>
          </div>
          <div className="detail-rows">
            <div className="info-row">
              <span className="info-lbl">Client Name</span>
              <span className="info-val"><strong>{request.clientName}</strong></span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Email Address</span>
              <span className="info-val">{request.clientEmail}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Phone Number</span>
              <span className="info-val">{request.clientPhone || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Contact Method</span>
              <span className="info-val">{request.preferredContactMethod || 'Email'}</span>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header-styled">
            <span className="card-sec-badge">2</span>
            <h3>PROJECT INFORMATION</h3>
          </div>
          <div className="detail-rows">
            <div className="info-row">
              <span className="info-lbl">Project Name</span>
              <span className="info-val"><strong>{request.projectName}</strong></span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Project Type</span>
              <span className="info-val">{request.projectType}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Location</span>
              <span className="info-val">{request.location}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Est. Budget</span>
              <span className="info-val highlight-budget">{request.estimatedBudget || 'Not specified'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Expected Comp.</span>
              <span className="info-val">{request.expectedCompletionDate || '—'}</span>
            </div>
          </div>
        </div>

        <div className="details-card full-width">
          <div className="card-header-styled">
            <span className="card-sec-badge">3</span>
            <h3>PROJECT DETAILS &amp; SCOPE</h3>
          </div>
          <div className="detail-block-text">
            <strong>Detailed Requirements:</strong>
            <p>{request.projectDetails || request.description || 'No specific details provided.'}</p>
          </div>
          {request.specialRequirements && (
            <div className="detail-block-text" style={{ marginTop: '16px' }}>
              <strong>Special Requirements &amp; Notes:</strong>
              <p>{request.specialRequirements}</p>
            </div>
          )}
        </div>

        <div className="details-card full-width">
          <div className="card-header-styled">
            <span className="card-sec-badge">4</span>
            <h3>ATTACHMENTS &amp; REFERENCE PLANS ({request.attachments?.length || 0})</h3>
          </div>
          <AttachmentViewer
            attachments={request.attachments}
            requestId={request.id}
            apiUrl={apiUrl}
          />
        </div>
      </div>

      <div className="details-card full-width" style={{ marginTop: '32px', marginBottom: '64px' }}>
        <div className="card-header-styled" style={{ backgroundColor: '#2b3648' }}>
          <span className="card-sec-badge" style={{ backgroundColor: '#fff', color: '#2b3648' }}>5</span>
          <h3 style={{ color: '#fff' }}>TECHNICAL ASSESSMENT</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="modal-grid-fields">
            <div className="form-field">
              <label>Site Feasibility <span className="req">*</span></label>
              <select
                value={form.siteFeasibility}
                onChange={(e) => setForm({ ...form, siteFeasibility: e.target.value })}
                required
                disabled={!isEditable}
              >
                <option value="SUITABLE">SUITABLE</option>
                <option value="SUITABLE_WITH_CONDITIONS">SUITABLE WITH CONDITIONS</option>
                <option value="NOT_SUITABLE">NOT SUITABLE</option>
              </select>
            </div>

            <div className="form-field">
              <label>Technical Risk <span className="req">*</span></label>
              <select
                value={form.technicalRisk}
                onChange={(e) => setForm({ ...form, technicalRisk: e.target.value })}
                required
                disabled={!isEditable}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div className="form-field full-width">
              <label>Estimated Construction Duration (Optional)</label>
              <input
                type="text"
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                placeholder="e.g. 9 months"
                disabled={!isEditable}
              />
            </div>

            <div className="form-field full-width">
              <label>Site Conditions</label>
              <textarea
                rows={2}
                value={form.siteConditions}
                onChange={(e) => setForm({ ...form, siteConditions: e.target.value })}
                placeholder="Describe current site conditions..."
                disabled={!isEditable}
              />
            </div>

            <div className="form-field full-width">
              <label>Recommended Construction Notes</label>
              <textarea
                rows={2}
                value={form.recommendedConstructionNotes}
                onChange={(e) => setForm({ ...form, recommendedConstructionNotes: e.target.value })}
                placeholder="Any special notes for construction..."
                disabled={!isEditable}
              />
            </div>

            <div className="form-field full-width">
              <label>Major Material Requirements</label>
              <textarea
                rows={2}
                value={form.majorMaterialRequirements}
                onChange={(e) => setForm({ ...form, majorMaterialRequirements: e.target.value })}
                disabled={!isEditable}
              />
            </div>

            <div className="form-field full-width">
              <label>Safety / Engineering Concerns</label>
              <textarea
                rows={2}
                value={form.safetyEngineeringConcerns}
                onChange={(e) => setForm({ ...form, safetyEngineeringConcerns: e.target.value })}
                disabled={!isEditable}
              />
            </div>

            <div className="form-field full-width" style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <label style={{ fontSize: '1.1em', color: '#1a1a1a' }}>Technical Recommendation <span className="req">*</span></label>
              <select
                value={form.recommendation}
                onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                required
                disabled={!isEditable}
                style={{ fontSize: '1.05em', padding: '10px' }}
              >
                <option value="RECOMMEND_APPROVAL">RECOMMEND APPROVAL</option>
                <option value="CHANGES_REQUIRED">CHANGES REQUIRED</option>
                <option value="NOT_FEASIBLE">NOT FEASIBLE</option>
              </select>
            </div>

            <div className="form-field full-width">
              <label>Engineer Comments (Internal) <span className="req">*</span></label>
              <textarea
                rows={4}
                value={form.engineerComments}
                onChange={(e) => setForm({ ...form, engineerComments: e.target.value })}
                required
                disabled={!isEditable}
                placeholder="Detailed comments for the Admin / Project Manager..."
              />
            </div>
          </div>

          {isEditable && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="client-primary-button"
                style={{ fontSize: '1.1em', padding: '12px 24px' }}
                disabled={busy}
              >
                {busy ? 'Submitting…' : 'Send Assessment to Admin'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
