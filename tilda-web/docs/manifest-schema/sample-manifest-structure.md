---
sidebar_position: 4
---

# Sample Manifest Structure

Below is a sample manifest structure that demonstrates how to define form fields, set up pre and post hooks, and configure validation rules within Tilda. This example provides a comprehensive template for managing form data efficiently.

### Sample Manifest JSON

```jsx title="manifest.json"
{
    "hmac": "",
    "data": {
      "fields": {
        "name": {
          "inputName": "name",
          "ui": {
            "label": "Name"
          },
          "const": {},
          "validators": [
            {
              "factory": "alpha"
            },
            {
              "factory": "notEmpty"
            }
          ]
        },
        "surname": {
          "inputName": "surname",
          "ui": {
            "label": "Surname"
          },
          "const": {},
          "validators": [
            {
              "factory": "alpha"
            },
            {
              "factory": "notEmpty"
            }
          ]
        },
        "email": {
          "inputName": "email",
          "ui": {
            "label": "Email"
          },
          "const": {},
          "validators": [
            {
              "factory": "email"
            },
            {
              "factory": "notEmpty"
            }
          ]
        },
        "age": {
          "inputName": "age",
          "ui": {
            "label": "Age"
          },
          "const": {},
          "validators": [
            {
              "factory": "numeric"
            },
            {
              "factory": "notEmpty"
            }
          ]
        }
      },
      "hooks": {
        "pre": [
          {
            "factory": "webhook",
            "params": {
              "url": "https://example.com/api/validate",
              "headers": [
                {
                  "Content-Type": "application/json"
                }
              ],
              "method": "post",
              "values": {
                "name": "{$.fields.name.value}",
                "surname": "{$.fields.surname.value}"
              },
              "success_path": "$.status.success"
            },
            "id": "preValidationWebhook",
            "ignoreSuccess": false
          }
        ],
        "post": [
          {
            "factory": "email",
            "params": {
              "serviceType": "SMTP",
              "config": {
                "from:enc": "example@mail.com",
                "host:enc": "mail.example.com",
                "port": 587,
                "secure": false,
                "user:enc": "user",
                "pass:enc": "password"
              },
              "recipients": [
                {
                  "email:enc": "recipient@example.com"
                }
              ]
            },
            "id": "postEmailNotification",
            "ignoreSuccess": false
          },
          {
            "factory": "webhook",
            "params": {
              "url": "https://example.com/api/notify",
              "headers": [
                {
                  "Content-Type": "application/json"
                }
              ],
              "method": "post",
              "values": {
                "nameSurname": "{$.fields.name.value} {$.fields.surname.value}",
                "email": "{$.fields.email.value}"
              },
              "success_path": "$.success"
            },
            "id": "postNotificationWebhook",
            "ignoreSuccess": false
          }
        ]
      }
    }
  }
```

### Explanations

- **Fields**: Defines form fields and specifies validators for each field.
  - **name**: Should consist of letters only and should not be empty.
  - **surname**: Should consist of letters only and should not be empty.
  - **email**: Should be a valid email address and should not be empty.
  - **age**: Should be a numeric value and should not be empty.

- **Pre Hook**: Invokes a webhook before processing form data.
  - **preValidationWebhook**: Sends a POST request to the specified URL and checks if the response indicates success at the `$.status.success` path.

- **Post Hooks**: Sends an email and invokes a webhook after processing form data.
  - **postEmailNotification**: Sends an email via SMTP.
  - **postNotificationWebhook**: Sends a POST request to the specified URL and checks if the response indicates success at the `$.success` path.

This manifest example provides a comprehensive structure for validating and processing form data in Tilda.

