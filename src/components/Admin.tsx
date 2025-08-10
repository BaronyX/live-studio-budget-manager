import React from 'react';
import { Brand, Fragrance } from '@/types';
import Card from './ui/Card';
import Button from './ui/Button';
import { th } from '@/i18n/th';
import { needsUpdate } from '@/lib/utils';

export interface AdminProps {
  brands: Brand[];
  fragrances: Fragrance[];
  onToggleBrandActive: (slug: string) => void;
  onMarkVerified: (fragranceId: string, supplierIndex: number) => void;
  onStopSupplier: (fragranceId: string, supplierIndex: number) => void;
  onActivateFragrance: (id: string) => void;
}

export const Admin: React.FC<AdminProps> = ({ brands, fragrances, onToggleBrandActive, onMarkVerified, onStopSupplier, onActivateFragrance }) => {
  const needs = fragrances.flatMap(f => f.suppliers.map((s, idx) => ({ f, s, idx }))).filter(({ s }) => needsUpdate(s.lastVerifiedAt) && s.supplierStatus === 'active');
  const inactive = fragrances.filter(f => f.status === 'inactive');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="font-semibold mb-2">Brands</div>
        <div className="space-y-2">
          {brands.map(b => (
            <div key={b.slug} className="flex items-center justify-between border-b border-bd pb-2">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-mu">{b.slug}</div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onToggleBrandActive(b.slug)}>
                {b.is_active ? th.hideBrand : th.showBrand}
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <div className="font-semibold mb-2">{th.needsUpdateCenter}</div>
        <div className="space-y-2">
          {needs.length === 0 && <div className="text-sm text-mu">ไม่มีรายการ</div>}
          {needs.map(({ f, s, idx }) => (
            <div key={`${f.id}-${idx}`} className="border border-bd rounded-md p-2">
              <div className="text-sm font-medium">{f.name} • {s.supplier}</div>
              <div className="text-xs text-mu">Last: {new Date(s.lastVerifiedAt).toLocaleDateString()}</div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => onMarkVerified(f.id, idx)}>{th.markVerified}</Button>
                <Button size="sm" variant="danger" onClick={() => onStopSupplier(f.id, idx)}>{th.stopImport}</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 lg:col-span-2">
        <div className="font-semibold mb-2">Inactive Fragrances</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {inactive.map(f => (
            <div key={f.id} className="border border-bd rounded-md p-3">
              <div className="font-medium text-sm">{f.name}</div>
              <div className="text-xs text-mu">{f.code} • {f.brandSlug}</div>
              <div className="pt-2">
                <Button size="sm" variant="secondary" onClick={() => onActivateFragrance(f.id)}>{th.active}</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Admin;