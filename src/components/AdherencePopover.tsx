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
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 pointer-events-none">
      {/* Invisible backdrop to capture outside clicks */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      <div
        ref={popoverRef}
        className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[#00aae1]/30 w-full max-w-sm overflow-hidden p-4 space-y-3 animate-in zoom-in-95 duration-150 z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8eb]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#effaff] border border-[#00aae1]/30 flex items-center justify-center text-[#00aae1] shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-[#033d59] text-xs">Adherencia: {patient.nombre}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-[#033d59] hover:bg-gray-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2.5">
          <div className="h-4 w-full bg-[#f1f5f9] rounded-lg p-0.5 flex gap-1 border border-[#e2e8eb] items-center overflow-hidden shadow-inner">
            {cancPct > 0 && (
              <div
                style={{ width: `${cancPct}%` }}
                className="bg-[#e11d48] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
                title={`% Cancelaciones: ${cancPct}%`}
              >
                {cancPct}%
              </div>
            )}
            {inasPct > 0 && (
              <div
                style={{ width: `${inasPct}%` }}
                className="bg-[#f59e0b] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
                title={`% Inasistencias: ${inasPct}%`}
              >
                {inasPct}%
              </div>
            )}
            {reprogPct > 0 && (
              <div
                style={{ width: `${reprogPct}%` }}
                className="bg-[#00aae1] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
                title={`% Reprogramaciones: ${reprogPct}%`}
              >
                {reprogPct}%
              </div>
            )}
            {vencPct > 0 && (
              <div
                style={{ width: `${vencPct}%` }}
                className="bg-[#a855f7] h-full rounded flex items-center justify-center text-[9px] font-extrabold text-white transition-all shrink-0"
                title={`% Vencimientos: ${vencPct}%`}
              >
                {vencPct}%
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[10px]">
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48] rounded-lg py-1.5 px-1 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[9px] text-rose-700 font-extrabold">CANC.</span>
            </div>
            <div className="bg-[#fffbeb] border border-[#fde68a] text-[#d97706] rounded-lg py-1.5 px-1 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[9px] text-amber-700 font-extrabold">INASIS.</span>
            </div>
            <div className="bg-[#f0f9ff] border border-[#bae6fd] text-[#00aae1] rounded-lg py-1.5 px-1 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[9px] text-sky-700 font-extrabold">REPROG.</span>
            </div>
            <div className="bg-[#faf5ff] border border-[#e9d5ff] text-[#a855f7] rounded-lg py-1.5 px-1 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[9px] text-purple-700 font-extrabold">VENCID.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
