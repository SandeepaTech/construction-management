import React, { useState, useEffect } from 'react';


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

      </div>

      <div className="details-card full-width technical-assessment-card" style={{ marginTop: '32px', marginBottom: '64px', padding: 0 }}>
        <div className="assessment-header-styled">
          <div className="assessment-header-content">
            <span className="assessment-sec-badge">5</span>
            <div className="assessment-title-group">
              <h3>TECHNICAL ASSESSMENT</h3>
              <p>Evaluate the technical feasibility, risks, site conditions, and provide your professional recommendation.</p>
            </div>
          </div>
          <div className="assessment-header-bg-graphics"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="assessment-form-body" style={{ padding: '32px' }}>
          <div className="assessment-grid-layout">
            
            <div className="assessment-field">
              <div className="assessment-field-header">
                <span className="field-icon blue-icon">🏢</span>
                <div className="field-labels">
                  <label>Site Feasibility <span className="req">*</span></label>
                  <span className="field-desc">Assess if the project is technically feasible at the proposed location.</span>
                </div>
              </div>
              <div className="select-with-dot">
                <span className="select-dot" style={{backgroundColor: form.siteFeasibility.includes('NOT') ? '#e74c3c' : '#2ecc71'}}></span>
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
            </div>

            <div className="assessment-field">
              <div className="assessment-field-header">
                <span className="field-icon red-icon">⚠️</span>
                <div className="field-labels">
                  <label>Technical Risk <span className="req">*</span></label>
                  <span className="field-desc">Evaluate the overall technical risk level.</span>
                </div>
              </div>
              <div className="select-with-dot">
                <span className="select-dot" style={{backgroundColor: form.technicalRisk === 'LOW' ? '#2ecc71' : form.technicalRisk === 'MEDIUM' ? '#f39c12' : '#e74c3c'}}></span>
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
            </div>

            <div className="assessment-field">
              <div className="assessment-field-header">
                <span className="field-icon blue-icon">📅</span>
                <div className="field-labels">
                  <label>Estimated Construction Duration (Optional)</label>
                  <span className="field-desc">Your estimated time to complete the construction.</span>
                </div>
              </div>
              <div className="input-with-icon">
                <span className="input-icon">🗓️</span>
                <input
                  type="text"
                  value={form.estimatedDuration}
                  onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                  placeholder="e.g. 9 months"
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div className="assessment-field">
              <div className="assessment-field-header">
                <span className="field-icon blue-icon">📍</span>
                <div className="field-labels">
                  <label>Site Conditions</label>
                  <span className="field-desc">Describe the current site conditions (access, terrain, soil, etc.).</span>
                </div>
              </div>
              <textarea
                rows={3}
                value={form.siteConditions}
                onChange={(e) => setForm({ ...form, siteConditions: e.target.value })}
                placeholder="Site is easily accessible by main road. Land is flat and stable..."
                disabled={!isEditable}
              />
            </div>

            <div className="assessment-field">
              <div className="assessment-field-header">
                <span className="field-icon blue-icon">📄</span>
                <div className="field-labels">
                  <label>Recommended Construction Notes</label>
                  <span className="field-desc">Any special notes or recommendations for construction.</span>
                </div>
              </div>
              <textarea
                rows={3}
                value={form.recommendedConstructionNotes}
                onChange={(e) => setForm({ ...form, recommendedConstructionNotes: e.target.value })}
                placeholder="Follow standard construction practices..."
                disabled={!isEditable}
              />
            </div>

            <div className="assessment-field">
              <div className="assessment-field-header">
                <span className="field-icon blue-icon">📚</span>
                <div className="field-labels">
                  <label>Major Material Requirements</label>
                  <span className="field-desc">List any key material requirements or special considerations.</span>
                </div>
              </div>
              <textarea
                rows={3}
                value={form.majorMaterialRequirements}
                onChange={(e) => setForm({ ...form, majorMaterialRequirements: e.target.value })}
                placeholder="Standard construction materials can be used..."
                disabled={!isEditable}
              />
            </div>

            <div className="assessment-field">
              <div className="assessment-field-header">
                <span className="field-icon blue-icon">🛡️</span>
                <div className="field-labels">
                  <label>Safety / Engineering Concerns</label>
                  <span className="field-desc">Mention any safety issues, engineering constraints, or risks.</span>
                </div>
              </div>
              <textarea
                rows={3}
                value={form.safetyEngineeringConcerns}
                onChange={(e) => setForm({ ...form, safetyEngineeringConcerns: e.target.value })}
                placeholder="No major safety concerns..."
                disabled={!isEditable}
              />
            </div>

            <div className="assessment-field highlighted-field">
              <div className="assessment-field-header">
                <span className="field-icon gold-icon">💡</span>
                <div className="field-labels">
                  <label>Technical Recommendation <span className="req">*</span></label>
                  <span className="field-desc">Your final technical recommendation for this project.</span>
                </div>
              </div>
              <div className="select-with-dot">
                <span className="select-dot" style={{backgroundColor: form.recommendation.includes('APPROVAL') ? '#2ecc71' : form.recommendation.includes('CHANGES') ? '#f39c12' : '#e74c3c'}}></span>
                <select
                  value={form.recommendation}
                  onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                  required
                  disabled={!isEditable}
                >
                  <option value="RECOMMEND_APPROVAL">RECOMMEND APPROVAL</option>
                  <option value="CHANGES_REQUIRED">CHANGES REQUIRED</option>
                  <option value="NOT_FEASIBLE">NOT FEASIBLE</option>
                </select>
              </div>
            </div>

            <div className="assessment-field full-span">
              <div className="assessment-field-header">
                <span className="field-icon blue-icon">💬</span>
                <div className="field-labels">
                  <label>Engineer Comments (Internal) <span className="req">*</span></label>
                  <span className="field-desc">Additional comments for the Admin / Project Manager (not visible to client).</span>
                </div>
              </div>
              <textarea
                rows={3}
                value={form.engineerComments}
                onChange={(e) => setForm({ ...form, engineerComments: e.target.value })}
                required
                disabled={!isEditable}
                placeholder="Project is technically feasible. Site conditions are good..."
              />
            </div>

          </div>

          <div className="assessment-form-footer">
            <button type="button" className="btn-footer-back" onClick={onBack}>← Back</button>
            <div className="footer-right-actions">
              <button type="button" className="btn-footer-draft" disabled={!isEditable}>
                💾 Save as Draft
              </button>
              {isEditable && (
                <button type="submit" className="btn-footer-submit" disabled={busy}>
                  🚀 {busy ? 'Submitting…' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
