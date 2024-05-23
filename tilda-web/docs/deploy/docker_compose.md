---
sidebar_position: 1
---

# Docker Compose
To customize the service, review the [environment variables](../enviroment-variables.md) document.


## Deploying With Docker Compose

It is possible to deploy the server by pulling the docker image on the Docker Hub.

To deploy Tilda using Docker Compose, follow these steps:

**1. Create a docker-compose.yml file:**

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


**2. Run Docker Compose:**
```bash
$ docker-compose up -d
```