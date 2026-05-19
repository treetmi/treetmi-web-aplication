require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

// Import Config
const prisma = require('./config/prisma');
const { initSocket } = require('./config/socket');
const { seedTrustBadges } = require('./config/badge.seeder');

// Import Routes
const userRoutes = require('./routes/user.routes');
const gameRoutes = require('./routes/game.routes');
const queueRoutes = require('./routes/queue.routes');
const financeRoutes = require('./routes/finance.routes');
const adminRoutes = require('./routes/admin.routes');
const projectRoutes = require('./routes/project.routes');
const widgetRoutes = require('./routes/widget.routes');
const ticketRoutes = require('./routes/ticket.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const paymentChannelRoutes = require('./routes/payment-channel.routes');
const partnerRoutes = require('./routes/partner.routes');

const app = express();
const server = http.createServer(app);

/**
 * Middlewares
 */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * API Routes Definition
 */
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/games', gameRoutes);
app.use('/api/v1/queues', queueRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/widget-settings', widgetRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/payment-channels', paymentChannelRoutes);
app.use('/api/v1/partners', partnerRoutes);

// Serve uploaded sound files
const path = require('path');
app.use('/uploads', require('express').static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('Treetmi API v1 is running...');
});

/**
 * Initialize Socket.io
 */
initSocket(server);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Treetmi Backend running on Port ${PORT}`);
  console.log(`📡 WebSocket ready & waiting for clients`);
  console.log(`==================================================\n`);
  
  try {
    await prisma.$connect();
    console.log('💎 Database Connection: SUCCESS');
    await seedTrustBadges();
  } catch (err) {
    console.error('❌ Database Connection: FAILED', err.message);
  }
});

// Force a fresh nodemon reload for the newly generated Prisma Client models!
