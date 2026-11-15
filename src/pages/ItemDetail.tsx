import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, Edit3, HeartHandshake, MapPin, MessageCircle, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { CategoryVisual } from '../components/CategoryVisual';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, fmtDate, getUserId, imageUrl, memberName, type Item } from '../lib/api';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [showClaim, setShowClaim] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const mine = item && user && getUserId(item.owner) === user.id;
  useEffect(() => {
    if (!id) return;
    let active = true;
    api<{ item: Item }>(`/items/${id}`).then((result) => { if (active) setItem(result.item); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  async function claim(e: React.FormEvent) {
    e.preventDefault(); if (!item) return;
    setBusy(true); setError('');
    try { await api('/claims', { method: 'POST', body: JSON.stringify({ itemId: item._id, message }) }); setSent(true); setShowClaim(false); toast('Your request has been sent to the owner.'); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  async function changeStatus() {
    if (!item) return;
    if (!window.confirm(`Mark this listing as ${item.status === 'open' ? 'resolved' : 'active'}?`)) return;
    setBusy(true);
    try {
      const result = await api<{ item: Item }>(`/items/${item._id}`, { method: 'PATCH', body: JSON.stringify({ status: item.status === 'open' ? 'resolved' : 'open' }) });
      setItem({ ...item, status: result.item.status }); toast('Listing status updated.');
    } catch (err) { toast((err as Error).message, 'error'); } finally { setBusy(false); }
  }
  async function remove() {
    if (!item || !window.confirm('Delete this listing permanently? This also removes all its requests.')) return;
    setBusy(true);
    try { await api(`/items/${item._id}`, { method: 'DELETE' }); toast('Listing deleted.'); navigate('/my-items'); }
    catch (err) { toast((err as Error).message, 'error'); setBusy(false); }
  }
  if (loading) return <div className="page-loading"><span className="loader" /> Finding the details...</div>;
  if (!item) return <div className="container page-wrap"><div className="empty-state"><h2>Listing not found</h2><p>{error || 'This listing may have been removed.'}</p><Link className="btn btn-primary" to="/browse">Browse items</Link></div></div>;
  return <div className="container page-wrap item-detail-page"><Link className="back-link" to="/browse"><ArrowLeft size={17}/> Back to listings</Link>
    <div className="detail-layout"><div className="detail-main">
      <div className="detail-image-wrap"><CategoryVisual category={item.category} src={item.images[activePhoto]} className="detail-image"/><div className="detail-image-badges"><span className={`status-chip chip-${item.type}`}>{item.type === 'lost' ? 'Lost item' : 'Found item'}</span>{item.status === 'resolved' && <span className="resolved-chip">Reunited ✓</span>}</div></div>
      {item.images.length > 1 && <div className="detail-thumbnails">{item.images.map((src, i) => <button key={src} onClick={() => setActivePhoto(i)} className={activePhoto === i ? 'active' : ''}><img src={imageUrl(src)} alt={`Item view ${i + 1}`}/></button>)}</div>}
      <div className="detail-content"><div className="eyebrow">{item.category.toUpperCase()} / {item.type.toUpperCase()}</div><h1>{item.title}</h1><div className="detail-metas"><span><MapPin size={18}/>{item.location}</span><span><CalendarDays size={18}/>{fmtDate(item.occurredOn)}</span><span><Clock3 size={18}/> Posted {fmtDate(item.createdAt)}</span></div><hr/><h2>About this item</h2><p className="detail-description">{item.description}</p><div className="detail-category"><strong>Category</strong><span>{item.category}</span></div></div>
    </div><aside className="detail-aside"><div className="detail-action-panel"><div className="detail-owner"><div className="detail-owner-avatar"><UserRound size={25}/></div><div><small>Posted by</small><strong>{memberName(item.owner)}</strong></div></div>
      <div className="detail-action-body">{mine ? <><h3>Your listing</h3><p>Manage the information and updates for this item.</p><Link className="btn btn-primary btn-full" to={`/items/${item._id}/edit`}><Edit3 size={18}/> Edit listing</Link><button className="btn btn-outline btn-full" disabled={busy} onClick={changeStatus}>{item.status === 'open' ? 'Mark as resolved' : 'Reopen listing'}</button><Link className="btn btn-soft btn-full" to="/requests"><MessageCircle size={17}/> View incoming requests</Link><button className="danger-link" disabled={busy} onClick={remove}><Trash2 size={16}/> Delete listing</button></> : item.status === 'resolved' ? <><div className="resolved-large"><CheckCircle2 size={35}/></div><h3>Happy ending!</h3><p>This listing has been marked as resolved. Thanks for looking out for each other.</p></> : sent ? <><div className="resolved-large"><CheckCircle2 size={35}/></div><h3>Request sent!</h3><p>The owner can review your message. Check its status under Requests.</p><Link className="btn btn-outline btn-full" to="/requests">View my requests</Link></> : <><h3>{item.type === 'lost' ? 'Have you found it?' : 'Is this yours?'}</h3><p>{item.type === 'lost' ? 'Let the poster know you might have their missing item.' : 'Tell the finder why you believe this belongs to you.'}</p>{user ? <button className="btn btn-primary btn-full" onClick={() => setShowClaim(true)}><MessageCircle size={18}/> Send a request <ArrowRight size={18}/></button> : <Link className="btn btn-primary btn-full" to={`/login?next=${encodeURIComponent(`/items/${item._id}`)}`}>Sign in to connect <ArrowRight size={18}/></Link>}<small className="privacy-note"><ShieldCheck size={16}/> Contact emails are shared only after approval.</small></>}
      </div></div><div className="aside-tip"><HeartHandshake size={23}/><div><strong>A safer way to reconnect</strong><p>Meet in a public place and verify ownership before handing over an item.</p></div></div></aside></div>
    {showClaim && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowClaim(false); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><div className="eyebrow">LET'S RECONNECT</div><h2 id="modal-title">Send a request</h2></div><button aria-label="Close" onClick={() => setShowClaim(false)}><X size={21}/></button></div><p>Share enough information about <strong>{item.title}</strong> so the poster can verify your connection to it.</p><form onSubmit={claim}><label htmlFor="request-message">Your message</label><textarea id="request-message" required minLength={15} maxLength={1000} rows={5} placeholder="Describe identifying details, where you last saw the item, or how you can help..." value={message} onChange={(e) => setMessage(e.target.value)} /><small>{message.length}/1000 characters</small>{error && <div className="form-error">{error}</div>}<button disabled={busy} type="submit" className="btn btn-primary btn-full btn-large">{busy ? 'Sending...' : 'Send request'} <ArrowRight size={18}/></button></form></div></div>}
  </div>;
}
