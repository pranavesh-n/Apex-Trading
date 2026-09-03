import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, ShieldAlert, Target, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatINR, formatPercent } from '../utils/formatters';

export default function KiteOrderModal({ 
  isOpen, 
  onClose, 
  quote, 
  defaultAction = 'BUY', 
  portfolio, 
  onOrderPlaced,
  beginnerMode = false
}) {
  const isIndex = quote?.type === 'INDEX' || quote?.symbol?.startsWith('^');
  const currency = quote?.currency || 'INR';
  const [action, setAction] = useState(defaultAction); // 'BUY' | 'SELL'
  const [product, setProduct] = useState('CNC'); // 'CNC' (Longterm) | 'MIS' (Intraday)
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' | 'LIMIT' | 'SL' | 'SL-M'
  const [qty, setQty] = useState(10);
  const [price, setPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [thesis, setThesis] = useState('');
  const [selectedTag, setSelectedTag] = useState('Breakout');
  const [enableGtt, setEnableGtt] = useState(false);
  const [stoplossPct, setStoplossPct] = useState(3);
  const [targetPct, setTargetPct] = useState(6);
  const [charges, setCharges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setAction(defaultAction);
    setError(null);
    setSuccessMsg(null);
  }, [defaultAction, isOpen, quote]);

  const ltp = quote?.price || 1000;
  const cashBalance = portfolio?.cashBalance || 0;

  useEffect(() => {
    if (orderType === 'LIMIT' && (!price || price === '0') && ltp) {
      setPrice(ltp.toString());
    }
    if ((orderType === 'SL' || orderType === 'SL-M') && (!triggerPrice || triggerPrice === '0') && ltp) {
      setTriggerPrice((ltp * 0.98).toFixed(1));
    }
  }, [orderType, ltp]);

  // Fetch estimated charges
  useEffect(() => {
    const effectivePrice = orderType === 'LIMIT' && price ? parseFloat(price) : ltp;
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
  }, [product, action, ltp, price, qty, orderType]);

  if (!isOpen || !quote) return null;

  const effectivePrice = orderType === 'LIMIT' && price ? parseFloat(price) : ltp;
  const rawOrderValue = effectivePrice * (parseInt(qty, 10) || 0);
  // MIS Intraday has 5x leverage in Indian equities
  const marginRequired = product === 'MIS' ? rawOrderValue / 5 : rawOrderValue;
  const totalRequired = marginRequired + (charges?.total || 0);

  const isBuy = action === 'BUY';
  const headerBg = isBuy ? '#387ed1' : '#ff5722';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const calculatedSl = enableGtt ? +(effectivePrice * (1 - stoplossPct / 100)).toFixed(1) : (triggerPrice ? parseFloat(triggerPrice) : null);
      const calculatedTgt = enableGtt ? +(effectivePrice * (1 + targetPct / 100)).toFixed(1) : null;

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
          limitPrice: orderType === 'LIMIT' ? parseFloat(price) : null,
          stopLoss: calculatedSl,
          target: calculatedTgt,
          thesis: thesis.trim() || `${selectedTag} trade on ${quote.shortName || quote.symbol}`,
          tags: [selectedTag, product, quote.sector]
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to execute order');
      }

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setSuccessMsg(`Order placed: ${action} ${qty} ${quote.shortName || quote.symbol} @ ₹${effectivePrice.toLocaleString('en-IN')}`);
      if (onOrderPlaced) onOrderPlaced(data);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '460px',
          background: '#121824',
          borderRadius: '8px',
          border: '1px solid #233047',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Iconic Zerodha Top Bar (Blue / Orange) */}
        <div style={{ background: headerBg, padding: '12px 18px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                {action} {quote.shortName || quote.name || quote.symbol}
              </span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                {quote.exchange || 'NSE'}
              </span>
              {isIndex && (
                <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.3)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  INDEX
                </span>
              )}
            </div>
            <div className="font-mono" style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {formatCurrency(quote.price, currency)} ({formatPercent(quote.changePercent)})
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Switch Buy / Sell Toggle */}
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '4px', display: 'flex', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setAction('BUY')}
                style={{
                  background: action === 'BUY' ? '#fff' : 'transparent',
                  color: action === 'BUY' ? '#387ed1' : '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => setAction('SELL')}
                style={{
                  background: action === 'SELL' ? '#fff' : 'transparent',
                  color: action === 'SELL' ? '#ff5722' : '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                S
              </button>
            </div>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Beginner Mode explainer */}
          {beginnerMode && (
            <div style={{ background: 'rgba(245, 158, 11, 0.07)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.72rem', color: '#fcd34d', lineHeight: 1.5 }}>
              <b>Quick guide:</b> <b>CNC</b> = delivery buy (shares are yours, hold for years, zero brokerage).
              <b> MIS</b> = same-day intraday with ~5x leverage (must exit today). MARKET executes now, LIMIT waits for your price.
            </div>
          )}

          {/* Product Types: Intraday MIS vs Longterm CNC */}
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #1f2a3d', paddingBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: product === 'MIS' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="radio"
                name="product"
                checked={product === 'MIS'}
                onChange={() => setProduct('MIS')}
              />
              <span>Intraday <b style={{ fontSize: '0.72rem', color: '#f59e0b' }}>MIS 5x</b></span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: product === 'CNC' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="radio"
                name="product"
                checked={product === 'CNC'}
                onChange={() => setProduct('CNC')}
              />
              <span>Longterm <b style={{ fontSize: '0.72rem', color: '#10b981' }}>CNC</b></span>
            </label>
          </div>

          {/* Quantity & Price Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Qty.
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#090d16', border: '1px solid #233047', borderRadius: '4px', overflow: 'hidden' }}>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="font-mono"
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 10px',
                    width: '100%',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                disabled={orderType === 'MARKET' || orderType === 'SL-M'}
                value={orderType === 'MARKET' || orderType === 'SL-M' ? ltp : price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
                placeholder={ltp.toString()}
                style={{
                  width: '100%',
                  background: (orderType === 'MARKET' || orderType === 'SL-M') ? '#182030' : '#090d16',
                  border: '1px solid #233047',
                  color: (orderType === 'MARKET' || orderType === 'SL-M') ? '#64748b' : '#fff',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              />
            </div>
          </div>

          {/* Trigger Price (if SL / SL-M) */}
          {(orderType === 'SL' || orderType === 'SL-M') && (
            <div>
              <label style={{ fontSize: '0.72rem', color: '#fda4af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Trigger Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="font-mono"
                required
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #233047',
                  color: '#f43f5e',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              />
            </div>
          )}

          {/* Order Types: Market, Limit, SL, SL-M */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderBottom: '1px solid #1f2a3d', paddingBottom: '12px' }}>
            {['MARKET', 'LIMIT', 'SL', 'SL-M'].map(type => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: orderType === type ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="orderType"
                  checked={orderType === type}
                  onChange={() => setOrderType(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>

          {/* Zerodha GTT Feature (Stoploss & Target) */}
          <div style={{ background: '#090d16', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1f2a3d' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={14} color="#38bdf8" /> Set GTT Stoploss & Target
              </span>
              <input
                type="checkbox"
                checked={enableGtt}
                onChange={(e) => setEnableGtt(e.target.checked)}
              />
            </label>

            {enableGtt && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1a2333' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#fda4af', fontWeight: 600 }}>Stoploss (-{stoplossPct}%)</label>
                  <input
                    type="number"
                    value={stoplossPct}
                    onChange={(e) => setStoplossPct(Number(e.target.value))}
                    className="font-mono"
                    style={{ width: '100%', background: '#121824', border: '1px solid #233047', color: '#f43f5e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 600 }}>Target (+{targetPct}%)</label>
                  <input
                    type="number"
                    value={targetPct}
                    onChange={(e) => setTargetPct(Number(e.target.value))}
                    className="font-mono"
                    style={{ width: '100%', background: '#121824', border: '1px solid #233047', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Trade Thesis / Note */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Sparkles size={12} /> TRADE REASON / JOURNAL THESIS
            </label>
            <input
              type="text"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="e.g. 50 EMA bounce, strong Q3 result, resistance breakout"
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid #233047',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem'
              }}
            />
          </div>

          {/* Margin Required & Available Margin Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8', background: '#0a0f18', padding: '8px 12px', borderRadius: '4px' }}>
            <div>
              <span>Margin required: </span>
              <b className="font-mono" style={{ color: '#fff' }}>{formatCurrency(totalRequired, currency)}</b>
            </div>
            <div>
              <span>Available: </span>
              <b className="font-mono" style={{ color: '#38bdf8' }}>₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</b>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#86efac', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> {successMsg}
            </div>
          )}

          {/* Action Buttons: Solid Blue "Buy" or Solid Orange "Sell" */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: headerBg,
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: isBuy ? '0 4px 12px rgba(56, 126, 209, 0.4)' : '0 4px 12px rgba(255, 87, 34, 0.4)'
              }}
            >
              {loading ? 'Submitting...' : isBuy ? 'Buy' : 'Sell'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '10px 16px', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
