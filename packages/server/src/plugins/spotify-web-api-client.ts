import type { AxiosInstance } from 'axios';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createWebApiClient } from '@spotify-playlist-manager/spotify-sdk';
import fp from 'fastify-plugin';
import { BodySpotifyTokenType } from '../shared/schemas/spotify-token-schema';

declare module 'fastify' {
  interface FastifyRequest {
    spotify: AxiosInstance;
  }
}

export type SpotifyWebApiClientOptions = Record<string, never>;

const decorateRequestWithWebApiClient: FastifyPluginAsyncTypebox<
  SpotifyWebApiClientOptions
> = async (fastify) => {
  fastify.decorateRequest('spotify', null);
  fastify.addHook<{ Body?: Partial<BodySpotifyTokenType> }>(
    'preHandler',
    async (request) => {
      request.spotify = createWebApiClient(request.body?.token);
    },
  );
};

export default fp(decorateRequestWithWebApiClient, {
  fastify: '4.x',
  name: 'spotify-web-api-client',
});
