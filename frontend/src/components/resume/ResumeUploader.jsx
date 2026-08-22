import { useState, useRef } from "react";
import { UploadCloud, FileText, Check, AlertCircle, Trash2, Download, RefreshCw } from "lucide-react";
import { uploadResume, deleteResume, downloadResume } from "../../services/resume.api";

const ResumeUploader = ({ currentResume, onUploaded, onDeleted }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = async (file) => {
    if (!file) return;

    setErrorNotice(null);
    setNotice(null);

    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "text/plain"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!validTypes.includes(file.type) && ![".pdf", ".docx", ".doc", ".txt"].includes(ext)) {
      setErrorNotice("Unsupported file type. Please upload a PDF or DOCX resume document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorNotice("File size exceeds maximum 10MB limit.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await uploadResume(formData);
      setNotice(`Resume "${file.name}" uploaded and analyzed successfully.`);
      if (onUploaded) onUploaded(res.resume);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to upload resume file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your uploaded resume?")) return;
    setDeleting(true);
    setErrorNotice(null);
    setNotice(null);

    try {
      await deleteResume();
      setNotice("Resume deleted successfully.");
      if (onDeleted) onDeleted();
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to delete resume.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadResume();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", currentResume.originalName || "resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorNotice("Unable to download resume file.");
    }
  };

  return (
    <div className="resume-uploader-card">
      {notice && (
        <div className="card-apply-notice success" style={{ margin: "0 0 16px 0" }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="card-apply-notice danger" style={{ margin: "0 0 16px 0" }}>
          <AlertCircle size={16} />
          <span>{errorNotice}</span>
        </div>
      )}

      {currentResume ? (
        <div className="uploaded-resume-status flex-between">
          <div className="resume-file-info flex-between" style={{ gap: "12px" }}>
            <div className="file-icon-box">
              <FileText size={24} className="text-primary" />
            </div>

            <div className="file-details">
              <strong>{currentResume.originalName}</strong>
              <p className="notif-subtext">
                {(currentResume.size / (1024 * 1024)).toFixed(2)} MB • Uploaded{" "}
                {new Date(currentResume.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="file-actions-row flex-between" style={{ gap: "8px" }}>
            <button
              type="button"
              className="secondary-action-btn"
              onClick={handleDownload}
              title="Download File"
            >
              <Download size={14} />
              <span>Download</span>
            </button>

            <button
              type="button"
              className="secondary-action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Replace File"
            >
              <RefreshCw size={14} />
              <span>Replace</span>
            </button>

            <button
              type="button"
              className="secondary-action-btn danger"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete Resume"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone-box ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={40} className="upload-icon text-primary" />
          <h4>Drag & Drop your Resume here</h4>
          <p className="notif-subtext">Supports PDF or DOCX documents (Maximum 10 MB)</p>

          <button type="button" className="primary-action-btn" disabled={uploading}>
            {uploading ? "Parsing & Scoring Resume..." : "Browse File"}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ResumeUploader;
