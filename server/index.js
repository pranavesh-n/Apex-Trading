import express from 'express';
import cors from 'cors';
import {
  getQuote,
  getQuotesBatch,
  getHistoricalCandles,
  searchStocks,
  getAllStocks
} from './services/marketData.js';
import {
  initPortfolio,
  getPortfolioSummary,
  placeOrder,
  closePosition,
  resetPortfolio,
  updateCashBalance,
  updateJournalEntry,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  calculateCharges
} from './services/portfolioEngine.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { handleGoogleAuth } from './services/authService.js';
import { 
  createSecureSession, 
  authenticateSession, 
  destroySession 
} from './services/sessionSecurity.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS & Parsing
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 3. Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: 'Order frequency limit exceeded. Please wait a moment.' }
});

// 4. Session Hijacking Defense Middleware
app.use(authenticateSession);

// Initialize persistent portfolio
initPortfolio();

// Top Indian & Global Indices (NSE benchmarks, sectoral indices & major global indices)
const MAJOR_INDICES = [
  '^NSEI',               // Nifty 50
  '^NSEBANK',            // Bank Nifty
  '^BSESN',              // Sensex
  '^NSMIDCP',            // Nifty Next 50
  'NIFTY_MIDCAP_100.NS', // Nifty Midcap 100
  '^CRSLDX',             // Nifty 500
  '^CNX100',             // Nifty 100
  '^CNXIT',              // Nifty IT
  '^CNXAUTO',            // Nifty Auto
  '^CNXPHARMA',          // Nifty Pharma
  '^CNXFMCG',            // Nifty FMCG
  '^CNXENERGY',          // Nifty Energy
  '^CNXREALTY',          // Nifty Realty
  '^CNXMETAL',           // Nifty Metal
  '^CNXINFRA',           // Nifty Infrastructure
  '^CNXFIN',             // Nifty Financial Services
  '^CNXPSUBANK',         // Nifty PSU Bank
  '^CNXSC',              // Nifty Smallcap 100
  '^INDIAVIX',           // India VIX
  '^GSPC',               // S&P 500
  '^IXIC',               // Nasdaq Composite
  '^DJI'                 // Dow Jones
];

/**
 * GET /api/market/indices
 * Returns live status of key Indian benchmarks
 */
app.get('/api/market/indices', async (req, res) => {
  try {
    const data = await getQuotesBatch(MAJOR_INDICES);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/market/quote/:symbol
 */
app.get('/api/market/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const data = await getQuote(symbol);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/market/history/:symbol
 */
app.get('/api/market/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1mo', interval = '1d' } = req.query;
    const data = await getHistoricalCandles(symbol, range, interval);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/market/search?q=...
 */
app.get('/api/market/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const results = await searchStocks(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/market/stocks
 */
app.get('/api/market/stocks', (req, res) => {
  try {
    const stocks = getAllStocks();
    res.json({ success: true, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/market/batch-quotes
 */
app.post('/api/market/batch-quotes', async (req, res) => {
  try {
    const { symbols = [] } = req.body;
    const data = await getQuotesBatch(symbols);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/portfolio
 */
app.get('/api/portfolio', async (req, res) => {
  try {
    const summary = await getPortfolioSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders/calculate-charges
 */
app.post('/api/orders/calculate-charges', (req, res) => {
  try {
    const { product, action, price, qty } = req.body;
    const charges = calculateCharges(product, action, price, qty);
    res.json({ success: true, data: charges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders
 */
app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    const { symbol, action, type, qty, price, product } = req.body;
    
    // Strict input validation
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid stock symbol' });
    }
    const sanitizedQty = parseInt(qty, 10);
    if (!Number.isInteger(sanitizedQty) || sanitizedQty <= 0 || sanitizedQty > 100000) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive integer between 1 and 100,000' });
    }
    const sanitizedPrice = parseFloat(price);
    if (isNaN(sanitizedPrice) || sanitizedPrice < 0) {
      return res.status(400).json({ success: false, error: 'Invalid price specification' });
    }

    const orderResult = await placeOrder({
      ...req.body,
      qty: sanitizedQty,
      price: sanitizedPrice,
      userId: req.user?.id || 'default'
    });
    const summary = await getPortfolioSummary();
    res.json({ success: true, data: orderResult, portfolio: summary });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/positions/:id/close
 */
app.post('/api/positions/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const { exitThesis } = req.body;
    const result = await closePosition(id, exitThesis);
    const summary = await getPortfolioSummary();
    res.json({ success: true, data: result, portfolio: summary });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portfolio/update-funds
 */
app.post('/api/portfolio/update-funds', async (req, res) => {
  try {
    const { amount } = req.body;
    const summary = await updateCashBalance(amount);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portfolio/reset
 */
app.post('/api/portfolio/reset', async (req, res) => {
  try {
    const { capital } = req.body;
    const summary = await resetPortfolio(capital ? parseFloat(capital) : undefined);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/journal/:id
 */
app.patch('/api/journal/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateJournalEntry(id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/watchlists/add
 */
app.post('/api/watchlists/add', (req, res) => {
  try {
    const { watchlistId, symbol } = req.body;
    const watchlists = addSymbolToWatchlist(watchlistId, symbol);
    res.json({ success: true, data: watchlists });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/watchlists/remove
 */
app.post('/api/watchlists/remove', (req, res) => {
  try {
    const { watchlistId, symbol } = req.body;
    const watchlists = removeSymbolFromWatchlist(watchlistId, symbol);
    res.json({ success: true, data: watchlists });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- GOOGLE OAUTH & SECURE SESSION ENDPOINTS ---
app.get('/api/auth/config', (req, res) => {
  res.json({ success: true, clientId: process.env.GOOGLE_CLIENT_ID || '' });
});

app.post('/api/auth/google', authLimiter, async (req, res) => {
  try {
    const { credential, profile } = req.body;
    const user = await handleGoogleAuth({ credential, profile });
    
    // Create HttpOnly session with cryptographic device fingerprint
    const { sessionId } = await createSecureSession(req, res, user);
    
    res.json({ 
      success: true, 
      data: { 
        user,
        sessionId 
      } 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  // Populated by authenticateSession anti-hijacking middleware
  res.json({ success: true, user: req.user || null });
});

app.post('/api/auth/logout', async (req, res) => {
  await destroySession(req, res);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Indian Equities Paper Trading API running on http://localhost:${PORT}`);
});
