import { environmentBase, EnvironmentConfig } from './environment.base';

export const environment: EnvironmentConfig = {
  ...environmentBase,
  production: false,
  redirectURI: 'http://localhost:4200/callback/',
  logConfig: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
};
