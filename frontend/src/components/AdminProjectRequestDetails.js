import React, { useState, useEffect } from 'react';
import { getStatusBadgeClass, formatStatusLabel } from './ClientRequestsList';
import { AttachmentViewer } from './AttachmentViewer';

export function AdminProjectRequestDetails({
  requestId,
  apiUrl = 'http://localhost:8080',
  getCsrfToken,
  onBack,
  onProjectCreated,
}) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Site engineers list for approval
  const [siteEngineers, setSiteEngineers] = useState([]);

  // Modals
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionBusy, setRevisionBusy] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectBusy, setRejectBusy] = useState(false);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForm, setApproveForm] = useState({
    projectName: '',
    approvedBudget: '',
    startDate: '',
    expectedEndDate: '',
    siteName: '',
    siteLocation: '',
    siteAddress: '',
    assignedSiteEngineerId: '',
  });
  const [approveBusy, setApproveBusy] = useState(false);

  const [showEngineerModal, setShowEngineerModal] = useState(false);
  const [engineerForm, setEngineerForm] = useState({
    siteEngineerId: '',
    adminNote: '',
  });
  const [engineerBusy, setEngineerBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${apiUrl}/api/admin/project-requests/${requestId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request #${requestId} could not be loaded.`);
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setRequest(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    fetch(`${apiUrl}/api/admin/site-engineers`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (mounted) setSiteEngineers(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [apiUrl, requestId]);

  async function handleMarkUnderReview() {
    setError('');
    setNotice('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${requestId}/under-review`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });
      if (!res.ok) throw new Error('Could not update status to Under Review.');
      const updated = await res.json();
      setRequest(updated);
      setNotice('Request is now marked as Under Review.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRequestChangesSubmit(e) {
    e.preventDefault();
    if (!revisionReason.trim()) return;
    setRevisionBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${requestId}/request-changes`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ revisionReason: revisionReason.trim() }),
      });
      if (!res.ok) throw new Error('Could not submit revision request.');
      const updated = await res.json();
      setRequest(updated);
      setShowRevisionModal(false);
      setRevisionReason('');
      setNotice('Revision request sent to client.');
    } catch (err) {
      setError(err.message);
    } finally {
      setRevisionBusy(false);
    }
  }

  async function handleSendToEngineerSubmit(e) {
    e.preventDefault();
    if (!engineerForm.siteEngineerId) return;
    setEngineerBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${requestId}/send-to-engineer`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          siteEngineerId: Number(engineerForm.siteEngineerId),
          adminNote: engineerForm.adminNote.trim(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || 'Could not send to site engineer.');
      }
      const updated = await res.json();
      setRequest(updated);
      setShowEngineerModal(false);
      setEngineerForm({ siteEngineerId: '', adminNote: '' });
      setNotice('Project request sent to Site Engineer for technical review.');
    } catch (err) {
      setError(err.message);
    } finally {
      setEngineerBusy(false);
    }
  }

  function openApproveModal() {
    setApproveForm({
      projectName: request.projectName,
      approvedBudget: request.estimatedBudget || '',
      startDate: request.preferredStartDate || '',
      expectedEndDate: request.expectedCompletionDate || '',
      siteName: `${request.projectName} Construction Site`,
      siteLocation: request.location,
      siteAddress: request.location,
      assignedSiteEngineerId: request.assignedSiteEngineerId ? request.assignedSiteEngineerId.toString() : '',
    });
    setShowApproveModal(true);
  }

  async function handleApproveSubmit(e) {
    e.preventDefault();
    setApproveBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          projectName: approveForm.projectName.trim(),
          approvedBudget: approveForm.approvedBudget.trim(),
          startDate: approveForm.startDate || null,
          expectedEndDate: approveForm.expectedEndDate || null,
          siteName: approveForm.siteName.trim(),
          siteLocation: approveForm.siteLocation.trim(),
          siteAddress: approveForm.siteAddress.trim(),
          assignedSiteEngineerId: approveForm.assignedSiteEngineerId ? Number(approveForm.assignedSiteEngineerId) : null,
        }),
      });
      if (!res.ok) throw new Error('Could not approve request.');
      const createdProject = await res.json();
      setShowApproveModal(false);
      if (onProjectCreated) {
        onProjectCreated(createdProject.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setApproveBusy(false);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setRejectBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${requestId}/reject`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
      });
      if (!res.ok) throw new Error('Could not reject request.');
      const updated = await res.json();
      setRequest(updated);
      setShowRejectModal(false);
      setRejectionReason('');
      setNotice('Request has been rejected and client notified.');
    } catch (err) {
      setError(err.message);
    } finally {
      setRejectBusy(false);
    }
  }

  if (loading) {
    return <div className="client-panel client-loading-state">Loading request details…</div>;
  }

  if (error || !request) {
    return (
      <div className="client-panel">
        <p className="dashboard-error">{error || 'Request not found.'}</p>
        <button type="button" className="client-primary-button" onClick={onBack}>
          ← Back to Project Requests
        </button>
      </div>
    );
  }

  return (
    <div className="admin-details-view">
      <div className="details-header-bar">
        <button type="button" className="back-link-btn" onClick={onBack}>
          ← Back to Requests
        </button>
        <div className="header-status-group">
          <span className="eyebrow">STATUS:</span>
          <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
            {formatStatusLabel(request.status)}
          </span>
        </div>
      </div>

      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">PROJECT PROPOSAL #{request.id}</span>
          <h1>{request.projectName}</h1>
          <p>
            Submitted by <strong>{request.clientName}</strong> on {request.submittedAt || request.createdAt ? new Date(request.submittedAt || request.createdAt).toLocaleString() : '—'}
          </p>
        </div>

        <div className="admin-actions-bar">
          {request.status === 'PENDING' && (
            <button
              type="button"
              className="btn-action-secondary"
              onClick={handleMarkUnderReview}
            >
              Mark Under Review
            </button>
          )}

          {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW' || request.status === 'UNDER_ADMIN_REVIEW' || request.status === 'NEEDS_REVISION') && (
            <button
              type="button"
              className="client-primary-button"
              style={{ backgroundColor: '#2b3648' }}
              onClick={() => setShowEngineerModal(true)}
            >
              Send to Site Engineer
            </button>
          )}

          {request.status !== 'APPROVED' && request.status !== 'REJECTED' && (
            <>
              {request.status === 'ENGINEER_REVIEW_COMPLETED' && (
                <button
                  type="button"
                  className="btn-action-approve"
                  onClick={openApproveModal}
                >
                  Final Approve
                </button>
              )}
              
              <button
                type="button"
                className="btn-action-revision"
                onClick={() => {
                  setRevisionReason('');
                  setShowRevisionModal(true);
                }}
              >
                Request Changes
              </button>
              
              <button
                type="button"
                className="btn-action-reject"
                onClick={() => {
                  setRejectionReason('');
                  setShowRejectModal(true);
                }}
              >
                Reject Request
              </button>
            </>
          )}
        </div>
      </div>

      {notice && <div className="client-success-message" role="status">{notice}</div>}
      {error && <div className="form-error-banner" role="alert">{error}</div>}

      {/* Revision notice */}
      {request.status === 'NEEDS_REVISION' && (
        <div className="revision-alert-box">
          <div className="revision-alert-icon">⚠️</div>
          <div>
            <strong>Revisions Requested From Client</strong>
            <p>{request.revisionReason}</p>
          </div>
        </div>
      )}

      {/* Rejection notice */}
      {request.status === 'REJECTED' && (
        <div className="rejection-alert-box">
          <div className="rejection-alert-icon">✕</div>
          <div>
            <strong>Proposal Rejected</strong>
            <p>{request.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Approval notice */}
      {request.status === 'APPROVED' && (
        <div className="approval-alert-box">
          <div className="approval-alert-icon">✓</div>
          <div>
            <strong>Request Approved</strong>
            <p>
              This request was approved. Project record <strong>#{request.approvedProjectId}</strong> has been created.
            </p>
          </div>
        </div>
      )}

      <div className="admin-details-sections-grid">
        {/* Section 1: Client Information */}
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
              <span className="info-lbl">Preferred Contact</span>
              <span className="info-val">{request.preferredContactMethod || 'Email'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Project Information */}
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
              <span className="info-lbl">Property / Building</span>
              <span className="info-val">{request.propertyType || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Location</span>
              <span className="info-val">{request.location}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Project Size</span>
              <span className="info-val">{request.approximateProjectSize || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Number of Floors</span>
              <span className="info-val">{request.numberOfFloors || '—'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Budget & Schedule */}
        <div className="details-card">
          <div className="card-header-styled">
            <span className="card-sec-badge">3</span>
            <h3>BUDGET &amp; SCHEDULE</h3>
          </div>
          <div className="detail-rows">
            <div className="info-row">
              <span className="info-lbl">Estimated Budget</span>
              <span className="info-val highlight-budget">{request.estimatedBudget || 'Not specified'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Preferred Start Date</span>
              <span className="info-val">{request.preferredStartDate || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Expected Completion</span>
              <span className="info-val">{request.expectedCompletionDate || '—'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Project Details */}
        <div className="details-card full-width">
          <div className="card-header-styled">
            <span className="card-sec-badge">4</span>
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

        {/* Section 5: Attachments */}
        <div className="details-card full-width">
          <div className="card-header-styled">
            <span className="card-sec-badge">5</span>
            <h3>ATTACHMENTS &amp; REFERENCE PLANS ({request.attachments?.length || 0})</h3>
          </div>
          <AttachmentViewer
            attachments={request.attachments}
            requestId={request.id}
            apiUrl={apiUrl}
          />
        </div>

        {/* Section 6: Technical Assessment */}
        {request.technicalAssessment && (
          <div className="details-card full-width" style={{ marginTop: '24px', borderLeft: '4px solid #4a6fa5' }}>
            <div className="card-header-styled">
              <span className="card-sec-badge" style={{ backgroundColor: '#4a6fa5' }}>TA</span>
              <h3 style={{ color: '#4a6fa5' }}>SITE ENGINEER TECHNICAL ASSESSMENT</h3>
            </div>
            <div className="detail-rows">
              <div className="info-row full-row">
                <span className="info-lbl">Site Engineer</span>
                <span className="info-val"><strong>{request.technicalAssessment.siteEngineerName}</strong></span>
              </div>
              
              <div className="info-row">
                <span className="info-lbl">Site Feasibility</span>
                <span className="info-val">
                  {request.technicalAssessment.siteFeasibility === 'SUITABLE' && <span style={{color: '#2e7d32', fontWeight: 600}}>SUITABLE</span>}
                  {request.technicalAssessment.siteFeasibility === 'SUITABLE_WITH_CONDITIONS' && <span style={{color: '#ed6c02', fontWeight: 600}}>SUITABLE WITH CONDITIONS</span>}
                  {request.technicalAssessment.siteFeasibility === 'NOT_SUITABLE' && <span style={{color: '#d32f2f', fontWeight: 600}}>NOT SUITABLE</span>}
                </span>
              </div>
              <div className="info-row">
                <span className="info-lbl">Technical Risk</span>
                <span className="info-val">
                  {request.technicalAssessment.technicalRisk === 'LOW' && <span style={{color: '#2e7d32', fontWeight: 600}}>LOW</span>}
                  {request.technicalAssessment.technicalRisk === 'MEDIUM' && <span style={{color: '#ed6c02', fontWeight: 600}}>MEDIUM</span>}
                  {request.technicalAssessment.technicalRisk === 'HIGH' && <span style={{color: '#d32f2f', fontWeight: 600}}>HIGH</span>}
                </span>
              </div>
              <div className="info-row">
                <span className="info-lbl">Est. Duration</span>
                <span className="info-val">{request.technicalAssessment.estimatedDuration || '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-lbl">Recommendation</span>
                <span className="info-val">
                  {request.technicalAssessment.recommendation === 'RECOMMEND_APPROVAL' && <span style={{color: '#2e7d32', fontWeight: 700}}>RECOMMEND APPROVAL</span>}
                  {request.technicalAssessment.recommendation === 'CHANGES_REQUIRED' && <span style={{color: '#ed6c02', fontWeight: 700}}>CHANGES REQUIRED</span>}
                  {request.technicalAssessment.recommendation === 'NOT_FEASIBLE' && <span style={{color: '#d32f2f', fontWeight: 700}}>NOT FEASIBLE</span>}
                </span>
              </div>
            </div>

            <div className="detail-block-text" style={{ marginTop: '16px' }}>
              <strong>Site Conditions:</strong>
              <p>{request.technicalAssessment.siteConditions || 'None specified'}</p>
            </div>
            <div className="detail-block-text" style={{ marginTop: '16px' }}>
              <strong>Recommended Construction Notes:</strong>
              <p>{request.technicalAssessment.recommendedConstructionNotes || 'None specified'}</p>
            </div>
            <div className="detail-block-text" style={{ marginTop: '16px' }}>
              <strong>Major Material Requirements:</strong>
              <p>{request.technicalAssessment.majorMaterialRequirements || 'None specified'}</p>
            </div>
            <div className="detail-block-text" style={{ marginTop: '16px' }}>
              <strong>Safety / Engineering Concerns:</strong>
              <p>{request.technicalAssessment.safetyEngineeringConcerns || 'None specified'}</p>
            </div>
            <div className="detail-block-text" style={{ marginTop: '16px', backgroundColor: '#f0f4f8', padding: '12px', borderRadius: '4px' }}>
              <strong>Engineer Comments:</strong>
              <p style={{ margin: 0 }}>{request.technicalAssessment.engineerComments}</p>
            </div>
          </div>
        )}
      </div>

      {/* REQUEST CHANGES MODAL */}
      {showRevisionModal && (
        <div className="modal-backdrop" onClick={() => setShowRevisionModal(false)}>
          <div className="admin-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">REQUEST REVISION · #{request.id}</span>
                <h3>Request Changes from Client</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowRevisionModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRequestChangesSubmit}>
              <div className="modal-body">
                <label htmlFor="detailsRevisionReason">Revision Message / Reason <span className="req">*</span></label>
                <textarea
                  id="detailsRevisionReason"
                  rows={4}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="e.g. Please provide a more accurate estimated budget and upload the land plan."
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-secondary-button" onClick={() => setShowRevisionModal(false)} disabled={revisionBusy}>Cancel</button>
                <button type="submit" className="client-primary-button" disabled={revisionBusy}>
                  {revisionBusy ? 'Sending…' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="admin-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">REJECT REQUEST · #{request.id}</span>
                <h3>Reject Project Request</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <label htmlFor="detailsRejectionReason">Rejection Reason <span className="req">*</span></label>
                <textarea
                  id="detailsRejectionReason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Requested budget is not feasible for the proposed project scope."
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-secondary-button" onClick={() => setShowRejectModal(false)} disabled={rejectBusy}>Cancel</button>
                <button type="submit" className="btn-danger-submit" disabled={rejectBusy}>
                  {rejectBusy ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND TO ENGINEER MODAL */}
      {showEngineerModal && (
        <div className="modal-backdrop" onClick={() => setShowEngineerModal(false)}>
          <div className="admin-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">TECHNICAL REVIEW · #{request.id}</span>
                <h3>Send to Site Engineer</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowEngineerModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSendToEngineerSubmit}>
              <div className="modal-body">
                <label htmlFor="assignEngineer">Assign Site Engineer <span className="req">*</span></label>
                <select
                  id="assignEngineer"
                  value={engineerForm.siteEngineerId}
                  onChange={(e) => setEngineerForm({ ...engineerForm, siteEngineerId: e.target.value })}
                  required
                >
                  <option value="">Select a Site Engineer...</option>
                  {siteEngineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>{eng.fullName} ({eng.email})</option>
                  ))}
                </select>

                <label htmlFor="adminNote" style={{ marginTop: '16px' }}>Admin Note / Instructions</label>
                <textarea
                  id="adminNote"
                  rows={4}
                  value={engineerForm.adminNote}
                  onChange={(e) => setEngineerForm({ ...engineerForm, adminNote: e.target.value })}
                  placeholder="e.g. Please review the site feasibility, project scope and expected duration."
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-secondary-button" onClick={() => setShowEngineerModal(false)} disabled={engineerBusy}>Cancel</button>
                <button type="submit" className="client-primary-button" disabled={engineerBusy}>
                  {engineerBusy ? 'Sending…' : 'Send for Technical Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="modal-backdrop" onClick={() => setShowApproveModal(false)}>
          <div className="admin-action-modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">APPROVE REQUEST · #{request.id}</span>
                <h3>Approve Request &amp; Create Project</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowApproveModal(false)}>✕</button>
            </div>
            <form onSubmit={handleApproveSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
              <div className="modal-body-scroll">
                <div className="approve-info-banner">
                  Confirm the official project parameters and site specifications below.
                </div>
                <div className="modal-grid-fields">
                  <div className="form-field full-width">
                    <label>Official Project Name <span className="req">*</span></label>
                    <input
                      type="text"
                      value={approveForm.projectName}
                      onChange={(e) => setApproveForm({ ...approveForm, projectName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Client</label>
                    <input
                      type="text"
                      value={`${request.clientName} (${request.clientEmail})`}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                  <div className="form-field">
                    <label>Approved Budget <span className="req">*</span></label>
                    <input
                      type="text"
                      value={approveForm.approvedBudget}
                      onChange={(e) => setApproveForm({ ...approveForm, approvedBudget: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Start Date <span className="req">*</span></label>
                    <input
                      type="date"
                      value={approveForm.startDate}
                      onChange={(e) => setApproveForm({ ...approveForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Expected End Date</label>
                    <input
                      type="date"
                      value={approveForm.expectedEndDate}
                      onChange={(e) => setApproveForm({ ...approveForm, expectedEndDate: e.target.value })}
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>Site Name <span className="req">*</span></label>
                    <input
                      type="text"
                      value={approveForm.siteName}
                      onChange={(e) => setApproveForm({ ...approveForm, siteName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Site Location <span className="req">*</span></label>
                    <input
                      type="text"
                      value={approveForm.siteLocation}
                      onChange={(e) => setApproveForm({ ...approveForm, siteLocation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Assigned Site Engineer</label>
                    <select
                      value={approveForm.assignedSiteEngineerId}
                      onChange={(e) => setApproveForm({ ...approveForm, assignedSiteEngineerId: e.target.value })}
                    >
                      <option value="">Select Site Engineer (Optional)</option>
                      {siteEngineers.map((eng) => (
                        <option key={eng.id} value={eng.id}>{eng.fullName} ({eng.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field full-width">
                    <label>Site Address</label>
                    <input
                      type="text"
                      value={approveForm.siteAddress}
                      onChange={(e) => setApproveForm({ ...approveForm, siteAddress: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-secondary-button" onClick={() => setShowApproveModal(false)} disabled={approveBusy}>Cancel</button>
                <button type="submit" className="client-primary-button" disabled={approveBusy}>
                  {approveBusy ? 'Creating Project…' : 'Approve & Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
