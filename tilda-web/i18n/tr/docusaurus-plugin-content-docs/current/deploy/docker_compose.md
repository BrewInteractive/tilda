---
sidebar_position: 1
---

# Docker Compose

Servisi özelleştirmek için [ortam değişkenleri](../enviroment-variables.md) dokümanını inceleyin.

## Docker Compose ile Dağıtım

Docker Hub üzerindeki docker imajını çekerek sunucuyu dağıtmak mümkündür.

Docker Compose kullanarak Tilda'yı dağıtmak için aşağıdaki adımları izleyin:

**1. Bir docker-compose.yml dosyası oluşturun:**

```yml title="docker-compose.yml"
version: '3.3'
services:
  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
    restart: always
    env_file:
      - .env
  tilda-api:
    image: brewery/tilda:latest
    ports:
      - "3000:3000"
    restart: always
    depends_on:
      - "redis"
    env_file:
      - .env
```


**2. Docker Compose Dosyasını Çalıştırma:**
```bash
$ docker-compose up -d
```