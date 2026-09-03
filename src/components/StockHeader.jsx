import React from 'react';
import { ArrowUpRight, ArrowDownRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getMarketStatusForSymbol } from '../utils/marketHours';

export default function StockHeader({ 
  quote, 
  isInWatchlist, 
  onToggleWatchlist 
}) {
  if (!quote) return null;

  const isUp = (quote.change || 0) >= 0;
  const currency = quote.currency || 'INR';

  const dayRangePct = quote.high > quote.low 
    ? Math.min(100, Math.max(0, ((quote.price - quote.low) / (quote.high - quote.low)) * 100))
    : 50;
  
  const yearRangePct = quote.fiftyTwoWeekHigh > quote.fiftyTwoWeekLow
    ? Math.min(100, Math.max(0, ((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100))
    : 50;

  const displayName = quote.shortName || quote.name || quote.symbol;
  const isIndex = quote.type === 'INDEX' || quote.symbol.startsWith('^');

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Left: Stock Identification & Sector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                {displayName}
              </h1>

              {/* Symbol Tag */}
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: '#131d2e', 
                color: '#94a3b8',
                border: '1px solid #1e293b'
              }}>
                {quote.symbol}
              </span>

              {/* Exchange Badge */}
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: '#1e293b', 
                color: '#38bdf8',
                border: '1px solid #334155'
              }}>
                {quote.exchange || 'NSE'}
              </span>

              {/* Type Badge */}
              <span style={{ 
                fontSize: '0.68rem', 
                fontWeight: 700, 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: isIndex ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: isIndex ? '#fbbf24' : '#60a5fa',
                border: `1px solid ${isIndex ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
              }}>
                {quote.type || (isIndex ? 'INDEX' : 'EQUITY')}
              </span>

              {/* Dynamic Market Status Badge */}
              {(() => {
                const status = getMarketStatusForSymbol(quote.symbol);
                return (
                  <span 
                    title={status.tooltip}
                    style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      background: status.bg, 
                      color: status.color, 
                      border: `1px solid ${status.borderColor}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span 
                      className={status.isOpen ? "pulse-live" : ""}
                      style={{ 
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: status.isOpen ? '#10b981' : '#94a3b8'
                      }} 
                    />
                    {status.isOpen ? `${status.market} LIVE` : `${status.market} CLOSED`}
                  </span>
                );
              })()}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
              {quote.name} • <span style={{ color: '#64748b' }}>{quote.sector || 'Equities'}</span>
            </div>
          </div>

          <button 
            onClick={onToggleWatchlist}
            className="btn-ghost"
            style={{ 
              padding: '8px', 
              borderRadius: '8px', 
              background: isInWatchlist ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
              borderColor: isInWatchlist ? 'rgba(245, 158, 11, 0.4)' : '#1e293b'
            }}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {isInWatchlist ? (
              <BookmarkCheck size={18} color="#f59e0b" />
            ) : (
              <Bookmark size={18} color="#94a3b8" />
            )}
          </button>
        </div>

        {/* Center: Live Price & Day P&L */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <div className="font-mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            {formatCurrency(quote.price, currency)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span 
              className={`font-mono ${isUp ? 'profit-bg' : 'loss-bg'}`}
              style={{ 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                padding: '3px 8px', 
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatCurrency(quote.change, currency, true)} ({formatPercent(quote.changePercent)})
            </span>
          </div>
        </div>

        {/* Right: Day Range & 52-Week Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Day High / Low */}
          <div style={{ minWidth: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
              <span>Low: <b className="font-mono" style={{ color: '#cbd5e1' }}>{formatCurrency(quote.low, currency)}</b></span>
              <span>Day Range</span>
              <span>High: <b className="font-mono" style={{ color: '#cbd5e1' }}>{formatCurrency(quote.high, currency)}</b></span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#1e293b', borderRadius: '3px', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                left: `${dayRangePct}%`, 
                top: '-3px', 
                width: '11px', 
                height: '11px', 
                borderRadius: '50%', 
                background: '#06b6d4', 
                transform: 'translateX(-50%)',
                boxShadow: '0 0 6px #06b6d4'
              }} />
            </div>
          </div>

          {/* 52-Week High / Low */}
          <div style={{ minWidth: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
              <span>52W L: <b className="font-mono" style={{ color: '#cbd5e1' }}>{formatCurrency(quote.fiftyTwoWeekLow, currency)}</b></span>
              <span>52-W Range</span>
              <span>52W H: <b className="font-mono" style={{ color: '#cbd5e1' }}>{formatCurrency(quote.fiftyTwoWeekHigh, currency)}</b></span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#1e293b', borderRadius: '3px', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                left: `${yearRangePct}%`, 
                top: '-3px', 
                width: '11px', 
                height: '11px', 
                borderRadius: '50%', 
                background: '#3b82f6', 
                transform: 'translateX(-50%)'
              }} />
            </div>
          </div>

          {/* Volume */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Volume</div>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
              {Number(quote.volume || 0).toLocaleString('en-US')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
