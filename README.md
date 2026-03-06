<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  A RCON module for Nest framework (node.js) using <a href="https://github.com/janispritzkau/rcon-client">rcon-client</a> library
</p>

<p align="center">
  <a href="https://www.npmjs.com/org/tacxou"><img src="https://img.shields.io/npm/v/@tacxou/nestjs_module_rcon.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/org/tacxou"><img src="https://img.shields.io/npm/l/@tacxou/nestjs_module_rcon.svg" alt="Package License" /></a>
  <a href="https://github.com/tacxou/nestjs_module_rcon/actions/workflows/ci.yml"><img src="https://github.com/tacxou/nestjs_module_rcon/actions/workflows/ci.yml/badge.svg" alt="Publish Package to npmjs" /></a>
  <a href="https://codecov.io/github/tacxou/nestjs_module_rcon"><img src="https://codecov.io/github/tacxou/nestjs_module_rcon/graph/badge.svg?token=JZAaijmyoy"/></a>
  <a href="https://github.com/tacxou/nestjs_module_rcon/actions/workflows/release.yml?event=workflow_dispatch"><img alt="GitHub contributors" src="https://github.com/tacxou/nestjs_module_rcon/actions/workflows/release.yml/badge.svg"></a>
</p>
<br>

# NestJS RCON Module

## Installation

```bash
bun add @tacxou/nestjs_module_rcon rcon-client
```

## Utilisation

### Configuration simple (`forRoot`)

```ts
import { Module } from '@nestjs/common'
import { RconModule } from '@tacxou/nestjs_module_rcon'

@Module({
  imports: [
    RconModule.forRoot({
      config: {
        host: '127.0.0.1',
        port: 25575,
        password: 'secret',
      },
      maxAttempts: 3,
      retryDelay: 1000,
      failOnError: true,
    }),
  ],
})
export class AppModule {}
```

### Configuration async (`forRootAsync`)

```ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RconModule, RconOptions } from '@tacxou/nestjs_module_rcon'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RconModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: config.get<RconOptions>('rcon.options'),
        maxAttempts: 3,
        retryDelay: 1000,
        failOnError: true,
      }),
    }, 'main'),
  ],
})
export class AppModule {}
```

## Injection de la connexion RCON

```ts
import { Injectable } from '@nestjs/common'
import { InjectRcon, Rcon } from '@tacxou/nestjs_module_rcon'

@Injectable()
export class GameService {
  constructor(@InjectRcon('main') private readonly rcon: Rcon) {}

  async listPlayers() {
    return this.rcon.send('list')
  }
}
```

Si tu n'utilises pas de nom de connexion, utilise simplement `@InjectRcon()`.

## Scripts utiles

```bash
bun test
bun test:coverage
bun run build
```
