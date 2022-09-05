import { createContext, ReactNode, Reducer, useContext, useReducer } from 'react';

type SpotifyAuthKeys = 'accessToken' | 'refreshToken';
type SpotifyAuthSetters = `set${Capitalize<SpotifyAuthKeys>}`;
type SpotifyAuthValues = string;

export type SpotifyAuthState = Record<SpotifyAuthKeys, SpotifyAuthValues>;

export type SpotifyAuthAction = {
  type: SpotifyAuthSetters;
  value: SpotifyAuthValues;
};

export type SpotifyAuthDispatch = (action: SpotifyAuthAction) => void;

const SpotifyAuthContext = createContext<
  | ({
      state: SpotifyAuthState;
    } & Record<SpotifyAuthSetters, (value: SpotifyAuthValues) => void>)
  | undefined
>(undefined);

const spotifyAuthReducer: Reducer<SpotifyAuthState, SpotifyAuthAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case 'setAccessToken': {
      action.value
        ? localStorage.setItem('access_token', action.value)
        : localStorage.removeItem('access_token');
      return { ...state, accessToken: action.value };
    }

    case 'setRefreshToken': {
      action.value
        ? localStorage.setItem('refresh_token', action.value)
        : localStorage.removeItem('refresh_token');
      return { ...state, refreshToken: action.value };
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);

  if (context == null) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }

  return context;
};

export const SpotifyAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(spotifyAuthReducer, {
    accessToken: localStorage.getItem('access_token') ?? '',
    refreshToken: localStorage.getItem('refresh_token') ?? '',
  });

  const setAccessToken = (accessToken: string) =>
    dispatch({ type: 'setAccessToken', value: accessToken });

  const setRefreshToken = (refreshToken: string) =>
    dispatch({ type: 'setRefreshToken', value: refreshToken });

  const value = { state, dispatch, setAccessToken, setRefreshToken };
  return (
    <SpotifyAuthContext.Provider value={value}>{children}</SpotifyAuthContext.Provider>
  );
};
