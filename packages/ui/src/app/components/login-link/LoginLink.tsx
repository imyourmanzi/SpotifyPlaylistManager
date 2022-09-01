import { useEffect, useState } from 'react';

export const LoginLink = () => {
  const [redirectUri, setRedirectUri] = useState('');

  // get the server to generate the redirect URL, but then place it in the DOM
  useEffect(() => {
    console.log('entering app hook', { redirectUri });

    if (!!redirectUri) {
      console.log('already have uri');
      return;
    }

    console.log('getting redirect uri');
    fetch('/api/login').then(async (response) => {
      const { authRedirect } = await response.json();
      setRedirectUri(authRedirect);
      console.log('uri is set');
    });
  }, []);

  return (
    <div id="login">
      <h1>This is an example of the Authorization Code flow</h1>
      {redirectUri && <a href={redirectUri}>Log in with Spotify</a>}
    </div>
  );
};
