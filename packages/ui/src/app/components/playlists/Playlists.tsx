import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { Checkbox } from 'baseui/checkbox';
import { Heading, HeadingLevel } from 'baseui/heading';
import { StyledLink } from 'baseui/link';
import {
  Modal,
  ModalBody,
  ModalButton,
  ModalFooter,
  ModalHeader,
  ROLE,
  SIZE,
} from 'baseui/modal';
import { Pagination } from 'baseui/pagination';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { toaster, ToasterContainer } from 'baseui/toast';
import { ParagraphSmall } from 'baseui/typography';
import { useCallback, useEffect, useState } from 'react';
import {
  SPOTIFY_WEB_API_BASE_URL,
  GetCurrentUserPlaylistsResponse,
} from '@spotify-playlist-manager/spotify-sdk';
import { Logout } from '../logout/Logout';
import { useSpotifyAuth } from '../../contexts/spotify-auth/SpotifyAuth';

type Playlists = Omit<GetCurrentUserPlaylistsResponse, 'items'> & {
  items: (GetCurrentUserPlaylistsResponse['items'][number] & {
    selected?: boolean;
  })[];
};
type TableRow = Playlists['items'][number];

const TABLE_ROWS = 50;

export const Playlists = () => {
  const [css, theme] = useStyletron();
  const {
    state: { accessToken },
  } = useSpotifyAuth();
  const [page, setPage] = useState(1);
  const [playlists, setPlaylists] = useState<Playlists>();
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [exportData, setExportData] =
    useState<Partial<Pick<HTMLAnchorElement, 'href' | 'download'>>>();
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const hasPlaylists = !requestLoading && !requestError && !!playlists?.items.length;
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

  const getUserPlaylists = useCallback(
    async () => {
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
        const playlistsData =
          (await playlistsResponse.json()) as GetCurrentUserPlaylistsResponse;

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
        } else {
          setPlaylists(playlistsData);
        }
      } finally {
        setRequestLoading(false);
      }
    },
    // leaving out `requestError` and `requestLoading` so the playlists aren't continuously
    // re-fetched in case of errors or based on either of the two times the loading state
    // changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken, page],
  );

  /**
   * Request a full export of checked playlists and trigger a pop-up to download it.
   */
  const exportPlaylists = async () => {
    if (!playlists || !someChecked || exportLoading || exportError) {
      return;
    }

    const exportRequestBody = {
      token: accessToken,
      playlists: playlists.items
        .filter((playlist) => playlist.selected)
        .map((playlist) => ({ id: playlist.id, ownerId: playlist.owner.id })),
    };

    setExportLoading(true);

    try {
      const response = await fetch('/api/playlists/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportRequestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setExportData({
          href: URL.createObjectURL(new Blob([JSON.stringify(data)])),
          download: `playlists_${new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d+Z$/, '')}.json`,
        });
        setExportModalOpen(true);
      } else {
        throw new Error(response.statusText);
      }
    } catch {
      setExportError(true);
      toaster.negative(<p>Unable to export your playlists, please retry later</p>, {
        autoHideDuration: 4000,
        onClose: () => setExportError(false),
      });
    } finally {
      setExportLoading(false);
    }
  };

  const closeExportModal = () => {
    setExportData(undefined);
    setExportModalOpen(false);
  };

  useEffect(() => {
    getUserPlaylists();
  }, [getUserPlaylists]);

  const Paganitaor = () => (
    <Pagination
      currentPage={page}
      numPages={playlists ? Math.ceil(playlists.total / TABLE_ROWS) : 1}
      onNextClick={() => setPage(page + 1)}
      onPrevClick={() => setPage(page - 1)}
      onPageChange={({ nextPage }) => setPage(nextPage)}
    />
  );

  return (
    <>
      <ToasterContainer>
        <HeadingLevel>
          <Heading>Playlists</Heading>
          <ParagraphSmall>
            {TABLE_ROWS} playlists are shown per page. You can only work on page at a
            time.
          </ParagraphSmall>
          <Button
            disabled={!someChecked}
            isLoading={exportLoading}
            onClick={exportPlaylists}
          >
            Export
          </Button>
          <Paganitaor />
          <TableBuilder
            data={playlists?.items ?? []}
            isLoading={requestLoading}
            loadingMessage={
              <div
                className={css({
                  width: '100%',
                  height: theme.sizing.scale900,
                  color: 'transparent',
                  backgroundImage:
                    'linear-gradient(100deg, #eceff1 30%, #f6f7f8 50%, #eceff1 70%)',
                  backgroundSize: '400%',
                  animationDuration: theme.animation.timing1000,
                  animationTimingFunction: theme.animation.easeInOutCurve,
                  animationIterationCount: 'infinite',
                  animationName: {
                    '0%': {
                      backgroundPosition: '100% 50%',
                    },
                    '100%': {
                      backgroundPosition: '0 50%',
                    },
                  },
                })}
              ></div>
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
            <TableBuilderColumn header="Creator">
              {(row: TableRow) => row.owner.display_name}
            </TableBuilderColumn>
            <TableBuilderColumn header="Track Count" numeric={true}>
              {(row: TableRow) => row.tracks.total}
            </TableBuilderColumn>
            <TableBuilderColumn
              header="Link"
              sortable={false}
              overrides={{
                TableHeadCell: {
                  style: {
                    textAlign: 'center',
                  },
                },
                TableBodyCell: {
                  style: {
                    paddingTop: '0',
                    paddingBottom: '0',
                    paddingLeft: '0',
                    paddingRight: '0',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  },
                },
              }}
            >
              {(row: TableRow) => (
                <StyledLink
                  className={css({
                    fontSize: `${theme.typography.ParagraphLarge.fontSize} !important`,
                  })}
                  href={row.external_urls.spotify}
                  target="_blank"
                >
                  <FontAwesomeIcon icon={solid('arrow-up-right-from-square')} />
                </StyledLink>
              )}
            </TableBuilderColumn>
          </TableBuilder>
          <Paganitaor />
        </HeadingLevel>
      </ToasterContainer>
      <Modal
        onClose={closeExportModal}
        isOpen={exportModalOpen}
        size={SIZE.default}
        role={ROLE.dialog}
      >
        <ModalHeader>Your playlist export is ready!</ModalHeader>
        <ModalBody>
          Click <StyledLink {...exportData}>here</StyledLink> to download it.
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={closeExportModal}>Done</ModalButton>
        </ModalFooter>
      </Modal>
    </>
  );
};
