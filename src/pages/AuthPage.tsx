import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedNext = searchParams.get('next') || '';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/my-items';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signup = mode === 'register';
  if (user) return <Navigate to={next} replace />;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (signup) await register(name, email, password); else await login(email, password);
      toast(signup ? 'Welcome to FindBack!' : 'Welcome back!');
      navigate(next);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  return <div className="auth-page"><div className="container auth-grid">
    <div className="auth-side"><div className="auth-decor-auth">✳</div><div className="auth-side-content"><div className="auth-side-icon"><Heart size={37} fill="currentColor" /></div><h2>Good things find<br />their way back.</h2><p>Join a community that believes every little act of kindness matters.</p><div className="auth-quote"><span>“</span><p>It's more than finding things. It's about looking out for each other.</p></div></div></div>
    <div className="auth-form-wrap"><div className="auth-form-card"><div className="eyebrow">WELCOME {signup ? 'TO THE COMMUNITY' : 'BACK'}</div><h1>{signup ? 'Join FindBack.' : 'Hello again.'}</h1><p>{signup ? 'Create an account and start making a difference.' : 'Sign in to continue helping things find their way home.'}</p>
      <form className="stack-form" onSubmit={submit}>
        {signup && <div className="field"><label htmlFor="auth-name">Your name</label><div className="input-icon"><UserRound size={19}/><input required minLength={2} maxLength={60} id="auth-name" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div></div>}
        <div className="field"><label htmlFor="auth-email">Email address</label><div className="input-icon"><Mail size={19}/><input required type="email" id="auth-email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div></div>
        <div className="field"><label htmlFor="auth-password">Password</label><div className="input-icon"><LockKeyhole size={19}/><input required minLength={signup ? 8 : 1} maxLength={72} type={showPassword ? 'text' : 'password'} id="auth-password" placeholder={signup ? 'At least 8 characters' : 'Your password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'}/><button className="password-toggle" type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18}/>}</button></div></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary btn-full btn-large" disabled={busy}>{busy ? 'Please wait...' : signup ? 'Create your account' : 'Sign in'} <ArrowRight size={19} /></button>
      </form>
      <div className="auth-switch">{signup ? 'Already have an account?' : "Don't have an account?"} <Link to={`${signup ? '/login' : '/register'}${requestedNext ? `?next=${encodeURIComponent(next)}` : ''}`}>{signup ? 'Sign in' : 'Join FindBack'}</Link></div>
      <div className="auth-footer-note"><LockKeyhole size={14}/> Your details are kept private until a request is approved.</div>
    </div></div>
  </div></div>;
}
