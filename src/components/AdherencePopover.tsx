import React, { useEffect, useRef } from 'react';
import { Patient, SpecialistInfo } from '../types';
import { X, Clock } from 'lucide-react';

interface AdherencePopoverProps {
  patient: Patient;
  onClose: () => void;
}

export const AdherencePopover: React.FC<AdherencePopoverProps> = ({ patient, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        !target?.closest('[data-adherence-toggle]')
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const cancPct = patient.tasas?.cancelacionesPct ?? 15;
  const inasPct = patient.tasas?.inasistenciasPct ?? 5;
  const reprogPct = patient.tasas?.reprogramacionesPct ?? 10;
  const totalSpecs = Object.keys(patient.specialists || {}).length || 7;
  const overdueCount = Object.values(patient.specialists || {}).filter(
    (s: SpecialistInfo) => s?.isOverdue
  ).length;
  const vencPct = Math.round((overdueCount / totalSpecs) * 100) || 20;

  return (
    <div
      ref={popoverRef}
      className="absolute left-full top-0 ml-1.5 z-50 bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] rounded-xl shadow-2xl border border-[#00aae1]/40 w-72 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e8eb] dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/20 border border-[#00aae1]/30 flex items-center justify-center text-[#00aae1] dark:text-[#38bdf8]">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-[#033d59] dark:text-[#f8fafc] text-[11px]">Adherencia: {patient.nombre}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-[#033d59] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-[#f1f5f9] dark:bg-gray-800 rounded-lg p-0.5 flex gap-1 border border-[#e2e8eb] dark:border-[#334155] items-center overflow-hidden shadow-inner">
          {cancPct > 0 && (
            <div
              style={{ width: `${cancPct}%` }}
              className="bg-[#e11d48] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
              title={`% Cancelaciones: ${cancPct}%`}
            />
          )}
          {inasPct > 0 && (
            <div
              style={{ width: `${inasPct}%` }}
              className="bg-[#f59e0b] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
              title={`% Inasistencias: ${inasPct}%`}
            />
          )}
          {reprogPct > 0 && (
            <div
              style={{ width: `${reprogPct}%` }}
              className="bg-[#00aae1] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
              title={`% Reprogramaciones: ${reprogPct}%`}
            />
          )}
          {vencPct > 0 && (
            <div
              style={{ width: `${vencPct}%` }}
              className="bg-[#a855f7] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
              title={`% Vencimientos: ${vencPct}%`}
            />
          )}
        </div>

        <div className="grid grid-cols-4 gap-1 text-center font-bold text-[9px]">
          <div className="bg-[#fff1f2] dark:bg-rose-950/40 border border-[#fecdd3] dark:border-rose-900 text-[#e11d48] dark:text-rose-400 rounded py-1 px-1 flex flex-col items-center justify-center">
            <span>Canc.</span>
            <span className="text-[10px] font-extrabold">{cancPct}%</span>
          </div>
          <div className="bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fde68a] dark:border-amber-900 text-[#d97706] dark:text-amber-400 rounded py-1 px-1 flex flex-col items-center justify-center">
            <span>Inasis.</span>
            <span className="text-[10px] font-extrabold">{inasPct}%</span>
          </div>
          <div className="bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#bae6fd] dark:border-sky-900 text-[#00aae1] dark:text-sky-400 rounded py-1 px-1 flex flex-col items-center justify-center">
            <span>Reprog.</span>
            <span className="text-[10px] font-extrabold">{reprogPct}%</span>
          </div>
          <div className="bg-[#faf5ff] dark:bg-purple-950/40 border border-[#e9d5ff] dark:border-purple-900 text-[#a855f7] dark:text-purple-400 rounded py-1 px-1 flex flex-col items-center justify-center">
            <span>Vencid.</span>
            <span className="text-[10px] font-extrabold">{vencPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
