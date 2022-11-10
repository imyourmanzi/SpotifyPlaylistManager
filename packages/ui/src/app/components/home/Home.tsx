import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { Heading, HeadingLevel } from 'baseui/heading';
import { toaster, ToasterContainer } from 'baseui/toast';
import { ParagraphLarge } from 'baseui/typography';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotifyAuth } from '../../contexts/spotify-auth/SpotifyAuth';

export const Home = () => {
  const [css, theme] = useStyletron();
  const {
    state: { accessToken, refreshToken },
  } = useSpotifyAuth();

  const [redirectUri, setRedirectUri] = useState('');
  const [hasError, setHasError] = useState(false);

  /**
   * Convenience function to show a generic error message for this simple component.
   * Ensures multiple duplicate errors are not shown.
   */
  const showErrorToast = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      toaster.negative('Login is currently unavailable', {
        autoHideDuration: 4000,
        onClose: () => setHasError(false),
      });
    }
  }, [hasError]);

  // get the server to generate the redirect URL, but then place it in the DOM
  useEffect(() => {
    if ((accessToken && refreshToken) || redirectUri) {
      return;
    }

    setHasError(false);
    fetch('/api/auth/login')
      .then(async (response) => {
        const { authRedirect } = await response.json();
        setRedirectUri(authRedirect);
      })
      .catch(() => showErrorToast());
  }, [accessToken, refreshToken, redirectUri, showErrorToast]);

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
      <HeadingLevel>
        <Heading>Resume control.</Heading>
        <ParagraphLarge>
          Take back control over the playlists in your Spotify account.
        </ParagraphLarge>
        {accessToken && refreshToken ? (
          <ParagraphLarge>Hooray, you're already logged in!</ParagraphLarge>
        ) : (
          <div className={css({ textAlign: 'center' })}>
            <Button
              kind="primary"
              startEnhancer={<FontAwesomeIcon icon={solid('play')} />}
              onClick={onLoginInitiate}
              overrides={{
                BaseButton: {
                  style: {
                    backgroundColor: theme.colors.backgroundAccent,
                  },
                },
              }}
            >
              Log in with Spotify to get started
            </Button>
          </div>
        )}
      </HeadingLevel>
    </ToasterContainer>
  );
};
