import React from 'react';
import { useStyletron } from 'baseui';

export const CodeBlock: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  const [css, theme] = useStyletron();

  return (
    <div
      className={css({
        width: '96%',
        padding: '2px 1%',
        margin: '2% 1%',
        borderRadius: '6px',
        overflowX: 'scroll',
        backgroundColor: theme.colors.backgroundTertiary,
      })}
    >
      {children}
    </div>
  );
};
