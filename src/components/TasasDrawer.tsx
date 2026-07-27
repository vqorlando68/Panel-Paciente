import React from 'react';
import { Patient } from '../types';
import { X, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface TasasDrawerProps {
  patient: Patient;
  onClose: () => void;
}

export const TasasDrawer: React.FC<TasasDrawerProps> = ({ patient, onClose }) => {
  const tasas = patient.tasas;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white w-[340px] max-w-full h-full shadow-2xl border-l border-[#e2e8eb] flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#033d59] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00aae1]" />
            <div>
              <h3 className="font-bold text-xs">Indicadores de Tasa</h3>
              <p className="text-[11px] text-white/80 truncate max-w-[200px]">{patient.nombre}</p>
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
          
          {/* 3 Metric Cards */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[11px] text-[#035476] uppercase tracking-wide">
              Métricas de Cumplimiento
            </h4>

            {/* Cancelaciones */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-rose-700">
                <span className="font-bold text-xs">Cancelaciones (%C)</span>
                <span className="text-lg font-black">{tasas.cancelacionesPct}%</span>
              </div>
              <p className="text-[10px] text-rose-600/90 font-medium">
                {tasas.cancelacionesNum} cita(s) canceladas en el período
              </p>
            </div>

            {/* Inasistencias */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-amber-800">
                <span className="font-bold text-xs">Inasistencias (%I)</span>
                <span className="text-lg font-black">{tasas.inasistenciasPct}%</span>
              </div>
              <p className="text-[10px] text-amber-700/90 font-medium">
                {tasas.inasistenciasNum} cita(s) con inasistencia registrada
              </p>
            </div>

            {/* Reprogramaciones */}
            <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[#0284c7]">
                <span className="font-bold text-xs">Reprogramaciones (%R)</span>
                <span className="text-lg font-black">{tasas.reprogramacionesPct}%</span>
              </div>
              <p className="text-[10px] text-[#035476]/90 font-medium">
                {tasas.reprogramacionesNum} cita(s) reprogramadas
              </p>
            </div>
          </div>

          {/* Simple Visual Comparison Bar */}
          <div className="p-3 bg-[#f9fafb] border border-[#e2e8eb] rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-[#035476] uppercase block">
              Comparativo de Tasa
            </span>
            <div className="h-3.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${tasas.cancelacionesPct}%` }}
                className="bg-rose-500 h-full"
                title={`Cancelaciones: ${tasas.cancelacionesPct}%`}
              />
              <div
                style={{ width: `${tasas.inasistenciasPct}%` }}
                className="bg-amber-400 h-full"
                title={`Inasistencias: ${tasas.inasistenciasPct}%`}
              />
              <div
                style={{ width: `${tasas.reprogramacionesPct}%` }}
                className="bg-[#00aae1] h-full"
                title={`Reprogramaciones: ${tasas.reprogramacionesPct}%`}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-500 font-semibold pt-0.5">
              <span className="text-rose-600">■ Canc ({tasas.cancelacionesPct}%)</span>
              <span className="text-amber-600">■ Inas ({tasas.inasistenciasPct}%)</span>
              <span className="text-[#00aae1]">■ Repr ({tasas.reprogramacionesPct}%)</span>
            </div>
          </div>

          {/* History of Last 5 Appointments */}
          <div className="space-y-2">
            <h4 className="font-bold text-[11px] text-[#035476] uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
              Historial Últimas Citas
            </h4>

            <div className="border border-[#e2e8eb] rounded-xl overflow-hidden divide-y divide-[#e2e8eb]">
              {tasas.history.length === 0 ? (
                <p className="text-gray-400 text-[11px] p-3 text-center italic">Sin registros históricos.</p>
              ) : (
                tasas.history.map((h) => (
                  <div key={h.id} className="p-2.5 bg-white hover:bg-[#f9fafb] transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#033d59] text-[11px]">{h.specialty}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{h.date} — {h.professional}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        h.status === 'Atendida'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : h.status === 'Cancelada'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : h.status === 'Inasistida'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                ))
              )}
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
