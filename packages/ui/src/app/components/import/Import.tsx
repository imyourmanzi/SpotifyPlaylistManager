import { styled } from 'baseui';
import { FileUploader } from 'baseui/file-uploader';
import { Heading, HeadingLevel } from 'baseui/heading';
import { LabelSmall, ParagraphMedium } from 'baseui/typography';
import { useState } from 'react';
import { useSpotifyAuth } from '../../contexts/spotify-auth/SpotifyAuth';

type RejectedFilesWarningProps = {
  files: File[];
  additionalMessage?: string;
};

const WarningLabelSmall = styled(LabelSmall, ({ $theme }) => ({
  margin: '10px',
  color: $theme.colors.warning,
}));

const RejectedFilesWarning = ({
  files,
  additionalMessage,
}: RejectedFilesWarningProps) => {
  const count = files.length;

  if (!count) {
    return null;
  }

  return (
    <>
      <WarningLabelSmall>
        {count === 1 ? 'This' : 'These'} file{count === 1 ? '' : 's'} cannot be processed:{' '}
        {files.map((file) => file.name).join(', ')}
      </WarningLabelSmall>
      {additionalMessage ? (
        <WarningLabelSmall>{additionalMessage}</WarningLabelSmall>
      ) : null}
    </>
  );
};

const SuccessLabelSmall = styled(LabelSmall, ({ $theme }) => ({
  margin: '10px',
  color: $theme.colors.positive,
}));

const SuccessfulImport = ({ file, loading }: { file: File | null; loading: boolean }) => {
  if (loading || !file) {
    return null;
  }

  return <SuccessLabelSmall>Successfully imported {file.name}!</SuccessLabelSmall>;
};

export const Import = () => {
  const {
    state: { accessToken },
  } = useSpotifyAuth();

  // UI-based states
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);

  // HTTP request-based states
  const [importLoading, setImportLoading] = useState(false);
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);

  const resetProcessingStates = () => {
    // UI-based states
    setRejectedFiles([]);
    setAcceptedFile(null);

    // HTTP request-based states
    setImportLoading(false);
    setFailedFile(null);
    setImportErrorMessage('');
  };

  const processFileForImport = (file: File) => {
    setImportLoading(true);

    const importFileData = new FormData();
    importFileData.append('importData', file);

    Promise.all([
      // send the file to the server for import
      fetch('/api/import', {
        headers: {
          'x-spotify-token': accessToken,
        },
        method: 'POST',
        body: importFileData,
      }),
      // also artificially inflate the import time so users don't see an awkward flash if
      // the file processes extremely quickly
      new Promise<void>((resolve) => setTimeout(resolve, 250)),
    ])
      .then(
        async ([response]) => {
          if (response.status >= 400) {
            const responseInfo = await response.json();
            setImportErrorMessage(
              responseInfo.error ?? responseInfo.message ?? 'An unknown error occurred',
            );
            setFailedFile(file);
            return;
          }
        },
        (error) => {
          setImportErrorMessage(error);
        },
      )
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setImportLoading(false);
      });
  };

  return (
    <HeadingLevel>
      <Heading>Import</Heading>
      <ParagraphMedium>Import one JSON file at a time.</ParagraphMedium>
      <FileUploader
        accept="application/json"
        maxSize={1 * 1000 * 1000}
        multiple={false}
        {...(importErrorMessage ? { errorMessage: importErrorMessage } : {})}
        onRetry={resetProcessingStates}
        onDrop={(accepted, rejected) => {
          // reset state
          resetProcessingStates();

          // update rejected files, if any
          if (rejected.length) {
            setRejectedFiles(rejected);
          }

          // don't process if there are no files we can process
          if (!accepted.length) {
            return;
          }

          // only allow processing the first file
          const file = accepted[0];
          setAcceptedFile(file);
          processFileForImport(file);
        }}
        progressMessage={
          acceptedFile && importLoading ? `Importing ${acceptedFile.name}` : ''
        }
        // replace the cancel button because these requests are not cancellable
        overrides={{ CancelButtonComponent: { component: () => <p></p> } }}
      />
      <RejectedFilesWarning
        files={rejectedFiles}
        additionalMessage="Please choose a single JSON file that is 1 MB or less."
      />
      <SuccessfulImport file={failedFile ? null : acceptedFile} loading={importLoading} />
    </HeadingLevel>
  );
};
