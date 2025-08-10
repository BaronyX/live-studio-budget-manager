import React from 'react';
import cx from 'classnames';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => {
  return (
    <div className={cx('bg-sf border border-bd rounded-lg shadow-card', className)} {...rest}>
      {children}
    </div>
  );
};

export default Card;