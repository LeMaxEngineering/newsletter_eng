export interface StatCardProps {
  label: string;
  value: string;
  helperText?: string;
  accent?: string;
}

const cardStyle: React.CSSProperties = {
  borderRadius: '1rem',
  padding: '1.25rem',
  background: '#ffffff',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  color: '#64748b'
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '2rem',
  fontWeight: 600
};

const helperStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#94a3b8'
};

export function StatCard({ label, value, helperText, accent = '#2563eb' }: StatCardProps) {
  return (
    <article style={{ ...cardStyle, borderTop: `4px solid ${accent}` }}>
      <p style={labelStyle}>{label}</p>
      <p style={valueStyle}>{value}</p>
      {helperText && <p style={helperStyle}>{helperText}</p>}
    </article>
  );
}
