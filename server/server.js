import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'talentai-secret-key-12345';
const DB_FILE = process.env.DB_FILE ? path.resolve(__dirname, process.env.DB_FILE) : path.join(__dirname, 'users.json');
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const app = express();

const corsOptions = {
  origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(','),
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' }
});

app.use('/api/auth/', authLimiter);


// Helper function to read/write JSON database
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Seed initial admin user if database is empty
const seedDB = () => {
  const users = readDB();
  if (users.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    users.push({
      id: 'admin-1',
      name: 'Saurav Gautam',
      company: 'TalentAI Labs',
      email: 'recruiter@talentai.io',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    writeDB(users);
  }
};
seedDB();

// 1. REGISTER
app.post('/api/auth/register', (req, res) => {
  const { name, company, email, password, role } = req.body;
  if (!name || !company || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const users = readDB();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `u-${Date.now()}`,
    name,
    company,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || 'recruiter',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeDB(users);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token });
});

// 2. LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readDB();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

// 3. GET CURRENT USER
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readDB();
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// 4. FORGOT PASSWORD UI TRIGGER
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const users = readDB();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Email address not found' });
  }
  res.json({ message: 'Password reset link sent to your registered email.' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`TalentAI Auth Backend running on http://localhost:${PORT}`);
});
