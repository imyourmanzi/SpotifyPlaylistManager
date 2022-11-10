import { Static, Type } from '@sinclair/typebox';

export const HeadersContentTypeJson = Type.Object(
  {
    'content-type': Type.Literal('application/json'),
  },
  { $id: 'headers.contentType:json' },
);

export type HeadersContentTypeJson = Static<typeof HeadersContentTypeJson>;
