import { useSpotifyAuth } from '@spotify-playlist-manager/ui/contexts/spotify-auth/SpotifyAuth';
import { Heading, HeadingLevel } from 'baseui/heading';
import { ListItem, ListItemLabel } from 'baseui/list';
import { toaster, ToasterContainer } from 'baseui/toast';
import { useEffect, useState } from 'react';
import {
  SPOTIFY_WEB_API_BASE_URL,
  GetCurrentUserPlaylists,
} from '@spotify-playlist-manager/spotify-sdk';

export const Playlists = () => {
  const {
    state: { accessToken },
  } = useSpotifyAuth();
  const [playlists, setPlaylists] = useState<GetCurrentUserPlaylists['items']>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(false);

  const getUserPlaylists = async () => {
    if (!accessToken || requestLoading || requestError) {
      return;
    }

    // starting the request
    setRequestLoading(true);

    try {
      const playlistsResponse = await fetch(`${SPOTIFY_WEB_API_BASE_URL}/me/playlists`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const playlistsData = (await playlistsResponse.json()) as GetCurrentUserPlaylists;

      if (playlistsData.error) {
        setRequestError(true);
        toaster.negative(
          'Unable to retrieve your playlists, please refresh or log out and back in again',
          {
            autoHideDuration: 4000,
            onClose: () => setRequestError(false),
          },
        );
        return;
      }

      setPlaylists(playlistsData.items);
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    getUserPlaylists().catch();
  }, []);

  return (
    <ToasterContainer>
      {!!playlists.length && (
        <HeadingLevel>
          <Heading>Playlists</Heading>
          <ul>
            {playlists.map((playlist) => (
              <ListItem key={playlist.id}>
                <ListItemLabel description={`${playlist.tracks.total} tracks`}>
                  {playlist.name}
                </ListItemLabel>
              </ListItem>
            ))}
          </ul>
        </HeadingLevel>
      )}
    </ToasterContainer>
  );
};
