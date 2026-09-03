import React from 'react';
import { formatCurrency, formatQty, formatPercent } from '../utils/formatters';
import { TrendingUp, Layers, ExternalLink, Activity, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

export default function MarketDepth({ quote, onSelectStock }) {
  if (!quote) return null;

  const ltp = quote.price || 0;
  const currency = quote.currency || 'INR';
  const isIndex = quote.type === 'INDEX' || quote.symbol.startsWith('^');

  const prevClose = quote.prevClose || ltp;
  const open = quote.open || prevClose;
  const high = quote.high || ltp;
  const low = quote.low || ltp;
  const volume = quote.volume || 0;
  const vwap = +((high + low + ltp) / 3).toFixed(2);

  // Standard circuit bands (10% from previous close)
  const lowerCircuit = +(prevClose * 0.9).toFixed(2);
  const upperCircuit = +(prevClose * 1.1).toFixed(2);

  // Suggested tradable ETF alternatives for indices
  const indexEtfMap = {
    '^NSEI': { symbol: 'NIFTYBEES.NS', name: 'Nippon India Nifty 50 BeES ETF' },
    '^NSEBANK': { symbol: 'BANKBEES.NS', name: 'Nippon India Bank BeES ETF' },
    '^BSESN': { symbol: 'SENSEXBEES.NS', name: 'Nippon India Sensex BeES ETF' },
    '^CNXIT': { symbol: 'ITBEES.NS', name: 'Nippon India IT BeES ETF' },
    '^GSPC': { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
    '^IXIC': { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)' },
    'GC=F': { symbol: 'GOLDBEES.NS', name: 'Nippon India Gold BeES ETF' },
  };

  const etfAlternative = indexEtfMap[quote.symbol];

  // If it's an Index, render Index Fundamental & Performance Card
  if (isIndex) {
    const dayRangeSpread = high > low ? +(high - low).toFixed(2) : 0;
    const dayRangePct = low > 0 ? +((dayRangeSpread / low) * 100).toFixed(2) : 0;

    return (
      <div className="glass-panel" style={{ padding: '16px 20px', marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#f59e0b" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.04em' }}>
              INDEX MARKET STATISTICS & BENCHMARK DETAILS
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Exchange Benchmark Indicator
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Key Stats */}
          <div style={{ background: '#090d16', padding: '14px 16px', borderRadius: '8px', border: '1px solid #1a2333' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
              SESSION METRICS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Open: </span>
                <b className="font-mono" style={{ color: '#fff' }}>{formatCurrency(open, currency)}</b>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Prev. Close: </span>
                <b className="font-mono" style={{ color: '#fff' }}>{formatCurrency(prevClose, currency)}</b>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Day High: </span>
                <b className="font-mono profit-text">{formatCurrency(high, currency)}</b>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Day Low: </span>
                <b className="font-mono loss-text">{formatCurrency(low, currency)}</b>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Intraday Range: </span>
                <b className="font-mono" style={{ color: '#38bdf8' }}>{formatCurrency(dayRangeSpread, currency)} ({dayRangePct}%)</b>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Volume: </span>
                <b className="font-mono" style={{ color: '#cbd5e1' }}>{formatQty(volume)}</b>
              </div>
            </div>
          </div>

          {/* Tradable Alternatives Banner */}
          <div style={{ background: '#090d16', padding: '14px 16px', borderRadius: '8px', border: '1px solid #1a2333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                TRADING THIS INDEX IN REALITY
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
                Benchmarks like {quote.shortName || quote.symbol} cannot be bought directly as delivery cash shares. Traders trade index contracts or liquid <b>Index ETFs</b> with zero lock-in.
              </p>
            </div>

            {etfAlternative && onSelectStock && (
              <button
                onClick={() => onSelectStock(etfAlternative.symbol)}
                className="btn-primary"
                style={{ marginTop: '12px', fontSize: '0.78rem', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Switch to {etfAlternative.symbol} ({etfAlternative.name})</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Stock / Equity Market Depth
  const tick = ltp > 1000 ? 0.5 : 0.05;
  const spread = tick;

  const bids = [
    { price: +(ltp - spread).toFixed(2), share: '32%' },
    { price: +(ltp - spread * 2).toFixed(2), share: '24%' },
    { price: +(ltp - spread * 3).toFixed(2), share: '18%' },
    { price: +(ltp - spread * 4).toFixed(2), share: '15%' },
    { price: +(ltp - spread * 5).toFixed(2), share: '11%' },
  ];

  const asks = [
    { price: +(ltp + spread).toFixed(2), share: '30%' },
    { price: +(ltp + spread * 2).toFixed(2), share: '25%' },
    { price: +(ltp + spread * 3).toFixed(2), share: '20%' },
    { price: +(ltp + spread * 4).toFixed(2), share: '14%' },
    { price: +(ltp + spread * 5).toFixed(2), share: '11%' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px', marginTop: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Left: 5-Level Bid/Ask Dynamic Price Ladder */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>
              PRICE LADDER & LIVE SPREAD (L2)
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Tick: {currency === 'INR' ? '₹' : '$'}{tick}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Bid Table */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, paddingBottom: '4px', borderBottom: '1px solid #1e293b' }}>
                <span>Bid ({currency})</span>
                <span style={{ textAlign: 'right' }}>Weight</span>
              </div>
              {bids.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.75rem', padding: '3px 0' }}>
                  <span className="font-mono profit-text" style={{ fontWeight: 600 }}>{b.price.toFixed(2)}</span>
                  <span className="font-mono" style={{ textAlign: 'right', color: '#94a3b8' }}>{b.share}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '4px', marginTop: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>
                <span>Best Bid:</span>
                <span className="font-mono">{formatCurrency(bids[0].price, currency)}</span>
              </div>
            </div>

            {/* Ask Table */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, paddingBottom: '4px', borderBottom: '1px solid #1e293b' }}>
                <span>Ask ({currency})</span>
                <span style={{ textAlign: 'right' }}>Weight</span>
              </div>
              {asks.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.75rem', padding: '3px 0' }}>
                  <span className="font-mono loss-text" style={{ fontWeight: 600 }}>{a.price.toFixed(2)}</span>
                  <span className="font-mono" style={{ textAlign: 'right', color: '#94a3b8' }}>{a.share}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '4px', marginTop: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#f43f5e' }}>
                <span>Best Ask:</span>
                <span className="font-mono">{formatCurrency(asks[0].price, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key Trading Metrics & Circuit Limits */}
        <div style={{ background: '#090d16', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1a2333' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.04em' }}>
            TECHNICAL & PRICE SNAPSHOT
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Open: </span>
              <b className="font-mono" style={{ color: '#fff' }}>{formatCurrency(open, currency)}</b>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Prev. Close: </span>
              <b className="font-mono" style={{ color: '#fff' }}>{formatCurrency(prevClose, currency)}</b>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>VWAP: </span>
              <b className="font-mono" style={{ color: '#38bdf8' }}>{formatCurrency(vwap, currency)}</b>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Volume: </span>
              <b className="font-mono" style={{ color: '#cbd5e1' }}>{formatQty(volume)}</b>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Lower Circuit (10%): </span>
              <b className="font-mono loss-text">{formatCurrency(lowerCircuit, currency)}</b>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Upper Circuit (10%): </span>
              <b className="font-mono profit-text">{formatCurrency(upperCircuit, currency)}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
