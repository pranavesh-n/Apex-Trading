// api/portfolio/funds.js — POST /api/portfolio/update-funds
import { loadUserPortfolio, savePortfolioBalance, initD1Tables } from '../_d1.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const userId = req.headers['x-user-id'] || 'default';
    await initD1Tables();
    const { amount, mode = 'add' } = req.body;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return res.status(400).json({ success: false, error: 'Invalid amount' });

    const portfolio = await loadUserPortfolio(userId) || { cashBalance: 0, initialCapital: 0, realizedPnl: 0 };
    let newBalance;
    if (mode === 'set') {
      newBalance = parsedAmount;
    } else {
      newBalance = (portfolio.cashBalance || 0) + parsedAmount;
    }
    if (newBalance < 0) return res.status(400).json({ success: false, error: 'Balance cannot be negative' });

    await savePortfolioBalance(userId, newBalance, portfolio.initialCapital || newBalance, portfolio.realizedPnl || 0);
    const updated = await loadUserPortfolio(userId);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
