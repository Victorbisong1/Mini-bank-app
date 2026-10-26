import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, PiggyBank } from 'lucide-react';
import { fetchDashboard } from '../redux/accountSlice';

export default function SavingsModal({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('DEPOSIT'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (mode === 'DEPOSIT' && numAmount > (user?.balance || 0)) {
      setError('Insufficient available balance.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      setSuccessMsg(`Successfully ${mode === 'DEPOSIT' ? 'deposited to' : 'withdrawn from'} CashVersal Vault!`);
      
      setTimeout(() => {
        dispatch(fetchDashboard());
        setSuccessMsg('');
        setAmount('');
        onClose();
      }, 1500);

    } catch (err) {
      setError('Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: 'var(--radius-xl)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <PiggyBank size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>CashVersal Vault</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Earn up to 15% annual interest</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Toggle Mode */}
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: 4, borderRadius: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setMode('DEPOSIT')}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              background: mode === 'DEPOSIT' ? 'var(--accent-emerald)' : 'transparent',
              color: mode === 'DEPOSIT' ? '#000' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Deposit to Vault
          </button>
          <button
            type="button"
            onClick={() => setMode('WITHDRAW')}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              background: mode === 'WITHDRAW' ? 'var(--bg-elevated)' : 'transparent',
              color: mode === 'WITHDRAW' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Withdraw to Wallet
          </button>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.8125rem', marginBottom: 12 }}>{error}</div>}
        {successMsg && <div style={{ color: '#34d399', fontSize: '0.8125rem', marginBottom: 12 }}>{successMsg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 6, display: 'block' }}>
              {mode === 'DEPOSIT' ? 'Amount to Save (₦)' : 'Amount to Withdraw (₦)'}
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
              style={{ width: '100%', fontSize: '1.1rem', padding: '10px 14px' }}
              min="1"
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6, textAlign: 'right' }}>
              Available: ₦{mode === 'DEPOSIT' ? (user?.balance || 0).toLocaleString() : '0.00'}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 700 }}
          >
            {loading ? 'Processing...' : mode === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
}