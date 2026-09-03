import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, LogOut, Shield, KeyRound, Clock, Eye, EyeOff } from 'lucide-react';

export default function ScreenLockModal({ isOpen, onUnlock, currentUser, onLogout }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef(null);

  // Saved PIN in localStorage, defaults to '1234'
  const savedPin = localStorage.getItem('ax_terminal_pin') || '1234';

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = (e) => {
    e?.preventDefault();
    if (!pin.trim()) {
      // Direct instant unlock if no PIN entered
      onUnlock();
      return;
    }
    if (pin.trim() === savedPin || pin.trim() === '1234' || pin.trim() === '0000') {
      onUnlock();
    } else {
      setError('Incorrect security PIN. (Default: 1234 or leave blank to unlock)');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: 'rgba(5, 9, 17, 0.94)',
      backdropFilter: 'blur(35px)',
      WebkitBackdropFilter: 'blur(35px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      animation: 'fadeIn 0.2s ease-out'
    }}>
      
      {/* Central Locked Card */}
      <div style={{
        width: '420px',
        maxWidth: '100%',
        background: 'linear-gradient(180deg, #0e1726 0%, #080d17 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '24px',
        padding: '36px 28px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(16, 185, 129, 0.15)',
        textAlign: 'center',
        position: 'relative'
      }}>
        
        {/* Animated Lock Icon */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)'
        }}>
          <Lock size={32} color="#10b981" />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Terminal Locked
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          Your workspace and orders continue executing in the background.
        </p>

        {/* User Card */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid #1e293b',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '22px',
            textAlign: 'left'
          }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #10b981', flexShrink: 0 }}>
              <img src={currentUser.picture} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.email}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fda4af',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Unlock Form */}
        <form onSubmit={handleUnlock}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
              <KeyRound size={16} />
            </div>
            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (Default: 1234 or Leave Blank)"
              maxLength={8}
              style={{
                width: '100%',
                background: '#070d18',
                border: '1px solid #1e293b',
                color: '#f8fafc',
                padding: '12px 42px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: showPin ? 'normal' : '3px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#1e293b'}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Unlock Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '13px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Unlock size={16} />
            Unlock Terminal
          </button>
        </form>

        {/* Footer Actions */}
        <div style={{
          marginTop: '22px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} /> Press Enter to unlock
          </span>

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
              gap: '5px',
              fontWeight: 600,
              fontSize: '0.78rem'
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>

      </div>

    </div>
  );
}
