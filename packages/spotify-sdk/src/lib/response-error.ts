import { Static, Type } from '@sinclair/typebox';

export const ResponseError = Type.Object({
  error: Type.Optional(Type.Unknown()),
});

export type ResponseError = Static<typeof ResponseError>;
