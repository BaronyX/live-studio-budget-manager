import React, { useMemo, useState } from 'react';
import { Brand, Fragrance, Role } from '@/types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { th } from '@/i18n/th';
import { normalizeText, isSaleReadySupplier } from '@/lib/utils';

export interface BrandExplorerProps {
  role: Role;
  brands: Brand[];
  fragrances: Fragrance[];
  onSelectBrand: (slug: string) => void;
  onAddBrand?: () => void;
}

export const BrandExplorer: React.FC<BrandExplorerProps> = ({ role, brands, fragrances, onSelectBrand, onAddBrand }) => {
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const nq = normalizeText(q);
    return brands
      .filter(b => b.is_active || role !== 'sales')
      .filter(b => !nq || normalizeText(b.name).includes(nq) || normalizeText(b.slug).includes(nq))
      .map(b => {
        const frags = fragrances.filter(f => f.brandSlug === b.slug);
        const readyCount = frags.filter(f => {
          if (f.status !== 'active') return false;
          const anyReady = f.suppliers.some(s => isSaleReadySupplier(s.lastVerifiedAt, s.isRecommended));
          return anyReady;
        }).length;
        return { ...b, readyCount } as Brand & { readyCount: number };
      });
  }, [brands, fragrances, q, role]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder={th.searchBrand} value={q} onChange={e => setQ(e.target.value)} className="flex-1" />
        {(role === 'rd' || role === 'admin') && (
          <Button onClick={onAddBrand}>{th.addBrand}</Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(b => (
          <Card key={b.id} className="p-4 cursor-pointer hover:shadow" onClick={() => onSelectBrand(b.slug)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.name}</div>
                <div className="text-sm text-mu">{b.slug}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-mu">{th.readyCount}</div>
                <div className="text-lg font-bold">{b.readyCount}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrandExplorer;