export const CATEGORIES = ['Electronics', 'Bags', 'Documents', 'Keys', 'Accessories', 'Clothing', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'resolved';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface User { id: string; name: string; email: string; createdAt?: string }
export interface Owner { _id: string; name: string; email?: string; createdAt?: string }
export interface Item {
  _id: string;
  owner: Owner | string;
  type: ItemType;
  title: string;
  description: string;
  category: Category;
  location: string;
  occurredOn: string;
  images: string[];
  status: ItemStatus;
  createdAt: string;
}
export interface Claim {
  _id: string;
  item: Pick<Item, '_id' | 'title' | 'type' | 'status' | 'images'> & { owner?: Owner } | null;
  claimant?: Owner;
  message: string;
  status: ClaimStatus;
  createdAt: string;
}
export interface Pagination { page: number; limit: number; total: number; totalPages: number }
export interface ItemInput {
  type: ItemType; title: string; description: string; category: Category;
  location: string; occurredOn: string;
}

export const TOKEN_KEY = 'findback_token';
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const baseOrigin = API_URL.startsWith('http') ? API_URL.replace(/\/api\/?$/, '') : '';
export const imageUrl = (url?: string) => !url ? '' : /^https?:\/\//.test(url) ? url : `${baseOrigin}${url}`;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const isForm = options.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(isForm ? {} : options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
  return data as T;
}
export const fmtDate = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const memberName = (owner: Item['owner']) => typeof owner === 'string' ? 'Community member' : owner.name;
export const getUserId = (owner: Item['owner']) => typeof owner === 'string' ? owner : owner._id;
