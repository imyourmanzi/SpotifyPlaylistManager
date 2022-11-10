import { environmentBase } from './environment.base';

export const environment = {
  ...environmentBase,
  production: false,
  redirectURI: 'http://localhost:4200/callback/',
  logConfig: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
};
