import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export const isD1Configured = () => {
  return !!(
    ACCOUNT_ID &&
    DATABASE_ID &&
    API_TOKEN &&
    API_TOKEN !== 'PASTE_YOUR_CLOUDFLARE_API_TOKEN_HERE' &&
    API_TOKEN.trim().length > 10
  );
};

const getEndpoint = () => {
  return `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
};

/**
 * Execute a single or batch SQL query on Cloudflare D1
 * @param {string} sql - SQL statement
 * @param {Array} params - query parameters
 */
export async function queryD1(sql, params = []) {
  if (!isD1Configured()) {
    return null;
  }

  try {
    const res = await axios.post(
      getEndpoint(),
      { sql, params },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN.trim()}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (res.data?.success && res.data.result?.[0]) {
      return res.data.result[0].results || [];
    }
    return [];
  } catch (err) {
    console.error('Cloudflare D1 Query Error:', err.response?.data || err.message);
    return null;
  }
}

/**
 * Sync in-memory state to Cloudflare D1 for a specific user space
 */
export async function syncStateToD1(state, userId = 'default') {
  if (!isD1Configured()) return false;

  try {
    // 1. Sync Portfolio Balance
    await queryD1(
      `INSERT INTO portfolio (id, initial_capital, cash_balance, realized_pnl, updated_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET 
         initial_capital = excluded.initial_capital,
         cash_balance = excluded.cash_balance,
         realized_pnl = excluded.realized_pnl,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, state.initialCapital || 0, state.cashBalance || 0, state.realizedPnl || 0]
    );

    // 2. Sync Watchlists for this specific user
    for (const wl of (state.watchlists || [])) {
      const scopedId = `${userId}_${wl.id}`;
      await queryD1(
        `INSERT INTO watchlists (id, name, symbols) 
         VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET 
           name = excluded.name,
           symbols = excluded.symbols`,
        [scopedId, wl.name, JSON.stringify(wl.symbols || [])]
      );
    }

    return true;
  } catch (err) {
    console.error(`Failed to sync user ${userId} state to D1:`, err.message);
    return false;
  }
}

/**
 * Load portfolio state from Cloudflare D1 for a specific user
 */
export async function loadStateFromD1(userId = 'default') {
  if (!isD1Configured()) return null;

  try {
    const portfolioRows = await queryD1('SELECT * FROM portfolio WHERE id = ?', [userId]);
    const watchlistRows = await queryD1('SELECT * FROM watchlists WHERE id LIKE ?', [`${userId}_%`]);
    const orderRows = await queryD1('SELECT * FROM orders ORDER BY timestamp DESC');
    const positionRows = await queryD1('SELECT * FROM positions');
    const holdingRows = await queryD1('SELECT * FROM holdings');
    const journalRows = await queryD1('SELECT * FROM journal ORDER BY rowid DESC');

    if (!portfolioRows || portfolioRows.length === 0) return null;

    const p = portfolioRows[0];
    const watchlists = (watchlistRows || []).map(r => {
      let symbols = [];
      try { symbols = JSON.parse(r.symbols); } catch { symbols = []; }
      const cleanId = r.id.replace(`${userId}_`, '');
      return { id: cleanId, name: r.name, symbols };
    });

    return {
      initialCapital: p.initial_capital || 0,
      cashBalance: p.cash_balance || 0,
      realizedPnl: p.realized_pnl || 0,
      settings: {
        enableCharges: true,
        defaultProduct: 'CNC',
        slippagePct: 0.05
      },
      holdings: (holdingRows || []).map(h => ({
        symbol: h.symbol,
        name: h.name,
        qty: h.qty,
        avgPrice: h.avg_price,
        totalInvested: h.total_invested
      })),
      positions: (positionRows || []).map(pos => ({
        id: pos.id,
        symbol: pos.symbol,
        name: pos.name,
        type: pos.type,
        product: pos.product,
        qty: pos.qty,
        entryPrice: pos.entry_price,
        stopLoss: pos.stop_loss,
        target: pos.target,
        thesis: pos.thesis,
        timestamp: pos.timestamp
      })),
      orders: (orderRows || []).map(o => ({
        id: o.id,
        symbol: o.symbol,
        name: o.name,
        type: o.action,
        orderType: o.order_type,
        product: o.product,
        qty: o.qty,
        price: o.price,
        executedPrice: o.executed_price,
        status: o.status,
        charges: o.charges,
        thesis: o.thesis,
        timestamp: o.timestamp
      })),
      journal: (journalRows || []).map(j => ({
        id: j.id,
        orderId: j.order_id,
        symbol: j.symbol,
        entryDate: j.entry_date,
        exitDate: j.exit_date,
        entryPrice: j.entry_price,
        exitPrice: j.exit_price,
        qty: j.qty,
        pnl: j.pnl,
        thesis: j.thesis,
        strategy: j.strategy,
        rating: j.rating,
        lessons: j.lessons
      })),
      watchlists: watchlists.length > 0 ? watchlists : [
        { id: 'default', name: 'Watchlist 1', symbols: [] },
        { id: 'wl-2', name: 'Watchlist 2', symbols: [] },
        { id: 'wl-3', name: 'Watchlist 3', symbols: [] },
        { id: 'wl-4', name: 'Watchlist 4', symbols: [] },
        { id: 'wl-5', name: 'Watchlist 5', symbols: [] }
      ]
    };
  } catch (err) {
    console.error('Error loading state from D1:', err.message);
    return null;
  }
}
