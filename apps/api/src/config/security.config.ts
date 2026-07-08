export const securityConfig = {
  bcrypt: { saltRounds: 12 },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  rateLimit: {
    ttl: 60000,
    limit: 100,
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  encryption: {
    algorithm: 'aes-256-gcm',
  },
};
