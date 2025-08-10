import React from 'react';
import cx from 'classnames';

type PillProps = React.HTMLAttributes<HTMLSpanElement> & {
  color?: 'default' | 'ok' | 'wa' | 'ac';
};

export const Pill: React.FC<PillProps> = ({ className, color = 'default', children, ...rest }) => {
  const colorClasses =
    color === 'ok' ? 'bg-ok/15 text-ok border-ok/30' :
    color === 'wa' ? 'bg-wa/15 text-wa border-wa/30' :
    color === 'ac' ? 'bg-ac/15 text-ac border-ac/30' : 'bg-sf text-mu border-bd';
  return (
    <span className={cx('inline-flex items-center px-2 h-6 rounded-full text-xs border', colorClasses, className)} {...rest}>
      {children}
    </span>
  );
};

export default Pill;