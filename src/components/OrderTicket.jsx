import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, ShieldAlert, Target, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatINR } from '../utils/formatters';

export default function OrderTicket({ 
  quote, 
  portfolio, 
  onOrderPlaced,
  beginnerMode = false
}) {
  const isIndex = quote?.type === 'INDEX' || quote?.symbol?.startsWith('^');
  const currency = quote?.currency || 'INR';
  const [action, setAction] = useState('BUY'); // 'BUY' | 'SELL'
  const [product, setProduct] = useState('CNC'); // 'CNC' (Delivery) | 'MIS' (Intraday)
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' | 'LIMIT' | 'SL'
  const [qty, setQty] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [target, setTarget] = useState('');
  const [thesis, setThesis] = useState('');
  const [selectedTag, setSelectedTag] = useState('Technical Breakout');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [charges, setCharges] = useState(null);

  const ltp = quote?.price || 1000;
  const cashBalance = portfolio?.cashBalance || 0;
  
  // Existing holding for this stock if any
  const existingHolding = portfolio?.holdings?.find(h => h.symbol === quote?.symbol);
  const existingQty = existingHolding?.qty || 0;

  // Reset price inputs when user switches to a different stock
  useEffect(() => {
    setLimitPrice('');
    setStopLoss('');
    setTarget('');
    setError(null);
    setSuccessMsg(null);
  }, [quote?.symbol]);

  useEffect(() => {
    if (orderType === 'LIMIT' && !limitPrice && ltp) {
      setLimitPrice(ltp.toString());
    }
    if (orderType === 'SL' && !stopLoss && ltp) {
      setStopLoss((ltp * 0.97).toFixed(1));
    }
  }, [orderType, ltp]);

  // Fetch estimated charges
  useEffect(() => {
    const effectivePrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : ltp;
    const effectiveQty = parseInt(qty, 10) || 0;
    if (effectiveQty > 0) {
      fetch('/api/orders/calculate-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          action,
          price: effectivePrice,
          qty: effectiveQty
        })
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) setCharges(res.data);
      })
      .catch(() => {});
    }
  }, [product, action, ltp, limitPrice, qty, orderType]);

  const effectivePrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : ltp;
  const orderValue = effectivePrice * (parseInt(qty, 10) || 0);
  const totalRequired = orderValue + (charges?.total || 0);

  // Quick allocation buttons
  const handlePercentAlloc = (pct) => {
    if (!ltp || ltp <= 0) return;
    const budget = cashBalance * (pct / 100);
    const calculatedQty = Math.max(1, Math.floor(budget / ltp));
    setQty(calculatedQty);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: quote.symbol,
          name: quote.name,
          sector: quote.sector,
          action,
          product,
          orderType,
          qty: parseInt(qty, 10),
          limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : null,
          stopLoss: stopLoss ? parseFloat(stopLoss) : null,
          target: target ? parseFloat(target) : null,
          thesis: thesis.trim() || `${selectedTag} setup on ${quote.shortName || quote.symbol}`,
          tags: [selectedTag, product, quote.sector]
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to execute order');
      }

      // Success confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      setSuccessMsg(`Order placed successfully! Executed ${qty} shares of ${quote.shortName || quote.symbol} at ₹${effectivePrice.toLocaleString('en-IN')}`);
      setThesis('');
      if (onOrderPlaced) onOrderPlaced(data);

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strategyTags = [
    'Technical Breakout',
    'Value / Fundamentals',
    'Momentum Swing',
    'Dip Buying',
    'Sector Rotation',
    'Earnings Play'
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Beginner Mode explainer */}
      {beginnerMode && (
        <div style={{ background: 'rgba(245, 158, 11, 0.07)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '0.75rem', color: '#fcd34d', lineHeight: 1.5 }}>
          <b>How to place your first trade:</b> choose BUY, keep product as <b>CNC</b> (shares are delivered to
          your Demat — truly yours), pick a small quantity, and press the green button. Watch the
          “Total Required” line below — it includes real-world charges like STT and stamp duty.
        </div>
      )}

      {/* Index Contract Notice */}
      {isIndex && (
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '0.75rem', color: '#fcd34d', lineHeight: 1.4 }}>
          <b>Index Contract Paper Trade:</b> Trading units on benchmark {quote?.shortName || quote?.symbol}. Indices cannot be delivered to Demat; for delivery holdings, consider trading index ETFs like NIFTYBEES.
        </div>
      )}
      {/* Header Tabs: BUY / SELL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => { setAction('BUY'); setError(null); }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            background: action === 'BUY' ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255, 255, 255, 0.03)',
            color: action === 'BUY' ? '#fff' : '#64748b',
            boxShadow: action === 'BUY' ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          BUY (LONG)
        </button>
        <button
          type="button"
          onClick={() => { setAction('SELL'); setError(null); }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            background: action === 'SELL' ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : 'rgba(255, 255, 255, 0.03)',
            color: action === 'SELL' ? '#fff' : '#64748b',
            boxShadow: action === 'SELL' ? '0 4px 14px rgba(244, 63, 94, 0.35)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          SELL (EXIT)
        </button>
      </div>

      {action === 'SELL' && (
        <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#fda4af', marginBottom: '14px' }}>
          Available CNC Holding: <b className="font-mono">{existingQty} shares</b>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {/* Product Type: Delivery (CNC) vs Intraday (MIS) */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            PRODUCT TYPE
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setProduct('CNC')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${product === 'CNC' ? '#3b82f6' : '#1e293b'}`,
                background: product === 'CNC' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: product === 'CNC' ? '#60a5fa' : '#94a3b8',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              CNC (Delivery)
            </button>
            <button
              type="button"
              onClick={() => setProduct('MIS')}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${product === 'MIS' ? '#3b82f6' : '#1e293b'}`,
                background: product === 'MIS' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: product === 'MIS' ? '#60a5fa' : '#94a3b8',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              MIS (Intraday)
            </button>
          </div>
        </div>

        {/* Order Type: Market vs Limit vs SL */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            ORDER TYPE
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {['MARKET', 'LIMIT', 'SL'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: `1px solid ${orderType === type ? '#06b6d4' : '#1e293b'}`,
                  background: orderType === type ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: orderType === type ? '#38bdf8' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Quick Percentage Presets */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              QUANTITY
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentAlloc(pct)}
                  style={{
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: 'none',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    cursor: 'pointer'
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
            className="font-mono"
            style={{
              width: '100%',
              background: '#0a0e17',
              border: '1px solid #1e293b',
              color: '#fff',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600
            }}
          />
        </div>

        {/* Limit Price Input if LIMIT */}
        {orderType === 'LIMIT' && (
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              LIMIT PRICE (₹)
            </label>
            <input
              type="number"
              step="0.05"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              required
              className="font-mono"
              placeholder={`LTP: ₹${ltp}`}
              style={{
                width: '100%',
                background: '#0a0e17',
                border: '1px solid #1e293b',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600
              }}
            />
          </div>
        )}

        {/* Risk Management: Stop Loss & Target */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#fda4af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <ShieldAlert size={12} /> STOP LOSS (₹)
            </label>
            <input
              type="number"
              step="0.05"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Optional SL"
              className="font-mono"
              style={{
                width: '100%',
                background: '#0a0e17',
                border: '1px solid #1e293b',
                color: '#f43f5e',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Target size={12} /> TARGET (₹)
            </label>
            <input
              type="number"
              step="0.05"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Optional Target"
              className="font-mono"
              style={{
                width: '100%',
                background: '#0a0e17',
                border: '1px solid #1e293b',
                color: '#10b981',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Stock Picking Thesis / Reason For Trade */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> TRADE THESIS & RATIONALE
            </label>
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {strategyTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                style={{
                  background: selectedTag === tag ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: selectedTag === tag ? '#38bdf8' : '#64748b',
                  border: `1px solid ${selectedTag === tag ? 'rgba(6, 182, 212, 0.4)' : '#1e293b'}`,
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.68rem',
                  cursor: 'pointer'
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={2}
            placeholder="Why are you picking this stock? (e.g. 50 EMA bounce, strong Q3 quarterly results, high volume breakout)"
            style={{
              width: '100%',
              background: '#0a0e17',
              border: '1px solid #1e293b',
              color: '#e2e8f0',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              resize: 'none'
            }}
          />
        </div>

        {/* Charges & Margin Breakdown */}
        <div style={{ background: '#090d16', border: '1px solid #1a2333', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#94a3b8' }}>Order Value:</span>
            <span className="font-mono" style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(orderValue, currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#64748b' }}>Est. Brokerage & Taxes:</span>
            <span className="font-mono" style={{ color: '#94a3b8' }}>{formatCurrency(charges?.total || 0, currency)}</span>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span style={{ color: '#cbd5e1' }}>Total Required:</span>
            <span className="font-mono" style={{ color: '#38bdf8' }}>{formatCurrency(totalRequired, currency)}</span>
          </div>
        </div>

        {/* Error / Success feedback */}
        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#86efac', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={loading}
          className={action === 'BUY' ? 'btn-buy' : 'btn-sell'}
          style={{ width: '100%', marginTop: 'auto', padding: '12px', fontSize: '0.95rem' }}
        >
          {loading ? 'Executing...' : `${action} ${qty} ${quote?.shortName || quote?.symbol} @ ${formatCurrency(effectivePrice, currency)}`}
        </button>
      </form>
    </div>
  );
}
