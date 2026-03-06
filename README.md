# NestJS RCON Module

Module RCON pour NestJS, basé sur [`rcon-client`](https://github.com/janispritzkau/rcon-client).

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
