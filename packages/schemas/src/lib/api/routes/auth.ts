import { Static, Type } from '@sinclair/typebox';

export const GetLoginResponse = {
  200: Type.Object({ authRedirect: Type.String() }),
};
export type GetLoginResponse = Static<typeof GetLoginResponse[200]>;

export const GetCallbackResponse = {
  200: Type.Object({
    access_token: Type.String(),
    refresh_token: Type.String(),
  }),
  400: Type.Object({
    error: Type.Union([
      Type.Literal('missing_code'),
      Type.Literal('state_mismatch'),
      Type.Literal('invalid_token'),
    ]),
  }),
};
export type GetCallbackResponse =
  | Static<typeof GetCallbackResponse[200]>
  | Static<typeof GetCallbackResponse[400]>;

export const PostRefreshTokenBody = Type.Object({
  refreshToken: Type.String(),
});
export type PostRefreshTokenBody = Static<typeof PostRefreshTokenBody>;

export const PostRefreshTokenResponse = {
  200: Type.Object({
    access_token: Type.String(),
    refresh_token: Type.Optional(Type.String()),
  }),
  500: Type.Object({ error: Type.Literal('refresh_failure') }),
};
export type PostRefreshTokenResponse =
  | Static<typeof PostRefreshTokenResponse[200]>
  | Static<typeof PostRefreshTokenResponse[500]>;
