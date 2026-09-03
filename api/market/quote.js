// api/market/quote.js — GET /api/market/quote?symbol=RELIANCE.NS
import { getQuote } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const symbol = req.query.symbol || req.url?.split('?')[0].split('/').pop();
    if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });
    const data = await getQuote(symbol);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
