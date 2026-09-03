// api/portfolio/index.js — GET /api/portfolio
// Loads portfolio state from Cloudflare D1 for the authenticated user

import { loadUserPortfolio, initD1Tables } from '../_d1.js';
import { getQuote } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const userId = req.headers['x-user-id'] || 'default';
    await initD1Tables();
    const portfolio = await loadUserPortfolio(userId);

    if (!portfolio) {
      return res.json({
        success: true,
        data: {
          initialCapital: 0,
          cashBalance: 0,
          realizedPnl: 0,
          unrealizedPnl: 0,
          totalPortfolioValue: 0,
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
    }

    // Enrich positions with live prices
    let unrealizedPnl = 0;
    const enrichedPositions = await Promise.all(
      (portfolio.positions || []).map(async (pos) => {
        try {
          const q = await getQuote(pos.symbol);
          const ltp = q?.price || pos.entryPrice;
          const pnl = pos.type === 'BUY'
            ? (ltp - pos.entryPrice) * pos.qty
            : (pos.entryPrice - ltp) * pos.qty;
          unrealizedPnl += pnl;
          return { ...pos, ltp, unrealizedPnl: pnl };
        } catch {
          return { ...pos, ltp: pos.entryPrice, unrealizedPnl: 0 };
        }
      })
    );

    // Enrich holdings with live prices
    const enrichedHoldings = await Promise.all(
      (portfolio.holdings || []).map(async (h) => {
        try {
          const q = await getQuote(h.symbol);
          const ltp = q?.price || h.avgPrice;
          const currentValue = ltp * h.qty;
          const pnl = currentValue - h.totalInvested;
          return { ...h, ltp, currentValue, pnl };
        } catch {
          return { ...h, ltp: h.avgPrice, currentValue: h.avgPrice * h.qty, pnl: 0 };
        }
      })
    );

    const holdingsValue = enrichedHoldings.reduce((s, h) => s + (h.currentValue || 0), 0);

    res.json({
      success: true,
      data: {
        ...portfolio,
        positions: enrichedPositions,
        holdings: enrichedHoldings,
        unrealizedPnl,
        totalPortfolioValue: portfolio.cashBalance + holdingsValue + unrealizedPnl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
