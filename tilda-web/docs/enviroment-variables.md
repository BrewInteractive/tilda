---
sidebar_position: 4
---

# Environment Variables

| Variable Name             | Description                                                                                                                                                                        | Required | Default                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------- |
| SWAGGER_ENABLED                  | Variable is used to enable or disable Swagger documentation for an API.                                                                                              | NO      | false                      |
| ENCRYPTION_SECRET                   | Encryption Key must be 32 bytes in hexadecimal.                                                                                                       | YES      | -                      |
| BULL_HOST                   | Represents the host of the redis that needs to be connected.                                                                                                                    | YES      | -                      |
| BULL_PORT                   | Represents the port of the redis that needs to be connected.                                                                                                                    | YES      | -                      |
| EMAIL_SERVICE                   | Represents the user of the database that needs to be connected.                                                                                                                    | YES      | -                      |
| SMTP_HOST               | Represents the host address or URL of the SMTP server for email communication.                                                                                                                | YES      | -                      |
| SMTP_PORT               | Represents the port number of the SMTP server for email communication.                                                                                                                | YES      | -                      |
| SMTP_SECURE               | Represents the security method used for communication with the SMTP server (e.g., 'true' or 'false').                                                                                                                | NO      | false                      |
| SMTP_AUTH_USER               | Represents the user identifier for authenticating with the SMTP server.	.                                                                                                                | YES      | -                      |
| SMTP_AUTH_PASS               | Represents the password for authenticating with the SMTP server.                                                                                                                | YES      | -                      |
