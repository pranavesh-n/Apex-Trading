// api/auth/google.js — POST /api/auth/google
// Handles Google OAuth credential/profile and creates a user session

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { credential, profile } = req.body;
    let user = null;

    // Path 1: Google One-Tap JWT credential
    if (credential) {
      try {
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        const decoded = JSON.parse(jsonPayload);
        user = {
          id: decoded.sub,
          name: decoded.name || decoded.email?.split('@')[0],
          email: decoded.email,
          picture: decoded.picture,
          role: 'trader'
        };
      } catch (e) {
        console.error('JWT decode error:', e.message);
      }
    }

    // Path 2: Profile passed directly (token flow)
    if (!user && profile?.email) {
      user = {
        id: profile.sub || `usr_${Buffer.from(profile.email).toString('base64').replace(/=/g, '').substring(0, 12)}`,
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        picture: profile.picture || null,
        role: 'trader'
      };
    }

    if (!user) {
      return res.status(400).json({ success: false, error: 'Unable to identify user from Google response' });
    }

    res.json({
      success: true,
      data: {
        user,
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
