import { Link, Route, Routes } from 'react-router-dom';
import { useMemo } from 'react';
import './styles.css';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/editor', label: 'Editor' },
  { path: '/analytics', label: 'Analytics' }
];

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Interactive Newsletter Engine</h1>
        <nav>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

function DashboardView() {
  const stats = useMemo(
    () => [
      { label: 'Active Projects', value: 3 },
      { label: 'Templates Published', value: 18 },
      { label: 'Avg CTR Uplift', value: '+17%' }
    ],
    []
  );

  return (
    <section className="card-grid">
      {stats.map((stat) => (
        <article key={stat.label} className="card">
          <p className="muted">{stat.label}</p>
          <strong>{stat.value}</strong>
        </article>
      ))}
    </section>
  );
}

function EditorPlaceholder() {
  return (
    <section className="panel">
      <h2>Editor</h2>
      <p>
        This will host the drag-and-drop composer. For now it shows a placeholder to confirm routing and layout
        wiring.
      </p>
    </section>
  );
}

function AnalyticsPlaceholder() {
  return (
    <section className="panel">
      <h2>Analytics</h2>
      <p>Future home for per-block performance heatmaps, alerts, and automation triggers.</p>
    </section>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/editor" element={<EditorPlaceholder />} />
        <Route path="/analytics" element={<AnalyticsPlaceholder />} />
      </Routes>
    </Layout>
  );
}
