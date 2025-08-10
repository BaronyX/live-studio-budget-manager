import React from 'react';
import cx from 'classnames';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}) => {
  const classes = cx(
    'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ac focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-4 text-sm',
    variant === 'primary' && 'bg-ac text-white hover:opacity-90',
    variant === 'secondary' && 'bg-sf text-tx hover:bg-bd',
    variant === 'ghost' && 'bg-transparent hover:bg-sf',
    variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
    className
  );
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;