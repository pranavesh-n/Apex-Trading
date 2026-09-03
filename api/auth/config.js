// api/auth/config.js — GET /api/auth/config
export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({
    success: true,
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || ''
  });
}
