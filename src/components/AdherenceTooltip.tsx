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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] p-4 w-80 max-w-full text-xs animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tooltip Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#e2e8eb]">
          <div className="flex items-center gap-2 font-bold text-[#033d59]">
            <div className="p-1 rounded bg-[#effaff] text-[#00aae1]">
              <TrendingUp className="w-4 h-4 text-[#00aae1]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#033d59]">Adherencia del Paciente</div>
              <div className="text-[10px] text-[#035476] font-normal truncate max-w-[180px]">
                {patient.nombre}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermometer Stacked Bar */}
        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-bold text-[#035476] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Indicadores de Incumplimiento</span>
              <span className="text-[9px] text-gray-400 font-mono">Total %</span>
            </div>
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
          </div>

          {/* Legend Details Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium pt-1">
            <div className="flex items-center justify-between p-1.5 rounded-md bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48]">
              <span className="font-bold">% Canc.</span>
              <span className="font-mono font-black">{cancPct}%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-md bg-[#fffbeb] border border-[#fde68a] text-[#d97706]">
              <span className="font-bold">% Inasis.</span>
              <span className="font-mono font-black">{inasPct}%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-md bg-[#f0f9ff] border border-[#bae6fd] text-[#0284c7]">
              <span className="font-bold">% Reprog.</span>
              <span className="font-mono font-black">{reprogPct}%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-md bg-[#faf5ff] border border-[#e9d5ff] text-[#a855f7]">
              <span className="font-bold">% Venc.</span>
              <span className="font-mono font-black">{vencPct}%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e2e8eb] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-[#00aae1] hover:bg-[#0196d4] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
