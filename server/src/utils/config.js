const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('[CONFIG] WARNING: JWT_SECRET env var not set — using insecure default. Set it in Railway before going to production.');
}

module.exports = { JWT_SECRET };
