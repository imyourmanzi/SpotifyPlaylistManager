import { environmentBase, EnvironmentConfig } from './environment.base';

export const environment: EnvironmentConfig = {
  ...environmentBase,
  production: true,
  redirectURI: 'TODO: set the prod redirect URI',
  logConfig: true,
  host: '0.0.0.0',
};
