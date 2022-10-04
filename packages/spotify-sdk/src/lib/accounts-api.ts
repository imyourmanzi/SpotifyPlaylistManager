import { ResponseError } from './response-error';

export const SPOTIFY_ACCOUNTS_BASE_URL = 'https://accounts.spotify.com';

/**
 * Body for `POST /api/token` (Authorization Code w/o PKCE)
 * https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
 */
export type PostAPITokenBody =
  | {
      grant_type: 'authorization_code';
      code: string;
      redirect_uri: string;
    }
  | {
      grant_type: 'refresh_token';
      refresh_token: string;
    };

/**
 * Response for `POST /api/token`
 * https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
 */
export type PostAPIToken<TokenType extends string = ''> = ResponseError & {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
} & (TokenType extends 'access' ? { refresh_token: string } : {});
