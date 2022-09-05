import { Button } from 'baseui/button';
import { toaster, ToasterContainer } from 'baseui/toast';
import { ParagraphSmall } from 'baseui/typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotifyAuth } from '@contexts/spotify-auth/SpotifyAuth';

export const Home = () => {
  const [redirectUri, setRedirectUri] = useState('');
  const [hasError, setHasError] = useState(false);

  const {
    state: { accessToken, refreshToken },
  } = useSpotifyAuth();

  /**
   * Convenience function to show a generic error message for this simple component.
   * Ensures multiple duplicate errors are not shown.
   */
  const showErrorToast = () => {
    if (!hasError) {
      setHasError(true);
      toaster.negative('Login is currently unavailable', {
        autoHideDuration: 4000,
        onClose: () => setHasError(false),
      });
    }
  };

  // get the server to generate the redirect URL, but then place it in the DOM
  useEffect(() => {
    if ((accessToken && refreshToken) || redirectUri) {
      return;
    }

    setHasError(false);
    fetch('/api/login')
      .then(async (response) => {
        const { authRedirect } = await response.json();
        setRedirectUri(authRedirect);
      })
      .catch(() => showErrorToast());
  }, []);

  const navigate = useNavigate();

  const onLoginInitiate = () => {
    if (accessToken && refreshToken) {
      navigate('me');
    }

    if (!redirectUri) {
      showErrorToast();
      return;
    }

    window.location.href = redirectUri;
  };

  return (
    <ToasterContainer>
      <ParagraphSmall>
        <Button kind="primary" onClick={onLoginInitiate}>
          Log in with Spotify to get started
        </Button>
      </ParagraphSmall>
    </ToasterContainer>
  );
};
