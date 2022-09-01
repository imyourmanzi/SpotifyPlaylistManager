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
    console.log('making callback request', { query: window.location.search });
    fetch(`/api/callback${window.location.search}`, { credentials: 'include' }).then(
      async (response) => {
        const { access_token, refresh_token, error } = await response.json();

        if (error) {
          console.error({ message: 'callback error', error });
          return;
        }

        setAccessToken(access_token);
        setRefreshToken(refresh_token);
      },
    );
  }, []);

  useEffect(() => {
    console.log('entered useEffect', { accessToken, refreshToken });

    if (!accessToken || !refreshToken) {
      console.log('not navigating yet, missing data');
      return;
    }

    console.log('navigating to /me');
    navigate('/me');
  }, [accessToken, refreshToken]);

  return <></>;
};
