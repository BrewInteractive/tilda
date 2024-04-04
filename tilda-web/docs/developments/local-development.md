---
sidebar_position: 1
---

# Local Development

First, create your ".env" file. Then, you can follow the steps below.

> [!NOTE]  
> It is possible to connect local redis with Docker in your local environment for testing purposes. [Learn more](#redis-run-with-docker)

Install the npm packages for the service requirements.

```bash
$ npm install
```

You can run the project with one of the following commands.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Redis Run With Docker

To observe the redis, you can install with the following command.

```bash
$ docker-compose up -d
```

## Running Tests

There are unit and integration tests within the service, which are written using NestJS's built-in testing framework. You can run the tests using the following commands.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
