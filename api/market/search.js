// api/market/search.js — GET /api/market/search?q=reliance
import { searchStocks } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const q = req.query.q || '';
    const results = await searchStocks(q);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
