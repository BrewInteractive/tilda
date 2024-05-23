---
sidebar_position: 1
---

# Local Development

:::danger[Take care]

First, create your ".env" file. Then, you can follow the steps below.

:::

:::tip[Redis Tips]

It is possible to connect local redis with Docker in your local environment for testing purposes. [Learn more](./local-development#redis-run-with-docker)

:::


Install the npm packages for the service requirements.

```bash
$ npm install
```

You can run the project with one of the following commands.

**Development**
```bash
$ npm run start
```
**Watch mode**
```bash
$ npm run start:dev
```
**Production mode**
```bash
$ npm run start:prod
```

## Redis Run With Docker

To observe the redis, you can install with the following command.

```bash
$ docker-compose up -d
```

## Running Tests

There are unit and integration tests within the service, which are written using NestJS's built-in testing framework. You can run the tests using the following commands.

**Unit tests**
```bash
$ npm run test
```
**E2e tests**
```bash
$ npm run test:e2e
```
**Test coverage**
```bash
$ npm run test:cov
```
