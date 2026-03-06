import { describe, expect, it } from 'bun:test'
import { getRconConnectionToken, getRconOptionsToken } from '../src/rcon.utils'

describe('rcon.utils', () => {
  it('returns default tokens when connection is not provided', () => {
    expect(getRconOptionsToken('')).toBe('default_RconModuleOptionsToken')
    expect(getRconConnectionToken('')).toBe('default_RconModuleConnectionToken')
  })

  it('returns namespaced tokens when connection is provided', () => {
    expect(getRconOptionsToken('custom')).toBe('custom_RconModuleOptionsToken')
    expect(getRconConnectionToken('custom')).toBe('custom_RconModuleConnectionToken')
  })
})
