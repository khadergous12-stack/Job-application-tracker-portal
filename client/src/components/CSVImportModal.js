import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CSVImportModal = ({ onClose, onImported }) => {
  const [file, setFile]         = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult]     = useState(null);
  const fileRef                 = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setResult(null); }
  };

  const handleDownloadTemplate = () => {
    window.open('/api/import/template', '_blank');
  };

  const handleImport = async () => {
    if (!file) return toast.error('Please select a CSV file first');
    setImporting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post('/api/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
      if (data.imported > 0) {
        toast.success(`${data.imported} applications imported!`);
        onImported && onImported();
      } else {
        toast.error('No valid rows found in CSV');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally { setImporting(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">📥 Import from CSV</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">

          {/* Step 1 — Download template */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Step 1 — Download the template</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
              Download the sample CSV, fill it in Excel/Google Sheets, then upload it below.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate}>
              ⬇ Download Template CSV
            </button>
          </div>

          {/* CSV columns reference */}
          <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>CSV Column Names</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
              {[
                ['companyName*', 'required'],
                ['roleTitle*', 'required'],
                ['location', 'optional'],
                ['jobUrl', 'optional'],
                ['source', 'LinkedIn / Indeed / ...'],
                ['status', 'Applied / Interview / ...'],
                ['priority', 'High / Medium / Low'],
                ['appliedDate', 'YYYY-MM-DD'],
                ['interviewDate', 'YYYY-MM-DD'],
                ['salaryNote', 'optional'],
                ['notes', 'optional'],
              ].map(([col, hint]) => (
                <div key={col} style={{ fontSize: 11 }}>
                  <code style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>{col}</code>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>— {hint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 — Upload */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Step 2 — Upload your CSV</p>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10, padding: '24px 16px', cursor: 'pointer',
              background: file ? 'var(--accent-glow)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 32, marginBottom: 8 }}>{file ? '✅' : '📂'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: file ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {file ? file.name : 'Click to choose CSV file'}
              </span>
              {file && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</span>}
              <input type="file" hidden ref={fileRef} accept=".csv" onChange={handleFile} />
            </label>
          </div>

          {/* Result */}
          {result && (
            <div style={{
              padding: 14, borderRadius: 10, marginBottom: 16,
              background: result.imported > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${result.imported > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Import Result</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>✅ Imported: <strong>{result.imported}</strong></p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⚠️ Skipped: <strong>{result.skipped}</strong></p>
              {result.errors?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 4 }}>Errors:</p>
                  {result.errors.slice(0, 5).map((e, i) => (
                    <p key={i} style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleImport} disabled={!file || importing}>
              {importing ? 'Importing...' : '📥 Import Applications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
