import React, { useState, useRef } from 'react';
import { formatFileSize } from './AttachmentViewer';

const PROJECT_TYPES = [
  'Home Construction',
  'Remodeling',
  'Commercial Construction',
  'Renovation',
  'Addition / Extension',
  'General Contracting',
  'Residential',
];

const PROPERTY_TYPES = [
  'House',
  'Apartment',
  'Office',
  'Shop / Retail',
  'Warehouse',
  'Other',
];

const BUDGET_OPTIONS = [
  'Below LKR 5 Million',
  'LKR 5M - 10M',
  'LKR 10M - 20M',
  'LKR 20M - 50M',
  'Above LKR 50M',
  'Not Sure Yet',
];

const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp'];

export function ClientProjectRequestForm({
  initialData = null,
  isEdit = false,
  onSubmitSuccess,
  apiUrl = 'http://localhost:8080',
  getCsrfToken,
}) {
  const [form, setForm] = useState({
    projectName: initialData?.projectName || '',
    projectType: initialData?.projectType || '',
    propertyType: initialData?.propertyType || '',
    location: initialData?.location || '',
    estimatedBudget: initialData?.estimatedBudget || '',
    preferredStartDate: initialData?.preferredStartDate || '',
    expectedCompletionDate: initialData?.expectedCompletionDate || '',
    approximateProjectSize: initialData?.approximateProjectSize || '',
    numberOfFloors: initialData?.numberOfFloors || '',
    projectDetails: initialData?.projectDetails || initialData?.description || '',
    specialRequirements: initialData?.specialRequirements || '',
    preferredContactMethod: initialData?.preferredContactMethod || 'Email',
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFilesSelected(newFiles) {
    setError('');
    const validExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const maxFiles = 5;
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    const totalAllowed = maxFiles - files.length;
    if (newFiles.length > totalAllowed) {
      setError(`You can only upload up to ${maxFiles} files in total.`);
      return;
    }

    const validatedFiles = [];
    const newPreviews = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const ext = file.name.split('.').pop().toLowerCase();

      if (!validExtensions.includes(ext)) {
        setError(`File "${file.name}" has an unsupported format. Please upload JPG, PNG, or PDF.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds the 10 MB size limit.`);
        return;
      }

      validatedFiles.push(file);

      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push({ file, previewUrl, isImage: true });
      } else {
        newPreviews.push({ file, previewUrl: null, isImage: false });
      }
    }

    setFiles((prev) => [...prev, ...validatedFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeFile(index) {
    const preview = filePreviews[index];
    if (preview && preview.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.projectName.trim()) {
      setError('Please enter a project name.');
      return;
    }
    if (!form.projectType) {
      setError('Please select a project type.');
      return;
    }
    if (!form.location.trim()) {
      setError('Please provide the project location.');
      return;
    }
    if (!form.projectDetails.trim()) {
      setError('Please describe your project details.');
      return;
    }

    setSubmitting(true);
    try {
      const csrfToken = await getCsrfToken();
      let response;

      if (files.length === 0) {
        // Send JSON
        const endpoint = isEdit && initialData?.id
          ? `${apiUrl}/api/client/requests/${initialData.id}`
          : `${apiUrl}/api/client/requests`;
        const method = isEdit ? 'PUT' : 'POST';

        const payload = {
          projectName: form.projectName.trim(),
          projectType: form.projectType.trim(),
          location: form.location.trim(),
          description: form.projectDetails.trim(),
        };
        if (form.propertyType) payload.propertyType = form.propertyType.trim();
        if (form.estimatedBudget) payload.estimatedBudget = form.estimatedBudget.trim();
        if (form.preferredStartDate) payload.preferredStartDate = form.preferredStartDate;
        if (form.expectedCompletionDate) payload.expectedCompletionDate = form.expectedCompletionDate;
        if (form.approximateProjectSize) payload.approximateProjectSize = form.approximateProjectSize.trim();
        if (form.numberOfFloors) payload.numberOfFloors = form.numberOfFloors.trim();
        if (form.projectDetails) payload.projectDetails = form.projectDetails.trim();
        if (form.specialRequirements) payload.specialRequirements = form.specialRequirements.trim();
        if (form.preferredContactMethod) payload.preferredContactMethod = form.preferredContactMethod;

        response = await fetch(endpoint, {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Send multipart FormData
        const formData = new FormData();
        formData.append('projectName', form.projectName.trim());
        formData.append('projectType', form.projectType);
        if (form.propertyType) formData.append('propertyType', form.propertyType);
        formData.append('location', form.location.trim());
        if (form.estimatedBudget) formData.append('estimatedBudget', form.estimatedBudget);
        if (form.preferredStartDate) formData.append('preferredStartDate', form.preferredStartDate);
        if (form.expectedCompletionDate) formData.append('expectedCompletionDate', form.expectedCompletionDate);
        if (form.approximateProjectSize) formData.append('approximateProjectSize', form.approximateProjectSize.trim());
        if (form.numberOfFloors) formData.append('numberOfFloors', form.numberOfFloors.trim());
        formData.append('projectDetails', form.projectDetails.trim());
        formData.append('description', form.projectDetails.trim());
        if (form.specialRequirements) formData.append('specialRequirements', form.specialRequirements.trim());
        if (form.preferredContactMethod) formData.append('preferredContactMethod', form.preferredContactMethod);

        files.forEach((file) => {
          formData.append('files', file);
        });

        const endpoint = isEdit && initialData?.id
          ? `${apiUrl}/api/client/requests/${initialData.id}`
          : `${apiUrl}/api/client/requests`;
        const method = isEdit ? 'PUT' : 'POST';

        response = await fetch(endpoint, {
          method,
          credentials: 'include',
          headers: {
            'X-XSRF-TOKEN': csrfToken,
          },
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Submission failed with status ${response.status}.`);
      }

      const savedRequest = await response.json();
      if (onSubmitSuccess) {
        onSubmitSuccess(
          savedRequest,
          isEdit ? 'Project request updated and resubmitted successfully.' : 'Project request submitted successfully.'
        );
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your project request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="project-request-form-container">
      {initialData?.revisionReason && (
        <div className="revision-alert-box" role="alert">
          <div className="revision-alert-icon">⚠️</div>
          <div>
            <strong>Revision Requested by Project Manager</strong>
            <p>{initialData.revisionReason}</p>
            <small>Please update the required information below and resubmit your request.</small>
          </div>
        </div>
      )}

      {error && <div className="form-error-banner" role="alert">{error}</div>}

      <form className="sectioned-request-form" onSubmit={handleSubmit}>
        {/* Section 1: Project Information */}
        <div className="form-section-card">
          <div className="section-card-header">
            <span className="section-badge">1</span>
            <div>
              <h3>Project Information</h3>
              <p>Essential details regarding your planned construction</p>
            </div>
          </div>
          <div className="section-grid">
            <div className="form-field full-width">
              <label htmlFor="projectName">Project Name <span className="req">*</span></label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                value={form.projectName}
                onChange={handleChange}
                placeholder="e.g. Modern Two-Storey Residence"
                maxLength={120}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="projectType">Project Type <span className="req">*</span></label>
              <select
                id="projectType"
                name="projectType"
                value={form.projectType}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select project type</option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="propertyType">Property / Building Type</label>
              <select
                id="propertyType"
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
              >
                <option value="">Select building type</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-field full-width">
              <label htmlFor="projectLocation">Project Location <span className="req">*</span></label>
              <input
                id="projectLocation"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="City, district, address or plot location"
                maxLength={240}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Budget & Schedule */}
        <div className="form-section-card">
          <div className="section-card-header">
            <span className="section-badge">2</span>
            <div>
              <h3>Budget &amp; Schedule</h3>
              <p>Your target investment range and intended timeline</p>
            </div>
          </div>
          <div className="section-grid">
            <div className="form-field">
              <label htmlFor="estimatedBudget">Estimated Budget <span className="req">*</span></label>
              <select
                id="estimatedBudget"
                name="estimatedBudget"
                value={form.estimatedBudget}
                onChange={handleChange}
              >
                <option value="">Select estimated budget</option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="preferredStartDate">Preferred Start Date <span className="req">*</span></label>
              <input
                id="preferredStartDate"
                name="preferredStartDate"
                type="date"
                value={form.preferredStartDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="expectedCompletionDate">Expected Completion Date</label>
              <input
                id="expectedCompletionDate"
                name="expectedCompletionDate"
                type="date"
                value={form.expectedCompletionDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
              <select
                id="preferredContactMethod"
                name="preferredContactMethod"
                value={form.preferredContactMethod}
                onChange={handleChange}
              >
                {CONTACT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Property Details */}
        <div className="form-section-card">
          <div className="section-card-header">
            <span className="section-badge">3</span>
            <div>
              <h3>Property Details</h3>
              <p>Physical scope and architectural specifications</p>
            </div>
          </div>
          <div className="section-grid">
            <div className="form-field">
              <label htmlFor="approximateProjectSize">Approximate Project Size</label>
              <input
                id="approximateProjectSize"
                name="approximateProjectSize"
                type="text"
                value={form.approximateProjectSize}
                onChange={handleChange}
                placeholder="e.g. 2500 sq.ft or 30 perches"
                maxLength={60}
              />
            </div>

            <div className="form-field">
              <label htmlFor="numberOfFloors">Number of Floors</label>
              <input
                id="numberOfFloors"
                name="numberOfFloors"
                type="text"
                value={form.numberOfFloors}
                onChange={handleChange}
                placeholder="e.g. 2 or Ground + 1"
                maxLength={30}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Project Details & Requirements */}
        <div className="form-section-card">
          <div className="section-card-header">
            <span className="section-badge">4</span>
            <div>
              <h3>Project Details &amp; Requirements</h3>
              <p>Comprehensive description and special engineering constraints</p>
            </div>
          </div>
          <div className="section-grid">
            <div className="form-field full-width">
              <label htmlFor="projectDescription">Project Details <span className="req">*</span></label>
              <textarea
                id="projectDescription"
                name="projectDetails"
                rows={5}
                value={form.projectDetails}
                onChange={handleChange}
                placeholder="Describe the project, your requirements, and any important details."
                maxLength={5000}
                required
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="specialRequirements">Special Requirements</label>
              <textarea
                id="specialRequirements"
                name="specialRequirements"
                rows={4}
                value={form.specialRequirements}
                onChange={handleChange}
                placeholder="E.g. Solar panel integration, rainwater harvesting, soil conditions, municipal permit assistance."
                maxLength={5000}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-actions-bar">
          <button
            type="submit"
            className="client-primary-button submit-btn-large"
            disabled={submitting}
          >
            {submitting
              ? (isEdit ? 'Updating Request…' : 'Submitting Project Request…')
              : (isEdit ? 'Resubmit Project Request' : 'Submit Project Request')}
            {!submitting && <span aria-hidden="true"> →</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
