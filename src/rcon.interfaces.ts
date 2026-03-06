import { ModuleMetadata, Type } from '@nestjs/common'
import { RconOptions } from 'rcon-client'

export interface RconModuleOptions {
  config: RconOptions
  maxAttempts: number
  retryDelay: number
  failOnError: boolean
}

export type { RconOptions } from 'rcon-client'
export { Rcon } from 'rcon-client'

export interface RconModuleOptionsFactory {
  createRconModuleOptions(): Promise<RconModuleOptions> | RconModuleOptions
}

export interface RconModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[]
  useClass?: Type<RconModuleOptionsFactory>
  useExisting?: Type<RconModuleOptionsFactory>
  useFactory?: (...args: any[]) => Promise<RconModuleOptions> | RconModuleOptions
}
