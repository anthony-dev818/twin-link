// Vercel Serverless Function - Auth
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'twinlink-dev-secret-key-change-in-production';

// In-memory users store (replace with MongoDB in production)
const users = new Map();
const verificationCodes = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'register':
        return await handleRegister(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'verify':
        return await handleVerify(req, res);
      default:
        return res.status(404).json({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function handleRegister(req, res) {
  const { name, email, password, age, bio } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const normalizedEmail = email.toLowerCase();

  if (users.has(normalizedEmail)) {
    return res.status(400).json({ success: false, error: 'User already exists' });
  }

  // Generate verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(normalizedEmail, { code, expires: Date.now() + 10 * 60 * 1000 });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Store user (unverified)
  users.set(normalizedEmail, {
    id: Date.now().toString(),
    name,
    email: normalizedEmail,
    password: hashedPassword,
    age: age || 18,
    bio: bio || '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`,
    isVerified: false,
    interests: [],
    createdAt: new Date(),
  });

  // Log code for development
  console.log(`\n📧 Verification code for ${normalizedEmail}: ${code}\n`);

  return res.status(201).json({
    success: true,
    message: 'Registration successful! Check your email.',
    data: { email: normalizedEmail, requiresVerification: true, devCode: code },
  });
}

async function handleVerify(req, res) {
  const { email, code } = req.body;
  const normalizedEmail = email?.toLowerCase();

  const stored = verificationCodes.get(normalizedEmail);
  if (!stored || stored.code !== code || stored.expires < Date.now()) {
    return res.status(400).json({ success: false, error: 'Invalid or expired code' });
  }

  const user = users.get(normalizedEmail);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  user.isVerified = true;
  verificationCodes.delete(normalizedEmail);

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(200).json({
    success: true,
    message: 'Email verified!',
    data: {
      user: { ...user, password: undefined },
      token,
    },
  });
}

async function handleLogin(req, res) {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase();

  const user = users.get(normalizedEmail);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(normalizedEmail, { code, expires: Date.now() + 10 * 60 * 1000 });
    console.log(`\n📧 New verification code for ${normalizedEmail}: ${code}\n`);

    return res.status(403).json({
      success: false,
      error: 'Email not verified. New code sent.',
      data: { requiresVerification: true, email: normalizedEmail, devCode: code },
    });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(200).json({
    success: true,
    data: {
      user: { ...user, password: undefined },
      token,
    },
  });
}
