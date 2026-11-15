import { Backpack, FileText, Headphones, KeyRound, Shirt, Watch, PackageOpen } from 'lucide-react';
import { imageUrl, type Category } from '../lib/api';
import type { ReactNode } from 'react';

const categoryIcons: Record<Category, ReactNode> = {
  Electronics: <Headphones />, Bags: <Backpack />, Documents: <FileText />,
  Keys: <KeyRound />, Accessories: <Watch />, Clothing: <Shirt />, Other: <PackageOpen />,
};
export function CategoryVisual({ category, src, className = '' }: { category: Category; src?: string; className?: string }) {
  return <div className={`category-visual category-${category.toLowerCase()} ${className}`}>
    {src ? <img src={imageUrl(src)} alt={`${category} item`} loading="lazy" /> : <span className="category-symbol">{categoryIcons[category]}</span>}
  </div>;
}
