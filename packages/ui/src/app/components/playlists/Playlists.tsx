import { useStyletron } from 'baseui';
import { Checkbox } from 'baseui/checkbox';
import { Heading, HeadingLevel } from 'baseui/heading';
import { Pagination } from 'baseui/pagination';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { toaster, ToasterContainer } from 'baseui/toast';
import { ParagraphSmall } from 'baseui/typography';
import { useEffect, useState } from 'react';
import {
  SPOTIFY_WEB_API_BASE_URL,
  GetCurrentUserPlaylists,
} from '@spotify-playlist-manager/spotify-sdk';
import { Logout } from '@spotify-playlist-manager/ui/components/logout/Logout';
import { useSpotifyAuth } from '@spotify-playlist-manager/ui/contexts/spotify-auth/SpotifyAuth';

type Playlists = Omit<GetCurrentUserPlaylists, 'items'> & {
  items: (GetCurrentUserPlaylists['items'][number] & { selected?: boolean })[];
};
type TableRow = Playlists['items'][number];

const TABLE_ROWS = 8;

export const Playlists = () => {
  const [css] = useStyletron();
  const {
    state: { accessToken },
  } = useSpotifyAuth();
  const [page, setPage] = useState(1);
  const [playlists, setPlaylists] = useState<Playlists>();
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(false);

  const hasPlaylists = !!playlists?.items.length;
  const allChecked =
    hasPlaylists && playlists?.items.every((playlist) => playlist.selected);
  const someChecked =
    hasPlaylists && playlists?.items.some((playlist) => playlist.selected);

  const toggleAll = () => {
    if (!playlists) {
      return;
    }

    // check or uncheck all of the playlists
    const items = playlists.items.map((playlist) => ({
      ...playlist,
      selected: !allChecked,
    }));

    setPlaylists({
      ...playlists,
      items,
    });
  };

  const toggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!playlists) {
      return;
    }

    const { name, checked } = event.currentTarget;

    const items = playlists.items.map((playlist) => ({
      ...playlist,
      // only change the value of `selected` if the ID matches
      ...(playlist.id === name ? { selected: checked } : {}),
    }));

    setPlaylists({
      ...playlists,
      items,
    });
  };

  const getUserPlaylists = async () => {
    if (!accessToken || requestLoading || requestError) {
      return;
    }

    const requestQuery = new URLSearchParams({
      offset: ((page - 1) * TABLE_ROWS).toString(10),
      limit: TABLE_ROWS.toString(10),
    });

    // starting the request
    setRequestLoading(true);

    try {
      const playlistsResponse = await fetch(
        `${SPOTIFY_WEB_API_BASE_URL}/me/playlists?${requestQuery.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const playlistsData = (await playlistsResponse.json()) as GetCurrentUserPlaylists;

      if (playlistsData.error) {
        setRequestError(true);
        toaster.negative(
          <p>
            Unable to retrieve your playlists, please refresh or <Logout /> and back in
            again
          </p>,
          {
            autoHideDuration: 4000,
            onClose: () => setRequestError(false),
          },
        );
        return;
      }

      setPlaylists(playlistsData);
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    getUserPlaylists();
  }, [accessToken, page]);

  return (
    <ToasterContainer>
      <div className={css({ width: '70%', margin: 'auto 15% 5%', textAlign: 'left' })}>
        <HeadingLevel>
          <Heading>Playlists</Heading>
          <ParagraphSmall>
            {TABLE_ROWS} playlists are shown per page. You can only work on page at a
            time.
          </ParagraphSmall>
          <TableBuilder
            data={playlists?.items ?? []}
            isLoading={true}
            loadingMessage={
              <>
                {Array(TABLE_ROWS).fill(
                  <p
                    className={css({
                      backgroundColor: 'rgba(220,220,220,0.5)',
                      width: '100%',
                      height: '24px',
                      padding: '16px auto',
                    })}
                  ></p>,
                )}
              </>
            }
          >
            <TableBuilderColumn
              overrides={{
                TableHeadCell: { style: { width: '1%' } },
                TableBodyCell: { style: { width: '1%' } },
              }}
              header={
                <Checkbox
                  checked={allChecked}
                  isIndeterminate={!allChecked && someChecked}
                  onChange={toggleAll}
                />
              }
            >
              {(row: TableRow) => (
                <Checkbox name={row.id} checked={row.selected} onChange={toggle} />
              )}
            </TableBuilderColumn>
            <TableBuilderColumn header="Name">
              {(row: TableRow) => row.name}
            </TableBuilderColumn>
            <TableBuilderColumn header="Track Count" numeric={true}>
              {(row: TableRow) => row.tracks.total}
            </TableBuilderColumn>
          </TableBuilder>
          <Pagination
            currentPage={page}
            numPages={playlists ? Math.ceil(playlists.total / TABLE_ROWS) : 1}
            onNextClick={() => setPage(page + 1)}
            onPrevClick={() => setPage(page - 1)}
            onPageChange={({ nextPage }) => setPage(nextPage)}
          />
        </HeadingLevel>
      </div>
    </ToasterContainer>
  );
};
