import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function KycUpgradeModal({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);

  const [targetTier, setTargetTier] = useState(user?.kycTier === 1 ? 2 : 3);
  const [bvn, setBvn] = useState('');
  const [utilityBill, setUtilityBill] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/user/kyc-request', {
        targetTier,
        bvn,
        utilityBill
      });
      setMessage(res.data.message || 'KYC upgrade request submitted successfully. Awaiting admin review.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
      <div className="modal-container" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Upgrade Account Tier</h3>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 4, borderRadius: 6 }}>
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
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
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

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Utility Bill / Proof of Address</label>
              <input
                type="text"
                required
                placeholder="e.g. IKEDC Electricity Bill - Jan 2026"
                value={utilityBill}
                onChange={(e) => setUtilityBill(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 0' }}
            >
              {loading ? 'Submitting...' : 'Submit for Admin Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}