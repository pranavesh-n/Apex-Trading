import React, { useState } from 'react';
import { Wallet, Plus, RotateCcw, ArrowDownRight, ArrowUpRight, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function KiteFunds({ 
  portfolio, 
  onUpdateFunds, 
  onResetPortfolio 
}) {
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const cashBalance = portfolio?.cashBalance || 0;
  const totalInvested = portfolio?.totalInvested || 0;
  const totalValue = portfolio?.totalPortfolioValue || 0;
  const realizedPnl = portfolio?.realizedPnl || 0;

  const quickAdds = [
    { label: '+ ₹50,000', amount: 50000 },
    { label: '+ ₹1 Lakh', amount: 100000 },
    { label: '+ ₹5 Lakhs', amount: 500000 },
    { label: '+ ₹10 Lakhs', amount: 1000000 },
    { label: '+ ₹25 Lakhs', amount: 2500000 },
  ];

  const handleAddQuick = async (amountToAdd) => {
    setLoading(true);
    try {
      const newTotal = cashBalance + amountToAdd;
      await onUpdateFunds(newTotal);
      confetti({ particleCount: 30, spread: 50 });
      setSuccessMsg(`Added ${formatINR(amountToAdd)} virtual trading capital!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetExact = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount.replace(/,/g, ''));
    if (!parsed || parsed <= 0) return;
    setLoading(true);
    try {
      await onUpdateFunds(parsed);
      confetti({ particleCount: 40, spread: 60 });
      setSuccessMsg(`Trading cash balance set to ${formatINR(parsed)}!`);
      setCustomAmount('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={22} color="#38bdf8" /> Equity Funds & Virtual Margin (₹ INR)
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Manage your virtual trading funds. Deposit or adjust capital anytime with zero financial risk.
          </p>
        </div>

        <button
          onClick={() => {
            const entered = window.prompt('Reset entire paper portfolio? Enter starting capital in ₹ (e.g. 100000 or 0):', '0');
            if (entered !== null) {
              const cap = Math.max(0, parseFloat(entered) || 0);
              onResetPortfolio(cap);
            }
          }}
          className="btn-ghost"
          style={{ fontSize: '0.825rem', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={14} /> Reset Account / Set Capital
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#86efac', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Top 3 Metric Cards (Zerodha Kite Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            Available Cash Margin
          </div>
          <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
            {formatINR(cashBalance)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            Free margin ready for CNC / MIS trades
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            Used Margin (Holdings & Trades)
          </div>
          <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#cbd5e1' }}>
            {formatINR(totalInvested)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            Capital allocated to active stocks
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            Total Account Net Worth
          </div>
          <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
            {formatINR(totalValue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            Cash + Current Holdings Value
          </div>
        </div>
      </div>

      {/* Two Column Section: Quick Top-Up & Margin Statement (collapses on mobile) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Left: Instant Add Funds (Zerodha / Groww style Paper Money Deposit) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#10b981" /> Instant Virtual Cash Deposit
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '16px' }}>
            Add paper funds to test larger trade setups or position sizing. No real money required.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '20px' }}>
            {quickAdds.map(q => (
              <button
                key={q.label}
                disabled={loading}
                onClick={() => handleAddQuick(q.amount)}
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  borderRadius: '6px',
                  padding: '10px 8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {q.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSetExact} style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Or Set Exact Cash Balance (₹)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                min="1000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 2500000"
                className="font-mono"
                style={{
                  flex: 1,
                  background: '#090d16',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
              />
              <button
                type="submit"
                disabled={loading || !customAmount}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.875rem' }}
              >
                Update Balance
              </button>
            </div>
          </form>
        </div>

        {/* Right: Zerodha Style Margin Breakdown Statement */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Margin Statement
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8' }}>Opening Balance</span>
              <span className="font-mono" style={{ color: '#fff', fontWeight: 600 }}>{formatINR(portfolio?.initialCapital || 1000000)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8' }}>Available Cash</span>
              <span className="font-mono" style={{ color: '#10b981', fontWeight: 700 }}>{formatINR(cashBalance)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8' }}>Used Margin (Holdings)</span>
              <span className="font-mono" style={{ color: '#cbd5e1' }}>{formatINR(totalInvested)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8' }}>Realized P&L</span>
              <span className={`font-mono ${realizedPnl >= 0 ? 'profit-text' : 'loss-text'}`} style={{ fontWeight: 700 }}>
                {formatINR(realizedPnl, true)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', fontWeight: 700 }}>
              <span style={{ color: '#38bdf8' }}>Total Collateral / Net Worth</span>
              <span className="font-mono" style={{ color: '#38bdf8', fontSize: '1.05rem' }}>{formatINR(totalValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
