import { styled } from 'baseui';
import { FileUploader } from 'baseui/file-uploader';
import { Heading, HeadingLevel } from 'baseui/heading';
import { LabelSmall, ParagraphMedium } from 'baseui/typography';
import { useState } from 'react';

type RejectedFilesWarningProps = {
  rejectedFiles: File[];
  additionalMessage?: string;
};

const WarningLabelSmall = styled(LabelSmall, ({ $theme }) => ({
  margin: '10px',
  color: $theme.colors.warning,
}));

const RejectedFilesWarning = ({
  rejectedFiles,
  additionalMessage,
}: RejectedFilesWarningProps) => {
  const count = rejectedFiles.length;

  if (!count) {
    return null;
  }

  return (
    <>
      <WarningLabelSmall>
        {count === 1 ? 'This' : 'These'} file{count === 1 ? '' : 's'} cannot be processed:{' '}
        {rejectedFiles.map((file) => file.name).join(', ')}
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
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);

  const resetProcessingStates = () => {
    setRejectedFiles([]);
    setAcceptedFile(null);
    setImportLoading(false);
    setImportErrorMessage('');
  };

  const processFileForImport = (file: File) => {
    setAcceptedFile(file);
    setImportLoading(true);

    const importFileData = new FormData();
    importFileData.append('importData', file);

    Promise.all([
      // send the file to the server for import
      fetch('/api/import', {
        headers: {
          accept: 'application/json',
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
          if (response.status >= 500) {
            const responseInfo = await response.json();
            setImportErrorMessage(responseInfo.error);
            return;
          }

          if (response.status >= 400) {
            setRejectedFiles([file]);
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
          processFileForImport(accepted[0]);
        }}
        progressMessage={
          acceptedFile && importLoading ? `Importing ${acceptedFile.name}` : ''
        }
        // replace the cancel button because these requests are not cancellable
        overrides={{ CancelButtonComponent: { component: () => <p></p> } }}
      />
      <RejectedFilesWarning
        rejectedFiles={rejectedFiles}
        additionalMessage="Please choose a single JSON file that is 1 MB or less."
      />
      <SuccessfulImport file={acceptedFile} loading={importLoading} />
    </HeadingLevel>
  );
};
