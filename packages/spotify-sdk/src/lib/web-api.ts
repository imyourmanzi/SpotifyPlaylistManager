import axios from 'axios';
import { Static, Type } from '@sinclair/typebox';
import { ResponseError } from './response-error';

export const SPOTIFY_WEB_API_VERSION = '1.0.0';
export const SPOTIFY_WEB_API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Response for `GET /me`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-current-users-profile
 */
export const GetMeResponse = Type.Intersect([
  ResponseError,
  Type.Object({
    country: Type.String(),
    display_name: Type.Union([Type.String(), Type.Null()]),
    email: Type.String(),
    explicit_content: Type.Object({
      filter_enabled: Type.Boolean(),
      filter_locked: Type.Boolean(),
    }),
    external_urls: Type.Object({
      spotify: Type.String(),
    }),
    followers: Type.Object({
      href: Type.Union([Type.String(), Type.Null()]),
      total: Type.Number(),
    }),
    href: Type.String(),
    id: Type.String(),
    images: Type.Array(
      Type.Object({
        url: Type.String(),
        height: Type.Number(),
        width: Type.Number(),
      }),
    ),
    product: Type.String(),
    type: Type.Literal('user'),
    uri: Type.String(),
  }),
]);
export type GetMeResponseType = Static<typeof GetMeResponse>;

/**
 * Response for `GET /playlists/{playlist_id}`.
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist
 */
export const GetPlaylistResponse = Type.Intersect([
  ResponseError,
  Type.Object({
    collaborative: Type.Boolean(),
    description: Type.Union([Type.String(), Type.Null()]),
    external_urls: Type.Object({
      spotify: Type.String(),
    }),
    followers: Type.Object({
      href: Type.Union([Type.String(), Type.Null()]),
      total: Type.Number(),
    }),
    href: Type.String(),
    id: Type.String(),
    images: Type.Array(
      Type.Object({
        url: Type.String(),
        height: Type.Number(),
        width: Type.Number(),
      }),
    ),
    name: Type.String(),
    owner: Type.Intersect([
      Type.Object({
        external_urls: Type.Object({
          spotify: Type.String(),
        }),
        followers: Type.Object({
          href: Type.Union([Type.String(), Type.Null()]),
          total: Type.Number(),
        }),
        href: Type.String(),
        id: Type.String(),
        type: Type.Literal('user'),
        uri: Type.String(),
      }),
      Type.Object({
        display_name: Type.Union([Type.String(), Type.Null()]),
      }),
    ]),
    public: Type.Union([Type.Boolean(), Type.Null()]),
    snapshot_id: Type.String(),
    tracks: Type.Object({
      href: Type.String(),
      /** Defined by the `GET /tracks/{track_id}` docs
       * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-track
       */
      items: Type.Array(
        Type.Object({
          added_at: Type.String(),
          added_by: Type.Object({
            external_urls: Type.Object({
              spotify: Type.String(),
            }),
            href: Type.String(),
            id: Type.String(),
            type: Type.Literal('user'),
            uri: Type.String(),
          }),
          is_local: Type.Boolean(),
          primary_color: Type.Union([Type.Null()]),
          track: Type.Object({
            album: Type.Object({
              album_type: Type.Union([
                Type.Literal('album'),
                Type.Literal('single'),
                Type.Literal('compilation'),
              ]),
              artists: Type.Array(
                Type.Object({
                  external_urls: Type.Object({
                    spotify: Type.String(),
                  }),
                  href: Type.String(),
                  id: Type.String(),
                  type: Type.Literal('artist'),
                  uri: Type.String(),
                  name: Type.String(),
                }),
              ),
              available_markets: Type.Array(Type.String()),
              external_urls: Type.Object({
                spotify: Type.String(),
              }),
              href: Type.String(),
              id: Type.String(),
              images: Type.Array(
                Type.Object({
                  height: Type.Number(),
                  url: Type.String(),
                  width: Type.Number(),
                }),
              ),
              name: Type.String(),
              release_date: Type.String(),
              release_date_precision: Type.Union([
                Type.Literal('year'),
                Type.Literal('month'),
                Type.Literal('day'),
              ]),
              total_tracks: Type.Number(),
              type: Type.Literal('album'),
              uri: Type.String(),
            }),
            artists: Type.Array(
              Type.Object({
                external_urls: Type.Object({
                  spotify: Type.String(),
                }),
                href: Type.String(),
                id: Type.String(),
                type: Type.Literal('artist'),
                uri: Type.String(),
                name: Type.String(),
              }),
            ),
            available_markets: Type.Array(Type.String()),
            disc_number: Type.Number(),
            duration_ms: Type.Number(),
            episode: Type.Boolean(),
            explicit: Type.Boolean(),
            external_ids: Type.Partial(
              Type.Object({
                isrc: Type.String(),
                ean: Type.String(),
                upc: Type.String(),
              }),
            ),
            external_urls: Type.Object({
              spotify: Type.String(),
            }),
            href: Type.String(),
            id: Type.String(),
            is_local: Type.Boolean(),
            name: Type.String(),
            popularity: Type.Number(),
            preview_url: Type.String(),
            track: Type.Boolean(),
            track_number: Type.Number(),
            type: Type.Literal('track'),
            uri: Type.String(),
          }),
          video_thumbnail: Type.Object({
            url: Type.Union([Type.String(), Type.Null()]),
          }),
        }),
      ),
      limit: Type.Number(),
      next: Type.Union([Type.String(), Type.Null()]),
      offset: Type.Number(),
      previous: Type.Union([Type.String(), Type.Null()]),
      total: Type.Number(),
    }),
    type: Type.Literal('playlist'),
    uri: Type.String(),
  }),
]);
export type GetPlaylistResponseType = Static<typeof GetPlaylistResponse>;

/**
 * Response for `GET /me/playlists`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-list-of-current-users-playlists
 */
export const GetCurrentUserPlaylistsResponse = Type.Intersect([
  ResponseError,
  Type.Object({
    href: Type.String(),
    items: Type.Array(
      Type.Object({
        collaborative: Type.Boolean(),
        description: Type.Union([Type.String(), Type.Null()]),
        external_urls: Type.Object({
          spotify: Type.String(),
        }),
        href: Type.String(),
        id: Type.String(),
        images: Type.Array(
          Type.Object({
            url: Type.String(),
            height: Type.Union([Type.Number(), Type.Null()]),
            width: Type.Union([Type.Number(), Type.Null()]),
          }),
        ),
        name: Type.String(),
        owner: Type.Object({
          display_name: Type.String(),
          external_urls: Type.Object({
            spotify: Type.String(),
          }),
          href: Type.String(),
          id: Type.String(),
          type: Type.Literal('user'),
          uri: Type.String(),
        }),
        primary_color: Type.Null(),
        public: Type.Boolean(),
        snapshot_id: Type.String(),
        tracks: Type.Object({
          href: Type.String(),
          total: Type.Number(),
        }),
        type: Type.Literal('playlist'),
        uri: Type.String(),
      }),
    ),
    limit: Type.Number(),
    next: Type.Union([Type.String(), Type.Null()]),
    offset: Type.Number(),
    previous: Type.Union([Type.String(), Type.Null()]),
    total: Type.Number(),
  }),
]);
export type GetCurrentUserPlaylistsResponseType = Static<
  typeof GetCurrentUserPlaylistsResponse
>;

/**
 * Factory function to create a new axios client for the Spotify Web API, optionally with
 * the access token baked into the client.
 *
 * @param token the access token to use for requests to the Spotify Web API
 * @returns an Axios client ready to hit the Spotify Web API
 */
export const createWebApiClient = (token?: string) =>
  axios.create({
    baseURL: SPOTIFY_WEB_API_BASE_URL,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
