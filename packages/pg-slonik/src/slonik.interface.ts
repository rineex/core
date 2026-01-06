import type { ClientConfigurationInput } from 'slonik';

export type SlonikConnectionName = string;
export type SlonikConnectionTags = string;

export interface SlonikConnectionConfig {
  name: SlonikConnectionName;
  options?: ClientConfigurationInput;
  dsn: string;
  tags?: SlonikConnectionTags[];
}

export interface SlonikModuleOptions {
  connections: SlonikConnectionConfig[];
}

export interface SlonikModuleExtraOptions {
  isGlobal?: boolean;
}
