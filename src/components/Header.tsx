import React from 'react';
import { UserRole } from '../types';
import { Activity } from 'lucide-react';

interface HeaderProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  totalPatients: number;
  overdueCount: number;
  activeCount: number;
  criticalCount?: number;
  onSelectMetricCard?: (metric: 'total' | 'activos' | 'vencidos') => void;
  activeMetricCard?: 'total' | 'activos' | 'vencidos';
  fastFilter?: string;
  onFastFilterChange?: (filter: string) => void;
}

const FAST_FILTER_CHIPS = [
  { id: 'Activos', label: 'Activos' },
  { id: 'Vencidos', label: 'Vencidos' },
  { id: 'Inconforme', label: 'Inconforme', dot: '#e11d48' },
  { id: 'Críticos', label: 'Críticos' },
  { id: '>90 días', label: '>90 días', dot: '#a855f7' },
  { id: 'Rehúso', label: 'Rehuso', dot: '#e11d48' },
  { id: 'Aceptados', label: 'Aceptados' },
  { id: 'Sin Acta', label: 'Sin Acta' },
];

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onRoleChange,
  totalPatients,
  overdueCount,
  activeCount,
  onSelectMetricCard,
  activeMetricCard = 'total',
  fastFilter = 'Todos',
  onFastFilterChange,
}) => {
  return (
    <header className="bg-white border-b border-[#e2e8eb] px-6 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 shrink-0 max-w-[1550px] w-full mx-auto font-sans rounded-b-xl shadow-2xs">
      {/* Title & Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-[#effaff] border border-[#00aae1]/20 flex items-center justify-center text-[#00aae1]">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#033d59] tracking-tight">Panel de Listado de Pacientes</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#effaff] text-[#00aae1] font-medium border border-[#00aae1]/20">
              SIAU v2.0
            </span>
          </div>
          <p className="text-xs text-[#035476]">
            Seguimiento clínico multidisciplinario e indicadores de vencimiento
          </p>
        </div>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex items-center gap-6 border-b border-transparent shrink-0">
        <button
          onClick={() => onRoleChange('comite_medico')}
          className={`pb-2 text-xs font-semibold transition-all cursor-pointer ${
            activeRole === 'comite_medico'
              ? 'text-[#00aae1] border-b-2 border-[#00aae1]'
              : 'text-[#035476] hover:text-[#033d59]'
          }`}
          title="Permisos completos para modificar Riesgo, Estado y Actas"
        >
          Comité Médico
        </button>

        <button
          onClick={() => onRoleChange('coordinadora_siau')}
          className={`pb-2 text-xs font-semibold transition-all cursor-pointer ${
            activeRole === 'coordinadora_siau'
              ? 'text-[#00aae1] border-b-2 border-[#00aae1]'
              : 'text-[#035476] hover:text-[#033d59]'
          }`}
          title="Vista enfocada en gestión operativa y seguimiento SIAU"
        >
          Coordinadora SIAU
        </button>
      </div>

      {/* Right Side: Metrics Bar & Quick Filters arranged strictly in 2 lines */}
      <div className="flex flex-col items-end gap-2 text-xs shrink-0">
        {/* Line 1: Counters (Total, Activos, Vencidos) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-[#035476] uppercase tracking-wider mr-0.5">
            Resumen:
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectMetricCard?.('total');
              onFastFilterChange?.('Todos');
            }}
            title="Ver todos los pacientes"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[#033d59] cursor-pointer transition-all ${
              activeMetricCard === 'total' && (fastFilter === 'Todos' || !fastFilter)
                ? 'bg-[#effaff] border-[#00aae1] ring-2 ring-[#00aae1]/30 font-bold shadow-xs'
                : 'bg-[#f9fafb] border-[#d0d5dd] hover:bg-gray-100'
            }`}
          >
            <span className="text-[#035476]">Total:</span>
            <span className="font-bold text-[#00aae1]">{totalPatients}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectMetricCard?.('activos');
              onFastFilterChange?.('Activos');
            }}
            title="Filtrar pacientes Activos"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[#01ae6c] cursor-pointer transition-all ${
              activeMetricCard === 'activos' || fastFilter === 'Activos'
                ? 'bg-[#d0fbe2] border-[#01ae6c] ring-2 ring-[#01ae6c]/30 font-bold shadow-xs'
                : 'bg-[#ebfef4] border-[#01ae6c]/30 hover:bg-[#d0fbe2]/60'
            }`}
          >
            <span>Activos:</span>
            <span className="font-bold">{activeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectMetricCard?.('vencidos');
              onFastFilterChange?.('Vencidos');
            }}
            title="Filtrar pacientes con atenciones Vencidas"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[#b45309] cursor-pointer transition-all ${
              activeMetricCard === 'vencidos' || fastFilter === 'Vencidos'
                ? 'bg-[#fef3c7] border-[#b45309] ring-2 ring-[#b45309]/30 font-bold shadow-xs'
                : 'bg-[#fffbeb] border-[#fbbf24]/40 hover:bg-[#fef3c7]/60'
            }`}
          >
            <span>Vencidos:</span>
            <span className="font-bold">{overdueCount}</span>
          </button>
        </div>

        {/* Line 2: Quick Filter Chips (Activos, Vencidos, Inconforme, Críticos, >90 días, Rehuso, Aceptados, Sin Acta) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className="text-[10px] font-bold text-[#035476] uppercase tracking-wider mr-0.5">
            Filtros Rápidos:
          </span>
          {FAST_FILTER_CHIPS.map((chip) => {
            const isActive =
              fastFilter === chip.id ||
              (chip.id === 'Rehúso' && (fastFilter === 'Rehúso' || fastFilter === 'Rehuso'));

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  if (isActive) {
                    onFastFilterChange?.('Todos');
                    onSelectMetricCard?.('total');
                  } else {
                    onFastFilterChange?.(chip.id);
                    if (chip.id === 'Activos') onSelectMetricCard?.('activos');
                    else if (chip.id === 'Vencidos') onSelectMetricCard?.('vencidos');
                  }
                }}
                className={`h-[26px] px-3 py-0.5 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-[#00aae1] text-white shadow-xs font-bold'
                    : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                }`}
              >
                {chip.dot && (
                  <span
                    className="w-2 h-2 rounded-full mr-1.5 shrink-0"
                    style={{ backgroundColor: chip.dot }}
                  />
                )}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
