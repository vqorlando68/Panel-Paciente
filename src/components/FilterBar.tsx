import React from 'react';
import { FilterState } from '../types';
import { Search, FilterX } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  coordinatorsList: string[];
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  coordinatorsList,
  onResetFilters,
}) => {
  const handleChange = (field: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters =
    filters.estado !== 'Todos' ||
    filters.seguimiento !== 'Todos' ||
    filters.coordinador !== 'Todos' ||
    filters.identificacion !== '' ||
    filters.nombresApellidos !== '' ||
    filters.numeroCarga !== '' ||
    filters.soloVencidas;

  return (
    <div className="bg-white border-b border-[#e2e8eb] px-6 py-4 shrink-0 space-y-3 max-w-[1550px] w-full mx-auto font-sans rounded-xl shadow-xs border my-3">
      {/* Top Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
        {/* Dropdown: Estado */}
        <div>
          <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wider">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="w-full h-9 text-xs bg-white border border-[#e2e8eb] rounded-md px-2.5 text-[#033d59] focus:outline-none focus:border-[#00aae1] focus:ring-2 focus:ring-[#00aae1]/20 font-medium cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Aceptado">Aceptado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>

        {/* Dropdown: Seguimiento */}
        <div>
          <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wider">
            Seguimiento
          </label>
          <select
            value={filters.seguimiento}
            onChange={(e) => handleChange('seguimiento', e.target.value)}
            className="w-full h-9 text-xs bg-white border border-[#e2e8eb] rounded-md px-2.5 text-[#033d59] focus:outline-none focus:border-[#00aae1] focus:ring-2 focus:ring-[#00aae1]/20 font-medium cursor-pointer"
          >
            <option value="Todos">Todos los seguimientos</option>
            <option value="Vencidos">Con Atenciones Vencidas</option>
            <option value="Al Día">Al Día</option>
          </select>
        </div>

        {/* Dropdown: Coordinador */}
        <div>
          <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wider">
            Coordinador
          </label>
          <select
            value={filters.coordinador}
            onChange={(e) => handleChange('coordinador', e.target.value)}
            className="w-full h-9 text-xs bg-white border border-[#e2e8eb] rounded-md px-2.5 text-[#033d59] focus:outline-none focus:border-[#00aae1] focus:ring-2 focus:ring-[#00aae1]/20 font-medium cursor-pointer"
          >
            <option value="Todos">Todos los coordinadores</option>
            {coordinatorsList.map((coord) => (
              <option key={coord} value={coord}>
                {coord}
              </option>
            ))}
          </select>
        </div>

        {/* Text Input: Identificación */}
        <div>
          <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wider">
            Identificación
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: CC 1.020..."
              value={filters.identificacion}
              onChange={(e) => handleChange('identificacion', e.target.value)}
              className="w-full h-9 text-xs bg-white border border-[#e2e8eb] rounded-md pl-8 pr-2.5 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1] focus:ring-2 focus:ring-[#00aae1]/20"
            />
            <Search className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Text Input: Nombres y Apellidos */}
        <div>
          <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wider">
            Nombres y Apellidos
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filters.nombresApellidos}
              onChange={(e) => handleChange('nombresApellidos', e.target.value)}
              className="w-full h-9 text-xs bg-white border border-[#e2e8eb] rounded-md pl-8 pr-2.5 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1] focus:ring-2 focus:ring-[#00aae1]/20"
            />
            <Search className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Text Input: Número de Carga */}
        <div>
          <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wider">
            Número de Carga
          </label>
          <input
            type="text"
            placeholder="Ej: CARGA-104"
            value={filters.numeroCarga}
            onChange={(e) => handleChange('numeroCarga', e.target.value)}
            className="w-full h-9 text-xs bg-white border border-[#e2e8eb] rounded-md px-2.5 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1] focus:ring-2 focus:ring-[#00aae1]/20"
          />
        </div>

        {/* Checkbox / Toggle Button: Solo Vencidas */}
        <div className="flex items-center h-9 justify-start">
          <label className="flex items-center gap-2 text-xs font-bold text-[#b45309] bg-[#fffbeb] px-3 py-2 rounded-md border border-[#fbbf24]/50 cursor-pointer select-none hover:bg-[#fef3c7] transition-colors w-full justify-center">
            <input
              type="checkbox"
              checked={filters.soloVencidas}
              onChange={(e) => handleChange('soloVencidas', e.target.checked)}
              className="w-4 h-4 accent-[#b45309] rounded cursor-pointer border-[#e2e8eb]"
            />
            <span>Solo Vencidas</span>
          </label>
        </div>
      </div>

      {/* Action Strip: Reset Filters button if active */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-[#e2e8eb]">
          <button
            onClick={onResetFilters}
            className="text-xs text-[#00aae1] hover:text-[#0196d4] font-medium flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-[#effaff] transition-colors cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
