import { useState } from "react";
import { initialCategories } from "../constants";
import { Sidebar } from "../components/common/Sidebar";
import { MainContent } from "../components/MainContent";

export default function Dashboard() {
  const [categories, setCategories] = useState(initialCategories);
  const [activePage, setActivePage] = useState("categories");
  const [activeCategory, setActiveCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleManage(category) {
    setActiveCategory(category);
    setActivePage("category-products");
  }

  function handleBack() {
    setActiveCategory(null);
    setActivePage("categories");
  }

  function handleNavigate(page) {
    setActivePage(page);
    setActiveCategory(null);
  }

  const pageForNav = activePage === "category-products" ? "categories" : activePage;

  return (
    <>
      {/* Global design tokens injected once at root */}
      <style>{globalTokens}</style>

      <div style={layoutStyle}>
        <Sidebar
          active={pageForNav}
          onChange={handleNavigate}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <MainContent
          activePage={activePage}
          activeCategory={activeCategory}
          categories={categories}
          setCategories={setCategories}
          onManage={handleManage}
          onBack={handleBack}
        />
      </div>
    </>
  );
}

/* ─── CSS design tokens available across all child components ─── */
const globalTokens = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Palette */
    --bg:          #0a0a0a;
    --surface:     #111111;
    --surface-2:   #1a1a1a;
    --border:      #2a2a2a;
    --border-soft: #1f1f1f;

    /* Text */
    --text-primary:   #f0f0f0;
    --text-secondary: #888888;
    --text-muted:     #555555;

    /* Accent */
    --accent:        #ffffff;
    --accent-dim:    rgba(255,255,255,0.08);
    --accent-glow:   rgba(255,255,255,0.04);

    /* Sidebar */
    --sidebar-w:     240px;
    --sidebar-bg:    #0d0d0d;

    /* Radii */
    --r-sm: 6px;
    --r-md: 10px;
    --r-lg: 16px;
    --r-xl: 22px;

    /* Typography */
    --font-sans:    'DM Sans', system-ui, sans-serif;
    --font-display: 'DM Serif Display', Georgia, serif;

    /* Shadows */
    --shadow-card: 0 1px 3px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3);
    --shadow-sm:   0 1px 4px rgba(0,0,0,0.4);
  }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ── Sidebar shell ── */
  .sidebar {
    width: var(--sidebar-w);
    min-height: 100vh;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border-soft);
    display: flex;
    flex-direction: column;
    padding: 0;
    position: sticky;
    top: 0;
    flex-shrink: 0;
  }

  .sidebar-logo {
    padding: 28px 24px 24px;
    border-bottom: 1px solid var(--border-soft);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sidebar-logo img {
    height: 36px;
    width: auto;
    object-fit: contain;
  }

  .sidebar-nav {
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--r-md);
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    letter-spacing: 0.01em;
  }

  .nav-item:hover {
    background: var(--accent-dim);
    color: var(--text-primary);
  }

  .nav-item.active {
    background: var(--accent-dim);
    color: #ffffff;
    font-weight: 600;
  }

  .nav-item .nav-icon {
    width: 18px;
    height: 18px;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .nav-item.active .nav-icon { opacity: 1; }

  /* ── Main content area ── */
  .main-content {
    flex: 1;
    padding: 36px 40px;
    overflow-y: auto;
    min-width: 0;
  }

  /* ── Page header ── */
  .page-header {
    margin-bottom: 32px;
  }

  .page-header h1 {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 400;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .page-header p {
    margin-top: 6px;
    font-size: 13.5px;
    color: var(--text-secondary);
    font-weight: 400;
  }

  /* ── Stat/summary row ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 20px 22px;
    box-shadow: var(--shadow-card);
    transition: border-color 0.2s, transform 0.2s;
  }

  .stat-card:hover {
    border-color: #3a3a3a;
    transform: translateY(-2px);
  }

  .stat-card .stat-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .stat-card .stat-value {
    font-family: var(--font-display);
    font-size: 26px;
    color: var(--text-primary);
    line-height: 1;
  }

  .stat-card .stat-sub {
    margin-top: 6px;
    font-size: 11.5px;
    color: var(--text-secondary);
  }

  /* ── Category / product cards grid ── */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-xl);
    padding: 22px;
    box-shadow: var(--shadow-card);
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card:hover {
    border-color: #3d3d3d;
    transform: translateY(-3px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }

  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--r-md);
    background: var(--surface-2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 400;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .card-meta {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 400;
  }

  .card-footer {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: var(--r-md);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    letter-spacing: 0.02em;
    transition: opacity 0.15s, transform 0.1s;
    font-family: var(--font-sans);
  }

  .btn:active { transform: scale(0.97); }

  .btn-primary {
    background: #ffffff;
    color: #000000;
  }

  .btn-primary:hover { opacity: 0.9; }

  .btn-ghost {
    background: var(--accent-dim);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover { background: var(--surface-2); }

  .btn-danger {
    background: rgba(239,68,68,0.12);
    color: #f87171;
    border: 1px solid rgba(239,68,68,0.2);
  }

  /* ── Table ── */
  .table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    overflow: hidden;
    box-shadow: var(--shadow-card);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }

  thead th {
    padding: 14px 18px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text-muted);
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }

  tbody tr {
    border-bottom: 1px solid var(--border-soft);
    transition: background 0.12s;
  }

  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--accent-glow); }

  tbody td {
    padding: 14px 18px;
    color: var(--text-primary);
    vertical-align: middle;
  }

  /* ── Badge ── */
  .badge {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .badge-green  { background: rgba(34,197,94,0.12); color: #4ade80; }
  .badge-yellow { background: rgba(234,179,8,0.12);  color: #facc15; }
  .badge-red    { background: rgba(239,68,68,0.12);  color: #f87171; }
  .badge-grey   { background: var(--surface-2);       color: var(--text-secondary); }

  /* ── Form inputs ── */
  .form-field { display: flex; flex-direction: column; gap: 6px; }

  .form-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .form-input {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    padding: 10px 13px;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    font-family: var(--font-sans);
    transition: border-color 0.15s;
  }

  .form-input::placeholder { color: var(--text-muted); }
  .form-input:focus { border-color: #555; }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }

  /* ── Mobile hamburger ── */
  .hamburger {
    display: none;
    position: fixed;
    top: 14px;
    left: 14px;
    z-index: 200;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    padding: 8px 10px;
    cursor: pointer;
    color: var(--text-primary);
  }

  /* ── Mobile overlay ── */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 99;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .sidebar-overlay.open { display: block; }
    .hamburger { display: flex; align-items: center; }

    .main-content {
      padding: 60px 18px 28px;
    }
  }
`;

const layoutStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "var(--bg)",
};