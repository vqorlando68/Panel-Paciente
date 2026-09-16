import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Patient, AdherenciaData } from '../types';
import { X, Clock, Loader2, AlertCircle } from 'lucide-react';
import { PatientService } from '../services/patientService';

interface AdherencePopoverProps {
  patient: Patient;
  onClose: () => void;
}

export const AdherencePopover: React.FC<AdherencePopoverProps> = ({ patient, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdherenciaData | null>(patient.adherencia ?? null);

  // Fetch adherencia from API if not already loaded on patient object
  const fetchAdherencia = useCallback(async () => {
    if (patient.adherencia != null) {
      setData(patient.adherencia);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await PatientService.getAdherencia(patient.id);
      setData(result);
    } catch (e: any) {
      setError('No se pudo cargar la adherencia.');
    } finally {
      setLoading(false);
    }
  }, [patient.id, patient.adherencia]);

  useEffect(() => {
    fetchAdherencia();
  }, [fetchAdherencia]);

  // Close on click outside
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

  const recomendadas = data?.recomendadas ?? 0;
  const realizadas = data?.realizadas ?? 0;
  const porcentaje = data?.porcentaje ?? (recomendadas > 0 ? Math.round((realizadas / recomendadas) * 100) : 0);
  const pendientes = Math.max(0, recomendadas - realizadas);

  // Color based on adherence percentage
  const getBarColor = (pct: number) => {
    if (pct >= 80) return '#01ae6c';   // green
    if (pct >= 50) return '#f59e0b';   // amber
    return '#e11d48';                   // red
  };
  const barColor = getBarColor(porcentaje);

  return (
    <div
      ref={popoverRef}
      className="absolute left-full top-0 ml-1.5 z-50 bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] rounded-xl shadow-2xl border border-[#00aae1]/40 w-64 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e8eb] dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/20 border border-[#00aae1]/30 flex items-center justify-center text-[#00aae1] dark:text-[#38bdf8]">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-[#033d59] dark:text-[#f8fafc] text-[11px] leading-tight">
            Adherencia
            <span className="block text-[10px] font-normal text-[#035476]/60 dark:text-gray-400 truncate max-w-[130px]">
              {patient.nombre}
            </span>
          </h3>
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
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-[#00aae1] text-[11px]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando adherencia…</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-1.5 py-2 text-[#e11d48] text-[10px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Percentage Badge */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#035476]/70 dark:text-gray-400 uppercase tracking-wider">
              Porcentaje
            </span>
            <span
              className="text-base font-black leading-none"
              style={{ color: barColor }}
            >
              {porcentaje}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-[#f1f5f9] dark:bg-gray-800 rounded-full overflow-hidden border border-[#e2e8eb] dark:border-[#334155] shadow-inner">
            <div
              style={{ width: `${Math.min(100, porcentaje)}%`, backgroundColor: barColor }}
              className="h-full rounded-full transition-all duration-500"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-1 text-center">
            {/* Recomendadas */}
            <div className="bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#bae6fd] dark:border-sky-900 rounded-lg py-1.5 px-1 flex flex-col items-center justify-center">
              <span className="text-[9px] font-semibold text-[#0369a1] dark:text-sky-400 uppercase tracking-wide leading-tight">
                Recom.
              </span>
              <span className="text-sm font-black text-[#0369a1] dark:text-sky-300 leading-tight">
                {recomendadas}
              </span>
            </div>
            {/* Realizadas */}
            <div
              className="border rounded-lg py-1.5 px-1 flex flex-col items-center justify-center"
              style={{
                backgroundColor: `${barColor}18`,
                borderColor: `${barColor}60`,
              }}
            >
              <span
                className="text-[9px] font-semibold uppercase tracking-wide leading-tight"
                style={{ color: barColor }}
              >
                Realiz.
              </span>
              <span
                className="text-sm font-black leading-tight"
                style={{ color: barColor }}
              >
                {realizadas}
              </span>
            </div>
            {/* Pendientes */}
            <div className="bg-[#f8fafc] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-lg py-1.5 px-1 flex flex-col items-center justify-center">
              <span className="text-[9px] font-semibold text-[#64748b] dark:text-gray-400 uppercase tracking-wide leading-tight">
                Pend.
              </span>
              <span className="text-sm font-black text-[#64748b] dark:text-gray-300 leading-tight">
                {pendientes}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
