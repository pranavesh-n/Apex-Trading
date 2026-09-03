// api/market/stocks.js — GET /api/market/stocks
import { getAllStocks } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const stocks = getAllStocks();
    res.json({ success: true, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
