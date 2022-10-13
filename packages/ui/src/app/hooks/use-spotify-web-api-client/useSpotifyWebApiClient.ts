import { createWebApiClient } from '@spotify-playlist-manager/spotify-sdk';

export const useSpotifyWebApiClient = (token?: string) => createWebApiClient(token);
