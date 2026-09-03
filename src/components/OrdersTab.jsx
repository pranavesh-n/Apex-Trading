import React, { useState } from 'react';
import { ListOrdered, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { formatINR, formatDate, formatQty } from '../utils/formatters';

export default function OrdersTab({ orders }) {
  const [filter, setFilter] = useState('ALL');

  const filteredOrders = (orders || []).filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Order Book & History ({orders?.length || 0})
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Simulated Indian Exchange Order Executions
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          {['ALL', 'EXECUTED', 'PENDING', 'CANCELLED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#1e293b' : 'transparent',
                color: filter === f ? '#38bdf8' : '#64748b',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          No orders found matching the filter.
        </div>
      ) : (
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Order ID</th>
              <th>Instrument</th>
              <th>Action</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Executed Price</th>
              <th>Charges</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => {
              const isBuy = o.action === 'BUY';
              return (
                <tr key={o.id}>
                  <td style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {formatDate(o.timestamp)}
                  </td>
                  <td className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {o.id.split('-').slice(0, 2).join('-')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#f1f5f9' }}>
                      {o.symbol.replace('.NS', '')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {o.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 700,
                      background: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: isBuy ? '#10b981' : '#f43f5e'
                    }}>
                      {o.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {o.product}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1' }}>
                    {o.orderType}
                  </td>
                  <td className="font-mono" style={{ fontWeight: 600 }}>
                    {formatQty(o.qty)}
                  </td>
                  <td className="font-mono">
                    {formatINR(o.price)}
                  </td>
                  <td className="font-mono" style={{ fontWeight: 700, color: '#38bdf8' }}>
                    {o.executedPrice ? formatINR(o.executedPrice) : '-'}
                  </td>
                  <td className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {formatINR(o.charges || 0)}
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem', 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      fontWeight: 700,
                      background: o.status === 'EXECUTED' ? 'rgba(16, 185, 129, 0.12)' : o.status === 'PENDING' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                      color: o.status === 'EXECUTED' ? '#10b981' : o.status === 'PENDING' ? '#f59e0b' : '#f43f5e'
                    }}>
                      {o.status === 'EXECUTED' && <CheckCircle2 size={11} />}
                      {o.status === 'PENDING' && <Clock size={11} />}
                      {o.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
