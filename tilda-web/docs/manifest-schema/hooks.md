---
sidebar_position: 4
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

### Built in Hook Types
E-mail Notification
This can be used as a post-processor hook:
```json
{
  "factory": "email",
  "params": {
    "recipients": [
      {
        "email:enc": "encrypted email address",
      }
    ]
  }
}
```
Web-hooks
Used to integrate with various external services. A typical entry in the manifest would be:
```json
{
      "factory": "webhook",
      "params": {
        "url": "",
        "headers": [],
        "method": "post",
        "values": {
          "nameSurname": "{$.fields.name.value} {$.fields.surname.value}"
        }
      }
    }
```

A web-hook object contains properties such as:

- `factory` (string | required): Indicates that this is a web-hook.

- `params → url` (string | required): URL to the external resource.

- `params → method` (string | required): POST or GET.

- `params → headers` (array | nullable): Optional array of HTTP request headers.

- `params → values` (object | nullable): An object array of key-value parameters.

You can use field values (user-submitted data) in web-hooks headers or values. See Accessing Field Values within Hooks for more info.


