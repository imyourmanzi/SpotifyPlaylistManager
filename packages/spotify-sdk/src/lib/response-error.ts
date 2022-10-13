import { Static, Type } from '@sinclair/typebox';

export const ResponseError = Type.Object({
  error: Type.Optional(Type.Unknown()),
});

export type ResponseErrorType = Static<typeof ResponseError>;
