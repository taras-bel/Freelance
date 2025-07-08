import React, { useState, useEffect } from 'react';
import { kycApi, KYCRequest } from '../../api/kyc';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'selfie', label: 'Selfie' },
  { value: 'inn', label: 'Tax ID/INN' },
];

export const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState('passport');
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) fetchStatus();
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const data = await kycApi.getStatus();
      setStatus(data);
    } catch {
      setStatus([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) {
      setError('Please select a file');
      return;
    }
    setLoading(true);
    try {
      await kycApi.upload(selectedType, file, comment);
      setSuccess('Document uploaded successfully!');
      setFile(null);
      setComment('');
      fetchStatus();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white">✕</button>
        <h2 className="text-2xl font-bold mb-2">KYC Verification</h2>
        <p className="text-muted-foreground mb-4">Upload your documents for identity verification. Only PDF, JPG, PNG. Max 20MB.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full border rounded px-3 py-2">
              {DOCUMENT_TYPES.map(dt => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comment (optional)</label>
            <input type="text" value={comment} onChange={e => setComment(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Uploading...' : 'Upload Document'}</button>
        </form>
        <hr className="my-6" />
        <h3 className="text-lg font-semibold mb-2">Your KYC Requests</h3>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {status.length === 0 && <div className="text-muted-foreground text-sm">No KYC requests yet.</div>}
          {status.map(req => (
            <div key={req.id} className="p-3 border rounded flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{req.document_type}</span>
                <span className={`text-xs px-2 py-1 rounded ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>
              </div>
              <a href={req.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View Document</a>
              {req.comment && <div className="text-xs text-gray-500">Comment: {req.comment}</div>}
              <div className="text-xs text-gray-400">Submitted: {new Date(req.submitted_at).toLocaleString()}</div>
              {req.reviewed_at && <div className="text-xs text-gray-400">Reviewed: {new Date(req.reviewed_at).toLocaleString()}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 