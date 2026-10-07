import React, { useState, useEffect } from 'react';

export function ClientNotifications({
  apiUrl = 'http://localhost:8080',
  getCsrfToken,
  onNavigate,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/client/notifications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, [apiUrl]);

  async function handleMarkRead(id, link) {
    try {
      const csrfToken = await getCsrfToken();
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {}

    if (link && onNavigate) {
      onNavigate(link);
    }
  }

  return (
    <div className="client-notifications-page">
      <div className="client-page-heading">
        <span className="eyebrow">ACCOUNT</span>
        <h1>Notifications</h1>
        <p>Updates on your project proposals, revisions, and site approvals.</p>
      </div>

      <div className="client-panel">
        {loading ? (
          <p className="client-loading-state">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div className="client-empty-state">
            <span aria-hidden="true">♧</span>
            <strong>No notifications yet</strong>
            <p>You will receive updates here whenever the project manager reviews or updates your project requests.</p>
          </div>
        ) : (
          <div className="client-notif-full-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`client-notif-card ${!n.read ? 'card-unread' : ''}`}
                onClick={() => handleMarkRead(n.id, n.link)}
              >
                <div className="notif-card-header">
                  <strong>{n.title}</strong>
                  <span className="notif-card-time">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <p className="notif-card-body">{n.message}</p>
                {n.link && (
                  <span className="notif-card-link">View Details →</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
