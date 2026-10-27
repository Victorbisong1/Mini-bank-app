import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onSuccess, amount, recipientName }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const DEMO_PIN = "1234"; // Default testing PIN

  if (!isOpen) return null;

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin === DEMO_PIN) {
      setError('');
      setPin(['', '', '', '']);
      onSuccess();
    } else {
      setError('Incorrect 4-digit PIN. (Use 1234 for testing)');
      setPin(['', '', '', '']);
      const firstInput = document.getElementById('pin-digit-0');
      if (firstInput) firstInput.focus();
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="modal-container" style={{ maxWidth: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={onClose} className="btn-outline" style={{ padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12
        }}>
          <Lock size={22} />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>Enter Security PIN</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Confirm payment of <strong style={{ color: '#fff' }}>₦{Number(amount || 0).toLocaleString()}</strong>
          {recipientName ? ` to ${recipientName}` : ''}
        </p>

        {error && (
          <div className="toast-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            {pin.map((digit, idx) => (
              <input
                key={idx}
                id={`pin-digit-${idx}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                style={{
                  width: 48,
                  height: 52,
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={pin.some(d => !d)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px 0' }}
          >
            Confirm & Complete
          </button>
        </form>
      </div>
    </div>
  );
}