require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const tableRoutes = require('./routes/table.routes');
const tableTypeRoutes = require('./routes/tableType.routes');
const fnbRoutes = require('./routes/fnb.routes');
const fnbCategoryRoutes = require('./routes/fnbCategory.routes');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');
const sessionRoutes = require('./routes/session.routes');
const revenueRoutes = require('./routes/revenue.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'BIDA Restaurant Management API', version: '1.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/table-types', tableTypeRoutes);
app.use('/api/fnb', fnbRoutes);
app.use('/api/fnb-categories', fnbCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/revenue', revenueRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
