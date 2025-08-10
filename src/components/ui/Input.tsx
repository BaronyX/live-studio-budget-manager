import React from 'react';
import cx from 'classnames';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { size?: 'sm' | 'md' };

export const Input: React.FC<InputProps> = ({ className, size = 'md', ...rest }) => {
  return (
    <input
      className={cx(
        'bg-white dark:bg-[#0f1117] text-tx placeholder:text-mu border border-bd rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ac focus-visible:ring-offset-2',
        size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-3 text-sm',
        className
      )}
      {...rest}
    />
  );
};

export default Input;