import React from 'react';
import {
  CandlestickChart,
  ListOrdered,
  Briefcase,
  User,
  List
} from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab, onOpenWatchlist }) {
  const tabs = [
    { id: 'watchlist-btn', label: 'Watchlist', icon: List, action: onOpenWatchlist },
    { id: 'terminal', label: 'Trade', icon: CandlestickChart, action: () => setActiveTab('terminal') },
    { id: 'orders', label: 'Orders', icon: ListOrdered, action: () => setActiveTab('orders') },
    { id: 'holdings', label: 'Portfolio', icon: Briefcase, action: () => setActiveTab('holdings') },
    { id: 'profile', label: 'Profile', icon: User, action: () => setActiveTab('profile') },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'rgba(13, 19, 31, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #1f2a3d',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        userSelect: 'none',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
      }}
    >
      {tabs.map(({ id, label, icon: Icon, action }) => {
        const isActive = activeTab === id || (id === 'holdings' && ['holdings', 'positions'].includes(activeTab));
        return (
          <button
            key={id}
            onClick={action}
            style={{
              background: 'transparent',
              border: 'none',
              borderTop: isActive ? '2px solid #10b981' : '2px solid transparent',
              color: isActive ? '#10b981' : '#64748b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '8px 0 6px 0',
              cursor: 'pointer',
              minHeight: '52px'
            }}
          >
            <Icon size={18} />
            <span style={{ fontSize: '0.66rem', fontWeight: isActive ? 800 : 500 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}