import React, { useState } from 'react';
import { Wallet, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function InitialFundsModal({ isOpen, onClose, onSetCapital }) {
  const [amount, setAmount] = useState('100000');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { label: '₹25,000', value: 25000, desc: 'Small Account' },
    { label: '₹50,000', value: 50000, desc: 'Starter' },
    { label: '₹1,00,000', value: 100000, desc: 'Standard' },
    { label: '₹5,00,000', value: 500000, desc: 'Pro' },
    { label: '₹10,00,000', value: 1000000, desc: '10 Lakhs' }
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(amount) || 0;
    setLoading(true);
    try {
      await onSetCapital(val);
      localStorage.setItem('ax-onboarded', '1');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to initialize capital');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWithZero = async () => {
    setLoading(true);
    try {
      await onSetCapital(0);
      localStorage.setItem('ax-onboarded', '1');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to initialize capital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div 
        className="glass-panel-elevated"
        style={{
          width: '520px',
          maxWidth: '92vw',
          background: '#0e1524',
          border: '1px solid #223249',
          borderRadius: '14px',
          padding: '28px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header with AX Logo */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            margin: '0 auto 12px auto',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            border: '1px solid rgba(16, 185, 129, 0.5)'
          }}>
            <img src="/logo.png" alt="Apex Trading" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Welcome to Apex Trading!
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Everything starts fresh. Set your starting paper trading capital to begin testing strategies with real live market data.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Choose Starting Amount:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))', gap: '8px' }}>
            {presets.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAmount(p.value.toString())}
                style={{
                  background: amount === p.value.toString() ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${amount === p.value.toString() ? '#10b981' : '#1e293b'}`,
                  color: amount === p.value.toString() ? '#10b981' : '#cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{p.label}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Or Enter Custom Amount (₹ INR):
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}>₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="font-mono"
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #223249',
                  color: '#10b981',
                  padding: '12px 14px 12px 34px',
                  borderRadius: '8px',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
            }}
          >
            <span>{loading ? 'Initializing...' : `Start Trading with ${formatINR(parseFloat(amount) || 0)}`}</span>
            <ArrowRight size={16} />
          </button>

          {/* Zero Start Option */}
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button
              type="button"
              onClick={handleStartWithZero}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Start with ₹0 balance (I will add funds later)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
