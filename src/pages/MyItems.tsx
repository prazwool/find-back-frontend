import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Edit3, Plus, Trash2 } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/Layout';
import { CategoryVisual } from '../components/CategoryVisual';
import { useToast } from '../context/ToastContext';
import { api, fmtDate, type Item } from '../lib/api';

export default function MyItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  useEffect(() => { api<{ items: Item[] }>('/items/mine').then(({ items }) => setItems(items)).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  async function remove(id: string) {
    if (!window.confirm('Permanently delete this listing and its requests?')) return;
    try { await api(`/items/${id}`, { method: 'DELETE' }); setItems((all) => all.filter((i) => i._id !== id)); toast('Listing deleted.'); }
    catch (err) { toast((err as Error).message, 'error'); }
  }
  return <div className="container page-wrap dashboard-page"><PageHeader eyebrow="YOUR LITTLE CORNER" title="My listings." description="Keep track of the items you've shared with your community." action={<Link to="/post" className="btn btn-primary"><Plus size={18}/> New listing</Link>} />
    <div className="dashboard-summary"><div><span>Total posts</span><strong>{items.length}</strong></div><div><span>Active listings</span><strong>{items.filter((i) => i.status === 'open').length}</strong></div><div><span>Resolved</span><strong>{items.filter((i) => i.status === 'resolved').length}</strong></div></div>
    {loading ? <div className="page-loading"><span className="loader"/> Loading listings...</div> : error ? <div className="form-error">{error}</div> : !items.length ? <EmptyState title="You haven't posted yet" description="Share a lost or found item to help someone in your community." action={<Link className="btn btn-primary" to="/post"><Plus size={18}/> Post your first item</Link>} /> : <div className="my-items-list">{items.map((item) => <div className="my-item-row" key={item._id}><Link to={`/items/${item._id}`} className="my-item-main"><CategoryVisual category={item.category} src={item.images[0]}/><div><span className={`status-text status-${item.type}`}>{item.type === 'lost' ? 'LOST' : 'FOUND'}</span><h3>{item.title}</h3><p>{item.location} · {fmtDate(item.createdAt)}</p></div></Link><div className="my-item-right"><span className={`mini-status ${item.status === 'open' ? 'mini-status-active' : 'mini-status-resolved'}`}>{item.status === 'open' ? '● Active' : '✓ Resolved'}</span><Link className="icon-action" aria-label={`Edit ${item.title}`} to={`/items/${item._id}/edit`}><Edit3 size={18}/></Link><button className="icon-action icon-action-danger" aria-label={`Delete ${item.title}`} onClick={() => remove(item._id)}><Trash2 size={18}/></button><Link className="icon-action" aria-label={`View ${item.title}`} to={`/items/${item._id}`}><ArrowRight size={19}/></Link></div></div>)}</div>}
  </div>;
}
