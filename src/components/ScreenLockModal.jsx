import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, Delete, Shield, Fingerprint, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ScreenLockModal({ isOpen, onUnlock, currentUser, onLogout, indices = null }) {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('locked'); // 'locked' | 'verifying' | 'unlocked' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  // Saved user PIN, default is '1234'
  const savedPin = localStorage.getItem('ax_terminal_pin') || '1234';
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Trader';

  // Clear states whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setStatus('locked');
      setErrorMessage('');
      setShake(false);
    }
  }, [isOpen]);

  const triggerUnlockSequence = useCallback(() => {
    setStatus('verifying');
    setTimeout(() => {
      setStatus('unlocked');
      setTimeout(() => {
        onUnlock();
      }, 400);
    }, 500);
  }, [onUnlock]);

  const verifyPin = useCallback((enteredPin) => {
    // Valid if matches saved PIN, default '1234', or universal master '0000'
    if (enteredPin === savedPin || enteredPin === '1234' || enteredPin === '0000') {
      triggerUnlockSequence();
    } else {
      setShake(true);
      setStatus('error');
      setErrorMessage('Incorrect PIN. Try 1234 or reset below.');
      setTimeout(() => {
        setShake(false);
        setPin('');
        setStatus('locked');
      }, 800);
    }
  }, [savedPin, triggerUnlockSequence]);

  const handleKeyPress = useCallback((digit) => {
    if (status === 'verifying' || status === 'unlocked') return;

    setActiveKey(digit);
    setTimeout(() => setActiveKey(null), 150);

    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        setTimeout(() => verifyPin(next), 100);
      }
      return next;
    });
  }, [status, verifyPin]);

  const handleDelete = useCallback(() => {
    if (status === 'verifying' || status === 'unlocked') return;
    setActiveKey('del');
    setTimeout(() => setActiveKey(null), 150);
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  }, [status]);

  // Physical keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pin.length === 4) {
          verifyPin(pin);
        } else if (pin.length === 0) {
          // Instant quick unlock with Enter if no PIN typed
          triggerUnlockSequence();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyPress, handleDelete, pin, verifyPin, triggerUnlockSequence]);

  if (!isOpen) return null;

  // Transition screen: "Securing / Unlocking Session..."
  if (status === 'verifying' || status === 'unlocked') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: '#070b14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '22px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)',
          marginBottom: '24px',
          animation: 'pulse 1.2s infinite ease-in-out'
        }}>
          {status === 'unlocked' ? (
            <CheckCircle2 size={38} color="#10b981" />
          ) : (
            <Unlock size={36} color="#10b981" />
          )}
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          {status === 'unlocked' ? 'Session Unlocked' : 'Restoring Terminal...'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Synchronizing active charts, feeds & order history
        </p>
      </div>
    );
  }

  const nifty = indices?.find(i => i.symbol === '^NSEI');
  const sensex = indices?.find(i => i.symbol === '^BSESN');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: 'rgba(5, 9, 17, 0.96)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      animation: 'fadeIn 0.2s ease-out',
      userSelect: 'none'
    }}>
      
      {/* Background Ambience */}
      <div style={{
        position: 'absolute',
        top: '20%',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Main Lock Card */}
      <div style={{
        width: '380px',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Apex Glowing Brand Emblem */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1.5px solid rgba(16, 185, 129, 0.6)',
          boxShadow: '0 10px 35px rgba(16, 185, 129, 0.45)',
          background: '#070d18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <img src="/logo.png" alt="Apex Trading" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Welcome Header */}
        <h2 style={{
          fontSize: '1.65rem',
          fontWeight: 800,
          color: '#f8fafc',
          margin: '0 0 6px 0',
          letterSpacing: '-0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Welcome Back, {firstName}</span>
          <span style={{ fontSize: '1.4rem' }}>👋</span>
        </h2>

        <p style={{
          fontSize: '0.86rem',
          color: '#94a3b8',
          margin: '0 0 32px 0',
          fontWeight: 500
        }}>
          Enter your 4-digit PIN to unlock Apex Trading
        </p>

        {/* 4 PIN Dots Matrix */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          marginBottom: '32px',
          animation: shake ? 'shake 0.4s ease-in-out' : 'none'
        }}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            const isError = status === 'error';
            return (
              <div
                key={index}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isFilled ? 'scale(1.25)' : 'scale(1)',
                  background: isError 
                    ? '#f43f5e' 
                    : isFilled 
                      ? '#10b981' 
                      : 'transparent',
                  border: isError
                    ? '2px solid #f43f5e'
                    : isFilled
                      ? '2px solid #10b981'
                      : '2px solid rgba(148, 163, 184, 0.35)',
                  boxShadow: isFilled
                    ? '0 0 14px rgba(16, 185, 129, 0.7)'
                    : isError
                      ? '0 0 14px rgba(244, 63, 94, 0.7)'
                      : 'none'
                }}
              />
            );
          })}
        </div>

        {/* Error Feedback Message */}
        {errorMessage && (
          <div style={{
            color: '#f43f5e',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Futuristic 3x4 Touch Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          width: '280px',
          marginBottom: '26px'
        }}>
          {[
            '1', '2', '3',
            '4', '5', '6',
            '7', '8', '9',
            'quick', '0', 'del'
          ].map((keyItem) => {
            const isPressed = activeKey === keyItem;

            if (keyItem === 'quick') {
              return (
                <button
                  key="quick"
                  type="button"
                  onClick={triggerUnlockSequence}
                  title="Quick Unlock (Biometric / Bypass)"
                  style={{
                    height: '62px',
                    borderRadius: '16px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    transform: isPressed ? 'scale(0.93)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.16)';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                  }}
                >
                  <Fingerprint size={22} />
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, marginTop: '2px', letterSpacing: '0.4px' }}>BYPASS</span>
                </button>
              );
            }

            if (keyItem === 'del') {
              return (
                <button
                  key="del"
                  type="button"
                  onClick={handleDelete}
                  title="Delete"
                  style={{
                    height: '62px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    transform: isPressed ? 'scale(0.93)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#f8fafc';
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <Delete size={20} />
                </button>
              );
            }

            return (
              <button
                key={keyItem}
                type="button"
                onClick={() => handleKeyPress(keyItem)}
                style={{
                  height: '62px',
                  borderRadius: '16px',
                  background: isPressed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isPressed ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.12s cubic-bezier(0.2, 0.8, 0.4, 1)',
                  transform: isPressed ? 'scale(0.94)' : 'scale(1)',
                  boxShadow: isPressed ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                {keyItem}
              </button>
            );
          })}
        </div>

        {/* Live Market Bar Peek */}
        {nifty && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            marginBottom: '20px'
          }}>
            <span style={{ color: '#94a3b8' }}>NIFTY: <b style={{ color: '#f8fafc' }}>₹{nifty.price?.toLocaleString('en-IN')}</b></span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#475569' }} />
            <span style={{ color: '#10b981', fontWeight: 600 }}>Trading Terminal Active</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '280px',
          fontSize: '0.74rem'
        }}>
          <button
            type="button"
            onClick={triggerUnlockSequence}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 500,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Quick Unlock (Enter)
          </button>

          <button
            type="button"
            onClick={() => {
              if (onLogout) {
                onUnlock();
                onLogout();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#f43f5e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              fontWeight: 600,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fda4af'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#f43f5e'}
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
      `}</style>

    </div>
  );
}
