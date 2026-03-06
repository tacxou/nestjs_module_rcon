import { describe, expect, it, mock } from 'bun:test'
import { RconModuleOptions } from '../src/rcon.interfaces'
import { RconManager } from '../src/rcon.manager'
import { createRconConnection } from '../src/rcon.utils'

describe('RconManager', () => {
  it('initializes successfully and marks manager as initialized', async () => {
    const manager = new RconManager({
      host: '127.0.0.1',
      port: 25575,
      password: 'secret',
    } as unknown as RconModuleOptions['config'])

    const connectMock = mock(async () => undefined)
    ;(manager.defaultClient as unknown as { connect: () => Promise<void> }).connect = connectMock

    await manager.initialize()

    expect(connectMock).toHaveBeenCalledTimes(1)
    expect(manager.initialized).toBe(true)
  })

  it('logs and schedules a retry when initialize fails', async () => {
    const manager = new RconManager({
      host: '127.0.0.1',
      port: 25575,
      password: 'secret',
    } as unknown as RconModuleOptions['config'])

    const connectError = new Error('connection failed')
    const connectMock = mock(async () => {
      throw connectError
    })
    const errorMock = mock(() => undefined)
    const originalSetTimeout = globalThis.setTimeout
    const setTimeoutMock = mock((callback: (...args: unknown[]) => void, delay?: number) => {
      void callback
      return 0 as unknown as ReturnType<typeof setTimeout>
    })

    ;(manager.defaultClient as unknown as { connect: () => Promise<void> }).connect = connectMock
    Reflect.set(manager, 'logger', { error: errorMock })
    ;(globalThis as unknown as { setTimeout: typeof setTimeout }).setTimeout = setTimeoutMock as unknown as typeof setTimeout

    try {
      await manager.initialize()

      expect(connectMock).toHaveBeenCalledTimes(1)
      expect(errorMock).toHaveBeenCalledWith('Error connecting to RCON server', connectError)
      expect(setTimeoutMock).toHaveBeenCalledTimes(1)
      expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), 5000)
      expect(manager.initialized).toBe(true)
    } finally {
      ;(globalThis as unknown as { setTimeout: typeof setTimeout }).setTimeout = originalSetTimeout
    }
  })

  it('returns client by name and throws when client is missing', () => {
    const manager = new RconManager({
      host: '127.0.0.1',
      port: 25575,
      password: 'secret',
    } as unknown as RconModuleOptions['config'])

    expect(manager.getClient('default')).toBe(manager.defaultClient)
    expect(() => manager.getClient('missing')).toThrow('Rcon Connection missing not found')
  })
})

describe('createRconConnection', () => {
  it('initializes manager and returns default client', async () => {
    const fakeClient = { id: 'fake-rcon-client' }
    const initializeMock = mock(async () => undefined)
    const originalInitialize = RconManager.prototype.initialize
    const originalDefaultClientDescriptor = Object.getOwnPropertyDescriptor(RconManager.prototype, 'defaultClient')

    RconManager.prototype.initialize = initializeMock as unknown as typeof RconManager.prototype.initialize
    Object.defineProperty(RconManager.prototype, 'defaultClient', {
      configurable: true,
      get() {
        return fakeClient as unknown as RconManager['defaultClient']
      },
    })

    try {
      const connection = await createRconConnection(
        {
          config: { host: '127.0.0.1', port: 25575, password: 'secret' } as unknown as RconModuleOptions['config'],
          maxAttempts: 3,
          retryDelay: 1000,
          failOnError: true,
        },
        2,
      )

      expect(initializeMock).toHaveBeenCalledTimes(1)
      expect(connection).toBe(fakeClient as unknown as RconManager['defaultClient'])
    } finally {
      RconManager.prototype.initialize = originalInitialize
      if (originalDefaultClientDescriptor) {
        Object.defineProperty(RconManager.prototype, 'defaultClient', originalDefaultClientDescriptor)
      }
    }
  })
})
