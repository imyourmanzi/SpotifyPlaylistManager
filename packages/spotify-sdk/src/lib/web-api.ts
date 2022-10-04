import { ResponseError } from './response-error';

export const SPOTIFY_WEB_API_VERSION = '1.0.0';
export const SPOTIFY_WEB_API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Response for `GET /me`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-current-users-profile
 */
export type GetMe = ResponseError & {
  country: string;
  display_name: string | null;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  product?: string;
  type: 'user';
  uri: string;
};

/**
 * Response for `GET /playlists/{playlist_id}`.
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist
 */
export type GetPlaylist = ResponseError & {
  collaborative: boolean;
  description: string | null;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  name: string;
  owner: {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    href: string;
    id: string;
    type: 'user';
    uri: string;
  } & {
    display_name: string | null;
  };
  public: boolean | null;
  snapshot_id: string;
  tracks: {
    href: string;
    items: Record<string, string>[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  type: 'playlist';
  uri: string;
};

/**
 * Response for `GET /me/playlists`
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-list-of-current-users-playlists
 */
export type GetCurrentUserPlaylists = ResponseError & {
  href: string;
  items: {
    collaborative: boolean;
    description: string | null;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    images: {
      url: string;
      height: number | null;
      width: number | null;
    }[];
    name: string;
    owner: {
      display_name: string;
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      type: 'user';
      uri: string;
    };
    primary_color: null;
    public: boolean;
    snapshot_id: string;
    tracks: {
      href: string;
      total: number;
    };
    type: 'playlist';
    uri: string;
  }[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};
