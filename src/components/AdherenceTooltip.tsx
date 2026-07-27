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
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8eb]">
          <div className="font-bold text-[#033d59] text-xs truncate pr-2">
            Adherencia - {patient.nombre}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Thermometer Stacked Bar */}
        <div className="space-y-2.5">
          <div className="h-7 w-full bg-gray-100 rounded-lg overflow-hidden flex border border-[#e2e8eb] p-0.5 gap-0.5 shadow-inner">
            {cancPct > 0 && (
              <div
                style={{ width: `${cancPct}%` }}
                className="bg-[#e11d48] h-full rounded flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
                title={`% Canc.: ${cancPct}%`}
              >
                {cancPct}%
              </div>
            )}

            {inasPct > 0 && (
              <div
                style={{ width: `${inasPct}%` }}
                className="bg-[#f59e0b] h-full rounded flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
                title={`% Inasis.: ${inasPct}%`}
              >
                {inasPct}%
              </div>
            )}

            {reprogPct > 0 && (
              <div
                style={{ width: `${reprogPct}%` }}
                className="bg-[#0284c7] h-full rounded flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
                title={`% Reprog.: ${reprogPct}%`}
              >
                {reprogPct}%
              </div>
            )}

            {vencPct > 0 && (
              <div
                style={{ width: `${vencPct}%` }}
                className="bg-[#a855f7] h-full rounded flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
                title={`% Venc.: ${vencPct}%`}
              >
                {vencPct}%
              </div>
            )}
          </div>

          {/* 4 Indicators Values Grid */}
          <div className="grid grid-cols-4 gap-1 text-[10.5px] font-semibold text-center pt-1 border-t border-[#e2e8eb]">
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48] rounded py-1 px-0.5">
              <div className="text-[9px] font-bold uppercase">Canc.</div>
              <div className="font-extrabold font-mono">{cancPct}%</div>
            </div>
            <div className="bg-[#fffbeb] border border-[#fde68a] text-[#d97706] rounded py-1 px-0.5">
              <div className="text-[9px] font-bold uppercase">Inasis.</div>
              <div className="font-extrabold font-mono">{inasPct}%</div>
            </div>
            <div className="bg-[#f0f9ff] border border-[#bae6fd] text-[#0284c7] rounded py-1 px-0.5">
              <div className="text-[9px] font-bold uppercase">Reprog.</div>
              <div className="font-extrabold font-mono">{reprogPct}%</div>
            </div>
            <div className="bg-[#faf5ff] border border-[#e9d5ff] text-[#a855f7] rounded py-1 px-0.5">
              <div className="text-[9px] font-bold uppercase">Venc.</div>
              <div className="font-extrabold font-mono">{vencPct}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
