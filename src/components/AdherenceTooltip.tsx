import React from 'react';
import { Patient, SpecialistInfo } from '../types';
import { X, TrendingUp } from 'lucide-react';

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
    <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-2xl border border-[#e2e8eb] p-3.5 w-72 text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
      {/* Tooltip Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#e2e8eb]">
        <div className="flex items-center gap-1.5 font-bold text-[#033d59]">
          <TrendingUp className="w-4 h-4 text-[#00aae1]" />
          <span>Adherencia del Paciente</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thermometer Stacked Bar */}
      <div className="space-y-2">
        <div className="h-6 w-full bg-gray-100 rounded-md overflow-hidden flex border border-[#e2e8eb] p-0.5 gap-0.5 shadow-inner">
          {cancPct > 0 && (
            <div
              style={{ width: `${cancPct}%` }}
              className="bg-[#e11d48] h-full rounded-xs flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
              title={`% Canc.: ${cancPct}%`}
            >
              {cancPct}%
            </div>
          )}

          {inasPct > 0 && (
            <div
              style={{ width: `${inasPct}%` }}
              className="bg-[#f59e0b] h-full rounded-xs flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
              title={`% Inasis.: ${inasPct}%`}
            >
              {inasPct}%
            </div>
          )}

          {reprogPct > 0 && (
            <div
              style={{ width: `${reprogPct}%` }}
              className="bg-[#0284c7] h-full rounded-xs flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
              title={`% Reprog.: ${reprogPct}%`}
            >
              {reprogPct}%
            </div>
          )}

          {vencPct > 0 && (
            <div
              style={{ width: `${vencPct}%` }}
              className="bg-[#a855f7] h-full rounded-xs flex items-center justify-center text-[10px] font-black text-white transition-all overflow-hidden shrink-0"
              title={`% Venc.: ${vencPct}%`}
            >
              {vencPct}%
            </div>
          )}
        </div>

        {/* Legend Text Below */}
        <div className="text-[10.5px] font-semibold text-[#035476] text-center pt-1 flex items-center justify-center gap-1.5 flex-wrap bg-[#f9fafb] p-1.5 rounded-lg border border-[#e2e8eb]">
          <span className="text-[#e11d48] font-bold">% Canc.</span>
          <span className="text-gray-300">|</span>
          <span className="text-[#f59e0b] font-bold">% Inasis.</span>
          <span className="text-gray-300">|</span>
          <span className="text-[#0284c7] font-bold">% Reprog.</span>
          <span className="text-gray-300">|</span>
          <span className="text-[#a855f7] font-bold">% Venc.</span>
        </div>
      </div>
    </div>
  );
};
