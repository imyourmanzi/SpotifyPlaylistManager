import type { AxiosInstance } from 'axios';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createWebApiClient } from '@spotify-playlist-manager/spotify-sdk';
import fp from 'fastify-plugin';
import { BodySpotifyTokenType } from '../shared/schemas/spotify-token-schema';

declare module 'fastify' {
  interface FastifyRequest {
    webApi: AxiosInstance;
  }
}

export type SpotifyWebApiClientOptions = {};

const decorateRequestWithWebApiClient: FastifyPluginAsyncTypebox<
  SpotifyWebApiClientOptions
> = async (fastify) => {
  fastify.addHook<{ Body: Partial<BodySpotifyTokenType> }>(
    'preHandler',
    async (request) => {
      const { token } = request.body;
      fastify.decorateRequest('webApi', createWebApiClient(token));
    },
  );
};

export const SpotifyWebApiClient = fp(decorateRequestWithWebApiClient, {
  fastify: '4.x',
  name: 'spotify-web-api-client',
});

export default SpotifyWebApiClient;
