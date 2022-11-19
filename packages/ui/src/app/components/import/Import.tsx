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

export const Import = () => {
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState('');
  const [progressOrDone, setProgressOrDone] = useState(0);

  const resetFile = () => {
    setAcceptedFile(null);
  };

  const processFileForImport = (file: File) => {
    setAcceptedFile(file);

    const result = new Promise<string>((resolve) => setTimeout(resolve, 3000));
    result.then(
      () => {
        setProgressOrDone(100);
      },
      (error) => {
        setImportErrorMessage(error);
      },
    );
  };

  return (
    <HeadingLevel>
      <Heading>Import</Heading>
      <ParagraphMedium>Import one JSON file at a time.</ParagraphMedium>
      <FileUploader
        accept=".json"
        multiple={false}
        errorMessage={importErrorMessage}
        onRetry={resetFile}
        onCancel={resetFile}
        onDrop={(accepted, rejected) => {
          setRejectedFiles([]);
          if (rejected.length) {
            setRejectedFiles(rejected);
          }

          if (!accepted.length) {
            return;
          }

          // only allow processing the first file
          processFileForImport(accepted[0]);
        }}
        // progressAmount={progressOrDone || undefined}
        progressMessage={
          acceptedFile
            ? `Processing ${acceptedFile.name} for import...${
                progressOrDone === 100 ? 'Done!' : ''
              }`
            : ''
        }
      />
      <RejectedFilesWarning
        rejectedFiles={rejectedFiles}
        additionalMessage="Please choose a single JSON file."
      />
    </HeadingLevel>
  );
};
