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

const FAST_FILTER_CHIPS = [
  'Todos',
  'Activos',
  'Vencidos',
  'Inconforme',
  'Críticos',
  '>90 días',
  'Rehúso',
  'Aceptados',
  'Sin Acta',
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
    filters.cohorte !== 'Todos' ||
    filters.seguimiento !== 'Todos' ||
    filters.coordinador !== 'Todos' ||
    (Array.isArray(filters.convenioNombre) ? filters.convenioNombre.length > 0 : filters.convenioNombre !== 'Todos') ||
    filters.identificacion !== '' ||
    filters.nombresApellidos !== '' ||
    filters.numeroCarga !== '' ||
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
    <div className="bg-white border border-[#e2e8eb] p-4 shrink-0 max-w-[1550px] w-full mx-auto font-sans rounded-xl shadow-2xs my-2 transition-all">
      {/* Header bar */}
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
              onClick={() => {
                onResetFilters();
                handleChange('fastFilter', 'Todos');
              }}
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

      {/* Filter Fields (Single horizontal row of fields - all controls h-8 (32px), px-3 py-1) */}
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
              className="w-full h-8 text-xs bg-white border border-[#e2e8eb] rounded-md px-3 py-1 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer truncate"
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
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Seguimiento
            </label>
            <select
              value={filters.seguimiento}
              onChange={(e) => handleChange('seguimiento', e.target.value)}
              className="w-full h-8 text-xs bg-white border border-[#e2e8eb] rounded-md px-3 py-1 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer"
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
              className="w-full h-8 text-xs bg-white border border-[#e2e8eb] rounded-md px-3 py-1 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer truncate"
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
            <label className="block text-[10px] font-bold text-[#035476] mb-1 uppercase tracking-wider">
              Convenio
            </label>
            <button
              type="button"
              onClick={() => setIsConvenioMenuOpen(!isConvenioMenuOpen)}
              className={`w-full h-8 text-xs bg-white border border-[#e2e8eb] rounded-md px-3 py-1 text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium cursor-pointer flex items-center justify-between transition-colors ${
                !isAllConveniosSelected ? 'border-[#00aae1] bg-[#effaff]/40 font-bold text-[#00aae1]' : ''
              }`}
              title={selectedConveniosArray.join(', ') || 'Todos los convenios'}
            >
              <span className="truncate pr-1 text-left">{convenioButtonLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#035476] shrink-0" />
            </button>

            {isConvenioMenuOpen && (
              <div className="absolute top-full left-0 mt-1 z-40 bg-white border border-[#e2e8eb] rounded-lg shadow-xl w-64 p-2 text-xs space-y-1">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e8eb] px-1">
                  <span className="font-bold text-[#035476] text-[10px] uppercase">Seleccionar Convenios</span>
                  {selectedConveniosArray.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllConvenios}
                      className="text-[10px] text-[#00aae1] font-bold hover:underline cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Option: Todos */}
                <button
                  type="button"
                  onClick={handleSelectAllConvenios}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between cursor-pointer text-xs ${
                    isAllConveniosSelected ? 'bg-[#effaff] font-bold text-[#00aae1]' : 'hover:bg-gray-50 text-[#033d59]'
                  }`}
                >
                  <span>Todos los convenios</span>
                  {isAllConveniosSelected && <Check className="w-3.5 h-3.5 text-[#00aae1]" />}
                </button>

                <div className="max-h-48 overflow-y-auto space-y-0.5 pt-1 border-t border-[#e2e8eb]">
                  {allConvenioOptions.map((conv) => {
                    const selected = selectedConveniosArray.includes(conv);
                    return (
                      <label
                        key={conv}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs ${
                          selected ? 'bg-[#effaff] font-bold text-[#00aae1]' : 'hover:bg-gray-50 text-[#033d59]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleConvenioOption(conv)}
                          className="rounded border-gray-300 text-[#00aae1] focus:ring-[#00aae1] cursor-pointer"
                        />
                        <span className="truncate">{conv}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
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
                className="w-full h-8 text-xs bg-white border border-[#e2e8eb] rounded-md pl-8 pr-3 py-1 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1]"
              />
              <Search className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
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
                className="w-full h-8 text-xs bg-white border border-[#e2e8eb] rounded-md pl-8 pr-3 py-1 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1]"
              />
              <Search className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
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
              className="w-full h-8 text-xs bg-white border border-[#e2e8eb] rounded-md px-3 py-1 text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1]"
            />
          </div>

        </div>
      )}

      {/* Modal: Nueva COHORTE */}
      {isNewCohorteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-[#e2e8eb] overflow-hidden">
            <div className="p-4 bg-[#effaff] border-b border-[#e2e8eb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00aae1] text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#033d59]">Crear Nueva Cohorte</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCohorteModalOpen(false)}
                className="p-1 text-[#035476] hover:text-[#033d59] rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCohorteSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#033d59] mb-1">
                  Nombre de la Cohorte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: RIESGO VASCULAR AVANZADO"
                  value={cohorteName}
                  onChange={(e) => setCohorteName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e2e8eb] rounded-lg text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#033d59] mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Descripción del grupo o criterios de inclusión de la cohorte..."
                  value={cohorteDesc}
                  onChange={(e) => setCohorteDesc(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#e2e8eb] rounded-lg text-[#033d59] focus:outline-none focus:border-[#00aae1] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8eb]">
                <button
                  type="button"
                  onClick={() => setIsNewCohorteModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#035476] bg-[#f9fafb] hover:bg-[#e2e8eb] border border-[#e2e8eb] rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!cohorteName.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#00aae1] hover:bg-[#0196d4] disabled:bg-gray-300 rounded-lg shadow-2xs cursor-pointer transition-colors"
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
