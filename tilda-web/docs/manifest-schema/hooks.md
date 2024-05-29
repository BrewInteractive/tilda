---
sidebar_position: 3
---

# Hooks

Hooks can be run before handling the form (pre hooks) or after handling the form (post hooks).

### Pre processing Hooks

Pre-hooks relay responses to the client and can be used for purposes such as:

Data validation using an external service
Integration with 3rd party services
CAPTCHAs

### Post processing Hooks

Post-hooks cannot return payloads to clients and are used for notification, logging, or persisting purposes.

# Built in Hook Types

## 1. Email Hook

E-mail Notification
This can be used as a post-processor hook:
The E-mail Notification hook can be used as a post-processor hook in Tilda. This hook is designed to send email notifications after a specific event or action has been completed. Below is a detailed explanation of the configuration options available for this hook.

```jsx
{
  "factory": "email",
  "params": {
    "serviceType": "SMTP",
    "config": {
      "from:enc": "example@mail.com",
      "host:enc": "mail.example.com",
      "port": 587 || 465,
      "secure": false || true,
      "user:enc": "user",
      "pass:enc": "password"
    },
    "recipients": [
      {
        "email:enc": "encrypted email address"
      }
    ]
  }
}
```

### Configuration Details
A email-hook object contains properties such as:

| Name                              | Description                                                                                                                | Required |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| `factory`                         | Specifies the type of hook. For email notifications, the value should be `"email"`.                                        | Yes      |
| `params → serviceType`            | Indicates the type of email service being used. Commonly, this would be `"SMTP"` for standard email delivery.              | Yes      |
| `params → config → from:enc`      | The email address from which the notification will be sent. This value should be encrypted for security purposes.          | Yes      |
| `params → config → host:enc`      | The SMTP server host address. This value should also be encrypted.                                                         | Yes      |
| `params → config → port`          | The port number used for connecting to the SMTP server. Common values are `587` for TLS and `465` for SSL.                 | Yes      |
| `params → config → secure`        | A boolean value indicating whether to use a secure connection (SSL/TLS). `true` for secure connections, `false` otherwise. | Yes      |
| `params → config → user:enc`      | The username for authenticating with the SMTP server. This should be encrypted.                                            | No       |
| `params → config → pass:enc`      | The password for authenticating with the SMTP server. This should also be encrypted.                                       | No       |
| `params → subject`             | The subject for email.                                                                                             | No      |
| `params → recipients`             | An array of recipient objects.                                                                                             | Yes      |
| `params → recipients → email:enc` | The email address of the recipient. Each email address should be encrypted to ensure privacy and security.                 | Yes      |


This hook can be utilized in scenarios where you need to send an email notification after a specific action, such as form submission or data processing. By configuring the parameters appropriately, you can ensure that emails are sent securely and efficiently.

## 2. Web Hook

Used to integrate with various external services. A typical entry in the manifest would be:

```jsx
{
  "factory": "webhook",
  "params": {
    "url": "example.com",
    "headers": [
       "Content-Type: application/json"
    ],
    "method": "post",
    "values": {
      "nameSurname": "{$.fields.name.value} {$.fields.surname.value}"
    }
    "success_path": "$.success"
  }
  "id": "webhookId",
  "ignoreSuccess": false
}
```
### Configuration Details
A web-hook object contains properties such as:

| Name               | Description                              | Required |
| ------------------ | ---------------------------------------- | -------- |
| `factory`          | Indicates that this is a web-hook.       | Yes      |
| `params → url`     | URL to the external resource.            | Yes      |
| `params → method`  | POST or GET.                             | Yes      |
| `params → headers` | Optional array of HTTP request headers.  | No       |
| `params → values`  | An object array of key-value parameters. | No       |
| `params → success_path`  | JSON path to check if the response indicates a successful operation. | No       |
| `id`  | A unique identifier for the webhook. Useful for debugging and managing multiple webhooks. | No       |
| `ignoreSuccess`  | If set to true, ignores the success status of the webhook response. Used in non-critical workflows. | No       |

### Additional Parameters Explanation

#### `params → success_path`

- **Description**: This parameter specifies the JSON path used to verify if the webhook's response indicates a successful operation.
- **Usage**: It should be used when you need to check a specific part of the response to determine if the webhook call was successful. For example, if the success status is contained within a nested object.
- **Example**: If the webhook response contains `{ "status": { "success": true } }`, the `success_path` would be `$.status.success`.

#### `id`

- **Description**: A unique identifier for the webhook.
- **Usage**: This is useful for debugging and managing multiple webhooks. It helps to differentiate between different webhook configurations.
- **Example**: If you have multiple webhooks for different purposes, assigning an `id` like `"userSignupWebhook"` helps in identifying the specific webhook during troubleshooting.

#### `ignoreSuccess`

- **Description**: When set to `true`, the webhook's success status is ignored.
- **Usage**: This can be useful in scenarios where the success of the webhook is not critical to the overall process, or where you want the process to continue regardless of the webhook's outcome.
- **Example**: In a logging scenario, you might set `ignoreSuccess` to `true` because even if the logging webhook fails, it should not halt the entire process.


You can use field values (user-submitted data) in web-hooks headers or values.
