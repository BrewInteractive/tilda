---
sidebar_position: 1
---

# Fields

Her alan, manifestte `data → fields` altında bir nesne olarak temsil edilir. Nesnenin adı, giriş alanının adına karşılık gelir ve ideal olarak, alan nesnesinin adı kullanılır. Ancak, bazı durumlarda `inputName` özelliği kullanılarak geçersiz kılınması gerekebilir.


```jsx
{
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
        }
    }
}
```

## Properties

- `inputName` (string | nullable): Formdan gönderilen giriş adını geçersiz kılmak için kullanılır.

- `ui → label` (string | nullable): Günlüklerde ve şablonlarda kullanılan, kullanıcı tarafından okunabilir etiket.

- `consts` (object | nullable): Kancalardan ve diğer eklentilerden erişilebilen sabitler. Bir sabit adına :enc eklemek, bunun çalışma zamanında şifrelenmesi gerektiği anlamına gelir.

- `validators` (array | nullable): Doğrulayıcı nesnelerden oluşan bir dizi içerir. Daha fazla bilgi için [Input Doğrulama](./validation-inputs) bölümüne bakın.
