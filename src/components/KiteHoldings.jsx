import React, { useState } from 'react';
import { Briefcase, ArrowUpRight, ArrowDownRight, Search, Plus, ExternalLink, Download } from 'lucide-react';
import { formatINR, formatPercent, formatQty } from '../utils/formatters';

export default function KiteHoldings({ 
  portfolio, 
  onSelectStock, 
  onOpenOrderModal, 
  onNavigate 
}) {
  const [searchFilter, setSearchFilter] = useState('');
  const holdings = portfolio?.holdings || [];

  const totalInvested = portfolio?.totalInvested || 0;
  const totalValue = portfolio?.totalHoldingsValue || 0;
  const totalPnl = portfolio?.holdingsUnrealizedPnl || 0;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const totalDayChange = holdings.reduce((acc, h) => acc + (h.dayChange || 0), 0);

  const filteredHoldings = holdings.filter(h =>
    h.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
    h.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (h.sector && h.sector.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner (Zerodha Kite Style Holdings Summary) */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: '#0e1524' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Investment
            </div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>
              {formatINR(totalInvested)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Current Value
            </div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatINR(totalValue)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Day's P&L
            </div>
            <div className={`font-mono ${totalDayChange >= 0 ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {formatINR(totalDayChange, true)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Total P&L
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div className={`font-mono ${totalPnl >= 0 ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {formatINR(totalPnl, true)}
              </div>
              <span className={`font-mono ${totalPnl >= 0 ? 'profit-bg' : 'loss-bg'}`} style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                {formatPercent(totalPnlPct)}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Holdings Table Section */}
      <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
        
        {/* Table Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Holdings ({holdings.length})
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CNC Longterm Portfolio</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '4px 10px', gap: '6px' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search holdings..."
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '140px' }}
              />
            </div>

            <button
              onClick={() => onNavigate('terminal')}
              className="btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              + Buy New Stock
            </button>
          </div>
        </div>

        {filteredHoldings.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <Briefcase size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.05rem', color: '#cbd5e1', marginBottom: '6px' }}>No Holdings Found</h3>
            <p style={{ fontSize: '0.825rem', maxWidth: '380px', margin: '0 auto 16px auto' }}>
              You don't have any stocks in your delivery portfolio yet. Click "+ Buy New Stock" or search any Indian stock in the marketwatch.
            </p>
          </div>
        ) : (
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Qty</th>
                <th>Avg. Cost</th>
                <th>LTP</th>
                <th>Cur. Val</th>
                <th>P&L (₹)</th>
                <th>Net Chg.</th>
                <th>Day Chg.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.map((h) => {
                const isPnlUp = h.pnl >= 0;
                const isDayUp = (h.dayChange || 0) >= 0;

                return (
                  <tr key={h.symbol}>
                    <td>
                      <div 
                        onClick={() => {
                          onSelectStock(h.symbol);
                          onNavigate('terminal');
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 700, color: '#f1f5f9' }}>
                          {h.symbol.replace('.NS', '').replace('.BO', '')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {h.name} • <span style={{ color: '#94a3b8' }}>{h.sector}</span>
                        </div>
                      </div>
                    </td>

                    <td className="font-mono" style={{ fontWeight: 600 }}>
                      {formatQty(h.qty)}
                    </td>

                    <td className="font-mono">
                      {formatINR(h.avgPrice)}
                    </td>

                    <td className="font-mono" style={{ fontWeight: 700, color: '#38bdf8' }}>
                      {formatINR(h.currentPrice)}
                    </td>

                    <td className="font-mono" style={{ fontWeight: 600 }}>
                      {formatINR(h.currentValue)}
                    </td>

                    <td>
                      <div className={`font-mono ${isPnlUp ? 'profit-text' : 'loss-text'}`} style={{ fontWeight: 700 }}>
                        {formatINR(h.pnl, true)}
                      </div>
                    </td>

                    <td>
                      <span className={`font-mono ${isPnlUp ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {formatPercent(h.pnlPct)}
                      </span>
                    </td>

                    <td>
                      <div className={`font-mono ${isDayUp ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {formatINR(h.dayChange, true)} ({formatPercent(h.changePercent)})
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => onOpenOrderModal({ symbol: h.symbol, name: h.name, price: h.currentPrice, sector: h.sector }, 'BUY')}
                          style={{
                            background: '#387ed1',
                            color: '#fff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Add more shares"
                        >
                          Add (B)
                        </button>

                        <button
                          onClick={() => onOpenOrderModal({ symbol: h.symbol, name: h.name, price: h.currentPrice, sector: h.sector }, 'SELL')}
                          style={{
                            background: '#ff5722',
                            color: '#fff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Exit position"
                        >
                          Exit (S)
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
