import React, { useState } from 'react';

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function AttachmentViewer({ attachments = [], requestId, apiUrl = 'http://localhost:8080' }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!attachments || attachments.length === 0) {
    return <p className="attachments-empty">No attachments uploaded for this request.</p>;
  }

  return (
    <div className="attachments-container">
      <div className="attachments-grid">
        {attachments.map((att) => {
          const isImage = att.fileType && att.fileType.startsWith('image/');
          const fileUrl = `${apiUrl}/api/project-requests/${requestId}/attachments/${att.id}`;

          return (
            <div key={att.id} className="attachment-card">
              {isImage ? (
                <div
                  className="attachment-thumb-wrap"
                  onClick={() => setSelectedImage({ url: fileUrl, name: att.originalFileName })}
                  role="button"
                  tabIndex={0}
                  title="Click to expand"
                >
                  <img src={fileUrl} alt={att.originalFileName} className="attachment-thumb" />
                  <div className="attachment-thumb-overlay">
                    <span>🔍 Enlarge</span>
                  </div>
                </div>
              ) : (
                <div className="attachment-pdf-icon-wrap">
                  <span className="attachment-pdf-badge" aria-hidden="true">PDF</span>
                  <span className="attachment-pdf-doc-icon">📄</span>
                </div>
              )}
              <div className="attachment-info">
                <span className="attachment-filename" title={att.originalFileName}>
                  {att.originalFileName}
                </span>
                <span className="attachment-meta">
                  {formatFileSize(att.fileSize)}
                </span>
                <div className="attachment-actions">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-btn"
                  >
                    View
                  </a>
                  <a
                    href={`${fileUrl}?download=true`}
                    download={att.originalFileName}
                    className="attachment-btn attachment-btn-download"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-title">{selectedImage.name}</span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
            <div className="lightbox-body">
              <img src={selectedImage.url} alt={selectedImage.name} className="lightbox-img" />
            </div>
            <div className="lightbox-footer">
              <a
                href={`${selectedImage.url}?download=true`}
                download={selectedImage.name}
                className="client-primary-button"
              >
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
