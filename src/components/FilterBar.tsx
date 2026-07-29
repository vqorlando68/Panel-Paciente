import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FilterState, COHORTE_OPTIONS } from '../types';
import { Search, FilterX, ChevronDown, ChevronUp, Plus, Check, X, Layers } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  coordinatorsList: string[];
  conveniosList: string[];
  onResetFilters: () => void;
  alarmCount?: number;
  onAddCohorte?: (name: string, description: string) => void;
}

const SPECIFIC_CONVENIOS = [
  'EPS Suramericana Cuidate360',
  'CMP Caribe',
  'CMP Salud Mental Cali',
  'CMP Vive al 100 Caribe',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  coordinatorsList,
  conveniosList,
  onResetFilters,
  onAddCohorte,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConvenioMenuOpen, setIsConvenioMenuOpen] = useState(false);
  const [isNewCohorteModalOpen, setIsNewCohorteModalOpen] = useState(false);
  const [cohorteName, setCohorteName] = useState('');
  const [cohorteDesc, setCohorteDesc] = useState('');

  const convenioDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (convenioDropdownRef.current && !convenioDropdownRef.current.contains(event.target as Node)) {
        setIsConvenioMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const allConvenioOptions = useMemo(() => {
    const combined = Array.from(new Set([...SPECIFIC_CONVENIOS, ...(conveniosList || [])])).filter(Boolean);
    return combined.sort();
  }, [conveniosList]);

  const selectedConveniosArray = useMemo(() => {
    if (Array.isArray(filters.convenioNombre)) {
      return filters.convenioNombre;
    }
    if (!filters.convenioNombre || filters.convenioNombre === 'Todos') {
      return [];
    }
    return [filters.convenioNombre];
  }, [filters.convenioNombre]);

  const isAllConveniosSelected = selectedConveniosArray.length === 0;

  const toggleConvenioOption = (conv: string) => {
    let next: string[];
    if (selectedConveniosArray.includes(conv)) {
      next = selectedConveniosArray.filter((item) => item !== conv);
    } else {
      next = [...selectedConveniosArray, conv];
    }

    if (next.length === 0) {
      handleChange('convenioNombre', 'Todos');
    } else {
      handleChange('convenioNombre', next);
    }
  };

  const handleSelectAllConvenios = () => {
    handleChange('convenioNombre', 'Todos');
  };

  const activeFastFilter = filters.fastFilter || 'Todos';

  const hasActiveFilters =
    filters.estado !== 'Todos' ||
    filters.cohorte !== 'Todos' ||
    filters.seguimiento !== 'Todos' ||
    filters.coordinador !== 'Todos' ||
    (Array.isArray(filters.convenioNombre) ? filters.convenioNombre.length > 0 : filters.convenioNombre !== 'Todos') ||
    filters.identificacion !== '' ||
    filters.nombresApellidos !== '' ||
    filters.numeroCarga !== '' ||
    Boolean(filters.soloVencidas) ||
    Boolean(filters.soloAlarmas) ||
    activeFastFilter !== 'Todos';

  const convenioButtonLabel = useMemo(() => {
    if (isAllConveniosSelected) {
      return 'Todos los convenios';
    }
    if (selectedConveniosArray.length === 1) {
      return selectedConveniosArray[0];
    }
    return `${selectedConveniosArray.length} convenios sel.`;
  }, [isAllConveniosSelected, selectedConveniosArray]);

  const handleCreateCohorteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohorteName.trim()) return;
    if (onAddCohorte) {
      onAddCohorte(cohorteName.trim(), cohorteDesc.trim());
    }
    setCohorteName('');
    setCohorteDesc('');
    setIsNewCohorteModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] p-4 shrink-0 max-w-[1550px] w-full mx-auto font-sans rounded-xl shadow-2xs my-2 transition-colors duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#033d59] dark:text-[#f8fafc] uppercase tracking-wide">Filtros de Búsqueda</span>
          {hasActiveFilters && (
            <span className="bg-[#00aae1]/10 text-[#00aae1] dark:bg-[#00aae1]/20 dark:text-[#38bdf8] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Filtros activos
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Primary Button "+ Nueva COHORTE" */}
          <button
            type="button"
            onClick={() => setIsNewCohorteModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#00aae1] hover:bg-[#0196d4] text-white shadow-2xs cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva COHORTE</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onResetFilters();
              }}
              className="text-xs text-[#00aae1] dark:text-[#38bdf8] hover:text-[#0196d4] font-bold flex items-center gap-1.5 bg-[#effaff] dark:bg-[#00aae1]/10 hover:bg-[#dbeafe] dark:hover:bg-[#00aae1]/20 px-2.5 py-1 rounded-lg border border-[#00aae1]/30 transition-colors cursor-pointer shadow-2xs"
              title="Limpiar todos los filtros"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}

          {/* Toggle - / + Filtros */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs font-semibold text-[#035476] dark:text-[#94a3b8] hover:text-[#00aae1] dark:hover:text-[#38bdf8] flex items-center gap-1 bg-[#f9fafb] dark:bg-[#0f172a] hover:bg-[#effaff] dark:hover:bg-[#334155] border border-[#e2e8eb] dark:border-[#334155] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <span>{isCollapsed ? '+ Filtros' : '- Filtros'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter Fields */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 items-end pt-1 animate-in fade-in duration-150">
          
          {/* Dropdown: Estado Cohorte */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
              Estado Cohorte
            </label>
            <select
              value={filters.cohorte}
              onChange={(e) => handleChange('cohorte', e.target.value)}
              className="w-full h-8 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-1 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer truncate"
            >
              <option value="Todos">Todas las cohortes</option>
              {COHORTE_OPTIONS.map((coh) => (
                <option key={coh.code} value={coh.code} title={coh.label}>
                  {coh.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown: Seguimiento */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
              Seguimiento
            </label>
            <select
              value={filters.seguimiento}
              onChange={(e) => handleChange('seguimiento', e.target.value)}
              className="w-full h-8 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-1 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Vencidos">Con Vencidos</option>
              <option value="Al Día">Al Día</option>
            </select>
          </div>

          {/* Dropdown: Coordinador */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
              Coordinador
            </label>
            <select
              value={filters.coordinador}
              onChange={(e) => handleChange('coordinador', e.target.value)}
              className="w-full h-8 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-1 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer truncate"
            >
              <option value="Todos">Todos</option>
              {coordinatorsList.map((coord) => (
                <option key={coord} value={coord}>
                  {coord}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Select Dropdown: Convenio */}
          <div className="relative" ref={convenioDropdownRef}>
            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
              Convenio
            </label>
            <button
              type="button"
              onClick={() => setIsConvenioMenuOpen(!isConvenioMenuOpen)}
              className="w-full h-8 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-1 text-[#033d59] dark:text-[#f8fafc] flex items-center justify-between font-medium cursor-pointer"
            >
              <span className="truncate">{convenioButtonLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
            </button>

            {isConvenioMenuOpen && (
              <div className="absolute z-30 mt-1 w-64 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-lg shadow-xl p-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllConvenios}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#effaff] dark:hover:bg-[#0f172a] flex items-center justify-between text-[#033d59] dark:text-[#f8fafc] font-semibold"
                >
                  <span>Todos los convenios</span>
                  {isAllConveniosSelected && <Check className="w-3.5 h-3.5 text-[#00aae1]" />}
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {allConvenioOptions.map((conv) => {
                    const isSelected = selectedConveniosArray.includes(conv);
                    return (
                      <button
                        key={conv}
                        type="button"
                        onClick={() => toggleConvenioOption(conv)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-[#0f172a] flex items-center justify-between text-[#035476] dark:text-[#94a3b8]"
                      >
                        <span className="truncate">{conv}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00aae1]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Input: Identificación */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
              Identificación
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Número..."
                value={filters.identificacion}
                onChange={(e) => handleChange('identificacion', e.target.value)}
                className="w-full h-8 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-1 pr-7 text-[#033d59] dark:text-[#f8fafc] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#00aae1] font-medium"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5" />
            </div>
          </div>

          {/* Input: Nombres y Apellidos */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
              Nombres / Apellidos
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar nombre..."
                value={filters.nombresApellidos}
                onChange={(e) => handleChange('nombresApellidos', e.target.value)}
                className="w-full h-8 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-1 pr-7 text-[#033d59] dark:text-[#f8fafc] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#00aae1] font-medium"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5" />
            </div>
          </div>

          {/* Input: Número de Carga */}
          <div>
            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
              N° Carga
            </label>
            <input
              type="text"
              placeholder="Carga..."
              value={filters.numeroCarga}
              onChange={(e) => handleChange('numeroCarga', e.target.value)}
              className="w-full h-8 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-1 text-[#033d59] dark:text-[#f8fafc] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#00aae1] font-medium"
            />
          </div>

        </div>
      )}

      {/* Modal: Nueva COHORTE */}
      {isNewCohorteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] text-[#033d59] dark:text-[#f8fafc] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-[#e2e8eb] dark:border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">Crear Nueva COHORTE</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCohorteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCohorteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
                  Código / Nombre de la Cohorte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: DIABETES TIPO 2"
                  value={cohorteName}
                  onChange={(e) => setCohorteName(e.target.value)}
                  className="w-full h-9 text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-lg px-3 py-1.5 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Descripción del grupo o programa..."
                  value={cohorteDesc}
                  onChange={(e) => setCohorteDesc(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-lg px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8eb] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsNewCohorteModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f172a]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#00aae1] hover:bg-[#0196d4] text-white shadow-xs"
                >
                  Guardar Cohorte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
