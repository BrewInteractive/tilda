---
sidebar_position: 1
---
# Example Manifest Schema
Example Manifest Schema Json

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