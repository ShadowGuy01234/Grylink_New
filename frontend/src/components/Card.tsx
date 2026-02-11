import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions, hover = false }) => {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
