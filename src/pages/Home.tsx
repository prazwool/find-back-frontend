import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, HeartHandshake, MapPin, PackageSearch, Search, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import { api, type Item } from '../lib/api';
import { ItemCard } from '../components/ItemCard';
import { LinkArrow, LoadingCards } from '../components/Layout';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<{ open: number; reunited: number; members: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { hash } = useLocation();
  useEffect(() => {
    Promise.all([api<{ items: Item[] }>('/items?limit=6'), api<{ open: number; reunited: number; members: number }>('/stats')])
      .then(([list, overview]) => { setItems(list.items); setStats(overview); }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (hash === '#how-it-works') document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }, [hash]);
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-content">
        <div className="hero-pill"><Sparkles size={15} /> The community that brings things back</div>
        <h1>Lost something?<br /><span>Let's find it.</span></h1>
        <p className="hero-lead">From misplaced keys to found treasures, we help people and their belongings find their way back together.</p>
        <form className="hero-search" onSubmit={(e) => { e.preventDefault(); nav(`/browse${q ? `?q=${encodeURIComponent(q)}` : ''}`); }}>
          <Search size={21} /><input aria-label="Search lost and found items" placeholder="Search for a lost or found item..." value={q} onChange={(e) => setQ(e.target.value)} /><button type="submit">Find it <ArrowRight size={17} /></button>
        </form>
        <div className="hero-note"><span className="hero-avatars"><i>J</i><i>M</i><i>A</i></span> A little kindness goes a long way <HeartHandshake size={17} /></div>
      </div>
      <div className="hero-art" aria-label="Illustration of a reunited lost item">
        <div className="hero-orbit hero-orbit-1" /><div className="hero-orbit hero-orbit-2" />
        <div className="floating-spark spark-a">✳</div><div className="floating-spark spark-b">✦</div>
        <div className="art-card"><div className="art-card-top"><span className="art-label">GOOD NEWS!</span><span className="art-more">•••</span></div><div className="art-object"><div className="art-object-ring"><PackageSearch size={76} strokeWidth={1.35} /></div></div><div className="art-card-bottom"><span className="art-heart">♥</span><div><strong>Back where it belongs.</strong><span>Another happy reunion</span></div><span className="art-check"><Check size={22} strokeWidth={3} /></span></div></div>
        <div className="hero-float hero-float-one"><span>✨</span><div><strong>It was found!</strong><small>Good news, coming through</small></div></div>
        <div className="hero-float hero-float-two"><span className="hero-check"><Check size={17} /></span><div><strong>Reunited!</strong><small>A little kindness matters</small></div></div>
      </div>
    </div></section>
    <section className="stats-section"><div className="container stats-row">
      <div><strong>{stats ? stats.open.toLocaleString() : '—'}</strong><span>Active listings</span></div><span className="stats-divide" /><div><strong>{stats ? stats.reunited.toLocaleString() : '—'}</strong><span>Items resolved</span></div><span className="stats-divide" /><div><strong>{stats ? stats.members.toLocaleString() : '—'}</strong><span>Community members</span></div><div className="stats-message"><ShieldCheck size={22} /><span>Built on trust.<br />Driven by community.</span></div>
    </div></section>
    <section className="section listings-section"><div className="container">
      <div className="section-heading"><div><div className="eyebrow">THE LATEST UPDATES</div><h2>Every item has a story.</h2><p>See what your community is looking for — or what they've found.</p></div><LinkArrow to="/browse">View all listings</LinkArrow></div>
      {loading ? <LoadingCards /> : items.length ? <div className="card-grid">{items.map((item) => <ItemCard key={item._id} item={item} />)}</div> : <div className="home-empty"><PackageSearch size={35} /><h3>Be the first to post!</h3><p>There aren't any active listings yet. Help your community get started.</p><Link className="btn btn-primary" to="/post">Post an item <ArrowRight size={17} /></Link></div>}
    </div></section>
    <section className="section steps-section" id="how-it-works"><div className="container">
      <div className="center-heading"><div className="eyebrow">SIMPLE, HUMAN, HELPFUL</div><h2>A few clicks. A happy ending.</h2><p>Getting things back to where they belong should be simple.</p></div>
      <div className="steps-grid">
        <div className="step-card"><div className="step-icon step-icon-1"><UploadCloud size={29} /></div><span className="step-number">01</span><h3>Post what happened</h3><p>Lost or found something? Share a few details and a photo to spread the word.</p></div>
        <div className="step-card"><div className="step-icon step-icon-2"><Search size={29} /></div><span className="step-number">02</span><h3>Make a connection</h3><p>Explore listings, find a match, and send a private request to connect.</p></div>
        <div className="step-card"><div className="step-icon step-icon-3"><HeartHandshake size={29} /></div><span className="step-number">03</span><h3>Bring it back home</h3><p>Once the owner approves, contact details are shared so you can arrange a reunion.</p></div>
      </div>
    </div></section>
    <section className="section cta-section"><div className="container"><div className="cta-box"><div className="cta-decor cta-decor-one"/><div className="cta-decor cta-decor-two"/><div className="cta-copy"><div className="eyebrow eyebrow-light">BE SOMEONE'S GOOD NEWS</div><h2>One post could<br />make someone's day.</h2><p>Your small action might be exactly what someone else is hoping for.</p><Link to="/post" className="btn btn-white">Post an item <ArrowUpRight size={19} /></Link></div><div className="cta-illustration"><div className="cta-bubble"><MapPin size={44} /><span>FOUND!</span></div><div className="cta-star">✱</div><div className="cta-mini"><Check size={22} /><span>Back together.</span></div></div></div></div></section>
    <div className="trust-line container"><span><ShieldCheck size={18} /> Private contact until approved</span><ChevronRight size={15}/><span><HeartHandshake size={18} /> Community powered</span><ChevronRight size={15}/><span><Sparkles size={18} /> Completely free</span></div>
  </>;
}
