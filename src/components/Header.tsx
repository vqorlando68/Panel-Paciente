import React from 'react';
import { UserRole } from '../types';
import { Activity, Sun, Moon, Database } from 'lucide-react';

interface HeaderProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  totalPatients: number;
  overdueCount: number;
  activeCount: number;
  inconformeCount?: number;
  criticalCount?: number;
  onSelectMetricCard?: (metric: 'total' | 'activos' | 'vencidos') => void;
  activeMetricCard?: 'total' | 'activos' | 'vencidos';
  fastFilter?: string;
  onFastFilterChange?: (filter: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenOracleDoc?: () => void;
}

const FAST_FILTER_CHIPS = [
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
  inconformeCount = 0,
  onSelectMetricCard,
  activeMetricCard = 'total',
  fastFilter = 'Todos',
  onFastFilterChange,
  theme = 'light',
  onToggleTheme,
  onOpenOracleDoc,
}) => {
  return (
    <header className="bg-white dark:bg-[#1e293b] border-b border-[#e2e8eb] dark:border-[#334155] px-6 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 shrink-0 max-w-[1550px] w-full mx-auto font-sans rounded-b-xl shadow-2xs transition-colors duration-200">
      {/* Title & Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/10 border border-[#00aae1]/20 flex items-center justify-center text-[#00aae1] dark:text-[#38bdf8]">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#033d59] dark:text-[#f8fafc] tracking-tight">Panel de Listado de Pacientes</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-medium border border-[#00aae1]/20">
              SIAU v2.0
            </span>
          </div>
          <p className="text-xs text-[#035476] dark:text-[#94a3b8]">
            Seguimiento clínico multidisciplinario e indicadores de vencimiento
          </p>
        </div>
      </div>

      {/* Center Actions: Role Switcher & DB Doc Button */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Role Switcher Tabs */}
        <div className="flex items-center gap-4 border-b border-transparent">
          <button
            onClick={() => onRoleChange('comite_medico')}
            className={`pb-1 text-xs font-semibold transition-all cursor-pointer ${
              activeRole === 'comite_medico'
                ? 'text-[#00aae1] dark:text-[#38bdf8] border-b-2 border-[#00aae1] dark:border-[#38bdf8]'
                : 'text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
            }`}
            title="Permisos completos para modificar Riesgo, Estado y Actas"
          >
            Comité Médico
          </button>

          <button
            onClick={() => onRoleChange('coordinadora_siau')}
            className={`pb-1 text-xs font-semibold transition-all cursor-pointer ${
              activeRole === 'coordinadora_siau'
                ? 'text-[#00aae1] dark:text-[#38bdf8] border-b-2 border-[#00aae1] dark:border-[#38bdf8]'
                : 'text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
            }`}
            title="Vista enfocada en gestión operativa y seguimiento SIAU"
          >
            Coordinadora SIAU
          </button>
        </div>

        {/* Oracle DB Integration Doc Button */}
        {onOpenOracleDoc && (
          <button
            type="button"
            onClick={onOpenOracleDoc}
            title="Ver documentación del paquete Oracle PL/SQL (Atajo: Ctrl + Alt + D)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] border border-[#00aae1]/30 hover:bg-[#00aae1] hover:text-white dark:hover:bg-[#00aae1] dark:hover:text-white transition-all cursor-pointer text-xs font-semibold shadow-2xs"
          >
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Oracle DB Doc</span>
            <span className="text-[10px] opacity-80 font-mono px-1 rounded bg-black/10 dark:bg-white/10">Ctrl+Alt+D</span>
          </button>
        )}

        {/* Theme Switcher Toggle (Sun / Moon) */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="w-9 h-9 rounded-lg border border-[#e2e8eb] dark:border-[#334155] bg-gray-50 dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#334155] transition-all cursor-pointer shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-200" />
            )}
          </button>
        )}
      </div>

      {/* Right Side: Organized Horizontal Lines */}
      <div className="flex flex-col items-end gap-2 text-xs shrink-0">
        {/* Line 1: Counters (Total, Activos, Vencidos, Inconforme) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onSelectMetricCard?.('total');
              onFastFilterChange?.('Todos');
            }}
            title="Ver todos los pacientes"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[#033d59] dark:text-[#f8fafc] cursor-pointer transition-all ${
              activeMetricCard === 'total' && (fastFilter === 'Todos' || !fastFilter)
                ? 'bg-[#effaff] dark:bg-[#00aae1]/20 border-[#00aae1] dark:border-[#38bdf8] ring-2 ring-[#00aae1]/30 font-bold shadow-xs'
                : 'bg-[#f9fafb] dark:bg-[#0f172a] border-[#d0d5dd] dark:border-[#334155] hover:bg-gray-100 dark:hover:bg-[#1e293b]'
            }`}
          >
            <span className="text-[#035476] dark:text-[#94a3b8]">Total:</span>
            <span className="font-bold text-[#00aae1] dark:text-[#38bdf8]">{totalPatients}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectMetricCard?.('activos');
              onFastFilterChange?.('Activos');
            }}
            title="Filtrar pacientes Activos"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[#01ae6c] dark:text-[#34d399] cursor-pointer transition-all ${
              activeMetricCard === 'activos' || fastFilter === 'Activos'
                ? 'bg-[#d0fbe2] dark:bg-[#059669]/30 border-[#01ae6c] dark:border-[#34d399] ring-2 ring-[#01ae6c]/30 font-bold shadow-xs'
                : 'bg-[#ebfef4] dark:bg-[#064e3b]/30 border-[#01ae6c]/30 dark:border-[#059669]/40 hover:bg-[#d0fbe2]/60'
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[#b45309] dark:text-[#fbbf24] cursor-pointer transition-all ${
              activeMetricCard === 'vencidos' || fastFilter === 'Vencidos'
                ? 'bg-[#fef3c7] dark:bg-[#b45309]/30 border-[#b45309] dark:border-[#fbbf24] ring-2 ring-[#b45309]/30 font-bold shadow-xs'
                : 'bg-[#fffbeb] dark:bg-[#451a03]/30 border-[#fbbf24]/40 dark:border-[#b45309]/40 hover:bg-[#fef3c7]/60'
            }`}
          >
            <span>Vencidos:</span>
            <span className="font-bold">{overdueCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (fastFilter === 'Inconforme') {
                onFastFilterChange?.('Todos');
                onSelectMetricCard?.('total');
              } else {
                onFastFilterChange?.('Inconforme');
              }
            }}
            title="Filtrar pacientes Inconformes"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[#e11d48] dark:text-[#fb7185] cursor-pointer transition-all ${
              fastFilter === 'Inconforme'
                ? 'bg-[#ffe4e6] dark:bg-[#be123c]/30 border-[#e11d48] dark:border-[#fb7185] ring-2 ring-[#e11d48]/30 font-bold shadow-xs'
                : 'bg-[#fff1f2] dark:bg-[#4c0519]/30 border-[#fecdd3] dark:border-[#be123c]/40 hover:bg-[#ffe4e6]/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#e11d48] dark:bg-[#fb7185] shrink-0" />
            <span>Inconforme:</span>
            <span className="font-bold">{inconformeCount}</span>
          </button>
        </div>

        {/* Line 2: Chips (Críticos, >90 días, Rehuso, Aceptados, Sin Acta) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
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
                  }
                }}
                className={`h-[26px] px-3 py-0.5 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-[#00aae1] text-white shadow-xs font-bold'
                    : 'bg-[#f3f4f6] dark:bg-[#0f172a] text-[#4b5563] dark:text-[#94a3b8] hover:bg-[#e5e7eb] dark:hover:bg-[#334155] border border-transparent dark:border-[#334155]'
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
