import { Static, Type } from '@sinclair/typebox';

export const HeadersContentTypeJson = Type.Object(
  {
    'Content-Type': Type.Literal('application/json'),
  },
  { $id: 'headers.contentType:json' },
);

export type HeadersContentTypeJsonType = Static<typeof HeadersContentTypeJson>;
