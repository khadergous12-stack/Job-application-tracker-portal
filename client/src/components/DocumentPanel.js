import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DOC_KINDS = ['Resume', 'Cover Letter', 'Portfolio', 'Other'];

const DocumentPanel = ({ jobId }) => {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [kind, setKind]       = useState('Resume');
  const fileRef               = useRef();

  const load = async () => {
    try {
      const { data } = await axios.get(`/api/jobs/${jobId}/documents`);
      setDocs(data.documents);
    } catch { toast.error('Failed to load documents'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { if (jobId) load(); }, [jobId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    setUploading(true);
    try {
      await axios.post(`/api/jobs/${jobId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded!');
      load();
      fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (docId) => {
    try {
      await axios.delete(`/api/jobs/${jobId}/documents/${docId}`);
      setDocs(prev => prev.filter(d => d._id !== docId));
      toast.success('Document deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleDownload = (docId, filename) => {
    window.open(`/api/jobs/${jobId}/documents/${docId}/download`, '_blank');
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const getIcon = (kind) => {
    const icons = { Resume: '📄', 'Cover Letter': '✉️', Portfolio: '🗂️', Other: '📎' };
    return icons[kind] || '📎';
  };

  return (
    <div>
      {/* Upload row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" value={kind} onChange={e => setKind(e.target.value)} style={{ width: 140 }}>
          {DOC_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
          {uploading ? 'Uploading...' : '📎 Choose File'}
          <input
            type="file" ref={fileRef} hidden
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF, DOC, DOCX, TXT — max 5 MB</span>
      </div>

      {/* Document list */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading documents...</p>
      ) : docs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No documents uploaded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {docs.map(doc => (
            <div key={doc._id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', background: 'var(--bg-secondary)',
              borderRadius: 8, border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 20 }}>{getIcon(doc.kind)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.originalName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {doc.kind} · {formatSize(doc.size)} · {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleDownload(doc._id, doc.originalName)}
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                ↓ Download
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(doc._id)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentPanel;
