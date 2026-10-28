// Vercel Serverless Function: /api/auth
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = (req.query.action || '').toLowerCase();
  const body = req.body || {};

  // 1. Login
  if (action === 'login' || req.url.includes('/login')) {
    const id = (body.email || body.phone || '').trim().toLowerCase();
    const pass = body.password || '';

    // Demo VIP account
    if (id === 'vip@client.com' || id === '+91 98401 23456') {
      return res.status(200).json({
        success: true,
        message: 'Welcome back, Praveen Kumar!',
        user: {
          id: 'USR-VIP-001',
          name: 'Praveen Kumar',
          email: 'vip@client.com',
          phone: '+91 98401 23456',
          role: 'VIP Investor',
          savedPlots: ['CHN-OMR-01', 'CHN-ECR-01', 'CHN-GST-01']
        },
        token: 'token_USR-VIP-001'
      });
    }

    // Generic login for testing
    return res.status(200).json({
      success: true,
      message: `Signed in as ${id.split('@')[0]}`,
      user: {
        id: `USR-${Date.now()}`,
        name: id.split('@')[0].toUpperCase(),
        email: id.includes('@') ? id : `${id}@mobile.client`,
        phone: id.includes('@') ? '+91 98401 23456' : id,
        role: 'Home Buyer',
        savedPlots: ['CHN-OMR-01']
      },
      token: `token_${Date.now()}`
    });
  }

  // 2. Register
  if (action === 'register' || req.url.includes('/register')) {
    const name = body.name || 'Investor';
    const email = body.email || `user_${Date.now()}@chennaiplots.com`;
    const phone = body.phone || '+91 98401 23456';
    const role = body.role || 'Home Buyer';

    return res.status(200).json({
      success: true,
      message: `Welcome ${name}! Your account is ready.`,
      user: {
        id: `USR-${Date.now()}`,
        name,
        email,
        phone,
        role,
        savedPlots: []
      },
      token: `token_${Date.now()}`
    });
  }

  // 3. OTP Request & Verify
  if (action === 'otp-request' || req.url.includes('/otp-request')) {
    return res.status(200).json({
      success: true,
      otp: '8492',
      message: `Demo OTP is 8492 (Sent to ${body.phone || 'mobile'})`
    });
  }

  if (action === 'otp-verify' || req.url.includes('/otp-verify')) {
    const phone = body.phone || '+91 98401 23456';
    return res.status(200).json({
      success: true,
      message: 'OTP Verified! Signed in successfully.',
      user: {
        id: `USR-M-${Date.now()}`,
        name: `User ${phone.slice(-4)}`,
        email: `user${phone.slice(-4)}@mobile.client`,
        phone,
        role: 'Mobile Buyer',
        savedPlots: ['CHN-OMR-01', 'CHN-GST-01']
      },
      token: `token_M_${Date.now()}`
    });
  }

  // Default Me
  return res.status(200).json({
    authenticated: false,
    user: null
  });
}
