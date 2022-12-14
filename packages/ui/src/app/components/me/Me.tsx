import { useStyletron } from 'baseui';
import { Avatar } from 'baseui/avatar';
import { Button } from 'baseui/button';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { Heading, HeadingLevel } from 'baseui/heading';
import { StyledLink } from 'baseui/link';
import { toaster, ToasterContainer } from 'baseui/toast';
import {
  LabelSmall,
  MonoLabelSmall,
  MonoParagraphSmall,
  ParagraphSmall,
} from 'baseui/typography';
import { useEffect, useState } from 'react';
import type { GetMeResponse } from '@spotify-playlist-manager/spotify-sdk';
import { CodeBlock } from '../code-block/CodeBlock';
import { Logout } from '../logout/Logout';
import { useSpotifyAuth } from '../../contexts/spotify-auth/SpotifyAuth';

/**
 * A property for each request type this component makes, allowing storing state to be
 * more concise and consistent for all request (e.g. for loading or error states).
 */
type RequestTypes = {
  me: boolean;
  newToken: boolean;
};

export const Me = () => {
  const {
    state: { accessToken, refreshToken },
    setAccessToken,
  } = useSpotifyAuth();

  const [loadingStates, setLoadingStates] = useState<RequestTypes>({
    me: false,
    newToken: false,
  });

  const [errors, setErrors] = useState<RequestTypes>({
    me: false,
    newToken: false,
  });

  const [userData, setUserData] = useState<GetMeResponse | null>(null);
  const [css] = useStyletron();

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
          const data = (await response.json()) as GetMeResponse;

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
    // purposefully leaving out `errors` and `loadingStates` so we don't constantly retry
    // either when the toast closes or twice when loading states are updated
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken],
  );

  const fetchNewToken = () => {
    if (!refreshToken || errors.newToken) {
      return;
    }

    setLoadingStates({ ...loadingStates, newToken: true });
    fetch('/api/auth/refresh_token', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
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

  const profileUrl = userData?.images[0]?.url;

  return (
    <ToasterContainer>
      <HeadingLevel>
        <FlexGrid flexGridColumnCount={2} alignItems={'baseline'}>
          <FlexGridItem>
            <Heading>Your Profile</Heading>
          </FlexGridItem>
          <FlexGridItem>
            <MonoLabelSmall className={css({ textAlign: 'right' })}>
              {userData && !userData.error
                ? `logged in as ${userData.display_name}`
                : 'data error'}
              {', '}
              <Logout />
            </MonoLabelSmall>
          </FlexGridItem>
        </FlexGrid>
        {!loadingStates.me && !errors.me && userData && (
          <>
            {profileUrl && <Avatar size="scale4800" src={profileUrl} />}
            <LabelSmall>Display Name</LabelSmall>
            <ParagraphSmall>{userData.display_name}</ParagraphSmall>
            <LabelSmall>ID</LabelSmall>
            <MonoParagraphSmall>{userData.id}</MonoParagraphSmall>
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
            {profileUrl && (
              <>
                <LabelSmall>Profile Image</LabelSmall>
                <ParagraphSmall>
                  <StyledLink href={profileUrl}>{profileUrl}</StyledLink>
                </ParagraphSmall>
              </>
            )}
            <LabelSmall>Country</LabelSmall>
            <ParagraphSmall>{userData.country}</ParagraphSmall>
            <HeadingLevel>
              <Heading>OAuth Details</Heading>
              <LabelSmall>Access token</LabelSmall>
              <CodeBlock>
                <MonoParagraphSmall>{accessToken}</MonoParagraphSmall>
              </CodeBlock>
              <LabelSmall>Refresh token</LabelSmall>
              <CodeBlock>
                <MonoParagraphSmall>{refreshToken}</MonoParagraphSmall>
              </CodeBlock>
              <Button
                size="mini"
                disabled={!refreshToken}
                isLoading={loadingStates.newToken}
                onClick={fetchNewToken}
              >
                Obtain new token using the refresh token
              </Button>
            </HeadingLevel>
          </>
        )}
      </HeadingLevel>
    </ToasterContainer>
  );
};
