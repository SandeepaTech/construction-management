import React, { useState, useEffect } from 'react';

export function EngineerProjectRequestsList({
  apiUrl = 'http://localhost:8080',
  getCsrfToken,
  onViewDetails,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${apiUrl}/api/engineer/project-requests`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load assigned project requests.');
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setRequests(data);
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
  }, [apiUrl]);

  function formatStatus(status) {
    if (!status) return 'Pending';
    if (status === 'SENT_TO_SITE_ENGINEER') return 'Review Required';
    if (status === 'ENGINEER_REVIEW_COMPLETED') return 'Assessment Submitted';
    if (status === 'APPROVED') return 'Project Approved';
    return status.replace(/_/g, ' ');
  }

  function getBadgeClass(status) {
    if (status === 'SENT_TO_SITE_ENGINEER') return 'status-under-review';
    if (status === 'ENGINEER_REVIEW_COMPLETED') return 'status-approved';
    return 'status-pending';
  }

  if (loading) {
    return <div className="client-panel client-loading-state">Loading assigned requests…</div>;
  }

  return (
    <div className="client-requests-page">
      <div className="client-page-heading">
        <span className="eyebrow">TASKS</span>
        <h1>Technical Review Requests</h1>
        <p>Review feasibility and provide technical assessments for project proposals.</p>
      </div>

      {error && <div className="form-error-banner" role="alert">{error}</div>}

      <div className="client-panel table-panel">
        {requests.length === 0 ? (
          <div className="client-empty-state">
            <span aria-hidden="true">▤</span>
            <strong>No assigned requests</strong>
            <p>You have not been assigned any project requests for technical review yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>REQ ID</th>
                  <th>CLIENT</th>
                  <th>PROJECT NAME</th>
                  <th>LOCATION</th>
                  <th>EST. BUDGET</th>
                  <th>ASSIGNED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const assignedDate = req.updatedAt || req.createdAt;
                  const formattedDate = new Date(assignedDate).toLocaleDateString();

                  return (
                    <tr key={req.id}>
                      <td className="bold-cell">#{req.id}</td>
                      <td>{req.clientName}</td>
                      <td>
                        <strong>{req.projectName}</strong>
                        {req.projectType && <span className="cell-sub">{req.projectType}</span>}
                      </td>
                      <td>{req.location}</td>
                      <td>{req.estimatedBudget || '—'}</td>
                      <td>{formattedDate}</td>
                      <td>
                        <span className={`status-badge ${getBadgeClass(req.status)}`}>
                          {formatStatus(req.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onViewDetails(req.id)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
