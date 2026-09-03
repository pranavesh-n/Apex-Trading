// Shared D1 client for Vercel serverless functions
// Calls Cloudflare D1 via REST API - works from any host

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export const isD1Configured = () =>
  !!(ACCOUNT_ID && DATABASE_ID && API_TOKEN && API_TOKEN.trim().length > 10);

const D1_ENDPOINT = () =>
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

export async function queryD1(sql, params = []) {
  if (!isD1Configured()) return null;
  try {
    const res = await fetch(D1_ENDPOINT(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params })
    });
    const json = await res.json();
    if (json.success && json.result?.[0]) return json.result[0].results || [];
    console.error('D1 error:', JSON.stringify(json.errors));
    return [];
  } catch (err) {
    console.error('D1 fetch error:', err.message);
    return null;
  }
}

export async function initD1Tables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      initial_capital REAL DEFAULT 0,
      cash_balance REAL DEFAULT 0,
      realized_pnl REAL DEFAULT 0,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      symbol TEXT,
      name TEXT,
      qty INTEGER,
      avg_price REAL,
      total_invested REAL
    )`,
    `CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      symbol TEXT,
      name TEXT,
      type TEXT,
      product TEXT,
      qty INTEGER,
      entry_price REAL,
      stop_loss REAL,
      target REAL,
      thesis TEXT,
      timestamp TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      symbol TEXT,
      name TEXT,
      action TEXT,
      order_type TEXT,
      product TEXT,
      qty INTEGER,
      price REAL,
      executed_price REAL,
      status TEXT,
      charges REAL,
      thesis TEXT,
      timestamp TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS journal (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      order_id TEXT,
      symbol TEXT,
      entry_date TEXT,
      exit_date TEXT,
      entry_price REAL,
      exit_price REAL,
      qty INTEGER,
      pnl REAL,
      thesis TEXT,
      strategy TEXT,
      rating INTEGER,
      lessons TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS watchlists (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      symbols TEXT DEFAULT '[]'
    )`
  ];
  for (const sql of tables) {
    await queryD1(sql, []);
  }
}

export async function loadUserPortfolio(userId) {
  if (!isD1Configured()) return null;

  const [portfolioRows, holdingRows, positionRows, orderRows, journalRows, watchlistRows] =
    await Promise.all([
      queryD1('SELECT * FROM portfolio WHERE id = ?', [userId]),
      queryD1('SELECT * FROM holdings WHERE user_id = ?', [userId]),
      queryD1('SELECT * FROM positions WHERE user_id = ?', [userId]),
      queryD1('SELECT * FROM orders WHERE user_id = ? ORDER BY timestamp DESC', [userId]),
      queryD1('SELECT * FROM journal WHERE user_id = ? ORDER BY rowid DESC', [userId]),
      queryD1('SELECT * FROM watchlists WHERE user_id = ?', [userId])
    ]);

  const p = portfolioRows?.[0];
  return {
    initialCapital: p?.initial_capital || 0,
    cashBalance: p?.cash_balance || 0,
    realizedPnl: p?.realized_pnl || 0,
    holdings: (holdingRows || []).map(h => ({
      symbol: h.symbol, name: h.name, qty: h.qty,
      avgPrice: h.avg_price, totalInvested: h.total_invested
    })),
    positions: (positionRows || []).map(pos => ({
      id: pos.id, symbol: pos.symbol, name: pos.name, type: pos.type,
      product: pos.product, qty: pos.qty, entryPrice: pos.entry_price,
      stopLoss: pos.stop_loss, target: pos.target, thesis: pos.thesis, timestamp: pos.timestamp
    })),
    orders: (orderRows || []).map(o => ({
      id: o.id, symbol: o.symbol, name: o.name, type: o.action,
      orderType: o.order_type, product: o.product, qty: o.qty,
      price: o.price, executedPrice: o.executed_price, status: o.status,
      charges: o.charges, thesis: o.thesis, timestamp: o.timestamp
    })),
    journal: (journalRows || []).map(j => ({
      id: j.id, orderId: j.order_id, symbol: j.symbol, entryDate: j.entry_date,
      exitDate: j.exit_date, entryPrice: j.entry_price, exitPrice: j.exit_price,
      qty: j.qty, pnl: j.pnl, thesis: j.thesis, strategy: j.strategy,
      rating: j.rating, lessons: j.lessons
    })),
    watchlists: (watchlistRows || []).length > 0
      ? (watchlistRows || []).map(w => {
          let symbols = [];
          try { symbols = JSON.parse(w.symbols); } catch {}
          return { id: w.id.replace(`${userId}_`, ''), name: w.name, symbols };
        })
      : [
          { id: 'default', name: 'Watchlist 1', symbols: [] },
          { id: 'wl-2', name: 'Watchlist 2', symbols: [] },
          { id: 'wl-3', name: 'Watchlist 3', symbols: [] },
          { id: 'wl-4', name: 'Watchlist 4', symbols: [] },
          { id: 'wl-5', name: 'Watchlist 5', symbols: [] }
        ]
  };
}

export async function savePortfolioBalance(userId, cashBalance, initialCapital, realizedPnl) {
  await queryD1(
    `INSERT INTO portfolio (id, initial_capital, cash_balance, realized_pnl, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       initial_capital = excluded.initial_capital,
       cash_balance = excluded.cash_balance,
       realized_pnl = excluded.realized_pnl,
       updated_at = excluded.updated_at`,
    [userId, initialCapital, cashBalance, realizedPnl]
  );
}

export async function upsertOrder(userId, order) {
  await queryD1(
    `INSERT INTO orders (id, user_id, symbol, name, action, order_type, product, qty, price, executed_price, status, charges, thesis, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status`,
    [order.id, userId, order.symbol, order.name, order.type, order.orderType, order.product,
     order.qty, order.price, order.executedPrice, order.status, order.charges, order.thesis, order.timestamp]
  );
}

export async function upsertPosition(userId, pos) {
  await queryD1(
    `INSERT INTO positions (id, user_id, symbol, name, type, product, qty, entry_price, stop_loss, target, thesis, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET qty = excluded.qty, stop_loss = excluded.stop_loss, target = excluded.target`,
    [pos.id, userId, pos.symbol, pos.name, pos.type, pos.product, pos.qty,
     pos.entryPrice, pos.stopLoss, pos.target, pos.thesis, pos.timestamp]
  );
}

export async function deletePosition(userId, positionId) {
  await queryD1('DELETE FROM positions WHERE id = ? AND user_id = ?', [positionId, userId]);
}

export async function upsertHolding(userId, holding) {
  if (holding.qty <= 0) {
    await queryD1('DELETE FROM holdings WHERE symbol = ? AND user_id = ?', [holding.symbol, userId]);
  } else {
    await queryD1(
      `INSERT INTO holdings (id, user_id, symbol, name, qty, avg_price, total_invested)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET qty = excluded.qty, avg_price = excluded.avg_price, total_invested = excluded.total_invested`,
      [`${userId}_${holding.symbol}`, userId, holding.symbol, holding.name,
       holding.qty, holding.avgPrice, holding.totalInvested]
    );
  }
}

export async function upsertWatchlist(userId, watchlist) {
  await queryD1(
    `INSERT INTO watchlists (id, user_id, name, symbols)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, symbols = excluded.symbols`,
    [`${userId}_${watchlist.id}`, userId, watchlist.name, JSON.stringify(watchlist.symbols || [])]
  );
}

export async function upsertJournalEntry(userId, entry) {
  await queryD1(
    `INSERT INTO journal (id, user_id, order_id, symbol, entry_date, exit_date, entry_price, exit_price, qty, pnl, thesis, strategy, rating, lessons)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET exit_date = excluded.exit_date, exit_price = excluded.exit_price,
       pnl = excluded.pnl, strategy = excluded.strategy, rating = excluded.rating, lessons = excluded.lessons`,
    [entry.id, userId, entry.orderId, entry.symbol, entry.entryDate, entry.exitDate,
     entry.entryPrice, entry.exitPrice, entry.qty, entry.pnl, entry.thesis,
     entry.strategy, entry.rating, entry.lessons]
  );
}

export async function clearUserData(userId) {
  await Promise.all([
    queryD1('DELETE FROM portfolio WHERE id = ?', [userId]),
    queryD1('DELETE FROM holdings WHERE user_id = ?', [userId]),
    queryD1('DELETE FROM positions WHERE user_id = ?', [userId]),
    queryD1('DELETE FROM orders WHERE user_id = ?', [userId]),
    queryD1('DELETE FROM journal WHERE user_id = ?', [userId]),
    queryD1('DELETE FROM watchlists WHERE user_id = ?', [userId])
  ]);
}
