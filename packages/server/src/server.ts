import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyCookie from '@fastify/cookie';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import * as qs from 'qs';
import { router as authRouter, prefix as authPrefix } from './routers/auth-router';
import {
  router as playlistsRouter,
  prefix as playlistsPrefix,
} from './routers/playlists-router';
import { JSONContent } from './shared/schemas/content-type-schemas';

// set up server
const fastify = Fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.addSchema(JSONContent);

fastify.register(FastifyCors);
fastify.register(FastifyCookie);

fastify.get('/healthcheck', (_, reply) => reply.status(200).send());

// register API routes
fastify.register(
  async (apiInstance) => {
    await apiInstance.register(authRouter, { prefix: authPrefix });
    await apiInstance.register(playlistsRouter, { prefix: playlistsPrefix });
  },
  { prefix: '/api' },
);

export const server = fastify;
