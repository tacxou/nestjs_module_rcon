import { describe, expect, it, mock } from 'bun:test'
import { RconCoreModule } from '../src/rcon.core-module'
import { RconModule } from '../src/rcon.module'
import { getRconConnectionToken, getRconOptionsToken } from '../src/rcon.utils'

type TestedProvider = {
  provide: string
  inject?: unknown[]
  useFactory?: (...args: unknown[]) => unknown
  useValue?: unknown
}

describe('RconCoreModule', () => {
  it('builds forRoot dynamic module with expected providers', () => {
    const options = {
      config: { host: '127.0.0.1', port: 25575, password: 'secret' },
      maxAttempts: 3,
      retryDelay: 1000,
      failOnError: true,
    }

    const dynamicModule = RconCoreModule.forRoot(options, 'root')
    const optionsProvider = dynamicModule.providers?.find(
      (provider) => typeof provider === 'object' && provider && 'provide' in provider && provider.provide === getRconOptionsToken('root'),
    )
    const connectionProvider = dynamicModule.providers?.find(
      (provider) => typeof provider === 'object' && provider && 'provide' in provider && provider.provide === getRconConnectionToken('root'),
    )

    expect(dynamicModule.module).toBe(RconCoreModule)
    expect(dynamicModule.exports).toHaveLength(2)
    expect(optionsProvider).toBeDefined()
    expect(
      optionsProvider && typeof optionsProvider === 'object' && 'useValue' in optionsProvider ? optionsProvider.useValue : undefined,
    ).toEqual(options)
    expect(connectionProvider).toBeDefined()
  })

  it('throws when async providers strategy is missing', () => {
    expect(() => RconCoreModule.createAsyncProviders({})).toThrow(
      'Invalid configuration. Must provide useFactory, useClass or useExisting',
    )
  })

  it('creates an async options provider with useFactory', async () => {
    const options = {
      config: { host: '127.0.0.1', port: 25575, password: 'secret' },
      maxAttempts: 3,
      retryDelay: 1000,
      failOnError: true,
    }

    const useFactory = mock(() => options)
    const provider = RconCoreModule.createAsyncOptionsProvider({
      useFactory,
      inject: ['CONFIG_TOKEN'],
    }, 'main') as TestedProvider

    expect(provider.provide).toBe(getRconOptionsToken('main'))
    expect(provider.inject).toEqual(['CONFIG_TOKEN'])

    const result = await provider.useFactory?.('value')
    expect(useFactory).toHaveBeenCalledWith('value')
    expect(result).toEqual(options)
  })

  it('creates async providers with useClass', async () => {
    class OptionsFactory {
      createRconModuleOptions() {
        return {
          config: { host: '127.0.0.1', port: 25575, password: 'secret' },
          maxAttempts: 5,
          retryDelay: 500,
          failOnError: false,
        }
      }
    }

    const providers = RconCoreModule.createAsyncProviders({ useClass: OptionsFactory }, 'custom')
    expect(providers).toHaveLength(2)

    const [optionsProvider, classProvider] = providers as [TestedProvider, { provide: unknown; useClass: unknown }]
    expect(classProvider).toEqual({
      provide: OptionsFactory,
      useClass: OptionsFactory,
    })
    expect(optionsProvider.provide).toBe(getRconOptionsToken('custom'))
    expect(optionsProvider.inject).toEqual([OptionsFactory])

    const resolvedOptions = await optionsProvider.useFactory?.(new OptionsFactory())
    expect(resolvedOptions).toEqual({
      config: { host: '127.0.0.1', port: 25575, password: 'secret' },
      maxAttempts: 5,
      retryDelay: 500,
      failOnError: false,
    })
  })

  it('builds forRootAsync dynamic module with expected tokens', () => {
    const dynamicModule = RconCoreModule.forRootAsync(
      {
        useFactory: () => ({
          config: { host: '127.0.0.1', port: 25575, password: 'secret' },
          maxAttempts: 3,
          retryDelay: 1000,
          failOnError: true,
        }),
      },
      'main',
    )

    const connectionProvider = dynamicModule.providers?.find(
      (provider) => typeof provider === 'object' && provider && 'provide' in provider && provider.provide === getRconConnectionToken('main'),
    ) as TestedProvider | undefined

    expect(dynamicModule.module).toBe(RconCoreModule)
    expect(dynamicModule.exports).toHaveLength(1)
    expect(connectionProvider).toBeDefined()
    expect(connectionProvider && typeof connectionProvider === 'object' && 'inject' in connectionProvider ? connectionProvider.inject : []).toEqual([
      getRconOptionsToken('main'),
    ])

    if (connectionProvider && typeof connectionProvider === 'object' && 'useFactory' in connectionProvider) {
      const createdConnection = connectionProvider.useFactory?.({
        config: { host: '127.0.0.1', port: 25575, password: 'secret' },
        maxAttempts: 3,
        retryDelay: 1000,
        failOnError: true,
      })
      expect(createdConnection).toBeDefined()
    }
  })
})

describe('RconModule', () => {
  it('wraps RconCoreModule.forRoot into imports', () => {
    const options = {
      config: { host: '127.0.0.1', port: 25575, password: 'secret' },
      maxAttempts: 3,
      retryDelay: 1000,
      failOnError: true,
    }
    const dynamicModule = RconModule.forRoot(options, 'main')

    expect(dynamicModule.module).toBe(RconModule)
    expect(dynamicModule.exports).toEqual([RconCoreModule])
    expect(dynamicModule.imports).toHaveLength(1)
    const importedCore = dynamicModule.imports?.[0]
    expect(typeof importedCore === 'object' && importedCore && 'module' in importedCore ? importedCore.module : null).toBe(
      RconCoreModule,
    )
  })

  it('wraps RconCoreModule.forRootAsync into imports', () => {
    const dynamicModule = RconModule.forRootAsync(
      {
        useFactory: () => ({
          config: { host: '127.0.0.1', port: 25575, password: 'secret' },
          maxAttempts: 3,
          retryDelay: 1000,
          failOnError: true,
        }),
      },
      'main',
    )

    expect(dynamicModule.module).toBe(RconModule)
    expect(dynamicModule.exports).toEqual([RconCoreModule])
    expect(dynamicModule.imports).toHaveLength(1)
    const importedCore = dynamicModule.imports?.[0]
    expect(typeof importedCore === 'object' && importedCore && 'module' in importedCore ? importedCore.module : null).toBe(
      RconCoreModule,
    )
  })
})
