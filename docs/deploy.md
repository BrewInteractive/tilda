# Tilda Installation and Deployment

To customize the service, review the [environment variables](https://github.com/BrewInteractive/tilda/blob/main/docs/environment_variables.md) document.

## Deploying With Docker Compose

It is possible to deploy the server by pulling the docker image on the Docker Hub.

```yml
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
