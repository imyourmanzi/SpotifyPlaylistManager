import { environmentBase, EnvironmentConfig } from './environment.base';

const { SPOTIFY_REDIRECT_URI: redirectURI } = process.env;

if (!redirectURI) {
  console.error({ msg: 'Missing redirect URI! Exiting...' });
  process.exit(1);
}

export const environment: EnvironmentConfig = {
  ...environmentBase,
  production: true,
  redirectURI,
  logConfig: true,
  host: '0.0.0.0',
};
