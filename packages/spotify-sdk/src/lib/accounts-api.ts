import { Static, Type } from '@sinclair/typebox';
import { ResponseError } from './response-error';

export const SPOTIFY_ACCOUNTS_BASE_URL = 'https://accounts.spotify.com';

/**
 * Body for `POST /api/token` (Authorization Code w/o PKCE)
 * https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
 */
export const PostApiTokenBody = Type.Union([
  Type.Object({
    grant_type: Type.Literal('authorization_code'),
    code: Type.String(),
    redirect_uri: Type.String(),
  }),
  Type.Object({
    grant_type: Type.Literal('refresh_token'),
    refresh_token: Type.String(),
  }),
]);
export type PostApiTokenBodyType = Static<typeof PostApiTokenBody>;

/**
 * Response for `POST /api/token`
 * https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
 */
export const PostApiTokenResponse = Type.Intersect([
  ResponseError,
  Type.Object({
    access_token: Type.String(),
    refresh_token: Type.Optional(Type.String()),
    token_type: Type.Literal('Bearer'),
    scope: Type.String(),
    expires_in: Type.Number(),
  }),
]);
export type PostApiTokenResponseType = Static<typeof PostApiTokenResponse>;
