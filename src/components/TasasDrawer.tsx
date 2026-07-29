import React from 'react';
import { Patient, SpecialistInfo } from '../types';
import { X, TrendingUp, AlertTriangle, Calendar, Clock } from 'lucide-react';

interface TasasDrawerProps {
  patient: Patient;
  onClose: () => void;
}

export const TasasDrawer: React.FC<TasasDrawerProps> = ({ patient, onClose }) => {
  const tasas = patient.tasas;

  // Calculate Overdue Specialist Percentage (% Venc.)
  const totalSpecs = Object.keys(patient.specialists || {}).length || 7;
  const overdueCount = Object.values(patient.specialists || {}).filter((s: SpecialistInfo) => s.isOverdue).length;
  const vencPct = Math.round((overdueCount / totalSpecs) * 100);

  const cancPct = tasas.cancelacionesPct;
  const inasPct = tasas.inasistenciasPct;
  const reprogPct = tasas.reprogramacionesPct;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] w-[380px] max-w-full h-full shadow-2xl border-l border-[#e2e8eb] dark:border-[#334155] flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Adherencia e Indicadores</h3>
              <p className="text-xs text-white/80 truncate max-w-[220px]">{patient.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* Stacked Temperature Bar Section */}
          <div className="p-3.5 bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#033d59] dark:text-[#f8fafc] uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00aae1]" />
                Barra de Temperatura Apilada
              </span>
              <span className="text-[10px] text-[#035476] dark:text-[#94a3b8] bg-white dark:bg-[#1e293b] px-2 py-0.5 rounded border border-[#e2e8eb] dark:border-[#334155]">
                4 Indicadores
              </span>
            </div>

            {/* The Stacked Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${vencPct}%` }} className="bg-[#b45309] h-full transition-all" title={`Vencidos: ${vencPct}%`} />
                <div style={{ width: `${cancPct}%` }} className="bg-[#e11d48] h-full transition-all" title={`Cancelaciones: ${cancPct}%`} />
                <div style={{ width: `${inasPct}%` }} className="bg-[#a855f7] h-full transition-all" title={`Inasistencias: ${inasPct}%`} />
                <div style={{ width: `${reprogPct}%` }} className="bg-[#0284c7] h-full transition-all" title={`Reprogramaciones: ${reprogPct}%`} />
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-medium pt-1">
                <div className="flex items-center gap-1.5 text-[#b45309] dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#b45309] shrink-0" />
                  <span>Vencidos ({overdueCount} esp / {vencPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#e11d48] dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#e11d48] shrink-0" />
                  <span>Cancelados ({tasas.cancelacionesNum} / {cancPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#a855f7] dark:text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7] shrink-0" />
                  <span>Inasistencias ({tasas.inasistenciasNum} / {inasPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#0284c7] dark:text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7] shrink-0" />
                  <span>Reprog. ({tasas.reprogramacionesNum} / {reprogPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cards for Details */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase block">Cancelaciones</span>
              <p className="text-base font-extrabold text-[#e11d48]">{tasas.cancelacionesPct}%</p>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{tasas.cancelacionesNum} citas en total</span>
            </div>

            <div className="p-3 bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase block">Inasistencias</span>
              <p className="text-base font-extrabold text-[#a855f7]">{tasas.inasistenciasPct}%</p>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{tasas.inasistenciasNum} no asistidas</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-[#0f172a] border-t border-[#e2e8eb] dark:border-[#334155] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
