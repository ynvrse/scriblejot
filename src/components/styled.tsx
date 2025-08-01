// components/styled.tsx (atau .tsx jika pakai komponen)
import React from 'react';

import clsx from 'clsx';

type CenteredProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export function Centered({ className, children, ...props }: CenteredProps) {
  return (
    <div className={clsx('flex items-center justify-center', className)} {...props}>
      {children}
    </div>
  );
}

export function FullSizeCentered({ className, children, ...props }: CenteredProps) {
  return (
    <Centered className={clsx('w-full h-full', className)} {...props}>
      {children}
    </Centered>
  );
}
