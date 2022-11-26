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
export type GetMeResponse = Static<typeof GetMeResponse>;

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
        followers: Type.Optional(
          Type.Object({
            href: Type.Union([Type.String(), Type.Null()]),
            total: Type.Number(),
          }),
        ),
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
export type GetPlaylistResponse = Static<typeof GetPlaylistResponse>;

/**
 * Response for `GET /playlist/{playlist_id}/tracks`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlists-tracks
 */
export const GetPlaylistTracksResponse = Type.Intersect([
  ResponseError,
  Type.Object({
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
]);
export type GetPlaylistTracksResponse = Static<typeof GetPlaylistTracksResponse>;

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
export type GetCurrentUserPlaylistsResponse = Static<
  typeof GetCurrentUserPlaylistsResponse
>;

/**
 * Body for `POST /users/{user_id}/playlists`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/create-playlist
 */
export const PostUserPlaylistsBody = Type.Object({
  name: Type.String(),
  public: Type.Optional(Type.Boolean()),
  collaborative: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String()),
});
export type PostUserPlaylistsBody = Static<typeof PostUserPlaylistsBody>;

/**
 * Response for `POST /users/{user_id}/playlists`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/create-playlist
 */
export const PostUserPlaylistsResponse = Type.Intersect([
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
        followers: Type.Optional(
          Type.Object({
            href: Type.Union([Type.String(), Type.Null()]),
            total: Type.Number(),
          }),
        ),
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
export type PostUserPlaylistsResponse = Static<typeof PostUserPlaylistsResponse>;

/**
 * Body for `POST /playlists/{playlist_id}/tracks`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/add-tracks-to-playlist
 */
export const PostPlaylistTracksBody = Type.Object({
  uris: Type.Array(Type.String(), { maxItems: 100 }),
  position: Type.Optional(Type.Integer({ minimum: 0 })),
});
export type PostPlaylistTracksBody = Static<typeof PostPlaylistTracksBody>;

/**
 * Response for `POST /playlists/{playlist_id}/tracks`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/add-tracks-to-playlist
 */
export const PostPlaylistTracksResponse = Type.Intersect([
  ResponseError,
  Type.Object({
    snapshot_id: Type.String(),
  }),
]);
export type PostPlaylistTracksResponse = Static<typeof PostPlaylistTracksResponse>;

/**
 * Body for `PUT /playlists/{playlist_id}/followers`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/follow-playlist
 */
export const PutPlaylistFollowersBody = Type.Object({
  public: Type.Optional(Type.Boolean()),
});
export type PutPlaylistFollowersBody = Static<typeof PutPlaylistFollowersBody>;

/**
 * Response for `PUT /playlists/{playlist_id}/followers`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/follow-playlist
 */
export const PutPlaylistFollowersResponse = Type.Intersect([ResponseError]);
export type PutPlaylistFollowersResponse = Static<typeof PutPlaylistFollowersResponse>;

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
