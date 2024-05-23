---
sidebar_position: 4
---

# Örnek Manifest Yapısı

Aşağıda, form alanlarını nasıl tanımlayacağınızı, ön ve son işleme kancalarını nasıl kuracağınızı ve Tilda içinde doğrulama kurallarını nasıl yapılandıracağınızı gösteren bir örnek manifest yapısı bulunmaktadır. Bu örnek, form verilerini verimli bir şekilde yönetmek için kapsamlı bir şablon sağlar.

### Örnek Manifest JSON

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

### Açıklamalar

- **Fields**: Form alanlarını tanımlar ve her alan için doğrulayıcıları belirtir.
  - **name**: Sadece harflerden oluşmalı ve boş olmamalı.
  - **surname**: Sadece harflerden oluşmalı ve boş olmamalı.
  - **email**: Geçerli bir e-posta adresi olmalı ve boş olmamalı.
  - **age**: Sayısal bir değer olmalı ve boş olmamalı.

- **Pre Hook**: Form verilerini işlemden önce bir webhook çağırır.
  - **preValidationWebhook**: Belirtilen URL'ye bir POST isteği gönderir ve yanıtın başarılı olup olmadığını `$.status.success` yolunda kontrol eder.

- **Post Hooks**: Form verilerini işledikten sonra bir e-posta gönderir ve bir webhook çağırır.
  - **postEmailNotification**: SMTP üzerinden bir e-posta gönderir.
  - **postNotificationWebhook**: Belirtilen URL'ye bir POST isteği gönderir ve yanıtın başarılı olup olmadığını `$.success` yolunda kontrol eder.

Bu manifest örneği, Tilda'da form verilerini doğrulamak ve işlemek için kapsamlı bir yapı sağlar.
