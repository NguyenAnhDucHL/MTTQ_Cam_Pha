module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'mttq-campha-super-secret-key-2026',
  env: process.env.NODE_ENV || 'development'
};
