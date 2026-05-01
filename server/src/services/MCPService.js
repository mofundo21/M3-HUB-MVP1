const MCPConfig = require('../config/mcp-config');

let FirecrawlApp = null;
try {
  ({ FirecrawlApp } = require('@mendable/firecrawl-js'));
} catch (_) {}

class MCPService {
  constructor() {
    this.firecrawl = null;
    this.initialized = false;
  }

  async initialize() {
    if (MCPConfig.firecrawl.enabled && FirecrawlApp) {
      this.firecrawl = new FirecrawlApp({ apiKey: MCPConfig.firecrawl.apiKey });
      console.log('[MCP] Firecrawl initialized');
    } else {
      console.log('[MCP] Firecrawl disabled (no FIRECRAWL_API_KEY)');
    }
    this.initialized = true;
    console.log('[MCP] Service ready');
  }

  async scrapeUrl(url) {
    if (!this.firecrawl) throw new Error('Firecrawl not available — set FIRECRAWL_API_KEY');
    const result = await this.firecrawl.scrapeUrl(url, { formats: ['markdown', 'html'] });
    return result;
  }

  async crawlUrl(url, options = {}) {
    if (!this.firecrawl) throw new Error('Firecrawl not available — set FIRECRAWL_API_KEY');
    const result = await this.firecrawl.crawlUrl(url, {
      limit: options.limit || 10,
      scrapeOptions: { formats: ['markdown'] },
    });
    return result;
  }

  getStatus() {
    return {
      firecrawl: MCPConfig.firecrawl.enabled && !!this.firecrawl,
      mcp_sdk: true,
      initialized: this.initialized,
    };
  }
}

module.exports = new MCPService();
