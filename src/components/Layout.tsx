import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ArrowRight, Heart, LogOut, Menu, Plus, SearchCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  function signOut() { logout(); setMenuOpen(false); navigate('/'); }
  const close = () => setMenuOpen(false);
  return <div className="app-shell">
    <div className="top-strip"><span><Heart size={13} fill="currentColor" /> Small acts. Big reunions.</span><span>Free to use, made for everyone.</span></div>
    <header className="site-header"><div className="container nav-inner">
      <Link to="/" className="brand" onClick={close} aria-label="FindBack home"><span className="brand-mark"><SearchCheck size={24} strokeWidth={2.7} /></span>find<span>back.</span></Link>
      <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} aria-label="Primary navigation">
        <NavLink onClick={close} to="/browse">Browse items</NavLink>
        <NavLink onClick={close} to="/#how-it-works">How it works</NavLink>
        {user && <><NavLink onClick={close} to="/my-items">My listings</NavLink><NavLink onClick={close} to="/requests">Requests</NavLink></>}
        <div className="mobile-only mobile-auth">
          {user ? <button className="btn btn-ghost" onClick={signOut}><LogOut size={17} /> Sign out</button> : <Link className="btn btn-ghost" onClick={close} to="/login">Log in</Link>}
        </div>
      </nav>
      <div className="nav-actions">
        {user ? <div className="nav-account"><span className="avatar">{user.name.charAt(0).toUpperCase()}</span><span className="nav-account-name">{user.name.split(' ')[0]}</span><button type="button" title="Sign out" aria-label="Sign out" className="logout-icon" onClick={signOut}><LogOut size={17} /></button></div> : <Link to="/login" className="login-link">Log in</Link>}
        <Link to="/post" className="btn btn-primary btn-sm nav-post"><Plus size={17} /> Post an item</Link>
      </div>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X /> : <Menu />}</button>
    </div></header>
    <main><Outlet /></main>
    <footer className="footer"><div className="container">
      <div className="footer-main"><div><Link to="/" className="brand footer-brand"><span className="brand-mark"><SearchCheck size={23} /></span>find<span>back.</span></Link><p>Helping good things find their way home.<br />One small act of kindness at a time.</p></div><div className="footer-links"><Link to="/browse">Browse listings</Link><Link to="/post">Report an item</Link><Link to="/my-items">My listings</Link></div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} FindBack. Built for better reunions.</span><span>Made with <Heart size={13} fill="currentColor" /> for communities</span></div>
    </div></footer>
    <Link className="floating-post" to="/post" aria-label="Post an item"><Plus size={24} /></Link>
  </div>;
}
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading"><span className="loader" /> Checking session...</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}
export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow || 'FIND YOUR WAY BACK'}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div>{action}</div>}</div>;
}
export function EmptyState({ title, description, icon, action }: { title: string; description: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon || <SearchCheck size={32} />}</div><h3>{title}</h3><p>{description}</p>{action && <div className="empty-action">{action}</div>}</div>;
}
export function LoadingCards() { return <div className="card-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton-card"><div className="skeleton-image" /><div className="skeleton-text" /><div className="skeleton-text short" /></div>)}</div>; }
export function LinkArrow({ to, children }: { to: string; children: React.ReactNode }) { return <Link className="text-link" to={to}>{children} <ArrowRight size={17} /></Link>; }
