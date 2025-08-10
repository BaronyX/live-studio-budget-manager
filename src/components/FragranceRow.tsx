import React from 'react';
import { Fragrance, Role } from '@/types';
import Pill from './ui/Pill';
import { calcPrice, isSaleReadySupplier } from '@/lib/utils';

export interface FragranceRowProps {
  fragrance: Fragrance;
  role: Role;
  onEdit?: (f: Fragrance) => void;
  onToggleActive?: (id: string) => void;
}

export const FragranceRow: React.FC<FragranceRowProps> = ({ fragrance, role, onEdit, onToggleActive }) => {
  const primarySupplier = fragrance.suppliers.find(s => s.isRecommended) || fragrance.suppliers[0];
  const isReady = primarySupplier ? isSaleReadySupplier(primarySupplier.lastVerifiedAt, !!primarySupplier.isRecommended) : false;

  return (
    <div className="flex items-start gap-3 p-3 border-b border-bd">
      <div className="w-14 h-14 bg-bd/30 rounded-md overflow-hidden flex items-center justify-center text-xs">
        {fragrance.imageUrl ? <img src={fragrance.imageUrl} alt={fragrance.name} className="w-full h-full object-cover" /> : 'IMG'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-semibold truncate">{fragrance.name}</div>
          <Pill>{fragrance.code}</Pill>
          {fragrance.isLLFFree && <Pill color="ok">LLF free</Pill>}
          {fragrance.isAllergenFree && <Pill color="ok">Allergen free</Pill>}
          {fragrance.isSalesPush && <Pill color="ac">Sales push</Pill>}
          {fragrance.isSPCInUse && <Pill color="ac">SPC มีใช้</Pill>}
          {fragrance.status === 'inactive' && <Pill color="wa">Inactive</Pill>}
        </div>
        <div className="text-sm text-mu line-clamp-2">{fragrance.description}</div>
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          {fragrance.referenceScents.slice(0,3).map(ref => (
            <Pill key={ref} className="bg-sf">{ref}</Pill>
          ))}
          {fragrance.referenceScents.length > 3 && (
            <Pill className="bg-sf">+{fragrance.referenceScents.length - 3} refs</Pill>
          )}
        </div>
        <div className="mt-2 text-xs text-mu flex items-center gap-3 flex-wrap">
          <span>Family: {fragrance.primaryFamilyId || '-'}</span>
          <span>Fit: {Object.entries(fragrance.fits).slice(0,3).map(([k,v]) => `${k} (${v})`).join(', ')}</span>
        </div>
      </div>
      <div className="w-52 text-sm text-right space-y-1">
        {role === 'sales' ? (
          primarySupplier ? (
            <div>
              <div className="text-xs text-mu">Lead time</div>
              <div className="font-medium">{primarySupplier.leadTimeDays} วัน</div>
            </div>
          ) : (
            <div className="text-xs text-mu">No supplier</div>
          )
        ) : (
          primarySupplier ? (
            <div>
              <div className="text-xs text-mu">{primarySupplier.supplier} {primarySupplier.tradeName ? `• ${primarySupplier.tradeName}` : ''}</div>
              {primarySupplier.tiers.slice(0,3).map((t, idx) => (
                <div key={idx} className="flex items-center justify-end gap-2">
                  <span className="text-xs text-mu">{t.moqKg}kg</span>
                  <span className="font-medium">฿{calcPrice(Number(t.basePriceTHBPerKg), t.enableExcise).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-mu">No supplier</div>
          )
        )}
        <div className="flex gap-2 justify-end pt-2">
          {(role === 'rd' || role === 'admin') && (
            <>
              <button className="text-ac text-xs" onClick={() => onEdit?.(fragrance)}>แก้ไข</button>
              <button className="text-wa text-xs" onClick={() => onToggleActive?.(fragrance.id)}>
                {fragrance.status === 'active' ? 'ทำให้ Inactive' : 'ทำให้ Active'}
              </button>
            </>
          )}
          {role === 'sales' && isReady && <Pill color="ok">พร้อมขาย</Pill>}
        </div>
      </div>
    </div>
  );
};

export default FragranceRow;