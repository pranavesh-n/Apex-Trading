// api/market/history.js — GET /api/market/history?symbol=RELIANCE.NS&range=1mo&interval=1d
import { getHistoricalCandles } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { symbol, range = '1mo', interval = '1d' } = req.query;
    if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });
    const data = await getHistoricalCandles(symbol, range, interval);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
