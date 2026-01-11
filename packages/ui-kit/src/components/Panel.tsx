import type { CSSProperties, ReactNode } from 'react';

const panelStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  padding: '1.5rem',
  boxShadow: '0 15px 40px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '0.75rem'
};

const titleWrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.25rem'
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: '#64748b'
};

export interface PanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, description, actions, children }: PanelProps) {
  return (
    <section style={panelStyle}>
      {(title || description || actions) && (
        <div style={headerStyle}>
          <div style={titleWrapperStyle}>
            {title && <h2 style={titleStyle}>{title}</h2>}
            {description && <p style={descriptionStyle}>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
