import { useStyletron } from 'baseui';
import { StyledLink } from 'baseui/link';
import { useNavigate } from 'react-router-dom';
import { useSpotifyAuth } from '../../contexts/spotify-auth/SpotifyAuth';

export const Logout = () => {
  const navigate = useNavigate();
  const [css] = useStyletron();
  const { setAccessToken, setRefreshToken } = useSpotifyAuth();

  const logout: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();

    setAccessToken('');
    setRefreshToken('');

    navigate(new URL(event.currentTarget.href).pathname);
  };

  return (
    <StyledLink
      className={css({
        font: 'inherit',
        color: 'inherit  !important',
      })}
      href="/"
      onClick={logout}
    >
      logout
    </StyledLink>
  );
};
