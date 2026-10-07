import React, { useState, useEffect, useCallback } from 'react';
import { getStatusBadgeClass, formatStatusLabel } from './ClientRequestsList';

const ALL_PROJECT_TYPES = [
  'Home Construction',
  'Remodeling',
  'Commercial Construction',
  'Renovation',
  'Addition / Extension',
  'General Contracting',
];

const ALL_STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'NEEDS_REVISION', label: 'Needs Revision' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function AdminProjectRequestsList({
  apiUrl = 'http://localhost:8080',
  getCsrfToken,
  onViewDetails,
  onProjectCreated,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Site engineers list for approval
  const [siteEngineers, setSiteEngineers] = useState([]);

  // Active Modals
  const [revisionModalReq, setRevisionModalReq] = useState(null);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionBusy, setRevisionBusy] = useState(false);

  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectBusy, setRejectBusy] = useState(false);

  const [approveModalReq, setApproveModalReq] = useState(null);
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

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter) params.append('projectType', typeFilter);
      if (searchQuery.trim()) params.append('query', searchQuery.trim());
      if (sortOrder) params.append('sort', sortOrder);

      const res = await fetch(`${apiUrl}/api/admin/project-requests?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load project requests (HTTP ${res.status}).`);
      }
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error loading requests.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, statusFilter, typeFilter, searchQuery, sortOrder]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    // Load site engineers for project assignment dropdown
    fetch(`${apiUrl}/api/admin/site-engineers`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSiteEngineers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [apiUrl]);

  async function handleMarkUnderReview(id) {
    setError('');
    setNotice('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${id}/under-review`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update status.');
      }
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setNotice(`Request #${id} marked as Under Review.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRequestChangesSubmit(e) {
    e.preventDefault();
    if (!revisionReason.trim()) {
      setError('Revision message is required.');
      return;
    }
    setRevisionBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${revisionModalReq.id}/request-changes`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ revisionReason: revisionReason.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to request changes.');
      }
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setNotice(`Changes requested for request #${updated.id}. Client has been notified.`);
      setRevisionModalReq(null);
      setRevisionReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setRevisionBusy(false);
    }
  }

  function openApproveModal(req) {
    setApproveModalReq(req);
    setApproveForm({
      projectName: req.projectName,
      approvedBudget: req.estimatedBudget || '',
      startDate: req.preferredStartDate || '',
      expectedEndDate: req.expectedCompletionDate || '',
      siteName: `${req.projectName} Construction Site`,
      siteLocation: req.location,
      siteAddress: req.location,
      assignedSiteEngineerId: '',
    });
  }

  async function handleApproveSubmit(e) {
    e.preventDefault();
    setApproveBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${approveModalReq.id}/approve`, {
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to approve request.');
      }

      const createdProject = await res.json();
      setNotice(`Request #${approveModalReq.id} approved! Project #${createdProject.id} created.`);
      setApproveModalReq(null);
      fetchRequests();

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
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setRejectBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/admin/project-requests/${rejectModalReq.id}/reject`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to reject request.');
      }
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setNotice(`Request #${updated.id} rejected. Client has been notified.`);
      setRejectModalReq(null);
      setRejectionReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setRejectBusy(false);
    }
  }

  return (
    <div className="admin-requests-section">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">CLIENT INTAKE</span>
          <h1>Client Project Requests</h1>
          <p>Review, assess, request modifications, or approve client construction project proposals.</p>
        </div>
        <div className="requests-summary-stats">
          <div className="stat-pill">
            <span>TOTAL</span>
            <strong>{requests.length}</strong>
          </div>
          <div className="stat-pill pill-pending">
            <span>PENDING</span>
            <strong>{requests.filter((r) => r.status === 'PENDING').length}</strong>
          </div>
        </div>
      </div>

      {notice && <div className="client-success-message" role="status">{notice}</div>}
      {error && <div className="form-error-banner" role="alert">{error}</div>}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="filter-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search by client, project name, or location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-dropdown"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="">All Project Types</option>
            {ALL_PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-dropdown"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="team-card">
        {loading ? (
          <p className="team-message">Loading project requests…</p>
        ) : requests.length === 0 ? (
          <div className="client-empty-state">
            <span aria-hidden="true">▤</span>
            <strong>No matching project requests found</strong>
            <p>Try clearing your filters or search keywords.</p>
          </div>
        ) : (
          <div className="team-table-wrap">
            <table className="team-table custom-admin-table">
              <thead>
                <tr>
                  <th>REQ ID</th>
                  <th>CLIENT</th>
                  <th>PROJECT</th>
                  <th>PROPERTY</th>
                  <th>LOCATION</th>
                  <th>EST. BUDGET</th>
                  <th>START DATE</th>
                  <th>SUBMITTED</th>
                  <th>FILES</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const submitted = req.submittedAt || req.createdAt;
                  const dateStr = submitted ? new Date(submitted).toLocaleDateString() : '—';

                  return (
                    <tr key={req.id}>
                      <td className="bold-cell">#{req.id}</td>
                      <td>
                        <strong>{req.clientName || 'Client'}</strong>
                        <span className="table-subtext">{req.clientEmail}</span>
                      </td>
                      <td>
                        <strong>{req.projectName}</strong>
                        <span className="table-subtext">{req.projectType}</span>
                      </td>
                      <td>{req.propertyType || '—'}</td>
                      <td>{req.location}</td>
                      <td>{req.estimatedBudget || '—'}</td>
                      <td>{req.preferredStartDate || '—'}</td>
                      <td>{dateStr}</td>
                      <td>
                        <span className="attachment-count-pill" title="Uploaded reference files">
                          📎 {req.attachmentCount || req.attachments?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                          {formatStatusLabel(req.status)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            type="button"
                            className="btn-action-view"
                            onClick={() => onViewDetails(req.id)}
                            title="View Full Request Details"
                          >
                            View
                          </button>

                          {req.status === 'PENDING' && (
                            <button
                              type="button"
                              className="btn-action-secondary"
                              onClick={() => handleMarkUnderReview(req.id)}
                              title="Mark Under Review"
                            >
                              Under Review
                            </button>
                          )}

                          {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                            <>
                              <button
                                type="button"
                                className="btn-action-revision"
                                onClick={() => {
                                  setRevisionModalReq(req);
                                  setRevisionReason('');
                                }}
                                title="Request Changes / Revisions"
                              >
                                Changes
                              </button>

                              <button
                                type="button"
                                className="btn-action-approve"
                                onClick={() => openApproveModal(req)}
                                title="Approve Request & Create Project"
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                className="btn-action-reject"
                                onClick={() => {
                                  setRejectModalReq(req);
                                  setRejectionReason('');
                                }}
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REQUEST CHANGES MODAL */}
      {revisionModalReq && (
        <div className="modal-backdrop" onClick={() => setRevisionModalReq(null)}>
          <div className="admin-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">REQUEST REVISION · #{revisionModalReq.id}</span>
                <h3>Request Changes from Client</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRevisionModalReq(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRequestChangesSubmit}>
              <div className="modal-body">
                <p>
                  Project: <strong>{revisionModalReq.projectName}</strong> (Client: {revisionModalReq.clientName})
                </p>
                <label htmlFor="revisionReason">Revision Reason / Instructions <span className="req">*</span></label>
                <textarea
                  id="revisionReason"
                  rows={4}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="e.g. Please provide a more accurate estimated budget and upload the land plan."
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-secondary-button"
                  onClick={() => setRevisionModalReq(null)}
                  disabled={revisionBusy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="client-primary-button"
                  disabled={revisionBusy}
                >
                  {revisionBusy ? 'Sending…' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalReq && (
        <div className="modal-backdrop" onClick={() => setRejectModalReq(null)}>
          <div className="admin-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">REJECT REQUEST · #{rejectModalReq.id}</span>
                <h3>Reject Project Request</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRejectModalReq(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <p>
                  Are you sure you want to reject <strong>{rejectModalReq.projectName}</strong>?
                </p>
                <label htmlFor="rejectionReason">Rejection Reason <span className="req">*</span></label>
                <textarea
                  id="rejectionReason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Requested budget is not feasible for the proposed project scope."
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-secondary-button"
                  onClick={() => setRejectModalReq(null)}
                  disabled={rejectBusy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger-submit"
                  disabled={rejectBusy}
                >
                  {rejectBusy ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE & CREATE PROJECT MODAL */}
      {approveModalReq && (
        <div className="modal-backdrop" onClick={() => setApproveModalReq(null)}>
          <div className="admin-action-modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">APPROVE REQUEST · #{approveModalReq.id}</span>
                <h3>Approve Request &amp; Create Project</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setApproveModalReq(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApproveSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
              <div className="modal-body-scroll">
                <div className="approve-info-banner">
                  Approving this request will automatically create an official Project and Site record, link them to client <strong>{approveModalReq.clientName}</strong>, and notify the client.
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
                      value={`${approveModalReq.clientName} (${approveModalReq.clientEmail})`}
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
                    <label>Site Location (City/District) <span className="req">*</span></label>
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
                    <label>Site Physical Address</label>
                    <input
                      type="text"
                      value={approveForm.siteAddress}
                      onChange={(e) => setApproveForm({ ...approveForm, siteAddress: e.target.value })}
                      placeholder="Specific street address or cadastral lot number"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-secondary-button"
                  onClick={() => setApproveModalReq(null)}
                  disabled={approveBusy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="client-primary-button"
                  disabled={approveBusy}
                >
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
