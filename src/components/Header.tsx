import React from 'react';
import { UserRole } from '../types';
import { AuthUser } from '../types/auth';
import { Activity, Sun, Moon, Database, Bot, User, LogOut } from 'lucide-react';

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
  onOpenChat?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
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
  onOpenChat,
  user,
  onLogout,
}) => {
  return (
    <header className="bg-white dark:bg-[#1e293b] border-b border-[#e2e8eb] dark:border-[#334155] px-6 py-2.5 flex flex-col gap-2.5 shrink-0 max-w-[1550px] w-full mx-auto font-sans rounded-b-xl shadow-2xs transition-colors duration-200">
      {/* ===================== FILA 1: IDENTIDAD, ROL Y ACCIONES/PERFIL ===================== */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Izquierda: Marca, Título y Selector de Rol */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/10 border border-[#00aae1]/20 flex items-center justify-center text-[#00aae1] dark:text-[#38bdf8] shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#033d59] dark:text-[#f8fafc] tracking-tight">
                  Panel de Listado de Pacientes
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-medium border border-[#00aae1]/20">
                  SIAU v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#035476] dark:text-[#94a3b8]">
                Seguimiento clínico multidisciplinario e indicadores de vencimiento
              </p>
            </div>
          </div>

          {/* Selector de Rol Segmentado */}
          <div className="flex items-center bg-[#f1f5f9] dark:bg-[#0f172a] p-0.5 rounded-lg border border-[#e2e8eb] dark:border-[#334155]">
            <button
              onClick={() => onRoleChange('comite_medico')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeRole === 'comite_medico'
                  ? 'bg-white dark:bg-[#1e293b] text-[#00aae1] dark:text-[#38bdf8] shadow-xs'
                  : 'text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
              }`}
              title="Permisos completos para modificar Riesgo, Estado y Actas"
            >
              Comité Médico
            </button>

            <button
              onClick={() => onRoleChange('coordinadora_siau')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeRole === 'coordinadora_siau'
                  ? 'bg-white dark:bg-[#1e293b] text-[#00aae1] dark:text-[#38bdf8] shadow-xs'
                  : 'text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white'
              }`}
              title="Vista enfocada en gestión operativa y seguimiento SIAU"
            >
              Coordinadora SIAU
            </button>
          </div>

          {/* Oracle DB Integration Doc Button (Ctrl + Alt + D) */}
          {onOpenOracleDoc && (
            <button
              type="button"
              onClick={onOpenOracleDoc}
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            >
              Oracle DB Doc
            </button>
          )}
        </div>

        {/* Derecha: Chat IA, Tema, Usuario y Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Botón Asistente IA Chat */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              title="Abrir Asistente IA - Chat de Paciente"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#008cb9] to-[#00aae1] hover:from-[#007b9e] hover:to-[#009acb] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer border border-[#00aae1]/30"
            >
              <Bot className="w-4 h-4 text-white" />
              <span>Chat IA</span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="w-8 h-8 rounded-lg border border-[#e2e8eb] dark:border-[#334155] bg-gray-50 dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#334155] transition-all cursor-pointer shadow-2xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}

          {/* Usuario Autenticado & Logout */}
          {user && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-[#334155]">
              <div className="w-8 h-8 rounded-full bg-[#00aae1]/15 dark:bg-[#00aae1]/30 border border-[#00aae1]/30 flex items-center justify-center text-[#00aae1] dark:text-[#38bdf8] font-bold text-xs shrink-0">
                {user.nombres ? user.nombres.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] leading-tight whitespace-nowrap">
                  {user.nombres} {user.apellidos}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {user.identificacion}
                </span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Cerrar Sesión TeKer"
                  className="w-8 h-8 ml-1 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================== FILA 2: CONTADORES Y FILTROS RÁPIDOS ===================== */}
      <div className="flex items-center justify-between gap-4 w-full pt-2 border-t border-[#e2e8eb]/70 dark:border-[#334155]/70 text-xs">
        {/* Lado Izquierdo: Contadores de Pacientes */}
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
              if (activeMetricCard === 'activos' || fastFilter === 'Activos') {
                onSelectMetricCard?.('total');
                onFastFilterChange?.('Todos');
              } else {
                onSelectMetricCard?.('activos');
                onFastFilterChange?.('Activos');
              }
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
              if (activeMetricCard === 'vencidos' || fastFilter === 'Vencidos') {
                onSelectMetricCard?.('total');
                onFastFilterChange?.('Todos');
              } else {
                onSelectMetricCard?.('vencidos');
                onFastFilterChange?.('Vencidos');
              }
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
                onSelectMetricCard?.('total');
                onFastFilterChange?.('Todos');
              } else {
                onSelectMetricCard?.('total');
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

        {/* Lado Derecho: Chips de filtro rápido */}
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
