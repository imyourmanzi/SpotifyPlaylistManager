import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  HeadersContentTypeJson,
  HydratedPlaylists,
  PostPlaylistsExportBody,
  PostPlaylistsExportResponse,
} from '@spotify-playlist-manager/schemas';
import type { GetPlaylistTracksResponse } from '@spotify-playlist-manager/spotify-sdk';
import type { AxiosInstance } from 'axios';
import fp from 'fastify-plugin';
import * as JSZip from 'jszip';
import { URL } from 'url';

/**
 * Router's instance of JSZip
 */
const zip = new JSZip();

/**
 * Load all tracks in a playlist.
 *
 * @param spotify the Axios client from the request, should have its own auth
 * @playlistId ID of the playlist to fetch tracks for
 * @param nextRequest the request URL to use in the next fetch
 * @param accumulatedResponse accumulates all of the tracks over every response
 * @returns the `accumulatedResponse` once Spotify indicates there are no more tracks
 */
const getAllPlaylistTracks = async (
  spotify: AxiosInstance,
  playlistId: string,
  nextRequest:
    | string
    | null = `${spotify.defaults.baseURL}/playlists/${playlistId}/tracks`,
  accumulatedResponse: GetPlaylistTracksResponse = {
    href: '',
    items: [],
    limit: 50,
    next: null,
    offset: 0,
    previous: null,
    total: 0,
  },
): Promise<GetPlaylistTracksResponse> => {
  if (nextRequest == null) {
    return accumulatedResponse;
  }

  const url = new URL(nextRequest);
  url.searchParams.set('limit', '50');
  url.searchParams.sort();

  const { data } = await spotify.get<GetPlaylistTracksResponse>(url.toString());

  const updatedAccumulation = {
    ...accumulatedResponse,
    items: [...accumulatedResponse.items, ...data.items],
    next: data.next,
    offset: data.offset,
    total: data.total,
  };

  return getAllPlaylistTracks(spotify, playlistId, data.next, updatedAccumulation);
};

const routes: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(
    async (prefixedInstance) => {
      prefixedInstance.post<{
        Headers: HeadersContentTypeJson;
        Body: PostPlaylistsExportBody;
        Reply: NodeJS.ReadableStream;
      }>(
        '/export',
        {
          schema: {
            headers: prefixedInstance.getSchema('headers.contentType:json'),
            body: PostPlaylistsExportBody,
            response: PostPlaylistsExportResponse,
          },
        },
        async (request, reply) => {
          const { playlists } = request.body;

          // hydrate the playlists, stored in memory
          type HydratedPlaylist = HydratedPlaylists[number];
          const hydratedPlaylists = await Promise.all(
            playlists.map(async ({ id, ownerId }) => {
              const userIsOwner = ownerId === request.user.id;

              let playlist: HydratedPlaylist;
              ({ data: playlist } = await request.spotify.get<HydratedPlaylist>(
                `/playlists/${id}`,
                // don't immediately fetch tracks, we may not need them
                { params: { fields: '(!tracks)' } },
              ));

              // if the user is the owner, then we'll fetch the tracks
              if (userIsOwner && !playlist.error) {
                playlist = {
                  ...playlist,
                  tracks: await getAllPlaylistTracks(request.spotify, id),
                };
              }

              return playlist;
            }),
          );

          // archive the playlists in export.json, which has then been zipped up
          const exportData = zip
            .file(`export.json`, JSON.stringify(hydratedPlaylists))
            .generateNodeStream({
              type: 'nodebuffer',
              streamFiles: true,
              compression: 'DEFLATE',
              compressionOptions: { level: 9 },
            });

          // send the raw archive data back to the requester
          return reply.send(exportData);
        },
      );
    },
    { prefix: '/playlists' },
  );
};

export default fp(routes, {
  fastify: '4.x',
  dependencies: ['spotify-web-api-client', 'spotify-auth-user'],
  decorators: {
    request: ['spotify', 'user'],
  },
});
