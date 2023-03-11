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

  // reset the error state when dependent resources change
  useEffect(() => {
    if (accessToken && refreshToken) {
      return;
    }

    setHasError(false);
  }, [accessToken, refreshToken]);

  const navigate = useNavigate();

  const onLoginInitiate = () => {
    if (accessToken && refreshToken) {
      navigate('me');
      return;
    }

    fetch('/api/auth/login')
      .then(async (response) => {
        const { authRedirect } = await response.json();
        window.location.href = authRedirect;
      })
      .catch(() => showErrorToast());
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
