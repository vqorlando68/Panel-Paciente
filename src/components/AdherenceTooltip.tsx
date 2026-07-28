import React from 'react';
import { Patient, SpecialistInfo } from '../types';
import { X } from 'lucide-react';

interface AdherenceTooltipProps {
  patient: Patient;
  onClose: () => void;
}

export const AdherenceTooltip: React.FC<AdherenceTooltipProps> = ({ patient, onClose }) => {
  const tasas = patient.tasas;

  const cancPct = tasas?.cancelacionesPct ?? 15;
  const inasPct = tasas?.inasistenciasPct ?? 5;
  const reprogPct = tasas?.reprogramacionesPct ?? 10;

  // Calculate Overdue Specialist Percentage (% Venc.)
  const totalSpecs = Object.keys(patient.specialists || {}).length || 7;
  const overdueCount = Object.values(patient.specialists || {}).filter(
    (s: SpecialistInfo) => s?.isOverdue
  ).length;
  const vencPct = Math.round((overdueCount / totalSpecs) * 100) || 20;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-2xs p-4 animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] p-3.5 w-80 max-w-full text-xs animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tooltip Header */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#e2e8eb]">
          <h3 className="font-bold text-[#033d59] text-sm">Adherencia</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermometer Stacked Bar + 4 Labels */}
        <div className="space-y-2.5">
          {/* Temperature bar container */}
          <div className="h-8 w-full bg-[#f1f5f9] rounded-xl p-0.5 flex gap-1 border border-[#e2e8eb]/60 items-center">
            {cancPct > 0 && (
              <div
                style={{ width: `${cancPct}%` }}
                className="bg-[#e11d48] h-full rounded-lg flex items-center justify-center text-[11px] font-black text-white transition-all overflow-hidden shrink-0 shadow-2xs"
                title={`% Canc.: ${cancPct}%`}
              >
                {cancPct}%
              </div>
            )}

            {inasPct > 0 && (
              <div
                style={{ width: `${inasPct}%` }}
                className="bg-[#f59e0b] h-full rounded-lg flex items-center justify-center text-[11px] font-black text-white transition-all overflow-hidden shrink-0 shadow-2xs"
                title={`% Inasis.: ${inasPct}%`}
              >
                {inasPct}%
              </div>
            )}

            {reprogPct > 0 && (
              <div
                style={{ width: `${reprogPct}%` }}
                className="bg-[#00aae1] h-full rounded-lg flex items-center justify-center text-[11px] font-black text-white transition-all overflow-hidden shrink-0 shadow-2xs"
                title={`% Reprog.: ${reprogPct}%`}
              >
                {reprogPct}%
              </div>
            )}

            {vencPct > 0 && (
              <div
                style={{ width: `${vencPct}%` }}
                className="bg-[#a855f7] h-full rounded-lg flex items-center justify-center text-[11px] font-black text-white transition-all overflow-hidden shrink-0 shadow-2xs"
                title={`% Venc.: ${vencPct}%`}
              >
                {vencPct}%
              </div>
            )}
          </div>

          {/* 4 Bottom Pill Labels */}
          <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[10px]">
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48] rounded-lg py-1 px-1 tracking-wider uppercase">
              CANC.
            </div>
            <div className="bg-[#fffbeb] border border-[#fde68a] text-[#d97706] rounded-lg py-1 px-1 tracking-wider uppercase">
              INASIS.
            </div>
            <div className="bg-[#f0f9ff] border border-[#bae6fd] text-[#00aae1] rounded-lg py-1 px-1 tracking-wider uppercase">
              REPROG.
            </div>
            <div className="bg-[#faf5ff] border border-[#e9d5ff] text-[#a855f7] rounded-lg py-1 px-1 tracking-wider uppercase">
              VENC.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
