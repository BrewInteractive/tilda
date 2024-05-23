---
sidebar_position: 4
---

# Environment Variables
:::warning
Each variable in the table corresponds to the environment variables used in the configuration. Make sure to set these variables appropriately in your environment to ensure the proper functioning of the Tilda application.
:::

| Variable Name             | Description                                                                                                                                                                        | Required | Default                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------- |
| ENCRYPTION_SECRET         | Encryption Key must be 32 bytes in hexadecimal.                                                       | YES      | -       |
| SWAGGER_ENABLED           | Variable is used to enable or disable Swagger documentation for an API.                               | NO       | false   |
| REDIS_HOST                | Represents the host of the Redis instance that needs to be connected.                                 | YES      | -       |
| REDIS_PORT                | Represents the port of the Redis instance that needs to be connected.                                 | YES      | -       |
| REDIS_PASSWORD            | Password for the Redis instance.                                                                      | NO       | -       |
| REDIS_USERNAME            | Username for the Redis instance.                                                                      | NO       | -       |
| REDIS_ENABLE_TLS          | Enables TLS for Redis connection if set to 'true'.                                                    | NO       | false   |
| REDIS_REJECT_UNAUTHORIZED | Reject unauthorized TLS certificates for Redis if set to 'true'.                                      | NO       | false   |
| API_KEY                   | API Key for accessing external services or APIs.                                                      | YES      | -       |
| ALLOWED_ORIGINS           | A comma-separated list of allowed origins for CORS configuration.                                     | NO       | []      |
