import { Static, Type } from '@sinclair/typebox';

export const ResponseError = Type.Object({
  error: Type.Optional(
    Type.Object({
      status: Type.Integer({ minimum: 400, maximum: 599 }),
      message: Type.String(),
    }),
  ),
});
export type ResponseError = Static<typeof ResponseError>;
