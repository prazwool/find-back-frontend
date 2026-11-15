import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
export default function NotFound() { return <div className="container page-wrap"><div className="empty-state not-found"><div className="empty-icon"><SearchX size={39}/></div><h1>Oops, wrong turn.</h1><p>We couldn't find that page. Let's get you back on track.</p><Link className="btn btn-primary" to="/"><ArrowLeft size={17}/> Back home</Link></div></div>; }
