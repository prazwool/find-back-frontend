import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryVisual } from './CategoryVisual';
import { fmtDate, type Item } from '../lib/api';

export function ItemCard({ item }: { item: Item }) {
  return <Link className="item-card" to={`/items/${item._id}`}>
    <div className="item-card-photo">
      <CategoryVisual category={item.category} src={item.images[0]} />
      <span className={`status-chip chip-${item.type}`}>{item.type === 'lost' ? 'Lost item' : 'Found item'}</span>
      {item.status === 'resolved' && <span className="resolved-chip">Reunited ✓</span>}
    </div>
    <div className="item-card-body">
      <div className="item-card-meta">{item.category}<span>·</span>{fmtDate(item.createdAt)}</div>
      <div className="item-card-title-row"><h3>{item.title}</h3><ArrowUpRight size={19} /></div>
      <p className="item-card-desc">{item.description}</p>
      <div className="item-card-foot"><span><MapPin size={15} /> {item.location}</span><span><CalendarDays size={14} /> {fmtDate(item.occurredOn)}</span></div>
    </div>
  </Link>;
}
