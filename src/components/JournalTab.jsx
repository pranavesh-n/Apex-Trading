import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Tag, 
  Save, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  Filter, 
  CheckCircle2,
  Award
} from 'lucide-react';
import { formatINR, formatPercent, formatDate } from '../utils/formatters';

export default function JournalTab({ journal, onUpdateJournal }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'WIN' | 'LOSS'
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState({});
  const [saveSuccessId, setSaveSuccessId] = useState(null);

  const filteredEntries = (journal || []).filter(entry => {
    if (filter === 'WIN') return entry.pnl > 0;
    if (filter === 'LOSS') return entry.pnl < 0;
    return true;
  });

  const handleSaveLesson = async (id) => {
    const lessonText = editNotes[id];
    if (lessonText !== undefined && onUpdateJournal) {
      await onUpdateJournal(id, { lessons: lessonText });
      setSaveSuccessId(id);
      setTimeout(() => setSaveSuccessId(null), 3000);
      setEditingId(null);
    }
  };

  const totalTrades = journal?.length || 0;
  const wins = journal?.filter(j => j.pnl > 0).length || 0;
  const losses = journal?.filter(j => j.pnl < 0).length || 0;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Mindset Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(14, 21, 36, 0.9), rgba(10, 16, 28, 0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '6px', borderRadius: '8px', color: '#06b6d4' }}>
                <BookOpen size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Individual Stock Picking & Strategy Journal
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, maxWidth: '650px' }}>
              Review every stock pick, validate your entry thesis, study post-trade outcomes, and log actionable lessons to continuously refine your edge in the Indian equity markets.
            </p>
          </div>

          {/* Quick Win/Loss Stats */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', padding: '8px 14px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Stock Picks</div>
              <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{totalTrades}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 14px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#86efac' }}>Win Rate</div>
              <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{winRate}%</div>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '8px 14px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd' }}>Wins / Losses</div>
              <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa' }}>{wins}W - {losses}L</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'ALL', label: 'All Stock Picks' },
            { id: 'WIN', label: 'Profitable Trades (Wins)' },
            { id: 'LOSS', label: 'Losing Trades (Losses)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                background: filter === tab.id ? '#1e293b' : 'transparent',
                color: filter === tab.id ? '#38bdf8' : '#64748b',
                border: `1px solid ${filter === tab.id ? '#334155' : 'transparent'}`,
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Cards List */}
      {filteredEntries.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <Sparkles size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '6px' }}>No Journal Entries in this category</h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
            When you exit or square off a position in your paper portfolio, a full trade analysis card will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredEntries.map(entry => {
            const isWin = entry.pnl > 0;
            const isEditing = editingId === entry.id;
            const currentLesson = editNotes[entry.id] !== undefined ? editNotes[entry.id] : (entry.lessons || '');

            return (
              <div 
                key={entry.id} 
                className="glass-panel" 
                style={{ 
                  padding: '20px', 
                  borderLeft: `4px solid ${isWin ? '#10b981' : '#f43f5e'}`,
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Entry Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                        {entry.symbol.replace('.NS', '')}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {entry.product || 'CNC'}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '12px' }}>
                        {entry.sector || 'Equities'}
                      </span>
                      {entry.tags && entry.tags.map((t, idx) => (
                        <span key={idx} style={{ fontSize: '0.68rem', background: 'rgba(6, 182, 212, 0.12)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {entry.name} • {entry.qty} shares
                    </div>
                  </div>

                  {/* P&L Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div className={`font-mono ${isWin ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                      {formatINR(entry.pnl, true)}
                    </div>
                    <div className={`font-mono ${isWin ? 'profit-text' : 'loss-text'}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {formatPercent(entry.pnlPct)} return
                    </div>
                  </div>
                </div>

                {/* Numbers Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', background: '#090d16', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #1a2333' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Entry Price</div>
                    <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{formatINR(entry.entryPrice)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Exit Price</div>
                    <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{formatINR(entry.exitPrice)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Taxes & Charges</div>
                    <div className="font-mono" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{formatINR(entry.charges || 0)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Entry Date</div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{formatDate(entry.entryDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Exit Date</div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{formatDate(entry.exitDate)}</div>
                  </div>
                </div>

                {/* Thesis & Exit Analysis */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Initial Stock Picking Thesis
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                      {entry.thesis || 'No initial thesis recorded.'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Exit Rationale
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                      {entry.exitThesis || 'Closed manually or hit exit order.'}
                    </div>
                  </div>
                </div>

                {/* Lessons Learned & Self-Reflection */}
                <div style={{ background: '#0a0f1b', padding: '12px 14px', borderRadius: '8px', border: '1px solid #202b3f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} /> LESSONS LEARNED & STOCK PICKING FEEDBACK
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditNotes({ ...editNotes, [entry.id]: entry.lessons || '' });
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {entry.lessons ? 'Edit Reflection' : '+ Add Stock Picking Note'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div>
                      <textarea
                        value={currentLesson}
                        onChange={(e) => setEditNotes({ ...editNotes, [entry.id]: e.target.value })}
                        placeholder="What did you learn from this pick? (e.g. Bought too close to resistance, held through earnings properly, respected stop loss)"
                        rows={2}
                        style={{
                          width: '100%',
                          background: '#070a11',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#fff',
                          padding: '8px 10px',
                          fontSize: '0.825rem',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveLesson(entry.id)}
                          className="btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        >
                          <Save size={13} /> Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.825rem', color: entry.lessons ? '#cbd5e1' : '#64748b', fontStyle: entry.lessons ? 'normal' : 'italic' }}>
                      {entry.lessons || 'No review added yet. Click "+ Add Stock Picking Note" to capture what worked or didn\'t.'}
                    </div>
                  )}

                  {saveSuccessId === entry.id && (
                    <div style={{ color: '#86efac', fontSize: '0.75rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Saved note to journal!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
