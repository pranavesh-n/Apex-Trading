import React from 'react';
import {
  X,
  LayoutDashboard,
  BarChart3,
  ListOrdered,
  Briefcase,
  Layers,
  CreditCard,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Smartphone,
  Search,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getIndianMarketStatus, getUSMarketStatus } from '../utils/marketHours';

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenTips,
  onOpenSearch,
  onInstallPWA,
  indices,
  onSelectStock,
  portfolio,
  currentUser = null,
  onOpenAuth
}) {
  if (!isOpen) return null;

  const navItems = [
    { id: 'terminal', label: 'Terminal', desc: 'Live charts, real-time depth & trading', icon: BarChart3, color: '#10b981' },
    { id: 'dashboard', label: 'Dashboard', desc: 'Overview, market stats & allocations', icon: LayoutDashboard, color: '#38bdf8' },
    { id: 'orders', label: 'Orders', desc: 'Order book, executions & pending orders', icon: ListOrdered, color: '#a855f7' },
    { id: 'holdings', label: 'Holdings', desc: 'Delivery equity & long-term Demat portfolio', icon: Briefcase, color: '#f59e0b' },
    { id: 'positions', label: 'Positions', desc: 'Active intraday MIS positions & P&L', icon: Layers, color: '#ec4899' },
    { id: 'funds', label: 'Funds & Capital', desc: 'Manage margin, deposit or reset capital', icon: CreditCard, color: '#06b6d4' },
    { id: 'journal', label: 'Trading Journal', desc: 'Performance review, notes & trade psychology', icon: BookOpen, color: '#6366f1' },
    { id: 'learn', label: 'Learn Academy', desc: 'Trading lessons, strategies & definitions', icon: GraduationCap, color: '#14b8a6' }
  ];

  const handleNav = (id) => {
    onSelectTab(id);
    onClose();
  };

  const handlePickIndex = (sym) => {
    onSelectStock(sym);
    onSelectTab('terminal');
    onClose();
  };

  return (
    <div className="mobile-drawer-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="mobile-drawer"
        style={{
          width: 'min(86vw, 360px)',
          background: '#0a0f18',
          borderRight: '1px solid #1f2a3d',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #1c2738', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d131f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.5)' }}>
              <img src="/logo.png" alt="Apex Trading" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#fff' }}>
              APEX<span style={{ color: '#10b981', marginLeft: '3px' }}>TRADING</span>
            </span>

            {/* Dynamic Market Status Badge */}
            {(() => {
              const market = getIndianMarketStatus();
              return (
                <span style={{ 
                  fontSize: '0.55rem', 
                  background: market.bg, 
                  color: market.color, 
                  border: `1px solid ${market.borderColor}`,
                  padding: '1px 5px', 
                  borderRadius: '3px', 
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: market.isOpen ? '#10b981' : '#94a3b8' }} />
                  {market.label}
                </span>
              );
            })()}
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Account / Google Login Banner */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #162030', background: 'rgba(255,255,255,0.02)' }}>
          {currentUser ? (
            <div 
              onClick={() => { onOpenAuth(); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #10b981' }}>
                  <img src={currentUser.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{currentUser.email}</div>
                </div>
              </div>
              <ChevronRight size={16} color="#64748b" />
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); onClose(); }}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #233047',
                color: '#fff',
                padding: '9px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in</span>
            </button>
          )}
        </div>

        {/* Quick Actions (Search, Tips, Install) */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #162030', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => { onOpenSearch(); onClose(); }}
            style={{
              background: '#131c2c',
              border: '1px solid #223046',
              color: '#38bdf8',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={14} />
            <span>Search</span>
          </button>

          <button
            onClick={() => { onOpenTips(); onClose(); }}
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Lightbulb size={14} />
            <span>Trading Tips</span>
          </button>
        </div>

        {/* Major Benchmarks Strip */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #162030' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Live Benchmarks
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {(indices || []).slice(0, 4).map(idx => (
              <div
                key={idx.symbol}
                onClick={() => handlePickIndex(idx.symbol)}
                style={{
                  background: '#111724',
                  border: '1px solid #1c2638',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {idx.name}
                </div>
                <div className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {formatCurrency(idx.price, idx.currency)}
                </div>
                <div className={`font-mono ${idx.change >= 0 ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '0.64rem', fontWeight: 600 }}>
                  ({formatPercent(idx.changePercent)})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All App Navigation Sections */}
        <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '4px 8px', marginBottom: '2px' }}>
            All Modules & Functions
          </div>
          {navItems.map(({ id, label, desc, icon: Icon, color }) => {
            const isActive = activeTab === id;
            return (
              <div
                key={id}
                onClick={() => handleNav(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: isActive ? '#10b981' : color }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isActive ? '#10b981' : '#f1f5f9' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {desc}
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} color="#64748b" />
              </div>
            );
          })}
        </div>

        {/* Footer: PWA Install & Margin */}
        <div style={{ padding: '14px', borderTop: '1px solid #1c2738', background: '#0d131f' }}>
          <button
            onClick={() => { onInstallPWA(); onClose(); }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              padding: '9px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '10px'
            }}
          >
            <Smartphone size={15} />
            <span>Install Apex Trading App</span>
          </button>

          <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
            Margin: <b className="font-mono" style={{ color: '#10b981' }}>₹{(portfolio?.cashBalance || 0).toLocaleString('en-IN')}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
