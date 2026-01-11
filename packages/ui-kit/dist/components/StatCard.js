import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const cardStyle = {
    borderRadius: '1rem',
    padding: '1.25rem',
    background: '#ffffff',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
};
const labelStyle = {
    margin: 0,
    fontSize: '0.9rem',
    color: '#64748b'
};
const valueStyle = {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 600
};
const helperStyle = {
    margin: 0,
    fontSize: '0.85rem',
    color: '#94a3b8'
};
export function StatCard({ label, value, helperText, accent = '#2563eb' }) {
    return (_jsxs("article", { style: { ...cardStyle, borderTop: `4px solid ${accent}` }, children: [_jsx("p", { style: labelStyle, children: label }), _jsx("p", { style: valueStyle, children: value }), helperText && _jsx("p", { style: helperStyle, children: helperText })] }));
}
