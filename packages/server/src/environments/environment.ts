import { environmentBase } from './environment.base';

export const environment = {
  ...environmentBase,
  production: false,
  redirectURI: 'http://localhost:4200/callback/',
};
