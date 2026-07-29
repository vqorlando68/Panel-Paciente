import React from 'react';
import { SpecialistInfo } from '../types';

interface SpecialistCardProps {
  data?: SpecialistInfo;
  patientHasRehuso?: boolean;
  onClick: () => void;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  data,
  patientHasRehuso,
  onClick,
}) => {
  const isUnassigned =
    !data ||
    !data.professionalName ||
    data.professionalName === '—' ||
    data.professionalName.toLowerCase() === 'sin asignar' ||
    data.professionalName.toLowerCase() === 'sin rellenar';

  if (isUnassigned) {
    return (
      <div
        onClick={onClick}
        className="p-2 bg-amber-50/40 dark:bg-amber-950/20 rounded-lg border border-dashed border-[#fbbf24] dark:border-amber-600/60 hover:border-[#00aae1] dark:hover:border-[#38bdf8] transition-all cursor-pointer min-h-[92px] flex items-center justify-center text-[#d97706] dark:text-amber-400 text-[11px] font-bold shadow-2xs"
        title="Sin especialista asignado. Clic para asignar."
      >
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          Sin Asignar
        </span>
      </div>
    );
  }

  const showPurple = Boolean(data.isOverdue);
  const showRed = Boolean(data.hasRehuso || (patientHasRehuso && data.hasRehuso !== false));

  const formatWithTime = (dateStr: string) => {
    if (!dateStr || dateStr === '—') return '—';
    if (dateStr.includes(':')) return dateStr;
    return `${dateStr} 10:30 AM`;
  };

  const lastDateFormatted = formatWithTime(data.lastAttentionDate);
  const targetDateFormatted = formatWithTime(data.targetDate);
  const appointmentCount = data.attentionsHistory?.length || 4;

  const isOverdue = Boolean(data.isOverdue);

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-lg border transition-all cursor-pointer text-xs space-y-1 bg-white dark:bg-[#0f172a] hover:border-[#00aae1] dark:hover:border-[#38bdf8] ${
        isOverdue
          ? 'border-[#fbbf24] dark:border-amber-500 bg-[#fffbeb] dark:bg-amber-950/30 shadow-[0_4px_12px_rgba(251,191,36,0.35)]'
          : 'border-[#e2e8eb] dark:border-[#334155] shadow-2xs'
      }`}
      title={`Especialista: ${data.professionalName}. Clic para editar.`}
    >
      {/* Line 1: Nombre + guion + contador */}
      <div className="font-bold text-[#033d59] dark:text-[#f8fafc] truncate text-[11px] flex items-center gap-1 leading-tight">
        <span className="shrink-0">👤</span>
        <span className="truncate">
          {data.professionalName} - {appointmentCount}
        </span>
      </div>

      {/* Line 2: Fecha y hora */}
      <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono flex items-center gap-1 truncate">
        <span className="shrink-0">📅</span>
        <span className="truncate">{lastDateFormatted}</span>
      </div>

      {/* Line 3: Fecha y hora objetivo */}
      <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono flex items-center gap-1 truncate">
        <span className="shrink-0">🎯</span>
        <span className="truncate">{targetDateFormatted}</span>
      </div>

      {/* Line 4: Frecuencia + Puntos de alarma */}
      <div className="text-[10px] font-semibold text-[#035476] dark:text-[#94a3b8] flex items-center justify-between pt-0.5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 truncate">
          <span className="shrink-0">⏱️</span>
          <span className="truncate">{data.frequency}</span>
        </div>
        <div className="flex items-center gap-0.5 text-xs shrink-0 pl-1 font-sans">
          {showPurple && (
            <span style={{ color: '#a855f7' }} title="Atención vencida (>90 días)">
              🟣
            </span>
          )}
          {showRed && (
            <span style={{ color: '#e11d48' }} title="Rehúso de atención">
              🔴
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
