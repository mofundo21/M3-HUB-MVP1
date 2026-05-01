const express = require('express');
const router = express.Router();
const MCPService = require('../services/MCPService');

router.get('/status', (_req, res) => {
  res.json({ status: 'ok', tools: MCPService.getStatus() });
});

router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const content = await MCPService.scrapeUrl(url);
    res.json({ success: true, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/crawl', async (req, res) => {
  try {
    const { url, limit } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const result = await MCPService.crawlUrl(url, { limit });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
