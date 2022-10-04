import { Static, Type } from '@sinclair/typebox';

export const JSONContent = Type.Object(
  {
    'Content-Type': Type.Literal('application/json'),
  },
  { $id: 'json.contentType' },
);

export type JSONContentType = Static<typeof JSONContent>;
