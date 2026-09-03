// api/market/batch-quotes.js — POST /api/market/batch-quotes
import { getQuotesBatch } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { symbols = [] } = req.body;
    const data = await getQuotesBatch(symbols);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
