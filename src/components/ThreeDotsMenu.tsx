import React from 'react';
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
  Clock,
} from 'lucide-react';
import { AdherenceTooltip } from './AdherenceTooltip';

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
  isAdherenciaOpen: boolean;
  onToggleAdherencia: () => void;
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
  isAdherenciaOpen,
  onToggleAdherencia,
}) => {
  const isComite = activeRole === 'comite_medico';

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-[#035476] hover:text-[#00aae1] transition-colors cursor-pointer"
        title="Menú de Acciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Options (7 literal items in exact order) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-xl shadow-2xl border border-[#e2e8eb] p-1.5 w-56 text-xs font-semibold space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* 1. Ver Actas */}
          <button
            type="button"
            onClick={() => {
              onOpenActas(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <FileText className="w-4 h-4 text-[#00aae1]" />
            <span>Ver Actas</span>
          </button>

          {/* 2. Evolución */}
          <button
            type="button"
            onClick={() => {
              onOpenEvolucion(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <Activity className="w-4 h-4 text-[#00aae1]" />
            <span>Evolución</span>
          </button>

          {/* 3. + Nueva Acta */}
          <button
            type="button"
            onClick={() => {
              onOpenNuevaActa(patient);
              onToggle();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-[#00aae1]" />
              <span>+ Nueva Acta</span>
            </span>
            {!isComite && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Consulta</span>
            )}
          </button>

          {/* 4. Costos */}
          <button
            type="button"
            onClick={() => {
              onOpenCostos(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <BarChart3 className="w-4 h-4 text-[#00aae1]" />
            <span>Costos</span>
          </button>

          {/* 5. Cuadro Médico Asignado */}
          <button
            type="button"
            onClick={() => {
              onOpenCuadroMedico(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <Users className="w-4 h-4 text-[#00aae1]" />
            <span>Cuadro Médico Asignado</span>
          </button>

          {/* 6. Agenda */}
          <button
            type="button"
            onClick={() => {
              onOpenAgenda(patient);
              onToggle();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <Calendar className="w-4 h-4 text-[#00aae1]" />
            <span>Agenda</span>
          </button>

          {/* 7. Adherencia */}
          <button
            type="button"
            onClick={() => {
              onToggleAdherencia();
              onToggle();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#033d59] hover:bg-[#effaff] hover:text-[#00aae1] transition-colors cursor-pointer text-left"
          >
            <Clock className="w-4 h-4 text-[#00aae1]" />
            <span>Adherencia</span>
          </button>
        </div>
      )}
    </div>
  );
};
