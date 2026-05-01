const MCPConfig = {
  firecrawl: {
    enabled: !!process.env.FIRECRAWL_API_KEY,
    apiKey: process.env.FIRECRAWL_API_KEY,
    description: 'Web scraping and content extraction',
  },

  mcp: {
    enabled: true,
    version: '1.0',
    description: 'Model Context Protocol SDK',
  },
};

module.exports = MCPConfig;
