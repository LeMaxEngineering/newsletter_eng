import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const panelStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 15px 40px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};
const headerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.75rem'
};
const titleWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
};
const titleStyle = {
    margin: 0,
    fontSize: '1.25rem'
};
const descriptionStyle = {
    margin: 0,
    color: '#64748b'
};
export function Panel({ title, description, actions, children }) {
    return (_jsxs("section", { style: panelStyle, children: [(title || description || actions) && (_jsxs("div", { style: headerStyle, children: [_jsxs("div", { style: titleWrapperStyle, children: [title && _jsx("h2", { style: titleStyle, children: title }), description && _jsx("p", { style: descriptionStyle, children: description })] }), actions] })), children] }));
}
