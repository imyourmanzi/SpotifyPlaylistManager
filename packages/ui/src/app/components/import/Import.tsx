import { useEffect, useRef, useState } from 'react';
import { FileUploader } from 'baseui/file-uploader';

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(() => {
    console.log('asdfadsf');
  });
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  // Set up the interval.
  useEffect((): (() => void) | void => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// useFakeProgress is an elaborate way to show a fake file transfer for illustrative purposes. You
// don't need this is your application. Use metadata from your upload destination if it's available,
// or don't provide progress.
const useFakeProgress = (): [number, string, () => void, () => void] => {
  const [fakeProgress, setFakeProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  function stopFakeProgress() {
    setIsActive(false);
    setErrorMessage('');
    setFakeProgress(0);
  }
  function startFakeProgress() {
    setIsActive(true);
  }
  useInterval(
    () => {
      if (fakeProgress >= 40) {
        // stopFakeProgress();
        setErrorMessage('Upload failed... connection was lost.');
      } else {
        setFakeProgress(fakeProgress + 10);
      }
    },
    isActive ? 500 : null,
  );
  return [fakeProgress, errorMessage, startFakeProgress, stopFakeProgress];
};

export const Import = () => {
  const [progressAmount, errorMessage, startFakeProgress, stopFakeProgress] =
    useFakeProgress();
  return (
    <FileUploader
      errorMessage={errorMessage}
      onRetry={stopFakeProgress}
      onCancel={stopFakeProgress}
      onDrop={(acceptedFiles, rejectedFiles) => {
        // handle file upload...
        console.log(acceptedFiles, rejectedFiles);
        startFakeProgress();
      }}
      // progressAmount is a number from 0 - 100 which indicates the percent of file transfer completed
      progressAmount={progressAmount}
      progressMessage={progressAmount ? `Uploading... ${progressAmount}% of 100%` : ''}
    />
  );
};
