import { useSpotifyAuth } from '@spotify-playlist-manager/ui/contexts/spotify-auth/SpotifyAuth';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * A transient component that handles the result of Spotify's authentication handler
 * redirecting the user back to the app.
 *
 * It stores the access and refresh tokens in the context from {@link useSpotifyAuth}.
 */
export const SpotifyLoginCallbackHandler = () => {
  const {
    state: { accessToken, refreshToken },
    setAccessToken,
    setRefreshToken,
  } = useSpotifyAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/callback${location.search}`, { credentials: 'include' }).then(
      async (response) => {
        const { access_token, refresh_token, error } = await response.json();

        if (error) {
          return;
        }

        setAccessToken(access_token);
        setRefreshToken(refresh_token);
      },
    );
  }, []);

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      return;
    }

    navigate('/me');
  }, [accessToken, refreshToken]);

  return <></>;
};
