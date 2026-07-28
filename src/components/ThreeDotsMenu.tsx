import React, { useEffect, useRef } from 'react';
import { Patient, UserRole } from '../types';
import {
  MoreVertical,
  FileText,
  Activity,
  Plus,
  Lock,
  BarChart3,
  Users,
  Calendar,
} from 'lucide-react';

interface ThreeDotsMenuProps {
  patient: Patient;
  activeRole: UserRole;
  isOpen: boolean;
  onToggle: () => void;
  onOpenActas: (patient: Patient) => void;
  onOpenEvolucion: (patient: Patient) => void;
  onOpenNuevaActa: (patient: Patient) => void;
  onOpenCostos: (patient: Patient) => void;
  onOpenCuadroMedico: (patient: Patient) => void;
  onOpenAgenda: (patient: Patient) => void;
}

export const ThreeDotsMenu: React.FC<ThreeDotsMenuProps> = ({
  patient,
  activeRole,
  isOpen,
  onToggle,
  onOpenActas,
  onOpenEvolucion,
  onOpenNuevaActa,
  onOpenCostos,
  onOpenCuadroMedico,
  onOpenAgenda,
}) => {
  const isComite = activeRole === 'comite_medico';
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-[#035476] hover:text-[#00aae1] transition-colors cursor-pointer"
        title="Menú de Acciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Options (Shifted to the right left-7 so the 3 dots remain visible, elevated -top-7) */}
      {isOpen && (
        <div className="absolute -top-7 left-7 z-50 bg-white rounded-xl shadow-2xl border border-[#e2e8eb] p-1 w-52 text-xs font-semibold space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* 1. Ver Actas */}
          <button
            type="button"
            onClick={() => {
              onOpenActas(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <FileText className="w-3.5 h-3.5 text-[#00aae1]" />
            <span>Ver Actas</span>
          </button>

          {/* 2. Evolución */}
          <button
            type="button"
            onClick={() => {
              onOpenEvolucion(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <Activity className="w-3.5 h-3.5 text-[#00aae1]" />
            <span>Evolución</span>
          </button>

          {/* 3. + Nueva Acta */}
          <button
            type="button"
            disabled={!isComite}
            onClick={() => {
              if (isComite) {
                onOpenNuevaActa(patient);
                onToggle();
              }
            }}
            title={!isComite ? 'Acceso inhabilitado para Coordinadora SIAU' : 'Registrar Nueva Acta'}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              isComite
                ? 'text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] cursor-pointer'
                : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-[#00aae1]" />
              <span>+ Nueva Acta</span>
            </span>
            {!isComite && (
              <Lock className="w-3 h-3 text-gray-400" />
            )}
          </button>

          {/* 4. Costos */}
          <button
            type="button"
            onClick={() => {
              onOpenCostos(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#00aae1]" />
            <span>Costos</span>
          </button>

          {/* 5. Cuadro Médico Asignado */}
          <button
            type="button"
            onClick={() => {
              onOpenCuadroMedico(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <Users className="w-3.5 h-3.5 text-[#00aae1]" />
            <span>Cuadro Médico Asignado</span>
          </button>

          {/* 6. Agenda */}
          <button
            type="button"
            onClick={() => {
              onOpenAgenda(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
            <span>Agenda</span>
          </button>
        </div>
      )}
    </div>
  );
};
