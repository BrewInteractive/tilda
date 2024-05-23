---
sidebar_position: 1
---

# Yerel Geliştirme

:::danger[Dikkat]

Öncelikle ".env" dosyanızı oluşturun. Daha sonra aşağıdaki adımları takip edebilirsiniz.

:::

:::tip[Redis İpuçları]

Yerel ortamınızda test amaçlı olarak Docker ile yerel redis'e bağlanmanız mümkündür. [Daha fazla bilgi edinin](./local-development#redis-run-with-docker)

:::

Servis gereksinimleri için npm paketlerini yükleyin.

```bash
$ npm install
```

Projeyi aşağıdaki komutlardan biriyle çalıştırabilirsiniz.

**Geliştirme**
```bash
$ npm run start
```
**İzleme modu**
```bash
$ npm run start:dev
```
**Üretim modu**
```bash
$ npm run start:prod
```

## Docker ile Redis Çalıştırma

Redis'i başlatmak için aşağıdaki komutla kurulum yapabilirsiniz.

```bash
$ docker-compose up -d
```

## Testleri Çalıştırma

Servis içinde NestJS'nin yerleşik test framework'ü kullanılarak yazılmış birim ve entegrasyon testleri bulunmaktadır. Testleri aşağıdaki komutlarla çalıştırabilirsiniz.


**Birim testleri**
```bash
$ npm run test
```
**E2e testleri**
```bash
$ npm run test:e2e
```
**Test kapsamı**
```bash
$ npm run test:cov
```
