import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, Inbox, Mail, MessageCircle, Send, X } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/Layout';
import { CategoryVisual } from '../components/CategoryVisual';
import { useToast } from '../context/ToastContext';
import { api, fmtDate, type Claim, type Category } from '../lib/api';

export default function Requests() {
  const [tab, setTab] = useState<'incoming' | 'mine'>('incoming');
  const [incoming, setIncoming] = useState<Claim[]>([]);
  const [mine, setMine] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const toast = useToast();
  useEffect(() => {
    Promise.all([api<{ claims: Claim[] }>('/claims/incoming'), api<{ claims: Claim[] }>('/claims/mine')]).then(([a, b]) => { setIncoming(a.claims); setMine(b.claims); }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);
  async function decide(id: string, status: 'approved' | 'rejected') {
    if (status === 'approved' && !window.confirm('Approve this request? Your contact email will be shared with the requester and this listing will be resolved.')) return;
    setBusyId(id);
    try {
      await api(`/claims/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      const [a, b] = await Promise.all([api<{ claims: Claim[] }>('/claims/incoming'), api<{ claims: Claim[] }>('/claims/mine')]);
      setIncoming(a.claims); setMine(b.claims);
      toast(status === 'approved' ? 'Request approved. Contact information is now shared.' : 'Request declined.');
    } catch (err) { toast((err as Error).message, 'error'); }
    finally { setBusyId(''); }
  }
  const list = tab === 'incoming' ? incoming : mine;
  return <div className="container page-wrap dashboard-page"><PageHeader eyebrow="MAKE A CONNECTION" title="Your requests." description="Review messages from others and check on the requests you've sent." />
    <div className="requests-tabs"><button className={tab === 'incoming' ? 'active' : ''} onClick={() => setTab('incoming')}><Inbox size={18}/> Received <span>{incoming.length}</span></button><button className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}><Send size={18}/> Sent <span>{mine.length}</span></button></div>
    {loading ? <div className="page-loading"><span className="loader"/> Loading requests...</div> : error ? <div className="form-error">{error}</div> : !list.length ? <EmptyState icon={<MessageCircle size={31}/>} title={tab === 'incoming' ? 'No requests yet' : 'You haven’t sent any requests'} description={tab === 'incoming' ? 'When someone responds to one of your listings, their message will appear here.' : 'Browse items and connect with someone about a lost or found item.'} action={<Link className="btn btn-outline" to={tab === 'incoming' ? '/my-items' : '/browse'}>{tab === 'incoming' ? 'View my listings' : 'Browse items'} <ArrowRight size={17}/></Link>}/> : <div className="requests-list">{list.map((claim) => <div className="request-card" key={claim._id}>
      <div className="request-top"><div className="request-item-photo"><CategoryVisual category={('category' in (claim.item || {}) ? (claim.item as unknown as { category: Category }).category : 'Other')} src={claim.item?.images?.[0]}/></div><div className="request-item-info"><span className="request-small-label">REQUEST FOR</span><h3>{claim.item?.title || 'Deleted listing'}</h3><span>Received {fmtDate(claim.createdAt)}</span></div><span className={`request-status request-status-${claim.status}`}>{claim.status === 'approved' ? 'Approved' : claim.status === 'rejected' ? 'Declined' : 'Pending'}</span></div>
      <div className="request-content"><div className="request-person"><div className="request-person-avatar">{(tab === 'incoming' ? claim.claimant?.name : claim.item?.owner?.name)?.charAt(0) || '?'}</div><div><strong>{tab === 'incoming' ? claim.claimant?.name || 'Community member' : claim.item?.owner?.name || 'Listing owner'}</strong><span>{tab === 'incoming' ? 'Sent you a message' : 'You sent a message'}</span></div></div><blockquote>{claim.message}</blockquote>
      {claim.status === 'approved' && <div className="contact-reveal"><CheckCircle2 size={20}/><div><strong>Contact details unlocked!</strong><p>{tab === 'incoming' ? 'Requester' : 'Listing owner'}: <a href={`mailto:${tab === 'incoming' ? claim.claimant?.email : claim.item?.owner?.email}`}><Mail size={15}/>{tab === 'incoming' ? claim.claimant?.email : claim.item?.owner?.email}</a></p><small>Arrange a safe handoff in a public place.</small></div></div>}
      </div>
      {tab === 'incoming' && claim.status === 'pending' && <div className="request-actions"><button className="btn btn-primary" disabled={busyId === claim._id} onClick={() => decide(claim._id, 'approved')}><Check size={17}/> Approve request</button><button className="btn btn-outline" disabled={busyId === claim._id} onClick={() => decide(claim._id, 'rejected')}><X size={16}/> Decline</button></div>}
    </div>)}</div>}
  </div>;
}
