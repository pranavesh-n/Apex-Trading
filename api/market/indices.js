// api/market/indices.js — GET /api/market/indices
import { getQuotesBatch } from '../../server/services/marketData.js';

const MAJOR_INDICES = [
  '^NSEI', '^NSEBANK', '^BSESN', '^NSMIDCP', 'NIFTY_MIDCAP_100.NS',
  '^CRSLDX', '^CNX100', '^CNXIT', '^CNXAUTO', '^CNXPHARMA',
  '^CNXFMCG', '^CNXENERGY', '^CNXREALTY', '^CNXMETAL', '^CNXINFRA',
  '^CNXFIN', '^CNXPSUBANK', '^CNXSC', '^INDIAVIX', '^GSPC', '^IXIC', '^DJI'
];

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const data = await getQuotesBatch(MAJOR_INDICES);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
