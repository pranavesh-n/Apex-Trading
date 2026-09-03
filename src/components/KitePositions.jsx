import React, { useState } from 'react';
import { Layers, ShieldAlert, Target, X, CheckCircle, Clock } from 'lucide-react';
import { formatINR, formatPercent, formatDate } from '../utils/formatters';

export default function KitePositions({ 
  positions, 
  onClosePosition, 
  onSelectStock, 
  onNavigate 
}) {
  const [closingPos, setClosingPos] = useState(null);
  const [exitReason, setExitReason] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPositionsPnl = (positions || []).reduce((acc, p) => acc + (p.pnl || 0), 0);

  const handleConfirmClose = async () => {
    if (!closingPos) return;
    setLoading(true);
    try {
      await onClosePosition(closingPos.id, exitReason);
      setClosingPos(null);
      setExitReason('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner (Zerodha Kite Positions Summary) */}
      <div className="glass-panel" style={{ padding: '18px 24px', background: '#0e1524', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} color="#38bdf8" />
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Positions ({positions?.length || 0})
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Intraday MIS (5x) & Open Trades
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>
            Total MTM P&L
          </div>
          <div className={`font-mono ${totalPositionsPnl >= 0 ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {formatINR(totalPositionsPnl, true)}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
        {(!positions || positions.length === 0) ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <Clock size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '4px' }}>No Active Open Positions</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Place an Intraday MIS order from the marketwatch or terminal to trade live positions.
            </p>
          </div>
        ) : (
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Instrument</th>
                <th>Qty.</th>
                <th>Avg. Price</th>
                <th>LTP</th>
                <th>P&L (₹)</th>
                <th>Chg. %</th>
                <th>SL / Target</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(p => {
                const isPnlUp = p.pnl >= 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        background: p.product === 'MIS' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: p.product === 'MIS' ? '#fbbf24' : '#60a5fa',
                        fontWeight: 700
                      }}>
                        {p.product}
                      </span>
                    </td>

                    <td>
                      <div 
                        onClick={() => {
                          onSelectStock(p.symbol);
                          onNavigate('terminal');
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 700, color: '#f1f5f9' }}>
                          {p.symbol.replace('.NS', '').replace('.BO', '')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {p.name}
                        </div>
                      </div>
                    </td>

                    <td className="font-mono" style={{ fontWeight: 600 }}>
                      {p.qty}
                    </td>

                    <td className="font-mono">
                      {formatINR(p.entryPrice)}
                    </td>

                    <td className="font-mono" style={{ fontWeight: 700, color: '#38bdf8' }}>
                      {formatINR(p.currentPrice)}
                    </td>

                    <td>
                      <div className={`font-mono ${isPnlUp ? 'profit-text' : 'loss-text'}`} style={{ fontWeight: 700 }}>
                        {formatINR(p.pnl, true)}
                      </div>
                    </td>

                    <td>
                      <span className={`font-mono ${isPnlUp ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {formatPercent(p.pnlPct)}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.75rem' }}>
                      <div className="font-mono" style={{ color: '#fda4af' }}>
                        SL: {p.stopLoss ? `₹${p.stopLoss}` : '-'}
                      </div>
                      <div className="font-mono" style={{ color: '#86efac' }}>
                        Tgt: {p.target ? `₹${p.target}` : '-'}
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => setClosingPos(p)}
                        style={{
                          background: '#ff5722',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '3px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Exit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Exit Modal */}
      {closingPos && (
        <div className="modal-overlay" onClick={() => setClosingPos(null)}>
          <div 
            style={{ width: '420px', padding: '20px', background: '#121824', borderRadius: '8px', border: '1px solid #233047' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Square Off Position
              </h3>
              <button 
                onClick={() => setClosingPos(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#090d16', padding: '12px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Stock:</span>
                <b style={{ color: '#fff' }}>{closingPos.symbol.replace('.NS', '')} ({closingPos.qty} shares)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>LTP:</span>
                <span className="font-mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{formatINR(closingPos.currentPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '6px', marginTop: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Estimated P&L:</span>
                <span className={`font-mono ${closingPos.pnl >= 0 ? 'profit-text' : 'loss-text'}`} style={{ fontWeight: 800 }}>
                  {formatINR(closingPos.pnl, true)} ({formatPercent(closingPos.pnlPct)})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setClosingPos(null)}
                className="btn-ghost"
                style={{ flex: 1, padding: '8px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmClose}
                style={{ flex: 1, padding: '8px', background: '#ff5722', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
              >
                {loading ? 'Exiting...' : 'Confirm Exit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
