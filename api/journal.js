// api/journal.js — PATCH /api/journal
import { upsertJournalEntry, initD1Tables } from './_d1.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH' && req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const userId = req.headers['x-user-id'] || 'default';
    await initD1Tables();
    const entry = req.body;
    if (!entry?.id) return res.status(400).json({ success: false, error: 'Journal entry id required' });
    await upsertJournalEntry(userId, entry);
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
