import React from 'react';
import { Lightbulb, X, BookOpen, ShieldAlert, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TipsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const tipSections = [
    {
      title: '1. CNC (Delivery) vs MIS (Intraday)',
      badge: 'Order Products',
      color: '#10b981',
      content: [
        { term: 'CNC (Cash & Carry / Delivery)', desc: 'You buy shares with 100% cash. They are delivered to your account and you can hold them for days, months, or years. Zero intraday forced square-off.' },
        { term: 'MIS (Margin Intraday Square-off)', desc: 'Intraday trading with leverage. Must be closed before market close (typically 3:15 PM). Higher risk; never hold overnight.' }
      ]
    },
    {
      title: '2. Market vs Limit vs Stop Loss (SL)',
      badge: 'Order Execution',
      color: '#38bdf8',
      content: [
        { term: 'MARKET Order', desc: 'Executes immediately at the current best available market price. Fastest fill, but watch out for market slippage on illiquid stocks.' },
        { term: 'LIMIT Order', desc: 'You choose the maximum price you are willing to pay (or minimum price to sell). Only executes if the market reaches your exact price.' },
        { term: 'STOP LOSS (SL)', desc: 'A safety trigger order. Automatically cuts your trade if the price moves against you to protect your capital from large losses.' }
      ]
    },
    {
      title: '3. The Golden 2% Risk Management Rule',
      badge: 'Capital Protection',
      color: '#f59e0b',
      content: [
        { term: 'Never Risk More Than 2%', desc: 'On any single trade, the difference between your Entry Price and Stop Loss should never exceed 1% to 2% of your total account capital.' },
        { term: 'Risk-to-Reward Ratio', desc: 'Always aim for at least 1:2 Risk-to-Reward. If you risk ₹1,000 on a trade, your profit target should be at least ₹2,000.' }
      ]
    },
    {
      title: '4. Understanding Candlesticks',
      badge: 'Technical Analysis',
      color: '#a855f7',
      content: [
        { term: 'Green (Bullish) Candle', desc: 'Price closed HIGHER than it opened. Buyers were in control during that timeframe.' },
        { term: 'Red (Bearish) Candle', desc: 'Price closed LOWER than it opened. Sellers dominated that timeframe.' },
        { term: 'Upper & Lower Wicks (Shadows)', desc: 'Show the highest and lowest price reached during the period before closing.' }
      ]
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '620px',
          maxWidth: '92vw',
          maxHeight: '88vh',
          background: '#0d131f',
          border: '1px solid #223249',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Lightbulb size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Beginner Trading Guide & Quick Tips
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Essential market rules and execution strategies
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
          {tipSections.map((sec, idx) => (
            <div 
              key={idx}
              style={{
                background: '#090e18',
                border: '1px solid #1c2738',
                borderRadius: '10px',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: sec.color }}>
                  {sec.title}
                </span>
                <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {sec.badge}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sec.content.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                    <b style={{ color: '#e2e8f0' }}>{c.term}: </b>
                    <span style={{ color: '#94a3b8' }}>{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Tip: You can re-open this guide anytime via the <b>Tips</b> button.
          </span>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.8rem' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
