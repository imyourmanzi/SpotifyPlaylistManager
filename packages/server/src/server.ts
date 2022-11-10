import Fastify from 'fastify';
import FastifyCookie from '@fastify/cookie';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import * as qs from 'qs';
import spotifyWebApiClient from './plugins/spotify-web-api-client';
import authRoutes from './routes/auth';
import playlistsRoutes from './routes/playlists';
import { HeadersContentTypeJson } from './shared/schemas/content-type-schemas';

// set up server
export const server = Fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
}).withTypeProvider<TypeBoxTypeProvider>();

server.addSchema(HeadersContentTypeJson);

server.register(FastifyCookie);

server.get('/healthcheck', (_, reply) => reply.status(200).send());

// set up API
server.register(
  async (apiInstance) => {
    // API plugins
    server.register(spotifyWebApiClient);

    // API routes
    await apiInstance.register(authRoutes);
    await apiInstance.register(playlistsRoutes);
  },
  { prefix: '/api' },
);
