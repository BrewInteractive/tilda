---
sidebar_position: 2
---
# Validation Inputs

`validators` is an array of objects, each representing a specific validation rule. These rules are processed sequentially, and any false value will break the chain.

### Alpha Validator

This validator allows string values containing only letters A-Z and a-z.

```jsx
{
  "factory": "alpha"
}
```

### Numeric Validator

This validator allows string values containing only numbers 0-9.

```jsx
{
  "factory": "numeric"
}
```

### Alpha Numeric Validator

This validator allows string values containing only letters A-Z, a-z, and numbers 0-9.

```jsx
{
  "factory": "alphaNumeric"
}
```

### Regex Validator

This validator tries to match the input value with the given regex and will fail or pass based on the onMatch value.

```jsx
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

```jsx
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

```jsx
{
  "factory": "notEmpty"
}
```

### Enum Validator

Requires input value to match a given set of enum values.

```jsx
{
  "factory": "enum",
  "params": {
    "values": ["bar", "foo"]
  }
}
```