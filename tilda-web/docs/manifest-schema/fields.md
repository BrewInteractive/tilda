---
sidebar_position: 2
---
# Fields

Each field in the manifest is represented as an object under `data → fields`. The object's name corresponds to the name of the input field, and ideally, the field object's name is used. However, in some cases, it may need to be overridden using the `inputName` property within the object.

## Properties

- `inputName` (string | nullable): Used to override the input name submitted from the form.

- `ui → label` (string | nullable): Human-readable label for the input, used in logs and templates.

- `consts` (object | nullable): Constants that can be accessed from hooks and other plugins. Appending `:enc` to a constant name means it must be decrypted during runtime.

- `validators` (array | nullable): Contains an array of validator objects. See [Validating Inputs](#validating-inputs) for more details.