export default () => ({
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET,
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === 'true' || false,
  BULL_HOST: process.env.BULL_HOST,
  BULL_PORT: process.env.BULL_PORT,
  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    SECURE: process.env.SMTP_SECURE === 'true' || false,
    AUTH: {
      USER: process.env.SMTP_AUTH_USER,
      PASS: process.env.SMTP_AUTH_PASS,
    },
  },
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  API_KEY: process.env.API_KEY,
});
