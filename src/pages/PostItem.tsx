import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Camera, CheckCircle2, Info, MapPin, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { PageHeader } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, CATEGORIES, getUserId, imageUrl, type Item, type ItemInput } from '../lib/api';

const empty: ItemInput = { type: 'lost', title: '', description: '', category: 'Electronics', location: '', occurredOn: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) };
export default function PostItem() {
  const { id } = useParams();
  const editMode = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState<ItemInput>({ ...empty });
  const [status, setStatus] = useState<'open' | 'resolved'>('open');
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(editMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => () => { previews.forEach((url) => URL.revokeObjectURL(url)); }, [previews]);
  useEffect(() => {
    if (!id) return;
    api<{ item: Item }>(`/items/${id}`).then(({ item }) => {
      if (getUserId(item.owner) !== user?.id) { setError('You cannot edit this listing.'); return; }
      setValues({ type: item.type, title: item.title, description: item.description, category: item.category, location: item.location, occurredOn: item.occurredOn.slice(0, 10) });
      setStatus(item.status); setExistingPhotos(item.images);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, user?.id]);
  function update<K extends keyof ItemInput>(key: K, value: ItemInput[K]) { setValues((v) => ({ ...v, [key]: value })); }
  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files);
    if (photos.length + next.length > 3) { setError('You can upload up to 3 photos.'); return; }
    if (next.some((f) => !['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)) { setError('Use JPEG, PNG, or WEBP files up to 5 MB each.'); return; }
    setError(''); setPhotos((previous) => [...previous, ...next]);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      let result: { item: Item };
      if (editMode) {
        result = await api<{ item: Item }>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify({ ...values, status }) });
      } else {
        const form = new FormData();
        Object.entries(values).forEach(([key, value]) => form.append(key, value));
        photos.forEach((file) => form.append('images', file));
        result = await api<{ item: Item }>('/items', { method: 'POST', body: form });
      }
      toast(editMode ? 'Your listing has been updated.' : 'Your listing is live. Thanks for helping!');
      navigate(`/items/${result.item._id}`);
    } catch (err) { setError((err as Error).message); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    finally { setBusy(false); }
  }
  if (loading) return <div className="page-loading"><span className="loader" /> Loading your listing...</div>;
  return <div className="container page-wrap form-page">
    <Link className="back-link" to={editMode ? `/items/${id}` : '/browse'}><ArrowLeft size={17}/> {editMode ? 'Back to listing' : 'Back to listings'}</Link>
    <PageHeader eyebrow={editMode ? 'MAKE AN UPDATE' : 'SPREAD THE WORD'} title={editMode ? 'Edit your listing.' : 'Let’s get it back.'} description={editMode ? 'Keep your information accurate to help the community.' : 'Tell us a little about what happened. The more details, the better the chance of a happy reunion.'} />
    <div className="form-layout"><form className="listing-form" onSubmit={submit}>
      <div className="form-card"><div className="form-section-heading"><span className="section-num">01</span><div><h2>What happened?</h2><p>Let's start with the basics.</p></div></div>
        <div className="field"><label>Type of listing <span className="req">*</span></label><div className="type-choice"><button type="button" className={`type-tile ${values.type === 'lost' ? 'type-tile--selected' : ''}`} onClick={() => update('type', 'lost')}><span className="choice-icon">🔎</span><span><strong>I lost something</strong><small>Help me find my item</small></span><span className="choice-radio" /></button><button type="button" className={`type-tile ${values.type === 'found' ? 'type-tile--selected' : ''}`} onClick={() => update('type', 'found')}><span className="choice-icon">🙌</span><span><strong>I found something</strong><small>Help return it to its owner</small></span><span className="choice-radio" /></button></div></div>
        <div className="field"><label htmlFor="post-title">Item title <span className="req">*</span></label><input required minLength={5} maxLength={100} id="post-title" placeholder="e.g. Black wireless headphones" value={values.title} onChange={(e) => update('title', e.target.value)}/><small>Give the item a short, clear name.</small></div>
        <div className="field"><label htmlFor="post-category">Category <span className="req">*</span></label><select required id="post-category" value={values.category} onChange={(e) => update('category', e.target.value as ItemInput['category'])}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
        <div className="field"><label htmlFor="post-description">Description <span className="req">*</span></label><textarea required minLength={15} maxLength={1500} id="post-description" rows={5} placeholder="What does it look like? Any distinctive features? Where did you last see it?" value={values.description} onChange={(e) => update('description', e.target.value)}/><div className="field-footer"><small>Share useful details, but keep private identifying details for verification.</small><small>{values.description.length}/1500</small></div></div>
      </div>
      <div className="form-card"><div className="form-section-heading"><span className="section-num">02</span><div><h2>When & where?</h2><p>Help others narrow down the search.</p></div></div>
        <div className="field"><label htmlFor="post-location"><MapPin size={16}/> Location <span className="req">*</span></label><input required minLength={3} maxLength={120} id="post-location" placeholder="e.g. Lakeside, Pokhara" value={values.location} onChange={(e) => update('location', e.target.value)}/><small>Use a general public location, not your personal address.</small></div>
        <div className="field"><label htmlFor="post-date"><CalendarDays size={16}/> Date {values.type === 'lost' ? 'lost' : 'found'} <span className="req">*</span></label><input required type="date" max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)} id="post-date" value={values.occurredOn} onChange={(e) => update('occurredOn', e.target.value)}/></div>
      </div>
      <div className="form-card"><div className="form-section-heading"><span className="section-num">03</span><div><h2>Add some photos</h2><p>A clear picture makes matching easier.</p></div></div>
        {editMode ? <><div className="existing-photos">{existingPhotos.length ? existingPhotos.map((photo) => <img alt="Current listing" src={imageUrl(photo)} key={photo}/>) : <div className="hint-box">No photos on this listing.</div>}</div><div className="hint-box"><Info size={18}/> Photo changes are not supported while editing. You can update all other details.</div></> : <><label className="upload-zone" htmlFor="photos"><input type="file" id="photos" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} disabled={photos.length >= 3}/><div className="upload-zone-icon"><UploadCloud size={31}/></div><strong>Click to upload photos</strong><span>JPEG, PNG or WEBP · Up to 3 photos · 5 MB each</span></label>
          {previews.length > 0 && <div className="photo-previews">{previews.map((url, index) => <div key={url} className="preview-photo"><img src={url} alt={`Upload preview ${index + 1}`}/><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}><Trash2 size={15}/></button></div>)}</div>}</>}
      </div>
      {editMode && <div className="form-card"><div className="form-section-heading"><span className="section-num">04</span><div><h2>Listing status</h2><p>Let the community know if it's been resolved.</p></div></div><div className="field"><label htmlFor="post-status">Status</label><select id="post-status" value={status} onChange={(e) => setStatus(e.target.value as 'open' | 'resolved')}><option value="open">Active — still looking</option><option value="resolved">Resolved — reunited or closed</option></select></div></div>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-submit-row"><Link className="btn btn-outline" to={editMode ? `/items/${id}` : '/browse'}>Cancel</Link><button type="submit" className="btn btn-primary btn-large" disabled={busy}>{busy ? 'Saving...' : editMode ? 'Save changes' : 'Publish listing'} <ArrowRight size={19}/></button></div>
    </form><aside className="form-sidebar"><div className="sidebar-panel"><div className="sidebar-illustration"><Camera size={48}/><span>✦</span></div><h3>Tips for a great post</h3><ul><li><CheckCircle2 size={17}/> Use a descriptive title</li><li><CheckCircle2 size={17}/> Mention distinguishing features</li><li><CheckCircle2 size={17}/> Choose an accurate location</li><li><CheckCircle2 size={17}/> Include photos if you have them</li></ul></div><div className="sidebar-safety"><ShieldCheck size={24}/><div><strong>Your safety matters</strong><p>Never share your home address, passwords, or private identification numbers in a public listing.</p></div></div></aside></div>
  </div>;
}
