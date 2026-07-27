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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white w-[380px] max-w-full h-full shadow-2xl border-l border-[#e2e8eb] flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#033d59] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00aae1]/20 flex items-center justify-center text-[#00aae1]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Adherencia del Paciente</h3>
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
          <div className="p-3.5 bg-[#f9fafb] border border-[#e2e8eb] rounded-xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#033d59] uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00aae1]" />
                Barra de Temperatura Apilada
              </span>
              <span className="text-[10px] text-[#035476] font-semibold bg-white px-2 py-0.5 rounded border border-[#e2e8eb]">
                4 Indicadores
              </span>
            </div>

            {/* The Stacked Bar */}
            <div className="h-6 w-full bg-gray-100 rounded-lg overflow-hidden flex border border-[#e2e8eb] shadow-inner p-0.5 gap-0.5">
              {cancPct > 0 && (
                <div
                  style={{ width: `${cancPct}%` }}
                  className="bg-[#e11d48] h-full rounded-xs transition-all flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
                  title={`% Canc.: ${cancPct}%`}
                >
                  {cancPct > 8 && `${cancPct}%`}
                </div>
              )}
              {inasPct > 0 && (
                <div
                  style={{ width: `${inasPct}%` }}
                  className="bg-[#f59e0b] h-full rounded-xs transition-all flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
                  title={`% Inasis.: ${inasPct}%`}
                >
                  {inasPct > 8 && `${inasPct}%`}
                </div>
              )}
              {reprogPct > 0 && (
                <div
                  style={{ width: `${reprogPct}%` }}
                  className="bg-[#0284c7] h-full rounded-xs transition-all flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
                  title={`% Reprog.: ${reprogPct}%`}
                >
                  {reprogPct > 8 && `${reprogPct}%`}
                </div>
              )}
              {vencPct > 0 && (
                <div
                  style={{ width: `${vencPct}%` }}
                  className="bg-[#a855f7] h-full rounded-xs transition-all flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
                  title={`% Venc.: ${vencPct}%`}
                >
                  {vencPct > 8 && `${vencPct}%`}
                </div>
              )}
            </div>

            {/* Indicator Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold pt-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/80 border border-rose-200 text-[#be123c]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
                  <span>% Canc.</span>
                </div>
                <span className="text-xs font-black">{cancPct}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[#b45309]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>% Inasis.</span>
                </div>
                <span className="text-xs font-black">{inasPct}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/80 border border-sky-200 text-[#0369a1]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                  <span>% Reprog.</span>
                </div>
                <span className="text-xs font-black">{reprogPct}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/80 border border-purple-200 text-[#7e22ce]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                  <span>% Venc.</span>
                </div>
                <span className="text-xs font-black">{vencPct}%</span>
              </div>
            </div>
          </div>

          {/* Detailed Metric Cards */}
          <div className="space-y-2">
            <h4 className="font-bold text-[11px] text-[#035476] uppercase tracking-wide">
              Desglose de Indicadores
            </h4>

            {/* Cancelaciones */}
            <div className="p-2.5 bg-white border border-rose-200 rounded-lg space-y-0.5">
              <div className="flex items-center justify-between text-rose-700">
                <span className="font-bold text-xs">% Canc. (Cancelaciones)</span>
                <span className="font-black text-sm">{cancPct}%</span>
              </div>
              <p className="text-[10px] text-gray-500">
                {tasas.cancelacionesNum} atenciones canceladas
              </p>
            </div>

            {/* Inasistencias */}
            <div className="p-2.5 bg-white border border-amber-200 rounded-lg space-y-0.5">
              <div className="flex items-center justify-between text-amber-800">
                <span className="font-bold text-xs">% Inasis. (Inasistencias)</span>
                <span className="font-black text-sm">{inasPct}%</span>
              </div>
              <p className="text-[10px] text-gray-500">
                {tasas.inasistenciasNum} atenciones con inasistencia
              </p>
            </div>

            {/* Reprogramaciones */}
            <div className="p-2.5 bg-white border border-sky-200 rounded-lg space-y-0.5">
              <div className="flex items-center justify-between text-[#0284c7]">
                <span className="font-bold text-xs">% Reprog. (Reprogramaciones)</span>
                <span className="font-black text-sm">{reprogPct}%</span>
              </div>
              <p className="text-[10px] text-gray-500">
                {tasas.reprogramacionesNum} atenciones reprogramadas
              </p>
            </div>

            {/* Vencidas */}
            <div className="p-2.5 bg-white border border-purple-200 rounded-lg space-y-0.5">
              <div className="flex items-center justify-between text-purple-800">
                <span className="font-bold text-xs">% Venc. (Atenciones Vencidas)</span>
                <span className="font-black text-sm">{vencPct}%</span>
              </div>
              <p className="text-[10px] text-gray-500">
                {overdueCount} de {totalSpecs} atenciones de especialidades vencidas
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f9fafb] border-t border-[#e2e8eb] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#033d59] bg-white border border-[#e2e8eb] hover:bg-gray-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
