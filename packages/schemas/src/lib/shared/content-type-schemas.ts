import { Static, Type } from '@sinclair/typebox';

export const HeadersContentTypeJson = Type.Object(
  {
    'content-type': Type.Literal('application/json'),
  },
  { $id: 'headers.contentType:json' },
);

export type HeadersContentTypeJson = Static<typeof HeadersContentTypeJson>;

export const HeadersContentTypeForm = Type.Object(
  {
    'content-type': Type.String({
      pattern: '(application/x-www-form-urlencoded|multipart/form-data; .*)',
    }),
  },
  { $id: 'headers.contentType:form' },
);

export type HeadersContentTypeForm = Static<typeof HeadersContentTypeForm>;
