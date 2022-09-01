import { useSpotifyAuth } from '@contexts/spotify-auth/SpotifyAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SpotifyLoginCallbackHandler = () => {
  const {
    state: { accessToken, refreshToken },
    setAccessToken,
    setRefreshToken,
  } = useSpotifyAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/callback${window.location.search}`, { credentials: 'include' }).then(
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
