const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connect');
const seedDatabase = require('./config/seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.PORT2 || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/allRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MiniBank API',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Initialize DB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    console.log(`📡 Database: Connected to MongoDB`);

    // Wrap seeding in try/catch so it doesn't block server port binding if it errors
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.log('Seeding notice:', seedErr.message);
    }

    // Explicitly bind to '0.0.0.0' for Render compatibility
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MiniBank Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();