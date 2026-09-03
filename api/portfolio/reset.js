// api/portfolio/reset.js — POST /api/portfolio/reset
import { clearUserData, savePortfolioBalance, initD1Tables } from '../_d1.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const userId = req.headers['x-user-id'] || 'default';
    await initD1Tables();
    const { capital } = req.body;
    const newCapital = capital ? parseFloat(capital) : 100000;
    await clearUserData(userId);
    await savePortfolioBalance(userId, newCapital, newCapital, 0);
    res.json({
      success: true,
      data: {
        cashBalance: newCapital,
        initialCapital: newCapital,
        realizedPnl: 0,
        holdings: [],
        positions: [],
        orders: [],
        journal: [],
        watchlists: [
          { id: 'default', name: 'Watchlist 1', symbols: [] },
          { id: 'wl-2', name: 'Watchlist 2', symbols: [] },
          { id: 'wl-3', name: 'Watchlist 3', symbols: [] },
          { id: 'wl-4', name: 'Watchlist 4', symbols: [] },
          { id: 'wl-5', name: 'Watchlist 5', symbols: [] }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
