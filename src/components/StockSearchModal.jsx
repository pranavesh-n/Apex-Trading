import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Sparkles, ArrowRight, Globe, Layers, BarChart2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function StockSearchModal({ 
  isOpen, 
  onClose, 
  onSelectStock 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const categories = [
    { id: 'ALL', label: 'All Instruments' },
    { id: 'INDEX', label: 'Indices (Indian & Global)' },
    { id: 'INDIAN', label: 'NSE & BSE Equities' },
    { id: 'GLOBAL', label: 'US & Global Stocks' },
    { id: 'ETF', label: 'ETFs & Commodities' },
  ];

  const popularPicks = [
    { label: 'NIFTY 50', symbol: '^NSEI' },
    { label: 'BANK NIFTY', symbol: '^NSEBANK' },
    { label: 'SENSEX', symbol: '^BSESN' },
    { label: 'RELIANCE', symbol: 'RELIANCE.NS' },
    { label: 'TMPV (Tata Motors)', symbol: 'TMPV.NS' },
    { label: 'ETERNAL (Zomato)', symbol: 'ETERNAL.NS' },
    { label: 'TCS', symbol: 'TCS.NS' },
    { label: 'S&P 500', symbol: '^GSPC' },
    { label: 'NASDAQ', symbol: '^IXIC' },
    { label: 'APPLE', symbol: 'AAPL' },
    { label: 'TESLA', symbol: 'TSLA' },
    { label: 'NIFTYBEES ETF', symbol: 'NIFTYBEES.NS' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      handleFetchResults('');
    } else {
      setQuery('');
      setCategoryFilter('ALL');
    }
  }, [isOpen]);

  const handleFetchResults = (q) => {
    setLoading(true);
    fetch(`/api/market/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setResults(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleInputChange = (val) => {
    setQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      handleFetchResults(val);
    }, 200);
  };

  if (!isOpen) return null;

  const filteredResults = results.filter(item => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'INDEX') return item.type === 'INDEX' || item.sector?.toLowerCase().includes('index') || item.symbol.startsWith('^');
    if (categoryFilter === 'INDIAN') return item.exchange === 'NSE' || item.exchange === 'BSE' || item.symbol.endsWith('.NS') || item.symbol.endsWith('.BO');
    if (categoryFilter === 'GLOBAL') return (!item.symbol.endsWith('.NS') && !item.symbol.endsWith('.BO') && !item.symbol.startsWith('^') && item.type !== 'INDEX' && item.type !== 'ETF');
    if (categoryFilter === 'ETF') return item.type === 'ETF' || item.symbol.endsWith('BEES.NS') || item.sector?.toLowerCase().includes('etf') || item.symbol.includes('=F');
    return true;
  });

  const cleanQuery = query.trim().toUpperCase();
  const directSymbol = cleanQuery;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-elevated"
        style={{ width: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: '#0e1524', overflow: 'hidden', border: '1px solid #223249' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px', background: '#0a0f19' }}>
          <Search size={22} color="#38bdf8" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && directSymbol) {
                onSelectStock(directSymbol);
                onClose();
              }
            }}
            placeholder="Search ANY stock or index (e.g. Nifty 50, Bank Nifty, Sensex, Reliance, TMPV, Apple, Tesla, S&P 500)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1.02rem',
              outline: 'none',
              fontWeight: 500
            }}
          />
          {query && (
            <button
              onClick={() => handleInputChange('')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: '#1a2333', border: '1px solid #2b394e', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600 }}
          >
            ESC
          </button>
        </div>

        {/* Popular Quick-Select Chips */}
        <div style={{ padding: '10px 16px', background: '#080d16', borderBottom: '1px solid #161f30', display: 'flex', gap: '6px', overflowX: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', marginRight: '4px' }}>
            Trending:
          </span>
          {popularPicks.map(p => (
            <button
              key={p.symbol}
              onClick={() => {
                onSelectStock(p.symbol);
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#cbd5e1',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '3px 9px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e293b';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #161f30', display: 'flex', gap: '6px', overflowX: 'auto', background: '#0c121e' }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              style={{
                background: categoryFilter === c.id ? '#2563eb' : 'transparent',
                color: categoryFilter === c.id ? '#fff' : '#94a3b8',
                border: `1px solid ${categoryFilter === c.id ? '#3b82f6' : '#1e293b'}`,
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Direct Ticker Match Option */}
        {cleanQuery.length >= 2 && (
          <div 
            onClick={() => {
              onSelectStock(directSymbol);
              onClose();
            }}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.08))',
              borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: '#38bdf8',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <span>Load Real Live Quote & Chart for <b>{directSymbol}</b> from Exchange</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: '4px' }}>
              <span>Press Enter</span>
              <ArrowRight size={14} />
            </div>
          </div>
        )}

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading && results.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: '#38bdf8', fontSize: '0.9rem' }}>
              <div className="pulse-live" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#38bdf8', margin: '0 auto 12px auto' }} />
              Connecting to Live Exchanges...
            </div>
          ) : filteredResults.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              No pre-indexed matches for "{query}". You can press Enter or click the banner above to load <b>{directSymbol}</b> directly.
            </div>
          ) : (
            filteredResults.map(stock => {
              const isIndex = stock.type === 'INDEX' || stock.sector === 'Index' || stock.symbol.startsWith('^');
              const isETF = stock.type === 'ETF' || stock.symbol.endsWith('BEES.NS');

              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    onSelectStock(stock.symbol);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    borderBottom: '1px solid #161f30'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '8px', 
                      background: isIndex 
                        ? 'rgba(245, 158, 11, 0.15)' 
                        : (isETF ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
                      color: isIndex ? '#fbbf24' : (isETF ? '#34d399' : '#60a5fa'),
                      border: `1px solid ${isIndex ? 'rgba(245, 158, 11, 0.3)' : (isETF ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)')}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {isIndex ? 'IDX' : (isETF ? 'ETF' : (stock.shortName?.[0] || '₹'))}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {stock.shortName || stock.name || stock.symbol}
                        </span>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 700,
                          color: '#38bdf8', 
                          background: 'rgba(56, 189, 248, 0.12)', 
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          padding: '1px 6px', 
                          borderRadius: '4px' 
                        }}>
                          {stock.exchange || 'EXCHANGE'}
                        </span>
                        {isIndex && (
                          <span style={{ fontSize: '0.65rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                            INDEX
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                        <span style={{ color: '#cbd5e1' }}>{stock.name}</span> • <span style={{ color: '#64748b' }}>{stock.sector || 'Equities'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>
                      {stock.symbol}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
                      Click to Chart →
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
