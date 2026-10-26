import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyForLoan, clearAccountStatus } from '../redux/accountSlice';
import { X, HandCoins, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function LoanModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { actionLoading, error, actionSuccess } = useSelector((state) => state.account);

  const [amount, setAmount] = useState('50000');
  const [durationMonths, setDurationMonths] = useState('3');
  const [purpose, setPurpose] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(clearAccountStatus());
    setAmount('50000');
    setPurpose('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(applyForLoan({
      amount: Number(amount),
      durationMonths: Number(durationMonths),
      purpose: purpose.trim()
    }));
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <HandCoins size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Apply for Loan</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Low-interest instant credit evaluation</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {actionSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Application Submitted!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
              {actionSuccess} Once approved by an administrator, funds will be immediately deposited into your balance.
            </p>
            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '0.8125rem',
              color: '#fef3c7',
              marginBottom: 16,
              display: 'flex',
              gap: 10
            }}>
              <Clock size={18} style={{ flexShrink: 0, marginTop: 2, color: '#fbbf24' }} />
              <div>
                <strong>Admin Review Required:</strong> Applications are reviewed directly by the platform administrator in the Admin Console.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Loan Amount (₦)</label>
              <input
                type="number"
                required
                min="10000"
                max="5000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[25000, 50000, 100000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    ₦{preset >= 100000 ? `${preset / 1000}k` : preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Repayment Tenure</label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                className="form-select"
              >
                <option value="1">1 Month (3% APR)</option>
                <option value="3">3 Months (4.5% APR)</option>
                <option value="6">6 Months (6% APR)</option>
                <option value="12">12 Months (8.5% APR)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Purpose of Loan</label>
              <textarea
                required
                rows={3}
                placeholder="Briefly describe what this loan will be used for..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !amount || Number(amount) <= 0 || !purpose.trim()}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {actionLoading ? 'Submitting...' : `Submit Application`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}