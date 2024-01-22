export default () => ({
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET,
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === 'true' || false,
  BULL_HOST: process.env.BULL_HOST,
  BULL_PORT: process.env.BULL_PORT,
});
