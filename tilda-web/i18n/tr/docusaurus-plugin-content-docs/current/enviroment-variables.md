---
sidebar_position: 4
---

# Ortam Değişkenleri
:::warning
Tablodaki her değişken, yapılandırmada kullanılan ortam değişkenlerine karşılık gelir. Tilda uygulamasının düzgün çalışmasını sağlamak için bu değişkenleri ortamınıza uygun şekilde ayarladığınızdan emin olun.
:::

| Variable Name             | Açıklama                                                                                                                                                                        | Gerekli | Varsayılan              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------- |
| ENCRYPTION_SECRET         | Şifreleme Anahtarı 32 bayt uzunluğunda ve onaltılık olmalıdır.                                                       | EVET      | -       |
| SWAGGER_ENABLED           | API için Swagger dokümantasyonunu etkinleştirmek veya devre dışı bırakmak için kullanılan değişken.                               | HAYIR       | false   |
| REDIS_HOST                | Bağlanılması gereken Redis instance'ının hostunu temsil eder.                                 | EVET      | -       |
| REDIS_PORT                | Bağlanılması gereken Redis instance'ının portunu temsil eder.                                 | EVET      | -       |
| REDIS_PASSWORD            | Redis instance'ı için şifre.                                                                      | HAYIR       | -       |
| REDIS_USERNAME            | Redis instance'ı için kullanıcı adı.                                                                      | HAYIR       | -       |
| REDIS_ENABLE_TLS          | 'true' olarak ayarlanırsa Redis bağlantısı için TLS'i etkinleştirir.                                                    | HAYIR       | false   |
| REDIS_REJECT_UNAUTHORIZED | 'true' olarak ayarlanırsa yetkisiz TLS sertifikalarını reddeder.                                      | HAYIR       | false   |
| API_KEY                   | Harici hizmetlere veya API'lere erişmek için API Anahtarı.                                                      | EVET      | -       |
| ALLOWED_ORIGINS           | CORS yapılandırması için izin verilen kökenlerin virgülle ayrılmış listesi.                                     | HAYIR       | []      |
