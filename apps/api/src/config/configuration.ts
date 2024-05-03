export default () => ({
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET,
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === 'true' || false,
  REDIS: {
    HOST: process.env.REDIS_HOST,
    PORT: process.env.REDIS_PORT,
    PASSWORD: process.env.REDIS_PASSWORD,
    USERNAME: process.env.REDIS_USERNAME,
    TLS: {
      ENABLE: process.env.REDIS_ENABLE_TLS === 'true' || false,
      REJECT_UNAUTHORIZED:
        process.env.REDIS_REJECT_UNAUTHORIZED === 'true' || false,
    },
  },
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
  CORS_CONFIG: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  },
});
