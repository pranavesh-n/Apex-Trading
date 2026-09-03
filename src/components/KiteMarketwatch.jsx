import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, BarChart2, Layers } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { isAnyMarketOpen } from '../utils/marketHours';

export default function KiteMarketwatch({ 
  watchlists, 
  activeSymbol, 
  onSelectSymbol, 
  onOpenOrderModal, 
  onRemoveSymbol,
  onOpenSearch
}) {
  const [activeWlIdx, setActiveWlIdx] = useState(0);
  const [quotesMap, setQuotesMap] = useState({});
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [filterText, setFilterText] = useState('');

  const activeWatchlist = watchlists?.[activeWlIdx] || watchlists?.[0];

  const fetchBatchQuotes = useCallback(() => {
    if (!activeWatchlist || !activeWatchlist.symbols || activeWatchlist.symbols.length === 0) return;

    fetch('/api/market/batch-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols: activeWatchlist.symbols })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success && res.data) {
        const map = {};
        res.data.forEach(q => {
          if (q && q.symbol) map[q.symbol] = q;
        });
        setQuotesMap(prev => ({ ...prev, ...map }));
      }
    })
    .catch(console.error);
  }, [activeWatchlist]);

  // Initial fetch and smart polling (pauses on market close & tab hide)
  useEffect(() => {
    fetchBatchQuotes();

    const timer = setInterval(() => {
      // RULE 1: Never poll if tab is backgrounded
      // RULE 2: Never poll if all markets are closed
      if (document.hidden || !isAnyMarketOpen()) return;
      fetchBatchQuotes();
    }, 5000);

    const handleVisibility = () => {
      if (!document.hidden && isAnyMarketOpen()) {
        fetchBatchQuotes();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchBatchQuotes]);

  const symbolsToRender = (activeWatchlist?.symbols || []).filter(sym => {
    if (!filterText) return true;
    const q = quotesMap[sym];
    const nameMatch = q?.name?.toLowerCase().includes(filterText.toLowerCase()) || q?.shortName?.toLowerCase().includes(filterText.toLowerCase());
    return sym.toLowerCase().includes(filterText.toLowerCase()) || nameMatch;
  });

  return (
    <div style={{ 
      background: '#0d131f', 
      borderRight: '1px solid #1f2a3d', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      minHeight: 'calc(100vh - 60px)',
      userSelect: 'none'
    }}>
      {/* Quick Search inside Marketwatch */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1f2a3d', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Search size={14} color="#64748b" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter watchlist..."
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '0.8rem',
            width: '100%',
            outline: 'none'
          }}
        />
        <button
          onClick={onOpenSearch}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            color: '#38bdf8',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
          title="Search and add any stock or index"
        >
          + Add
        </button>
      </div>

      {/* Marketwatch Items Count indicator */}
      <div style={{ padding: '6px 14px', fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', background: '#0a0f18', borderBottom: '1px solid #161f30' }}>
        <span>{symbolsToRender.length} / 50 items</span>
        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{activeWatchlist?.name || `Watchlist ${activeWlIdx + 1}`}</span>
      </div>

      {/* Stock Items List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {symbolsToRender.length === 0 ? (
          <div style={{ padding: '45px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '10px', 
              background: 'rgba(6, 182, 212, 0.12)', 
              color: '#38bdf8', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Plus size={20} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', marginBottom: '4px' }}>
              Watchlist is Empty
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 14px 0' }}>
              No preloaded stocks. Search and add any stock or index you want to monitor.
            </p>
            <button
              onClick={onOpenSearch}
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '6px 14px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Add First Instrument
            </button>
          </div>
        ) : (
          symbolsToRender.map(sym => {
            const quote = quotesMap[sym];
            const isSelected = activeSymbol === sym;
            const isHovered = hoveredSymbol === sym;
            const isUp = (quote?.change || 0) >= 0;
            const isIndex = sym.startsWith('^') || quote?.type === 'INDEX';
            const isETF = sym.endsWith('BEES.NS') || quote?.type === 'ETF';
            const displayName = quote?.shortName || quote?.name || sym.replace('.NS', '').replace('.BO', '');
            const currency = quote?.currency || 'INR';

            return (
              <div
                key={sym}
                onMouseEnter={() => setHoveredSymbol(sym)}
                onMouseLeave={() => setHoveredSymbol(null)}
                onClick={() => onSelectSymbol(sym)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: '1px solid #141c2b',
                  background: isSelected ? 'rgba(56, 189, 248, 0.08)' : isHovered ? '#121a29' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.1s ease'
                }}
              >
                {/* Left: Stock Name & Exchange */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '0.86rem', 
                      color: isSelected ? '#38bdf8' : '#f1f5f9' 
                    }}>
                      {displayName}
                    </span>
                    <span style={{ 
                      fontSize: '0.62rem', 
                      color: isIndex ? '#f59e0b' : (isETF ? '#10b981' : '#64748b'),
                      background: isIndex ? 'rgba(245, 158, 11, 0.1)' : (isETF ? 'rgba(16, 185, 129, 0.1)' : 'transparent'),
                      padding: isIndex || isETF ? '1px 4px' : '0',
                      borderRadius: '3px',
                      fontWeight: 600
                    }}>
                      {isIndex ? 'IDX' : (isETF ? 'ETF' : (quote?.exchange || 'NSE'))}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {sym}
                  </div>
                </div>

                {/* Right: Price / Hover Action Buttons */}
                {isHovered ? (
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* BUY BUTTON */}
                    <button
                      onClick={() => onOpenOrderModal(quote || { symbol: sym, name: displayName, price: quote?.price || 100 }, 'BUY')}
                      style={{
                        background: '#387ed1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Buy (B)"
                    >
                      B
                    </button>

                    {/* SELL BUTTON */}
                    <button
                      onClick={() => onOpenOrderModal(quote || { symbol: sym, name: displayName, price: quote?.price || 100 }, 'SELL')}
                      style={{
                        background: '#ff5722',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Sell (S)"
                    >
                      S
                    </button>

                    {/* CHART BUTTON */}
                    <button
                      onClick={() => onSelectSymbol(sym)}
                      style={{
                        background: '#1e293b',
                        color: '#94a3b8',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 6px',
                        cursor: 'pointer'
                      }}
                      title="View Chart"
                    >
                      <BarChart2 size={12} />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => onRemoveSymbol(activeWatchlist.id, sym)}
                      style={{
                        background: '#1e293b',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 6px',
                        cursor: 'pointer'
                      }}
                      title="Delete"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f43f5e'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontSize: '0.86rem', fontWeight: 700, color: isUp ? '#10b981' : '#f43f5e' }}>
                      {quote?.price != null ? formatCurrency(quote.price, currency) : 'Loading...'}
                    </div>
                    {quote?.change != null && (
                      <div 
                        className="font-mono" 
                        style={{ fontSize: '0.7rem', color: isUp ? '#10b981' : '#f43f5e' }}
                      >
                        {isUp ? `+${quote.change?.toFixed(2)}` : quote.change?.toFixed(2)} ({formatPercent(quote.changePercent)})
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Watchlist Switcher Tabs at Bottom (1, 2, 3, 4, 5) */}
      <div style={{ 
        display: 'flex', 
        borderTop: '1px solid #1f2a3d', 
        background: '#090d16',
        height: '36px',
        alignItems: 'center'
      }}>
        {(watchlists || []).map((wl, idx) => (
          <button
            key={wl.id || idx}
            onClick={() => setActiveWlIdx(idx)}
            style={{
              flex: 1,
              height: '100%',
              background: activeWlIdx === idx ? '#131b2c' : 'transparent',
              border: 'none',
              borderTop: activeWlIdx === idx ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeWlIdx === idx ? '#38bdf8' : '#64748b',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title={wl.name}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
