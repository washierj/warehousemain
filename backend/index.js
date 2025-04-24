const express = require('express');
const cors = require('cors');
const WarehouseBot = require('./WarehouseBot');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Store active bot instances
const activeBots = new Map();

// Initialize a new bot instance
app.post('/api/bot/initialize', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const bot = new WarehouseBot();
    
    const config = {
      refreshDelay: req.body.delay || 300,
      proxyServer: process.env.PROXY_SERVER || null,
      mouseMovementEnabled: true
    };
    
    const initialized = await bot.initialize(config);
    
    if (initialized) {
      activeBots.set(sessionId, bot);
      res.json({ success: true, sessionId });
    } else {
      res.status(500).json({ success: false, error: 'Failed to initialize bot' });
    }
  } catch (error) {
    console.error('Error initializing bot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start product monitoring
app.post('/api/bot/monitor', async (req, res) => {
  try {
    const { sessionId, productUrl, userDetails, webhookUrl } = req.body;
    
    if (!activeBots.has(sessionId)) {
      return res.status(404).json({ success: false, error: 'Bot session not found' });
    }
    
    const bot = activeBots.get(sessionId);
    
    // Start monitoring in the background
    bot.startMonitoring(productUrl, userDetails, webhookUrl);
    
    res.json({ success: true, message: 'Monitoring started' });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop monitoring
app.post('/api/bot/stop', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!activeBots.has(sessionId)) {
      return res.status(404).json({ success: false, error: 'Bot session not found' });
    }
    
    const bot = activeBots.get(sessionId);
    bot.stopMonitoring();
    
    res.json({ success: true, message: 'Monitoring stopped' });
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get bot status
app.get('/api/bot/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!activeBots.has(sessionId)) {
      return res.status(404).json({ success: false, error: 'Bot session not found' });
    }
    
    const bot = activeBots.get(sessionId);
    
    res.json({
      success: true,
      isMonitoring: bot.isMonitoring,
      // Add other status info as needed
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clean up bot instance
app.post('/api/bot/cleanup', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!activeBots.has(sessionId)) {
      return res.status(404).json({ success: false, error: 'Bot session not found' });
    }
    
    const bot = activeBots.get(sessionId);
    await bot.close();
    activeBots.delete(sessionId);
    
    res.json({ success: true, message: 'Bot resources cleaned up' });
  } catch (error) {
    console.error('Error cleaning up bot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});