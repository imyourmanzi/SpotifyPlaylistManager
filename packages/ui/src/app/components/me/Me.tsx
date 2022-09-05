import { useStyletron } from 'baseui';
import { Avatar } from 'baseui/avatar';
import { Button } from 'baseui/button';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { Heading, HeadingLevel } from 'baseui/heading';
import { StyledLink } from 'baseui/link';
import { ListItem, ListItemLabel } from 'baseui/list';
import { LabelSmall, MonoLabelSmall, ParagraphSmall } from 'baseui/typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotifyAuth } from '@contexts/spotify-auth/SpotifyAuth';
import { toaster, ToasterContainer } from 'baseui/toast';

/**
 * A property for each request type this component makes, allowing storing state to be
 * more concise and consistent for all request (e.g. for loading or error states).
 */
type RequestTypes = {
  me: boolean;
  newToken: boolean;
  playlists: boolean;
};

export const Me = () => {
  const {
    state: { accessToken, refreshToken },
    setAccessToken,
    setRefreshToken,
  } = useSpotifyAuth();

  const [loadingStates, setLoadingStates] = useState<RequestTypes>({
    me: false,
    newToken: false,
    playlists: false,
  });

  const [errors, setErrors] = useState<RequestTypes>({
    me: false,
    newToken: false,
    playlists: false,
  });

  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [playlists, setPlaylists] = useState<
    { id: string; name: string; tracks: { total: number } }[]
  >([]);

  const [css, theme] = useStyletron();

  useEffect(
    () => {
      if (!accessToken || errors.me) {
        return;
      }

      setLoadingStates({ ...loadingStates, me: true });
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(async (response) => {
          const data = await response.json();

          if (data.error) {
            setErrors({ ...errors, me: true });
            toaster.negative(
              'Unable to fetch user data, please refresh or log out and back in again',
              {
                autoHideDuration: 4000,
                onClose: () => {
                  setErrors({ ...errors, me: false });
                },
              },
            );
            return;
          }

          setUserData(data);
        })
        .finally(() => {
          setLoadingStates({ ...loadingStates, me: false });
        });
    },
    [accessToken], // purposefully leaving out `errors` so we don't constantly retry when the toast closes
  );

  const navigate = useNavigate();

  const logout: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();

    setAccessToken('');
    setRefreshToken('');

    navigate(new URL(event.currentTarget.href).pathname);
  };

  const fetchNewToken = () => {
    if (!refreshToken || errors.newToken) {
      return;
    }

    setLoadingStates({ ...loadingStates, newToken: true });
    fetch(
      `/api/refresh_token?${new URLSearchParams({
        refresh_token: refreshToken,
      }).toString()}`,
    )
      .then(async (response) => {
        const { access_token, error } = await response.json();

        if (error) {
          setErrors({ ...errors, newToken: true });
          toaster.negative(
            'Unable to fetch new token, please refresh or log out and back in again',
            {
              autoHideDuration: 4000,
              onClose: () => {
                setErrors({ ...errors, newToken: false });
              },
            },
          );
          return;
        }

        setAccessToken(access_token as string);
      })
      .finally(() => {
        setLoadingStates({ ...loadingStates, newToken: false });
      });
  };

  const getPlaylists = () => {
    if (!accessToken || !userData?.id || errors.playlists) {
      return;
    }

    setLoadingStates({ ...loadingStates, playlists: true });
    fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (data.error) {
          setErrors({ ...errors, playlists: true });
          toaster.negative(
            'Unable to playlists, please refresh or log out and back in again',
            {
              autoHideDuration: 4000,
              onClose: () => {
                setErrors({ ...errors, playlists: false });
              },
            },
          );
          return;
        }

        setPlaylists(data.items);
      })
      .finally(() => {
        setLoadingStates({ ...loadingStates, playlists: false });
      });
  };

  return (
    <>
      <ToasterContainer>
        <div className={css({ width: '70%', margin: 'auto 15% 5%', textAlign: 'left' })}>
          <HeadingLevel>
            <FlexGrid flexGridColumnCount={2} alignItems={'baseline'}>
              <FlexGridItem>
                <Heading>Your Profile</Heading>
              </FlexGridItem>
              <FlexGridItem>
                <MonoLabelSmall className={css({ textAlign: 'right' })}>
                  {userData?.error
                    ? `logged in as ${userData.display_name}`
                    : 'data error'}{' '}
                  /{' '}
                  <StyledLink
                    className={css({ ...theme.typography.MonoLabelSmall })}
                    href="/"
                    onClick={logout}
                  >
                    logout
                  </StyledLink>
                </MonoLabelSmall>
              </FlexGridItem>
            </FlexGrid>
            {!loadingStates.me && !errors.me && userData && (
              <>
                <Avatar size="scale4800" src={userData.images['0'].url} />
                <LabelSmall>Display Name</LabelSmall>
                <ParagraphSmall>{userData.display_name}</ParagraphSmall>
                <LabelSmall>ID</LabelSmall>
                <ParagraphSmall>{userData.id}</ParagraphSmall>
                <LabelSmall>Email</LabelSmall>
                <ParagraphSmall>{userData.email}</ParagraphSmall>
                <LabelSmall>Spotify URI</LabelSmall>
                <ParagraphSmall>
                  <StyledLink href={userData.external_urls.spotify}>
                    {userData.external_urls.spotify}
                  </StyledLink>
                </ParagraphSmall>
                <LabelSmall>API Link</LabelSmall>
                <ParagraphSmall>
                  <StyledLink href={userData.href}>{userData.href}</StyledLink>
                </ParagraphSmall>
                <LabelSmall>Profile Image</LabelSmall>
                <ParagraphSmall>
                  <StyledLink href={userData.images['0'].url}>
                    {userData.images['0'].url}
                  </StyledLink>
                </ParagraphSmall>
                <LabelSmall>Country</LabelSmall>
                <ParagraphSmall>{userData.country}</ParagraphSmall>
                <HeadingLevel>
                  <Heading>OAuth Details</Heading>
                  <LabelSmall>Access token</LabelSmall>
                  <ParagraphSmall>{accessToken}</ParagraphSmall>
                  <LabelSmall>Refresh token</LabelSmall>
                  <ParagraphSmall>{refreshToken}</ParagraphSmall>
                  <Button
                    size="mini"
                    disabled={!refreshToken}
                    isLoading={loadingStates.newToken}
                    onClick={fetchNewToken}
                  >
                    Obtain new token using the refresh token
                  </Button>
                  <Heading>More Actions</Heading>
                  <FlexGrid flexGridColumnCount={4}>
                    <FlexGridItem>
                      <Button
                        disabled={!userData?.id}
                        isLoading={loadingStates.playlists}
                        onClick={getPlaylists}
                      >
                        List some playlists
                      </Button>
                    </FlexGridItem>
                  </FlexGrid>
                  {!!playlists.length && (
                    <HeadingLevel>
                      <Heading>Playlists</Heading>
                      <ul>
                        {playlists.map((playlist) => (
                          <ListItem key={playlist.id}>
                            <ListItemLabel
                              description={`${playlist.tracks.total} tracks`}
                            >
                              {playlist.name}
                            </ListItemLabel>
                          </ListItem>
                        ))}
                      </ul>
                    </HeadingLevel>
                  )}
                </HeadingLevel>
              </>
            )}
          </HeadingLevel>
        </div>
      </ToasterContainer>
    </>
  );
};
