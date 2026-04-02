require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const tableRoutes = require('./routes/table.routes');
const fnbRoutes = require('./routes/fnb.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/fnb', fnbRoutes);
app.use('/api/orders', orderRoutes);

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
