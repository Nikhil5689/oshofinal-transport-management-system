import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage file
const dataFile = path.join(__dirname, 'server-data.json');

// Initialize data structure
const initializeData = () => {
  if (!fs.existsSync(dataFile)) {
    const defaultData = {
      users: [
        {
          id: 'user_rishabh',
          username: 'rishabh',
          password: 'Rishabh5689', // Plain text password
        },
      ],
      clients: [],
      bookings: [],
      payments: [],
      settings: {
        name: 'OSHO Transport Chhattisgarh',
        address: 'Transport Nagar, Raipur',
        city: 'Raipur',
        state: 'Chhattisgarh',
        phone: '9876543210',
        phone2: '9876543211',
        gst: '22AAAAA0000A1Z5',
        prefix: 'OSHO-',
        startingNumber: 1001,
        defaultFreight: 0,
        defaultHamali: 0,
        defaultDocket: 50,
        terms: 'Goods once booked will not be returned. Company not responsible for leakage or breakage. All disputes subject to Raipur jurisdiction.',
      },
    };
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
  }
};

// Load data from file
const loadData = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

// Save data to file
const saveData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Initialize on startup
initializeData();

// Serve static files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ======================== AUTH ROUTES ========================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const data = loadData();
  const user = data.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Simple password check
  if (password !== user.password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Generate a simple token
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    token,
    user: { id: user.id, username: user.username },
  });
});

app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

// Middleware to verify token (simplified)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // For simplicity, just check if token exists (no expiry)
  next();
};

// ======================== CLIENTS ROUTES ========================
app.get('/api/clients', verifyToken, (req, res) => {
  const data = loadData();
  res.json(data.clients);
});

app.post('/api/clients', verifyToken, (req, res) => {
  const data = loadData();
  const client = {
    ...req.body,
    id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  data.clients.unshift(client);
  saveData(data);
  res.status(201).json(client);
});

app.put('/api/clients/:id', verifyToken, (req, res) => {
  const data = loadData();
  const clientIndex = data.clients.findIndex((c) => c.id === req.params.id);
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }
  data.clients[clientIndex] = { ...data.clients[clientIndex], ...req.body };
  saveData(data);
  res.json(data.clients[clientIndex]);
});

app.delete('/api/clients/:id', verifyToken, (req, res) => {
  const data = loadData();
  data.clients = data.clients.filter((c) => c.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// ======================== BOOKINGS ROUTES ========================
app.get('/api/bookings', verifyToken, (req, res) => {
  const data = loadData();
  res.json(data.bookings);
});

app.post('/api/bookings', verifyToken, (req, res) => {
  const data = loadData();
  const wayBillNo = getNextWayBillNo(data);
  const booking = {
    ...req.body,
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    wayBillNo,
    createdAt: new Date().toISOString(),
  };
  data.bookings.unshift(booking);
  saveData(data);
  res.status(201).json(booking);
});

app.put('/api/bookings/:id', verifyToken, (req, res) => {
  const data = loadData();
  const bookingIndex = data.bookings.findIndex((b) => b.id === req.params.id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  data.bookings[bookingIndex] = { ...data.bookings[bookingIndex], ...req.body };
  saveData(data);
  res.json(data.bookings[bookingIndex]);
});

app.delete('/api/bookings/:id', verifyToken, (req, res) => {
  const data = loadData();
  data.bookings = data.bookings.filter((b) => b.id !== req.params.id);
  data.payments = data.payments.filter((p) => p.bookingId !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

app.get('/api/waybill/next', verifyToken, (req, res) => {
  const data = loadData();
  const wayBillNo = getNextWayBillNo(data);
  res.json({ wayBillNo });
});

// ======================== PAYMENTS ROUTES ========================
app.get('/api/payments', verifyToken, (req, res) => {
  const data = loadData();
  res.json(data.payments);
});

app.post('/api/payments', verifyToken, (req, res) => {
  const data = loadData();
  const payment = {
    ...req.body,
    id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  data.payments.unshift(payment);
  saveData(data);
  res.status(201).json(payment);
});

app.put('/api/payments/:id', verifyToken, (req, res) => {
  const data = loadData();
  const paymentIndex = data.payments.findIndex((p) => p.id === req.params.id);
  if (paymentIndex === -1) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  data.payments[paymentIndex] = { ...data.payments[paymentIndex], ...req.body };
  saveData(data);
  res.json(data.payments[paymentIndex]);
});

app.delete('/api/payments/:id', verifyToken, (req, res) => {
  const data = loadData();
  data.payments = data.payments.filter((p) => p.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// ======================== SETTINGS ROUTES ========================
app.get('/api/settings', verifyToken, (req, res) => {
  const data = loadData();
  res.json(data.settings);
});

app.put('/api/settings', verifyToken, (req, res) => {
  const data = loadData();
  data.settings = { ...data.settings, ...req.body };
  saveData(data);
  res.json(data.settings);
});

// Helper function for waybill numbers
const getNextWayBillNo = (data) => {
  const settings = data.settings;
  const existingNumbers = data.bookings.map(b => {
    const match = b.wayBillNo?.match(new RegExp(`${settings.prefix}(\\d+)`));
    return match ? parseInt(match[1]) : 0;
  });
  const maxNumber = Math.max(settings.startingNumber - 1, ...existingNumbers);
  return `${settings.prefix}${maxNumber + 1}`;
};

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data file: ${dataFile}`);
});