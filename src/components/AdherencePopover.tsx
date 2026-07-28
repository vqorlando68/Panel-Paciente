import React from 'react';
import { Patient, SpecialistInfo } from '../types';
import { X, Clock } from 'lucide-react';

interface AdherencePopoverProps {
  patient: Patient;
  onClose: () => void;
}

export const AdherencePopover: React.FC<AdherencePopoverProps> = ({ patient, onClose }) => {
  const cancPct = patient.tasas?.cancelacionesPct ?? 15;
  const inasPct = patient.tasas?.inasistenciasPct ?? 5;
  const reprogPct = patient.tasas?.reprogramacionesPct ?? 10;
  const totalSpecs = Object.keys(patient.specialists || {}).length || 7;
  const overdueCount = Object.values(patient.specialists || {}).filter(
    (s: SpecialistInfo) => s?.isOverdue
  ).length;
  const vencPct = Math.round((overdueCount / totalSpecs) * 100) || 20;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#00aae1]/30 w-full max-w-md overflow-hidden p-4 space-y-3.5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8eb]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#effaff] border border-[#00aae1]/30 flex items-center justify-center text-[#00aae1] shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#033d59] text-sm">Gráfico de Adherencia del Paciente</h3>
              <p className="text-[11px] text-[#035476] font-medium">{patient.nombre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#033d59] hover:bg-gray-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="h-5 w-full bg-[#f1f5f9] rounded-xl p-0.5 flex gap-1 border border-[#e2e8eb] items-center overflow-hidden shadow-inner">
            {cancPct > 0 && (
              <div
                style={{ width: `${cancPct}%` }}
                className="bg-[#e11d48] h-full rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all shrink-0 shadow-2xs"
                title={`% Cancelaciones: ${cancPct}%`}
              >
                {cancPct}%
              </div>
            )}
            {inasPct > 0 && (
              <div
                style={{ width: `${inasPct}%` }}
                className="bg-[#f59e0b] h-full rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all shrink-0 shadow-2xs"
                title={`% Inasistencias: ${inasPct}%`}
              >
                {inasPct}%
              </div>
            )}
            {reprogPct > 0 && (
              <div
                style={{ width: `${reprogPct}%` }}
                className="bg-[#00aae1] h-full rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all shrink-0 shadow-2xs"
                title={`% Reprogramaciones: ${reprogPct}%`}
              >
                {reprogPct}%
              </div>
            )}
            {vencPct > 0 && (
              <div
                style={{ width: `${vencPct}%` }}
                className="bg-[#a855f7] h-full rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all shrink-0 shadow-2xs"
                title={`% Vencimientos: ${vencPct}%`}
              >
                {vencPct}%
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-bold text-xs">
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48] rounded-xl py-2 px-2 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[10px] text-rose-700 font-extrabold tracking-wider">CANC.</span>
            </div>
            <div className="bg-[#fffbeb] border border-[#fde68a] text-[#d97706] rounded-xl py-2 px-2 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[10px] text-amber-700 font-extrabold tracking-wider">INASIS.</span>
            </div>
            <div className="bg-[#f0f9ff] border border-[#bae6fd] text-[#00aae1] rounded-xl py-2 px-2 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[10px] text-sky-700 font-extrabold tracking-wider">REPROG.</span>
            </div>
            <div className="bg-[#faf5ff] border border-[#e9d5ff] text-[#a855f7] rounded-xl py-2 px-2 flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[10px] text-purple-700 font-extrabold tracking-wider">VENCID.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#e2e8eb] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#033d59] bg-[#f9fafb] border border-[#e2e8eb] hover:bg-gray-100 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
