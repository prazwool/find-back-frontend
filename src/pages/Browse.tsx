import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, PackageSearch, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { ItemCard } from '../components/ItemCard';
import { EmptyState, LoadingCards, PageHeader } from '../components/Layout';
import { api, CATEGORIES, type Item, type Pagination } from '../lib/api';

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [queryDraft, setQueryDraft] = useState(params.get('q') || '');
  const [items, setItems] = useState<Item[]>([]);
  const [paging, setPaging] = useState<Pagination>({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const q = params.get('q') || '';
  const type = params.get('type') || 'all';
  const category = params.get('category') || 'all';
  const status = params.get('status') || 'open';
  const page = Number(params.get('page') || '1');
  useEffect(() => { setQueryDraft(q); }, [q]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api<{ items: Item[]; pagination: Pagination }>(`/items?${params.toString()}`)
      .then((data) => { if (active) { setItems(data.items); setPaging(data.pagination); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params, retry]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'status' && value === 'open')) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page'); setParams(next);
  }
  return <div className="container page-wrap">
    <PageHeader eyebrow="THE COMMUNITY BOARD" title="Discover listings." description="A lost item, a found treasure, or maybe the exact thing you were hoping to find." action={<Link to="/post" className="btn btn-primary"><Plus size={18}/> Post an item</Link>} />
    <div className="filter-panel"><div className="filter-panel-head"><div><SlidersHorizontal size={19} /><strong>Find what matters</strong></div><span>Explore items shared by your community</span></div>
      <form className="browse-search" onSubmit={(e) => { e.preventDefault(); update('q', queryDraft.trim()); }}><Search size={20} /><input aria-label="Search listings" placeholder="Search items, locations, descriptions..." value={queryDraft} onChange={(e) => setQueryDraft(e.target.value)} />{queryDraft && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => { setQueryDraft(''); update('q', ''); }}><X size={17}/></button>}<button className="btn btn-primary" type="submit">Search</button></form>
      <div className="filter-bottom"><div className="tabs" aria-label="Listing type"><button className={type === 'all' ? 'active' : ''} onClick={() => update('type', 'all')}>All items</button><button className={type === 'lost' ? 'active' : ''} onClick={() => update('type', 'lost')}>Lost</button><button className={type === 'found' ? 'active' : ''} onClick={() => update('type', 'found')}>Found</button></div>
        <div className="filter-selects"><label className="visually-hidden" htmlFor="filter-category">Category</label><select id="filter-category" value={category} onChange={(e) => update('category', e.target.value)}><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select><label className="visually-hidden" htmlFor="filter-status">Status</label><select id="filter-status" value={status} onChange={(e) => update('status', e.target.value)}><option value="open">Active</option><option value="resolved">Reunited</option><option value="all">All statuses</option></select></div>
      </div>
    </div>
    <div className="results-heading"><div><h2>{loading ? 'Loading listings...' : `${paging.total} ${paging.total === 1 ? 'listing' : 'listings'} found`}</h2><p>{q ? `Results matching “${q}”` : 'The latest posts from our community'}</p></div>{(q || type !== 'all' || category !== 'all' || status !== 'open') && <button className="reset-link" onClick={() => { setQueryDraft(''); setParams({}); }}>Reset filters <X size={15}/></button>}</div>
    {loading ? <LoadingCards /> : error ? <EmptyState title="Couldn't load listings" description={error} action={<button className="btn btn-outline" onClick={() => setRetry((v) => v + 1)}>Try again</button>} /> : items.length ? <div className="card-grid">{items.map((item) => <ItemCard key={item._id} item={item} />)}</div> : <EmptyState title="No matching items yet" description="Try different search terms or be the first to share a listing in this category." icon={<PackageSearch size={32}/>} action={<Link to="/post" className="btn btn-primary"><Plus size={17}/> Post an item</Link>} />}
    {!loading && paging.totalPages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => update('page', String(page - 1))}><ArrowLeft size={17}/> Previous</button><span>Page {page} of {paging.totalPages}</span><button disabled={page >= paging.totalPages} onClick={() => update('page', String(page + 1))}>Next <ArrowRight size={17}/></button></div>}
  </div>;
}
