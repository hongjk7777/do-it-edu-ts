import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: '해냄학원 API',
    description: '해냄학원 성적 관리 웹사이트에 사용되는 API',
    version: '2.0',
    path: 'api',
  },
  graphql: {
    playgroundEnabled: false,
    debug: true,
    schemaDestination: './src/schema.graphql',
    sortSchema: true,
  },
  security: {
    expiresIn: '59m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  cache: {
    ttl: 0,
  },
};

export default (): Config => config;
