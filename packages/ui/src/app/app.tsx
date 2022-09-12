import { useStyletron } from 'baseui';
import { StyledDivider } from 'baseui/divider';
import { Grid, Cell } from 'baseui/layout-grid';
import { Navigation, NavigationProps } from 'baseui/side-navigation';
import { DisplayMedium } from 'baseui/typography';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Home } from '@spotify-playlist-manager/ui/components/home/Home';
import { Me } from '@spotify-playlist-manager/ui/components/me/Me';
import { Playlists } from '@spotify-playlist-manager/ui/components/playlists/Playlists';
import { SpotifyLoginCallbackHandler } from '@spotify-playlist-manager/ui/components/spotify-login-callback-handler/SpotifyLoginCallbackHandler';
import { useSpotifyAuth } from '@spotify-playlist-manager/ui/contexts/spotify-auth/SpotifyAuth';

const DEFAULT_PAGE = '/';

export function App() {
  const [css] = useStyletron();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { accessToken },
  } = useSpotifyAuth();
  const [activeNavItem, setActiveNavItem] = useState(DEFAULT_PAGE);

  useEffect(() => {
    setActiveNavItem(location.pathname);
  }, [location]);

  const navItems: NavigationProps['items'] = [
    {
      title: 'Home',
      itemId: '/',
    },
    {
      title: 'About',
      itemId: '/about',
    },
  ];

  // if logged in, show nav links for "protected" pages
  if (accessToken) {
    navItems.splice(1, 0, {
      title: 'My...',
      subNav: [
        {
          title: 'Account',
          itemId: '/me',
        },
        {
          title: 'Playlists',
          itemId: '/playlists',
        },
      ],
    });
  }

  return (
    <>
      <div className={css({ textAlign: 'center', paddingTop: '3rem' })}>
        <DisplayMedium
          className={css({ cursor: 'pointer' })}
          onClick={() => navigate(DEFAULT_PAGE)}
        >
          Spotify Playlist Manager
        </DisplayMedium>
      </div>
      <StyledDivider className={css({ margin: '2rem auto' })} />
      <Grid gridColumns={20}>
        <Cell span={3}>
          <Navigation
            items={navItems}
            activeItemId={activeNavItem}
            onChange={({ event, item }) => {
              event.preventDefault();
              const page = item.itemId ?? DEFAULT_PAGE;

              navigate(page);
              setActiveNavItem(page);
            }}
          />
        </Cell>
        <Cell span={16} skip={1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/callback" element={<SpotifyLoginCallbackHandler />} />
            <Route path="/me" element={<Me />} />
            <Route path="/playlists" element={<Playlists />} />
          </Routes>
        </Cell>
      </Grid>
    </>
  );
}

export default App;
