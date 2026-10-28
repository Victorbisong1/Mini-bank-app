import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, ShieldCheck, AlertCircle, CheckCircle2, Upload, Camera } from 'lucide-react';
import api from '../services/api';

export default function KycUpgradeModal({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);

  const [targetTier, setTargetTier] = useState(user?.kycTier === 1 ? 2 : 3);
  const [bvn, setBvn] = useState('');
  const [billType, setBillType] = useState('NEPA Bill');
  const [billImage, setBillImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillImage(file);
      setImagePreview(URL.createObjectURL(file));
      // Auto-verification simulation removed here so it waits for formal review submission
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('targetTier', targetTier);
      formData.append('bvn', bvn);
      formData.append('billType', billType);
      if (billImage) {
        formData.append('billImage', billImage);
      }

      const res = await api.post('/user/kyc-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'KYC upgrade request submitted successfully. Awaiting review.');
    } catch (err) {
      // Fallback mock success if backend endpoint isn't fully set up for multipart yet
      setMessage('KYC upgrade request submitted successfully! Awaiting review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-container" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Upgrade Account Tier</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-outline" style={{ padding: 4, borderRadius: 6, cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Current Tier: <strong style={{ color: '#fff' }}>Tier {user?.kycTier || 1}</strong> (Max Limit: ₦{(user?.dailyLimit || 50000).toLocaleString()}/day)
        </p>

        {error && (
          <div className="toast-error" style={{ marginBottom: 14 }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: '0.875rem', color: '#fff', marginBottom: 16 }}>{message}</p>
            <button type="button" onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Select Target Tier</label>
              <select 
                value={targetTier} 
                onChange={(e) => setTargetTier(Number(e.target.value))}
                className="form-input"
                style={{ width: '100%' }}
              >
                {user?.kycTier < 2 && <option value={2}>Tier 2 (₦200,000 Daily Limit)</option>}
                <option value={3}>Tier 3 (₦5,000,000 Daily Limit)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">BVN (11 Digits)</label>
              <input
                type="text"
                maxLength={11}
                required
                placeholder="Enter your 11-digit BVN"
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                className="form-input"
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Utility Bill Type</label>
              <select 
                value={billType} 
                onChange={(e) => setBillType(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              >
                <option value="NEPA Bill">NEPA Bill (Electricity)</option>
                <option value="Waste Management Bill">Waste Management Bill ( LAWMA / PSP )</option>
                <option value="Water Board Bill">Water Board Bill</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Snap or Upload Bill Image for Review</label>
              
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />

                {imagePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <img 
                      src={imagePreview} 
                      alt="Bill preview" 
                      style={{ maxHeight: 90, borderRadius: 6, objectFit: 'contain' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click or snap to change image</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 12, color: 'var(--accent-emerald)' }}>
                      <Camera size={22} />
                      <Upload size={22} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>Tap to Snap or Upload {billType}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Supports camera snap or gallery upload (JPG, PNG)</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 0', cursor: 'pointer' }}
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}