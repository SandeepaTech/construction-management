import React, { useState } from 'react';
import { AttachmentViewer } from './AttachmentViewer';

export function getStatusBadgeClass(status) {
  if (!status) return 'status-pending';
  const s = status.toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'status-pending';
    case 'UNDER_REVIEW':
    case 'UNDER_ADMIN_REVIEW':
      return 'status-under-review';
    case 'SENT_TO_SITE_ENGINEER':
      return 'status-under-review'; // or a new class
    case 'ENGINEER_REVIEW_COMPLETED':
      return 'status-under-review';
    case 'NEEDS_REVISION':
      return 'status-needs-revision';
    case 'APPROVED':
      return 'status-approved';
    case 'REJECTED':
      return 'status-rejected';
    default:
      return 'status-pending';
  }
}

export function formatStatusLabel(status) {
  if (!status) return 'Pending';
  switch (status.toUpperCase()) {
    case 'UNDER_REVIEW':
    case 'UNDER_ADMIN_REVIEW':
      return 'Under Admin Review';
    case 'SENT_TO_SITE_ENGINEER':
      return 'Sent to Site Engineer';
    case 'ENGINEER_REVIEW_COMPLETED':
      return 'Engineer Review Completed';
    case 'NEEDS_REVISION':
      return 'Needs Revision';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'PENDING':
    default:
      return 'Pending';
  }
}

export function ClientRequestsList({
  requests = [],
  loading = false,
  error = '',
  onNewRequest,
  onEditRequest,
  onDeleteRequest,
  apiUrl = 'http://localhost:8080',
}) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const totalRequests = requests.length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;
  const inReviewCount = requests.filter((r) => r.status === 'UNDER_REVIEW' || r.status === 'UNDER_ADMIN_REVIEW' || r.status === 'SENT_TO_SITE_ENGINEER').length;

  if (loading) {
    return <div className="client-panel client-loading-state">Loading your project requests…</div>;
  }

  return (
    <div className="client-requests-page">
      <div className="client-page-heading client-heading-with-action">
        <div>
          <span className="eyebrow">PROJECT REQUESTS</span>
          <h1>My Project Requests</h1>
          <p>Track progress, revisions, and approvals for all your submitted project requests.</p>
        </div>
        <button
          className="client-primary-button-new"
          type="button"
          onClick={onNewRequest}
        >
          <span aria-hidden="true">+</span> Submit New Request
        </button>
      </div>

      <div className="client-stats-grid">
        <div className="client-stat-card">
          <div className="stat-icon-wrapper blue">
            <span aria-hidden="true">📄</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Requests</span>
            <strong className="stat-value">{totalRequests}</strong>
          </div>
          <div className="stat-chart">
            <div className="bar blue" style={{ height: '30%' }}></div>
            <div className="bar blue" style={{ height: '70%' }}></div>
            <div className="bar blue" style={{ height: '50%' }}></div>
            <div className="bar blue" style={{ height: '90%' }}></div>
          </div>
        </div>

        <div className="client-stat-card">
          <div className="stat-icon-wrapper green">
            <span aria-hidden="true">✓</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Approved</span>
            <strong className="stat-value">{approvedCount}</strong>
          </div>
          <div className="stat-chart">
            <div className="bar green" style={{ height: '20%' }}></div>
            <div className="bar green" style={{ height: '40%' }}></div>
            <div className="bar green" style={{ height: '100%' }}></div>
            <div className="bar green" style={{ height: '80%' }}></div>
          </div>
        </div>

        <div className="client-stat-card">
          <div className="stat-icon-wrapper red">
            <span aria-hidden="true">✕</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Rejected</span>
            <strong className="stat-value">{rejectedCount}</strong>
          </div>
          <div className="stat-chart">
            <div className="bar red" style={{ height: '50%' }}></div>
            <div className="bar red" style={{ height: '30%' }}></div>
            <div className="bar red" style={{ height: '20%' }}></div>
            <div className="bar red" style={{ height: '70%' }}></div>
          </div>
        </div>

        <div className="client-stat-card">
          <div className="stat-icon-wrapper yellow">
            <span aria-hidden="true">⏱</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">In Review</span>
            <strong className="stat-value">{inReviewCount}</strong>
          </div>
          <div className="stat-chart">
            <div className="bar yellow" style={{ height: '80%' }}></div>
            <div className="bar yellow" style={{ height: '60%' }}></div>
            <div className="bar yellow" style={{ height: '40%' }}></div>
            <div className="bar yellow" style={{ height: '90%' }}></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="form-error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="error-icon">!</span> {error}
          </div>
          <button className="error-close" onClick={() => {/* handle close if needed */}}>✕</button>
        </div>
      )}

      <div className="table-toolbar">
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search project requests..." className="table-search-input" />
        </div>
        <div className="table-filters">
          <select className="table-filter-select">
            <option>All Statuses</option>
          </select>
          <select className="table-filter-select">
            <option>📅 Sort by Date</option>
          </select>
        </div>
      </div>

      <div className="client-panel table-panel no-padding">
        {requests.length === 0 ? (
          <div className="client-empty-state">
            <span aria-hidden="true">▤</span>
            <strong>No project requests yet</strong>
            <p>Ready to start your construction journey? Submit your first project request today.</p>
            <button
              className="client-primary-button-new"
              type="button"
              onClick={onNewRequest}
              style={{ marginTop: '16px' }}
            >
              Submit Project Request →
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-data-table modern-table">
              <thead>
                <tr>
                  <th>REQ ID</th>
                  <th>PROJECT NAME</th>
                  <th>TYPE</th>
                  <th>LOCATION</th>
                  <th>EST. BUDGET</th>
                  <th>PREFERRED START</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const submitted = req.submittedAt || req.createdAt;
                  const formattedDate = submitted
                    ? new Date(submitted).toLocaleDateString()
                    : 'Recently';

                  return (
                    <tr key={req.id}>
                      <td className="bold-cell">#{req.id}</td>
                      <td>
                        <div className="project-name-cell">
                          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&q=80" alt="" className="project-thumbnail" />
                          <div>
                            <strong>{req.projectName}</strong>
                            {req.propertyType && <span className="cell-sub">{req.propertyType}</span>}
                          </div>
                        </div>
                      </td>
                      <td>{req.projectType}</td>
                      <td>
                        <div className="location-cell">
                          <span className="location-icon">📍</span>
                          {req.location}
                        </div>
                      </td>
                      <td>{req.estimatedBudget || '—'}</td>
                      <td>{req.preferredStartDate || '—'}</td>
                      <td>{formattedDate}</td>
                      <td>
                        <span className={`status-badge modern ${getStatusBadgeClass(req.status)}`}>
                          {getStatusBadgeClass(req.status) === 'status-approved' && <span className="badge-icon">✓</span>}
                          {getStatusBadgeClass(req.status) === 'status-rejected' && <span className="badge-icon">✕</span>}
                          {formatStatusLabel(req.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="table-action-btn-new view-btn"
                            onClick={() => setSelectedRequest(req)}
                          >
                            <span className="btn-icon">👁</span> View Details
                          </button>
                          {((req.status === 'PENDING' || req.status === 'NEEDS_REVISION' || req.status === 'REJECTED') && onDeleteRequest) && (
                            <button
                              type="button"
                              className="table-action-btn-new delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this project request?')) {
                                  onDeleteRequest(req.id);
                                }
                              }}
                            >
                              <span className="btn-icon">🗑</span> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="table-footer">
              <span className="table-showing-text">Showing 1 to {requests.length} of {requests.length} requests</span>
              <div className="table-pagination">
                <button className="page-btn nav-btn">{'<'}</button>
                <button className="page-btn active">1</button>
                <button className="page-btn nav-btn">{'>'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="modal-backdrop" onClick={() => setSelectedRequest(null)}>
          <div className="details-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">REQUEST DETAILS · #{selectedRequest.id}</span>
                <h2>{selectedRequest.projectName}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-scroll">
              {/* Revision Alert in Modal */}
              {selectedRequest.status === 'NEEDS_REVISION' && (
                <div className="revision-alert-box" style={{ marginBottom: '20px' }}>
                  <div className="revision-alert-icon">⚠️</div>
                  <div>
                    <strong>Action Required: Project Manager Requested Changes</strong>
                    <p>{selectedRequest.revisionReason || 'Please review and update the request details.'}</p>
                    <button
                      type="button"
                      className="client-primary-button"
                      style={{ marginTop: '12px' }}
                      onClick={() => {
                        const target = selectedRequest;
                        setSelectedRequest(null);
                        onEditRequest(target);
                      }}
                    >
                      ✏️ Edit &amp; Resubmit Request Now
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Alert */}
              {selectedRequest.status === 'REJECTED' && (
                <div className="rejection-alert-box" style={{ marginBottom: '20px' }}>
                  <div className="rejection-alert-icon">✕</div>
                  <div>
                    <strong>Request Rejected</strong>
                    <p>{selectedRequest.rejectionReason || 'This request was not approved.'}</p>
                  </div>
                </div>
              )}

              {/* Approved Alert */}
              {selectedRequest.status === 'APPROVED' && (
                <div className="approval-alert-box" style={{ marginBottom: '20px' }}>
                  <div className="approval-alert-icon">✓</div>
                  <div>
                    <strong>Request Approved!</strong>
                    <p>Your request has been approved and registered as a Project in our system.</p>
                  </div>
                </div>
              )}

              <div className="details-cards-grid">
                <div className="detail-card">
                  <h4>Status &amp; Timeline</h4>
                  <div className="detail-item">
                    <span className="detail-label">Current Status:</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {formatStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted On:</span>
                    <span>{selectedRequest.submittedAt || selectedRequest.createdAt ? new Date(selectedRequest.submittedAt || selectedRequest.createdAt).toLocaleString() : '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Preferred Start:</span>
                    <span>{selectedRequest.preferredStartDate || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expected Completion:</span>
                    <span>{selectedRequest.expectedCompletionDate || '—'}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <h4>Project Specifications</h4>
                  <div className="detail-item">
                    <span className="detail-label">Project Type:</span>
                    <span>{selectedRequest.projectType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Property Type:</span>
                    <span>{selectedRequest.propertyType || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span>{selectedRequest.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Budget:</span>
                    <span>{selectedRequest.estimatedBudget || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Project Size:</span>
                    <span>{selectedRequest.approximateProjectSize || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Floors:</span>
                    <span>{selectedRequest.numberOfFloors || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Preferred Contact:</span>
                    <span>{selectedRequest.preferredContactMethod || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-card full-width" style={{ marginTop: '16px' }}>
                <h4>Project Details &amp; Scope</h4>
                <p className="detail-text-block">
                  {selectedRequest.projectDetails || selectedRequest.description || 'No detailed scope provided.'}
                </p>
              </div>

              {selectedRequest.specialRequirements && (
                <div className="detail-card full-width" style={{ marginTop: '16px' }}>
                  <h4>Special Requirements</h4>
                  <p className="detail-text-block">{selectedRequest.specialRequirements}</p>
                </div>
              )}

              <div className="detail-card full-width" style={{ marginTop: '16px' }}>
                <h4>Reference Files &amp; Plans ({selectedRequest.attachments?.length || 0})</h4>
                <AttachmentViewer
                  attachments={selectedRequest.attachments}
                  requestId={selectedRequest.id}
                  apiUrl={apiUrl}
                />
              </div>
            </div>

            <div className="modal-footer">
              {selectedRequest.status === 'NEEDS_REVISION' && (
                <>
                  <button
                    type="button"
                    className="modal-secondary-button"
                    style={{ color: '#d32f2f' }}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to withdraw and delete this project request?')) {
                        setSelectedRequest(null);
                        onDeleteRequest(selectedRequest.id);
                      }
                    }}
                  >
                    Reject &amp; Withdraw Request
                  </button>
                  <button
                    type="button"
                    className="client-primary-button"
                    onClick={() => {
                      const target = selectedRequest;
                      setSelectedRequest(null);
                      onEditRequest(target);
                    }}
                  >
                    Edit &amp; Resubmit Request
                  </button>
                </>
              )}
              <button
                type="button"
                className="modal-secondary-button"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
