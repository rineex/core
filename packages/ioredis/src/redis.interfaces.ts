import type { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';

export interface RedisSingleOptions {
  type: 'single';
  url?: string;
  options?: RedisOptions;
}

export interface RedisClusterOptions {
  type: 'cluster';
  nodes: ClusterNode[];
  options?: ClusterOptions;
}

export type RedisModuleOptions = RedisClusterOptions | RedisSingleOptions;

export interface RedisModuleExtraOptions {
  connection?: string;
}
