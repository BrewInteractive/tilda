export default () => ({
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET,
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === 'true' || false,
});
