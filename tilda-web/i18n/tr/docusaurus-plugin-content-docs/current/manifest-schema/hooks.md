---
sidebar_position: 3
---

# Hooks

Hooks, form işlenmeden önce (pre hooks) veya form işlendikten sonra (post hooks) çalıştırılabilir.

### Pre Hooks

Pre-hooks, yanıtları istemciye iletir ve aşağıdaki amaçlar için kullanılabilir:

- Dış bir hizmet kullanarak veri doğrulama
- 3 . taraf hizmetlerle entegrasyon
- CAPTCHA'lar

### Post Hooks

Post-hooks, istemcilere yükler dönemez ve bildirim, günlükleme veya veri saklama amaçları için kullanılır.

# Hook Türleri

## 1. Email Hook

Bu, bir son işleme hook olarak kullanılabilir:
Email hook'u, Tilda'da bir post hook olarak kullanılabilir. Bu hook, belirli bir olay veya işlem tamamlandıktan sonra e-posta bildirimleri göndermek için tasarlanmıştır. Aşağıda, bu hook için mevcut yapılandırma seçeneklerinin ayrıntılı bir açıklaması verilmiştir.

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
Bir email-hook nesnesi aşağıdaki özellikleri içerir:

| İsim                              | Açıklama                                                                                                                | Gerekli |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| `factory`                         | Hook türünü belirtir. E-posta bildirimleri için değer `"email"` olmalıdır.                                                  | Evet      |
| `params → serviceType`            | Kullanılan e-posta hizmetinin türünü belirtir. Genellikle standart e-posta teslimi için `"SMTP"` olacaktır.                | Evet      |
| `params → config → from:enc`      | Bildirimin gönderileceği e-posta adresi. Güvenlik amaçlı bu değer şifrelenmiş olmalıdır.                                    | Evet      |
| `params → config → host:enc`      | SMTP sunucu host adresi. Bu değer de şifrelenmiş olmalıdır.                                                                | Evet      |
| `params → config → port`          | SMTP sunucusuna bağlanmak için kullanılan port numarası. Yaygın değerler `TLS` için `587` ve `SSL` için `465`'dir.         | Evet      |
| `params → config → secure`        | Güvenli bir bağlantı (SSL/TLS) kullanılıp kullanılmayacağını belirten bir boolean değer. Güvenli bağlantılar için `true`, aksi halde `false`. | Evet      |
| `params → config → user:enc`      | SMTP sunucusunda kimlik doğrulama için kullanılan kullanıcı adı. Bu değer şifrelenmiş olmalıdır.                           | Hayır       |
| `params → config → pass:enc`      | SMTP sunucusunda kimlik doğrulama için kullanılan şifre. Bu değer de şifrelenmiş olmalıdır.                                | Hayır       |
| `params → recipients`             | Alıcı nesnelerinden oluşan bir dizi.                                                                                       | Evet      |
| `params → recipients → email:enc` | Alıcının e-posta adresi. Her bir e-posta adresi gizlilik ve güvenlik sağlamak için şifrelenmiş olmalıdır.                   | Evet      |


Bu hook, form gönderimi veya veri işleme gibi belirli bir eylemden sonra e-posta bildirimi göndermeniz gereken durumlarda kullanılabilir. Parametreleri uygun şekilde yapılandırarak, e-postaların güvenli ve verimli bir şekilde gönderilmesini sağlayabilirsiniz.

## 2. Web Hook

Çeşitli dış hizmetlerle entegre olmak için kullanılır. Manifestte örnek bir webhook şu şekilde olur:


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
### Konfigurasyon Detayları
Bir web-hook nesnesi aşağıdaki özellikleri içerir:

| İsim               | Açıklama                                                          | Gerekli |
| ------------------ | -------------------------------------------------------------------- | -------- |
| `factory`          | Bu bir web-hook olduğunu belirtir.                                   | Evet      |
| `params → url`     | Dış kaynağın URL'si.                                                 | Evet      |
| `params → method`  | POST veya GET.                                                       | Evet      |
| `params → headers` | HTTP isteği başlıklarının isteğe bağlı dizisi.                       | Hayır       |
| `params → values`  | Anahtar-değer parametrelerinin bir nesne dizisi.                     | Hayır       |
| `params → success_path`  | Yanıtın başarılı bir işlem olup olmadığını kontrol etmek için JSON yolu. | Hayır       |
| `id`  | Webhook için benzersiz bir tanımlayıcı. Hata ayıklama ve birden fazla webhook yönetimi için kullanışlıdır. | Hayır       |
| `ignoreSuccess`  | true olarak ayarlandığında, webhook yanıtının başarı durumunu görmezden gelir. Kritik olmayan iş akışlarında kullanılır. | Hayır       |

### Ek Parametre Açıklamaları

#### `params → success_path`

- **Açıklama**: Bu parametre, webhook yanıtının başarılı bir işlem olup olmadığını doğrulamak için kullanılan JSON yolunu belirtir.
- **Kullanım**: Webhook çağrısının başarılı olup olmadığını belirlemek için yanıtın belirli bir kısmını kontrol etmeniz gerektiğinde kullanılmalıdır. Örneğin, başarı durumu iç içe bir nesnede bulunuyorsa.
- **Örnek**: Webhook yanıtı `{ "status": { "success": true } }` içeriyorsa, `success_path` `$.status.success` olacaktır.

#### `id`

- **Açıklama**: Webhook için benzersiz bir tanımlayıcı.
- **Kullanım**: Hata ayıklama ve birden fazla webhook yönetimi için kullanışlıdır. Farklı webhook yapılandırmalarını ayırt etmeye yardımcı olur.
- **Örnek**: Birden fazla farklı amaç için webhook'unuz varsa, `"userSignupWebhook"` gibi bir `id` atamak, hata ayıklama sırasında belirli webhook'u tanımlamaya yardımcı olur.

#### `ignoreSuccess`

- **Açıklama**: `true` olarak ayarlandığında, webhook'un başarı durumu görmezden gelinir.
- **Kullanım**: Webhook'un başarısının genel süreç için kritik olmadığı durumlarda veya webhook sonucuna bakılmaksızın sürecin devam etmesini istediğiniz senaryolarda kullanışlıdır.
- **Örnek**: Bir günlükleme senaryosunda, günlükleme webhook'u başarısız olsa bile tüm sürecin durmaması gerektiğinden `ignoreSuccess` `true` olarak ayarlanabilir.

Webhook başlıklarında veya değerlerinde alan değerlerini (kullanıcı tarafından gönderilen veriler) kullanabilirsiniz.

