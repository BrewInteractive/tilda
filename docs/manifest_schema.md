# Manifest Schema

Tilda's manifest schema is designed to define form fields, hooks, validation rules, and various processing steps. Below is an explanation of key components organized in a clear and structured manner:

### Example Manifest Schema
```json
{
    "hmac": "",
    "data": {
        "fields": {
            "name": {
                "inputName": "",
                "ui": {
                    "label": "Name"
                },
                "const": {
                    "constName1": "const value"
                },
                "validators": [
                    {
                        "factory": "alpha"
                    }
                ]
            },
            "surname": {
                "inputName": "",
                "ui": {
                    "label": "Surname"
                },
                "const": {
                    "constName2:enc": "encrypted value"
                },
                "validators": [
                    {
                        "factory": "alpha"
                    }
                ]
            }
        },
        "hooks": {
            "pre": [
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
            ],
            "post": [
                {
                    "factory": "email",
                    "params": {
                        "recipients": [
                            {
                                "email:enc": "encrypted email address"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
```

## Fields

Each field in the manifest is represented as an object under `data → fields`. The object's name corresponds to the name of the input field, and ideally, the field object's name is used. However, in some cases, it may need to be overridden using the `inputName` property within the object.

### Properties

- `inputName` (string | nullable): Used to override the input name submitted from the form.

- `ui → label` (string | nullable): Human-readable label for the input, used in logs and templates.

- `consts` (object | nullable): Constants that can be accessed from hooks and other plugins. Appending `:enc` to a constant name means it must be decrypted during runtime.

- `validators` (array | nullable): Contains an array of validator objects. See [Validating Inputs](#validating-inputs) for more details.

## Validating Inputs

`validators` is an array of objects, each representing a specific validation rule. These rules are processed sequentially, and any false value will break the chain.

### Alpha Validator

This validator allows string values containing only letters A-Z and a-z.

```json
{
  "factory": "alpha"
}
```

### Numeric Validator

This validator allows string values containing only numbers 0-9.

```json
{
  "factory": "numeric"
}
```

### Alpha Numeric Validator

This validator allows string values containing only letters A-Z, a-z, and numbers 0-9.

```json
{
  "factory": "alphaNumeric"
}
```

### Regex Validator

This validator tries to match the input value with the given regex and will fail or pass based on the onMatch value.

```json
{
  "factory": "regex",
  "params": {
    "value": "/d+",
    "onMatch": "fail" // fail | pass
  }
}
```

### Length Validator

This validator is used for matching the string length of inputs.

```json
{
  "factory": "length",
  "params": {
    "minLength": "10", // optional
    "maxLength": "20"  // optional
  }
}
```

### NotEmpty Validator

This validator returns false if the input is empty.

```json
{
  "factory": "notEmpty"
}
```

### Enum Validator

Requires input value to match a given set of enum values.

```json
{
  "factory": "enum",
  "params": {
    "values": ["bar", "foo"]
  }
}
```

## Hooks for Further Processing
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


