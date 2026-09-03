import React from 'react';
import { 
  TrendingUp, 
  Award, 
  PieChart, 
  ShieldCheck, 
  Scale, 
  Zap, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { formatINR, formatPercent } from '../utils/formatters';

export default function AnalyticsTab({ portfolio }) {
  const analytics = portfolio?.analytics || {};
  const {
    totalTrades = 0,
    winCount = 0,
    lossCount = 0,
    winRate = 0,
    profitFactor = 0,
    avgWin = 0,
    avgLoss = 0,
    bestTrade = null,
    sectorBreakdown = []
  } = analytics;

  const totalReturn = portfolio?.totalReturn || 0;
  const totalReturnPct = portfolio?.totalReturnPct || 0;

  // Sector color map
  const sectorColors = [
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Win Rate</span>
            <Award size={18} color="#10b981" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981' }}>
            {winRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {winCount} Wins / {lossCount} Losses ({totalTrades} total picks)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profit Factor</span>
            <Scale size={18} color="#38bdf8" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8' }}>
            {profitFactor > 900 ? '∞' : profitFactor}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Gross Profits ÷ Gross Losses
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Win vs Avg Loss</span>
            <Zap size={18} color="#f59e0b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="font-mono profit-text" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {formatINR(avgWin)}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>vs</span>
            <span className="font-mono loss-text" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {formatINR(avgLoss)}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Risk-Reward Realized Ratio: {avgLoss > 0 ? `1 : ${(avgWin / avgLoss).toFixed(2)}` : 'N/A'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Capital Growth</span>
            <TrendingUp size={18} color="#2563eb" />
          </div>
          <div className={`font-mono ${totalReturn >= 0 ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {formatINR(totalReturn, true)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {formatPercent(totalReturnPct)} overall account return
          </div>
        </div>
      </div>

      {/* Two Column Layout: Sector Breakdown & Best Trades */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
        {/* Sectoral Asset Allocation */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PieChart size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Sector Diversification & Exposure
            </h3>
          </div>

          {sectorBreakdown.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No active delivery holdings yet. Buy stocks across IT, Banking, Auto, Energy to see diversification breakdown.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Stacked Progress Bar */}
              <div style={{ width: '100%', height: '12px', borderRadius: '6px', background: '#1e293b', display: 'flex', overflow: 'hidden' }}>
                {sectorBreakdown.map((s, idx) => (
                  <div
                    key={s.sector}
                    style={{
                      width: `${s.percent}%`,
                      background: sectorColors[idx % sectorColors.length],
                      height: '100%'
                    }}
                    title={`${s.sector}: ${s.percent}%`}
                  />
                ))}
              </div>

              {/* Sector Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sectorBreakdown.map((s, idx) => (
                  <div key={s.sector} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: sectorColors[idx % sectorColors.length] }} />
                      <span style={{ color: '#cbd5e1' }}>{s.sector}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="font-mono" style={{ color: '#94a3b8' }}>{formatINR(s.value)}</span>
                      <span className="font-mono" style={{ color: '#fff', fontWeight: 700, minWidth: '45px', textAlign: 'right' }}>
                        {s.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Best Stock Pick Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Top Stock Pick Highlight
            </h3>
          </div>

          {bestTrade ? (
            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      {bestTrade.symbol.replace('.NS', '')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{bestTrade.name}</div>
                  </div>
                  <div className="font-mono profit-bg" style={{ fontSize: '1.1rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                    {formatINR(bestTrade.pnl, true)} ({formatPercent(bestTrade.pnlPct)})
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <b>Entry Thesis:</b> {bestTrade.thesis || 'Technical Breakout'}
                </div>

                {bestTrade.lessons && (
                  <div style={{ fontSize: '0.8rem', color: '#86efac', background: 'rgba(16, 185, 129, 0.08)', padding: '8px 10px', borderRadius: '6px' }}>
                    <b>Key Lesson:</b> {bestTrade.lessons}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: '10px', marginTop: '12px' }}>
                <span>Bought @ ₹{bestTrade.entryPrice}</span>
                <span>Sold @ ₹{bestTrade.exitPrice}</span>
                <span>Qty: {bestTrade.qty}</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Complete trades with profitable exits to see your top performing stock pick featured here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
