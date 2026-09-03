import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Plus, 
  RotateCcw, 
  Lock, 
  KeyRound, 
  LogOut, 
  CheckCircle2, 
  Database, 
  RefreshCw, 
  Sliders, 
  Info, 
  Lightbulb,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function ProfileTab({
  currentUser,
  portfolio,
  onUpdateFunds,
  onResetPortfolio,
  onLogout,
  onLockScreen,
  beginnerMode,
  setBeginnerMode,
  onOpenTips
}) {
  // Funds state
  const [customAmount, setCustomAmount] = useState('');
  const [fundsLoading, setFundsLoading] = useState(false);
  const [fundsSuccess, setFundsSuccess] = useState(null);

  // Security PIN state
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Cache state
  const [cacheCleared, setCacheCleared] = useState(false);

  const cashBalance = portfolio?.cashBalance || 0;
  const totalInvested = portfolio?.totalInvested || 0;
  const totalValue = portfolio?.totalPortfolioValue || 0;
  const currentPin = localStorage.getItem('ax_terminal_pin') || '1234';

  const quickAdds = [
    { label: '+ ₹50,000', amount: 50000 },
    { label: '+ ₹1 Lakh', amount: 100000 },
    { label: '+ ₹5 Lakhs', amount: 500000 },
    { label: '+ ₹10 Lakhs', amount: 1000000 },
    { label: '+ ₹25 Lakhs', amount: 2500000 },
  ];

  const handleAddQuick = async (amountToAdd) => {
    setFundsLoading(true);
    try {
      const newTotal = cashBalance + amountToAdd;
      await onUpdateFunds(newTotal);
      confetti({ particleCount: 30, spread: 50 });
      setFundsSuccess(`Added ${formatINR(amountToAdd)} virtual trading capital!`);
      setTimeout(() => setFundsSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setFundsLoading(false);
    }
  };

  const handleSetExact = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount.replace(/,/g, ''));
    if (!parsed || parsed <= 0) return;
    setFundsLoading(true);
    try {
      await onUpdateFunds(parsed);
      confetti({ particleCount: 40, spread: 60 });
      setFundsSuccess(`Trading cash balance set to ${formatINR(parsed)}!`);
      setCustomAmount('');
      setTimeout(() => setFundsSuccess(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setFundsLoading(false);
    }
  };

  const handleClearCache = () => {
    const auth = localStorage.getItem('ax_current_user');
    const token = localStorage.getItem('ax_auth_token');
    const pin = localStorage.getItem('ax_terminal_pin');

    localStorage.clear();
    sessionStorage.clear();

    if (auth) localStorage.setItem('ax_current_user', auth);
    if (token) localStorage.setItem('ax_auth_token', token);
    if (pin) localStorage.setItem('ax_terminal_pin', pin);

    setCacheCleared(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 numeric digits (0-9).');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }
    localStorage.setItem('ax_terminal_pin', newPin);
    setPinSuccess('Security PIN updated successfully!');
    setPinError('');
    setTimeout(() => {
      setShowPinModal(false);
      setNewPin('');
      setConfirmPin('');
      setPinSuccess('');
    }, 1200);
  };

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '24px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* 1. Profile Header Card */}
      <div style={{
        background: 'linear-gradient(180deg, #0d1524 0%, #070c16 100%)',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2.5px solid #10b981',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
            flexShrink: 0
          }}>
            <img src={currentUser?.picture} alt={currentUser?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                {currentUser?.name || 'Apex Trader'}
              </h1>
              <span style={{
                fontSize: '0.68rem',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700
              }}>
                Verified Trader
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              {currentUser?.email || 'trader@apex.internal'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            color: '#fda4af',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: '9px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.18)';
            e.currentTarget.style.borderColor = '#f43f5e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Virtual Funds & Margin Hub (Moved into Profile) */}
      <div style={{
        background: '#0d131f',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Virtual Funds & Margin (₹ INR)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              const entered = window.prompt('Reset entire paper portfolio? Enter starting capital in ₹ (e.g. 100000 or 0):', '100000');
              if (entered !== null) {
                const cap = Math.max(0, parseFloat(entered) || 0);
                onResetPortfolio(cap);
              }
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset Account / Set Capital</span>
          </button>
        </div>

        {fundsSuccess && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#86efac', padding: '10px 14px', borderRadius: '8px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {fundsSuccess}
          </div>
        )}

        {/* 3 Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Available Cash Margin
            </div>
            <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981' }}>
              {formatINR(cashBalance)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Free margin ready for CNC / MIS trades
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Used Margin (Holdings & Trades)
            </div>
            <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#cbd5e1' }}>
              {formatINR(totalInvested)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Capital allocated to active stocks
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Total Account Net Worth
            </div>
            <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatINR(totalValue)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Cash + Current Holdings Value
            </div>
          </div>
        </div>

        {/* Deposit Virtual Cash */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} color="#10b981" /> Instant Virtual Cash Deposit
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Add paper funds to test aggressive strategies and high-margin sizing. Zero real money involved.
            </p>
          </div>

          {/* Quick Add Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {quickAdds.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAddQuick(item.amount)}
                disabled={fundsLoading}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid #1e293b',
                  color: '#e2e8f0',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.color = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e293b';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Amount Form */}
          <form onSubmit={handleSetExact} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="number"
              placeholder="Or enter custom cash amount in ₹"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              style={{
                flex: 1,
                minWidth: '220px',
                background: '#070a11',
                border: '1px solid #1e293b',
                color: '#f8fafc',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={fundsLoading || !customAmount}
              style={{
                background: '#10b981',
                border: 'none',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Set Exact Balance
            </button>
          </form>
        </div>
      </div>

      {/* 3. Security & Screen Lock */}
      <div style={{
        background: '#0d131f',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Screen Lock & Privacy Protection
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Quickly lock your terminal screen when stepping away to protect positions and balance.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onLockScreen}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Lock size={13} />
              <span>Lock Screen (Ctrl+L)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <KeyRound size={13} />
              <span>Change PIN</span>
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.82rem'
        }}>
          <span style={{ color: '#94a3b8' }}>
            Status: <b style={{ color: '#10b981' }}>Active with 4-digit PIN ({currentPin.replace(/./g, '•')})</b>
          </span>
          <span style={{ color: '#64748b' }}>
            Quick Shortcut: <kbd style={{ background: '#1e293b', color: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>Ctrl+L</kbd>
          </span>
        </div>
      </div>

      {/* 4. Preferences & Trading Guide */}
      <div style={{
        background: '#0d131f',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={18} color="#a855f7" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Trading Guides & Preferences
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Beginner Assistance Mode</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Shows helpful order type explainers, stop-loss guidance, and 1% risk badges.</div>
          </div>
          <input
            type="checkbox"
            checked={beginnerMode}
            onChange={(e) => setBeginnerMode(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Interactive Trading Tips & Rulebook</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Open institutional risk management and trading rulebook.</div>
          </div>
          <button
            type="button"
            onClick={onOpenTips}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid #334155',
              color: '#f8fafc',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Open Guide
          </button>
        </div>
      </div>

      {/* 5. Storage & Clear Cache */}
      <div style={{
        background: '#0d131f',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={20} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Cache & Local State
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Purges local quotes cache and resets offline buffers while keeping your authentication intact.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearCache}
          disabled={cacheCleared}
          style={{
            background: cacheCleared ? '#10b981' : 'rgba(245, 158, 11, 0.12)',
            color: cacheCleared ? '#ffffff' : '#f59e0b',
            border: cacheCleared ? 'none' : '1px solid rgba(245, 158, 11, 0.4)',
            padding: '9px 16px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} />
          <span>{cacheCleared ? 'Cache Cleared! Reloading...' : 'Clear Cache & Reload'}</span>
        </button>
      </div>

      {/* 6. About Apex Trading & Institutional Brokerage Architecture */}
      <div style={{
        background: '#0d131f',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header with Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1.5px solid rgba(16, 185, 129, 0.5)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
              background: '#050912',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src="/logo.png" alt="Apex Trading" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                  Apex Trading Platform
                </h2>
                <span style={{
                  fontSize: '0.68rem',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  v2.4.0 Production
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                Next-generation simulated market terminal & algorithm training environment.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.72rem',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Live Gateway Active
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
          Apex Trading provides retail and institutional traders with high-fidelity paper trading across Indian and global equity markets. Experience real exchange liquidity, live multi-timeframe candlestick charting, and precision risk management with 100% simulated capital.
        </p>

        {/* Official Brokerage & Fee Rate Card (Groww Model) */}
        <div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Equity & Derivatives Brokerage Schedule
          </h3>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1.2fr 1.2fr 1fr',
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid #1e293b',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              <div>Segment</div>
              <div>Brokerage Fee</div>
              <div>Statutory & STT</div>
              <div>Exchange & GST</div>
            </div>

            {[
              {
                segment: 'Equity Delivery (CNC)',
                badge: 'Zero Risk Paper',
                brokerage: '₹20 or 0.05% max',
                subBrokerage: 'Whichever is lower',
                stt: '0.1% on Buy & Sell',
                taxes: '0.00297% NSE + 18% GST'
              },
              {
                segment: 'Equity Intraday (MIS)',
                badge: 'Margin Leverage',
                brokerage: '₹20 or 0.05% max',
                subBrokerage: 'Whichever is lower',
                stt: '0.025% on Sell Side',
                taxes: '0.00297% NSE + 18% GST'
              },
              {
                segment: 'Depository (DP) Charges',
                badge: 'Sell Side Only',
                brokerage: '₹13.50 + 18% GST',
                subBrokerage: 'Flat ₹15.93 per company',
                stt: 'Not Applicable',
                taxes: 'Standard CDSL/NSDL'
              }
            ].map((row, idx) => (
              <div
                key={row.segment}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1.2fr 1.2fr 1fr',
                  padding: '12px 16px',
                  borderBottom: idx < 2 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                  fontSize: '0.8rem',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{row.segment}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{row.badge}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>{row.brokerage}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{row.subBrokerage}</div>
                </div>
                <div>
                  <div style={{ color: '#cbd5e1' }}>{row.stt}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>{row.taxes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Feature Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>⚡ Sub-Second Liquidity</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Real-time quotes with bid/ask book replication.</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>🛡️ 1% Capital Risk Rule</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Integrated risk-reward & sizing calculations.</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>🔒 4-Digit Screen Lock</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Instant terminal security with biometric shortcuts.</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '3px' }}>📊 Interactive Charting</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>High-resolution candlestick & volume indicators.</div>
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '12px',
          padding: '14px 16px',
          fontSize: '0.75rem',
          color: '#94a3b8',
          lineHeight: 1.5
        }}>
          <strong style={{ color: '#cbd5e1' }}>Regulatory & Simulation Notice: </strong>
          Apex Trading is an institutional-grade educational simulation and algorithmic testing terminal. All balances, orders, ledger debits, and profit/loss figures are purely virtual for risk-free strategy evaluation. Live market quotes are streamed via public market gateways for real-world execution practice without capital risk.
        </div>
      </div>

      {/* Change PIN Modal */}
      {showPinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(4, 7, 13, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            width: '360px',
            background: '#0d131f',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '28px 24px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
              Change Security PIN
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Set a new 4-digit numeric PIN for your screen lock.
            </p>

            {pinError && (
              <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '8px', borderRadius: '8px', fontSize: '0.76rem', marginBottom: '14px' }}>
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '8px', borderRadius: '8px', fontSize: '0.76rem', marginBottom: '14px' }}>
                {pinSuccess}
              </div>
            )}

            <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter New 4-Digit PIN"
                style={{
                  background: '#070a11',
                  border: '1px solid #1e293b',
                  color: '#f8fafc',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontSize: '1rem',
                  letterSpacing: '4px',
                  outline: 'none'
                }}
              />

              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm 4-Digit PIN"
                style={{
                  background: '#070a11',
                  border: '1px solid #1e293b',
                  color: '#f8fafc',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontSize: '1rem',
                  letterSpacing: '4px',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #334155',
                    color: '#cbd5e1',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
