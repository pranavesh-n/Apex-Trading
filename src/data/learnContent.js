/**
 * Learn Academy — Structured trading education content for Indian markets.
 * Covers market basics, order types, charts, risk management, and delivery investing.
 */

export const LEARN_MODULES = [
  {
    id: 'basics',
    title: 'Market Basics',
    icon: 'building',
    description: 'What the stock market is, how NSE/BSE work, and why prices move.',
    lessons: [
      {
        id: 'what-is-market',
        title: 'What is the Stock Market?',
        minutes: 5,
        sections: [
          {
            heading: 'Buying a piece of a company',
            body: 'A share of stock is a tiny ownership stake in a company. When you buy 1 share of Reliance Industries, you own a small part of India\u2019s largest private company. If the company grows and earns profits, the value of your ownership usually grows too.',
          },
          {
            heading: 'Where trading happens',
            body: 'In India, shares are bought and sold on two main exchanges \u2014 the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE). You never buy directly from the exchange; a broker (like Zerodha, Groww, or Upstox) places your orders on the exchange on your behalf. Your shares are held safely in digital form in a Demat account.',
          },
          {
            heading: 'Who is on the other side?',
            body: 'Every trade has two sides: someone buying and someone selling. The market is a constant auction \u2014 buyers bid and sellers ask. The price you see (the Last Traded Price or LTP) is simply the price of the most recent completed trade.',
          },
        ],
        keyPoints: [
          'A share = real ownership in a real business',
          'NSE and BSE are India\u2019s two exchanges; brokers connect you to them',
          'Demat account holds your shares electronically',
          'LTP is the price of the last completed trade',
        ],
        tryIt: { label: 'Explore any stock in the Terminal', tab: 'terminal' },
      },
      {
        id: 'indices',
        title: 'NSE, BSE & Index Essentials',
        minutes: 6,
        sections: [
          {
            heading: 'What is an index?',
            body: 'An index is a basket of stocks that represents a part of the market. The NIFTY 50 tracks the 50 largest companies on the NSE; the SENSEX tracks 30 giants on the BSE. When people say \u201cthe market went up 1%\u201d, they usually mean an index moved.',
          },
          {
            heading: 'Sectoral indices',
            body: 'Beyond the headline indices, sector indices track specific industries: NIFTY IT (technology), NIFTY BANK (banks), NIFTY PHARMA, NIFTY AUTO, NIFTY FMCG, NIFTY ENERGY, NIFTY REALTY and more. Comparing a stock with its sector index tells you whether it is outperforming or underperforming its peers.',
          },
          {
            heading: 'Market-cap segments',
            body: 'Companies are grouped by size: Large Cap (top ~100 companies \u2014 the most stable), Mid Cap (next ~150 \u2014 growing but riskier), and Small Cap (the rest \u2014 highest risk and highest potential reward). There are dedicated indices like NIFTY MIDCAP 100 and NIFTY SMALLCAP 100 for these segments.',
          },
        ],
        keyPoints: [
          'NIFTY 50 = top 50 NSE companies; SENSEX = top 30 BSE companies',
          'Sector indices (IT, Bank, Pharma\u2026) benchmark specific industries',
          'Large Cap \u2248 safer, Small Cap \u2248 riskier with bigger swings',
        ],
        tryIt: { label: 'Browse all Indian indices', tab: 'dashboard' },
      },
      {
        id: 'why-prices-move',
        title: 'Why Do Prices Move?',
        minutes: 5,
        sections: [
          {
            heading: 'Supply and demand',
            body: 'Prices move when demand (buyers) and supply (sellers) fall out of balance. Good news brings more buyers than sellers \u2014 price rises. Bad news brings more sellers \u2014 price falls. Everything else (news, results, rumours, global markets) works through this simple mechanism.',
          },
          {
            heading: 'Common price drivers',
            body: 'Quarterly results (profit growth), interest rate decisions by RBI, crude oil prices, government budgets and policies, global markets (US markets, Asian peers), and company-specific events like orders, mergers, or management changes.',
          },
          {
            heading: 'Volatility is normal',
            body: 'Even strong companies fall 5\u201310% in a bad month. That is normal market behaviour, not necessarily a broken investment thesis. Beginners often panic-sell dips and buy tops \u2014 understanding that volatility is the price of returns is a crucial first lesson.',
          },
        ],
        keyPoints: [
          'Price = the meeting point of buyers and sellers',
          'Results, RBI policy, crude, and global cues drive daily moves',
          'Volatility is normal; panic decisions are the real risk',
        ],
      },
    ],
  },
  {
    id: 'first-trade',
    title: 'Your First Trade',
    icon: 'rocket',
    description: 'Reading quotes, order types, CNC vs MIS, and real charges.',
    lessons: [
      {
        id: 'reading-quote',
        title: 'Reading a Quote & Order Window',
        minutes: 6,
        sections: [
          {
            heading: 'The quote screen',
            body: 'Every stock page shows: LTP (last traded price), Open (first trade of the day), High/Low (day range), Prev Close, Volume (shares traded today) and 52-week high/low. The Day Range slider shows where the current price sits between today\u2019s low and high.',
          },
          {
            heading: 'Market depth (bid/ask)',
            body: 'Below the chart, Market Depth shows the 5 best buy orders (bids) and 5 best sell orders (asks) with quantities. The gap between the best bid and best ask is the spread \u2014 in liquid NSE stocks it is usually just a few paise.',
          },
          {
            heading: 'The order window',
            body: 'To place an order you choose: Quantity, Product (CNC or MIS), Order Type (MARKET, LIMIT, SL), and optionally a Trigger/Stop-loss price. In this app the Order Ticket also shows estimated charges before you submit \u2014 always check the \u201cTotal Required\u201d line.',
          },
        ],
        keyPoints: [
          'LTP, Open, High, Low, Prev Close, Volume are the six key quote numbers',
          'Market depth shows real buyer/seller queues; spread is the tiny bid-ask gap',
          'Always review estimated charges before submitting an order',
        ],
        tryIt: { label: 'Open the Terminal to read a live quote', tab: 'terminal' },
      },
      {
        id: 'order-types',
        title: 'Order Types: MARKET, LIMIT, SL',
        minutes: 6,
        sections: [
          {
            heading: 'Market order',
            body: 'Executes immediately at the best available price. Use it when you want in or out now and the stock is liquid (large caps). Risk: in fast markets your fill can be a little worse than the price you saw.',
          },
          {
            heading: 'Limit order',
            body: 'You specify the exact price. A buy limit executes only at your price or lower; a sell limit only at your price or higher. It may not execute at all if the price never reaches your level \u2014 you trade certainty of price for uncertainty of execution.',
          },
          {
            heading: 'Stop-loss (SL) order',
            body: 'A stop-loss triggers a market/limit order only when price touches your trigger level. Investors use SL orders to automatically exit a position if it falls below a level they can tolerate \u2014 an essential risk tool you will meet again in the Risk module.',
          },
        ],
        keyPoints: [
          'MARKET = execute now; LIMIT = execute at my price; SL = execute if price hits trigger',
          'Limit orders guarantee price, not execution',
          'Stop-loss orders automate your exit plan',
        ],
        tryIt: { label: 'Try placing a LIMIT order in the Terminal', tab: 'terminal' },
      },
      {
        id: 'cnc-vs-mis',
        title: 'Delivery (CNC) vs Intraday (MIS)',
        minutes: 7,
        sections: [
          {
            heading: 'CNC \u2014 Cash & Carry (Delivery)',
            body: 'When you buy with CNC, the shares are delivered into your Demat account by the next trading day (T+1 settlement) and they are truly yours \u2014 dividends, bonuses and splits all come to you. You can hold for years. Delivery buys need full money; there is no leverage, and Zerodha-style brokers charge zero brokerage on delivery.',
          },
          {
            heading: 'MIS \u2014 Margin Intraday Square-off',
            body: 'MIS is intraday leverage: you can trade with ~5x your cash, but the position must be closed the same day (brokers auto square-off around 3:20 PM if you forget). It is a trader\u2019s tool \u2014 fast profits, fast losses. Beginners should treat MIS carefully because leverage magnifies both.',
          },
          {
            heading: 'Which should you use?',
            body: 'If your goal is learning to invest \u2014 build a portfolio, hold quality companies, earn dividends \u2014 use CNC. Use MIS only when you consciously want to day-trade a setup you have studied. In this app, choose the product in the Order Ticket and the correct charges and margins are applied automatically.',
          },
        ],
        keyPoints: [
          'CNC = real delivery to Demat, hold for years, zero brokerage, no leverage',
          'MIS = 5x leverage intraday, must exit same day, bigger risk',
          'Beginners should start with CNC delivery trades',
        ],
        tryIt: { label: 'Place a CNC delivery order (Beginner practice)', tab: 'terminal' },
      },
      {
        id: 'charges',
        title: 'Brokerage, STT & Real Charges',
        minutes: 5,
        sections: [
          {
            heading: 'What you actually pay',
            body: 'An Indian equity trade attracts: Brokerage (zero on delivery at discount brokers; ~0.03% intraday), STT (0.1% both sides on delivery), Exchange transaction charges (~0.003%), SEBI charges (\u20b910/crore), GST (18% on brokerage+transaction), and Stamp Duty (0.015% on buy). This app computes all of them on every order \u2014 watch the charges line when you trade.',
          },
          {
            heading: 'Why small trades are expensive',
            body: 'Fixed-ish components (minimum brokerage, GST) mean a \u20b92,000 trade can cost proportionally more than a \u20b92,00,000 trade. Frequent small intraday trades quietly bleed capital through charges \u2014 one reason over-trading destroys beginner accounts.',
          },
          {
            heading: 'Taxes on profit',
            body: 'Held over 1 year \u2192 Long-Term Capital Gains (12.5% above \u20b91.25 lakh/year). Sold within 1 year \u2192 Short-Term (20%). Another reason patient delivery investing is tax-efficient.',
          },
        ],
        keyPoints: [
          'Charges: brokerage, STT, exchange, SEBI, GST, stamp duty',
          'Delivery (CNC) has zero brokerage; STT 0.1% applies',
          'Holding >1 year gets the lower long-term tax rate',
        ],
      },
    ],
  },
  {
    id: 'charts',
    title: 'Reading Charts',
    icon: 'chart',
    description: 'Candlesticks, moving averages, volume and market depth.',
    lessons: [
      {
        id: 'candlesticks',
        title: 'Candlesticks in 5 Minutes',
        minutes: 5,
        sections: [
          {
            heading: 'One candle = one time period',
            body: 'Each candle shows 4 prices for its period (a day on the 1D chart, a month on the 1M chart): Open, High, Low and Close (OHLC). The body spans open\u2192close; the thin wicks show the high and low extremes.',
          },
          {
            heading: 'Green vs red',
            body: 'A green candle closed higher than it opened (buyers won); a red candle closed lower (sellers won). On Indian apps green = up, red = down. A long green candle with small wicks shows strong buying; a small body with long wicks shows indecision.',
          },
          {
            heading: 'How to practice',
            body: 'Switch timeframes in this app\u2019s chart (1D, 5D, 1M, 6M, 1Y) and hover over candles \u2014 the O/H/L/C readout appears at the top. Try to predict what the next candle might look like based on the trend, then check. Chart-reading intuition builds with exactly this kind of repetition.',
          },
        ],
        keyPoints: [
          'Candle = OHLC of one period; body = open\u2192close, wicks = extremes',
          'Green = close above open; red = close below open',
          'Use the hover readout on the app chart to study OHLC',
        ],
        tryIt: { label: 'Study candles on the live chart', tab: 'terminal' },
      },
      {
        id: 'indicators',
        title: 'EMAs & Volume',
        minutes: 6,
        sections: [
          {
            heading: 'Moving averages smooth noise',
            body: 'An EMA (Exponential Moving Average) is the average of recent prices, weighting recent ones more. The app chart overlays EMA 20 (short-term trend) and EMA 50 (medium-term trend). Price above a rising EMA 20 = short-term uptrend; price below a falling EMA 50 = medium-term weakness.',
          },
          {
            heading: 'Crossovers',
            body: 'When EMA 20 crosses above EMA 50, short-term momentum is turning positive (a \u201cgolden cross\u201d pattern); the reverse signals weakness. No indicator is magic \u2014 they lag price and fail in sideways markets. Use them as context, not as auto-signals.',
          },
          {
            heading: 'Volume confirms moves',
            body: 'Volume is the number of shares traded. A price rise on rising volume shows real participation; a rise on falling volume is suspect. Toggle the Vol overlay on the app chart and compare up-days vs down-days on any stock.',
          },
        ],
        keyPoints: [
          'EMA 20 = short trend, EMA 50 = medium trend; crossovers show momentum shifts',
          'Indicators lag \u2014 use as context, not signals',
          'Rising volume validates a move; falling volume questions it',
        ],
      },
    ],
  },
  {
    id: 'risk',
    title: 'Risk & Strategy',
    icon: 'shield',
    description: 'Stop losses, position sizing and diversification \u2014 survive first.',
    lessons: [
      {
        id: 'stop-loss-targets',
        title: 'Stop Loss & Target Discipline',
        minutes: 6,
        sections: [
          {
            heading: 'Decide before you enter',
            body: 'Before buying, write down: why am I buying (the thesis), where is my stop loss (I was wrong if it breaks this), and where is my target (I will book profit here). The app\u2019s order form has SL and Target fields plus a trade thesis note \u2014 using them builds real discipline.',
          },
          {
            heading: 'The asymmetry rule',
            body: 'Losing 50% requires a 100% gain to break even. Small, planned losses are cheap; big unplanned losses are account-killers. A 2:1 reward-to-risk setup (target \u20b920 away, stop \u20b910 away) can make you profitable with only a 40% win rate.',
          },
          {
            heading: 'Never move your stop further away',
            body: 'The classic beginner mistake: price falls toward the stop, and instead of exiting, the trader widens the stop \u201cto give it room\u201d. That converts a small planned loss into a huge unplanned one. Stops exist to be respected.',
          },
        ],
        keyPoints: [
          'Plan thesis, stop loss and target before every entry',
          'Aim for reward \u2265 2x risk on each trade',
          'Never widen a stop loss after entry',
        ],
        tryIt: { label: 'Practice: set SL & Target on an order', tab: 'terminal' },
      },
      {
        id: 'position-sizing',
        title: 'Position Sizing & Diversification',
        minutes: 6,
        sections: [
          {
            heading: 'How much per stock?',
            body: 'A common beginner rule: no single stock should exceed 10\u201315% of your portfolio. The app\u2019s Order Ticket has quick allocation buttons (25%, 50% of cash) so you can see what different position sizes feel like. Smaller positions make stop-losses emotionally easier to respect.',
          },
          {
            heading: 'Diversify across sectors',
            body: 'Owning 6 banks is not diversification \u2014 they fall together. Spread holdings across sectors (IT, banks, FMCG, pharma, energy) so one industry shock cannot sink the whole portfolio. The Analytics tab (Console & Journal) shows your sector breakdown as a pie chart.',
          },
          {
            heading: 'Core & satellite',
            body: 'A simple beginner structure: put 70\u201380% in \u201ccore\u201d large-cap quality names you can hold for years, and 20\u201330% in \u201csatellite\u201d mid/small-cap ideas where you have a strong thesis. Check the Holdings tab to see your own core/satellite mix evolve.',
          },
        ],
        keyPoints: [
          'Cap any single stock at ~10\u201315% of portfolio',
          'Diversify across sectors, not just across stocks',
          'Core (70\u201380% large caps) + satellite (20\u201330% ideas) structure',
        ],
        tryIt: { label: 'Check sector mix in Console & Journal', tab: 'journal' },
      },
    ],
  },
  {
    id: 'mindset',
    title: 'Investor Mindset',
    icon: 'brain',
    description: 'Journaling, review habits and the mistakes that sink beginners.',
    lessons: [
      {
        id: 'journaling',
        title: 'Journal Every Trade',
        minutes: 5,
        sections: [
          {
            heading: 'Why journal?',
            body: 'Memory lies \u2014 we remember wins vividly and rationalize losses. A journal records what you actually believed at entry (the thesis) and what actually happened. After 20\u201330 journal trades, patterns appear: which setups work for you, and which emotions cost you money.',
          },
          {
            heading: 'The review loop',
            body: 'Every closed trade in this app flows into the Journal (Console & Journal tab). For each, add a short lesson: \u201cSold too early on fear\u201d, \u201cRespected my stop \u2014 good\u201d, \u201cBought without checking results date\u201d. The Analytics view computes win rate, profit factor and your best pick automatically.',
          },
        ],
        keyPoints: [
          'Journal the thesis at entry, the outcome at exit, and one lesson',
          'Review your journal weekly \u2014 patterns beat opinions',
          'Win rate and profit factor are in the Analytics tab',
        ],
        tryIt: { label: 'Open Console & Journal', tab: 'journal' },
      },
      {
        id: 'beginner-mistakes',
        title: 'Top 5 Beginner Mistakes',
        minutes: 6,
        sections: [
          {
            heading: '1. Over-trading & 2. No plan',
            body: 'Trading daily with no written plan converts the market into a casino \u2014 and charges eat the account. Fewer, planned trades beat constant activity. 3. Averaging down blindly: buying more of a falling stock without re-checking the thesis turns small losses into disasters.',
          },
          {
            heading: '4. Tips & FOMO, 5. All-in bets',
            body: 'Telegram/YouTube \u201chot tips\u201d arrive after the move has happened; by the time you buy, the tipster is selling. And putting everything into one \u201csure-shot\u201d stock (often a small cap) risks a 50% drawdown that takes years to recover. Slow, diversified, planned \u2014 boring is profitable.',
          },
          {
            heading: 'The paper trading advantage',
            body: 'You are practising with virtual money precisely to make these mistakes cheaply. Treat every virtual trade as if it were real \u2014 same discipline, same journaling \u2014 and the habits will transfer when you go live with small real amounts.',
          },
        ],
        keyPoints: [
          'Over-trading and no-plan trading are the top account killers',
          'Never average down without re-validating the thesis',
          'Tips and FOMO buy you someone else\u2019s exit',
          'Practise with full discipline \u2014 habits transfer to real money',
        ],
      },
    ],
  },
];

export const GLOSSARY = [
  { term: 'LTP', def: 'Last Traded Price \u2014 the price of the most recent completed trade.' },
  { term: 'NSE / BSE', def: 'India\u2019s two stock exchanges where equities are listed and traded.' },
  { term: 'SEBI', def: 'Securities and Exchange Board of India \u2014 the market regulator.' },
  { term: 'Demat Account', def: 'Digital account that holds your shares in electronic form.' },
  { term: 'CNC (Delivery)', def: 'Cash & Carry \u2014 buy shares with full money; delivered to your Demat, hold indefinitely.' },
  { term: 'MIS (Intraday)', def: 'Margin Intraday Square-off \u2014 leveraged (~5x) trade that must be closed the same day.' },
  { term: 'Limit Order', def: 'Order that executes only at your specified price or better.' },
  { term: 'Market Order', def: 'Order that executes immediately at the best available price.' },
  { term: 'SL (Stop Loss)', def: 'Order that triggers an exit only when price touches your trigger level.' },
  { term: 'Bid / Ask', def: 'Best price buyers offer (bid) and sellers demand (ask); the gap is the spread.' },
  { term: 'Volume', def: 'Number of shares traded in a period; high volume validates price moves.' },
  { term: '52W High/Low', def: 'Highest and lowest price of the last 52 weeks \u2014 a quick sentiment gauge.' },
  { term: 'Upper/Lower Circuit', def: 'Daily max/min price limits (often \u00b110%) within which a stock can trade.' },
  { term: 'Large / Mid / Small Cap', def: 'Size classes: roughly top 100, next 150, and the rest by market value.' },
  { term: 'Market Cap', def: 'Share price \u00d7 total shares \u2014 the total market value of a company.' },
  { term: 'STT', def: 'Securities Transaction Tax \u2014 government tax on every trade (0.1% each side on delivery).' },
  { term: 'T+1 Settlement', def: 'Trades settle (shares/money exchanged) one trading day after the trade date.' },
  { term: 'Dividend', def: 'Company profit distributed to shareholders, paid per share held.' },
  { term: 'Bonus / Split', def: 'Corporate actions giving free shares (bonus) or dividing shares (split); your value is unchanged.' },
  { term: 'IPO', def: 'Initial Public Offering \u2014 a company selling shares to the public for the first time.' },
  { term: 'EMA 20 / EMA 50', def: 'Exponential moving averages of the last 20/50 periods \u2014 short & medium trend lines.' },
  { term: 'Position Size', def: 'The rupee amount committed to one trade; beginners cap it at 10\u201315% of portfolio.' },
  { term: 'Stop-Loss Discipline', def: 'Exiting at your pre-set loss level without exception \u2014 the core survival habit.' },
  { term: 'Profit Factor', def: 'Total profits divided by total losses; above 1.5 is healthy, above 2 is strong.' },
];