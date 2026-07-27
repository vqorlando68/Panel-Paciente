import React, { useState } from 'react';
import { FilterState, COHORTE_OPTIONS } from '../types';
import { Search, FilterX, ChevronDown, ChevronUp, Bell } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  coordinatorsList: string[];
  conveniosList: string[];
  onResetFilters: () => void;
  alarmCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  coordinatorsList,
  conveniosList,
  onResetFilters,
  alarmCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (field: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters =
    filters.cohorte !== 'Todos' ||
    filters.seguimiento !== 'Todos' ||
    filters.coordinador !== 'Todos' ||
    filters.convenioNombre !== 'Todos' ||
    filters.identificacion !== '' ||
    filters.nombresApellidos !== '' ||
    filters.numeroCarga !== '' ||
    filters.soloVencidas ||
    Boolean(filters.soloAlarmas);

  return (
    <div className="bg-white border border-[#e2e8eb] p-4 shrink-0 max-w-[1550px] w-full mx-auto font-sans rounded-xl shadow-2xs my-2 transition-all">
      {/* Header bar with bell toggle and collapse button on same alignment */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#033d59] uppercase tracking-wide">Filtros de Búsqueda</span>
          {hasActiveFilters && (
            <span className="bg-[#00aae1]/10 text-[#00aae1] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Filtros activos
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Campana de Alarmas Button */}
          <button
            type="button"
            onClick={() => handleChange('soloAlarmas', !filters.soloAlarmas)}
            title={filters.soloAlarmas ? "Mostrando solo pacientes con alarmas" : "Filtrar por pacientes con alarmas de seguimiento"}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              filters.soloAlarmas 
                ? 'bg-[#fffbeb] text-[#b45309] border-[#fbbf24] shadow-2xs font-bold ring-2 ring-[#fbbf24]/30' 
                : 'bg-[#f9fafb] text-[#035476] border-[#e2e8eb] hover:bg-[#fffbeb] hover:text-[#b45309]'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 ${filters.soloAlarmas ? 'text-[#b45309] fill-[#b45309]' : 'text-[#035476]'}`} />
            <span>Alarmas</span>
            {alarmCount !== undefined && alarmCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                filters.soloAlarmas ? 'bg-[#b45309] text-white' : 'bg-[#fffbeb] text-[#b45309] border border-[#fbbf24]'
              }`}>
                {alarmCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-[#e11d48] hover:text-[#be123c] font-semibold flex items-center gap-1 hover:underline cursor-pointer transition-colors px-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>✕ Limpiar</span>
            </button>
          )}

          {/* Toggle - / + Filtros */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs font-semibold text-[#035476] hover:text-[#00aae1] flex items-center gap-1 bg-[#f9fafb] hover:bg-[#effaff] border border-[#e2e8eb] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <span>{isCollapsed ? '+ Filtros' : '- Filtros'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter Fields (Single horizontal row of fields) */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 items-end pt-1 animate-in fade-in duration-150">
          
          {/* Dropdown: Estado Cohorte */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Estado Cohorte
            </label>
            <select
              value={filters.cohorte}
              onChange={(e) => handleChange('cohorte', e.target.value)}
              className="w-full h-8 text-[11px] bg-white border border-[#e2e8eb] rounded-md px-2 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer truncate"
            >
              <option value="Todos">Todas las cohortes</option>
              {COHORTE_OPTIONS.map((coh) => (
                <option key={coh.code} value={coh.code} title={coh.label}>
                  {coh.code} - {coh.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown: Seguimiento */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Seguimiento
            </label>
            <select
              value={filters.seguimiento}
              onChange={(e) => handleChange('seguimiento', e.target.value)}
              className="w-full h-8 text-[11px] bg-white border border-[#e2e8eb] rounded-md px-2 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Vencidos">Con Vencidos</option>
              <option value="Al Día">Al Día</option>
            </select>
          </div>

          {/* Dropdown: Coordinador */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Coordinador
            </label>
            <select
              value={filters.coordinador}
              onChange={(e) => handleChange('coordinador', e.target.value)}
              className="w-full h-8 text-[11px] bg-white border border-[#e2e8eb] rounded-md px-2 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer truncate"
            >
              <option value="Todos">Todos</option>
              {coordinatorsList.map((coord) => (
                <option key={coord} value={coord}>
                  {coord}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown: Nombre Convenio */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Convenio
            </label>
            <select
              value={filters.convenioNombre}
              onChange={(e) => handleChange('convenioNombre', e.target.value)}
              className="w-full h-8 text-[11px] bg-white border border-[#e2e8eb] rounded-md px-2 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer truncate"
            >
              <option value="Todos">Todos</option>
              {conveniosList.map((conv) => (
                <option key={conv} value={conv}>
                  {conv}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input: Identificación */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Identificación
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej: 10482..."
                value={filters.identificacion}
                onChange={(e) => handleChange('identificacion', e.target.value)}
                className="w-full h-8 text-[11px] bg-white border border-[#e2e8eb] rounded-md pl-6 pr-1.5 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1]"
              />
              <Search className="w-3 h-3 text-[#035476] absolute left-1.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Text Input: Nombres y Apellidos */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Nombres / Apellidos
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.nombresApellidos}
                onChange={(e) => handleChange('nombresApellidos', e.target.value)}
                className="w-full h-8 text-[11px] bg-white border border-[#e2e8eb] rounded-md pl-6 pr-1.5 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1]"
              />
              <Search className="w-3 h-3 text-[#035476] absolute left-1.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Text Input: Número de Carga */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              N° Carga
            </label>
            <input
              type="text"
              placeholder="CARGA-..."
              value={filters.numeroCarga}
              onChange={(e) => handleChange('numeroCarga', e.target.value)}
              className="w-full h-8 text-[11px] bg-white border border-[#e2e8eb] rounded-md px-2 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1]"
            />
          </div>

        </div>
      )}
    </div>
  );
};
