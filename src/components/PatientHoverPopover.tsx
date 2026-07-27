import React from 'react';
import { Patient } from '../types';
import { Phone, Mail, MapPin, CreditCard, Edit3, X } from 'lucide-react';

interface PatientHoverPopoverProps {
  patient: Patient;
  position: { top: number; left: number };
  onClose: () => void;
  onClickEdit: () => void;
}

export const PatientHoverPopover: React.FC<PatientHoverPopoverProps> = ({
  patient,
  position,
  onClose,
  onClickEdit,
}) => {
  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-50 w-72 bg-white rounded-lg shadow-xl border border-[#e2e8eb] p-3 text-xs animate-in fade-in zoom-in-95 duration-150 font-sans"
    >
      <div className="flex items-start justify-between pb-2 mb-2 border-b border-[#e2e8eb]">
        <div>
          <h4 className="font-bold text-[#033d59] leading-snug">{patient.nombre}</h4>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="text-[10px] text-[#035476] font-mono font-semibold">
              <span className="text-gray-400">ID:</span> {patient.id}
            </span>
            <span className="text-[10px] text-[#035476] flex items-center gap-1 font-mono">
              <CreditCard className="w-3 h-3 text-[#00aae1]" />
              Identificación: {patient.identificacion}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClickEdit}
            className="text-[#00aae1] hover:bg-[#effaff] p-1 rounded-md transition-colors cursor-pointer"
            title="Editar información del paciente"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 text-[#033d59]">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-[#035476] shrink-0" />
          <a
            href={`tel:${patient.telefono}`}
            className="text-[#00aae1] hover:underline font-mono"
          >
            {patient.telefono}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-[#035476] shrink-0" />
          <span className="truncate text-[#033d59]">{patient.email}</span>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#035476] shrink-0 mt-0.5" />
          <span className="text-[#035476] leading-tight">{patient.direccion}</span>
        </div>

        <div className="pt-2 mt-2 border-t border-[#e2e8eb] flex items-center justify-between text-[11px]">
          <span className="text-[#035476]">Convenio:</span>
          <span className="font-semibold text-[#033d59]">{patient.idConvenio}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#035476]">Cohorte:</span>
          <span className="font-medium text-[#00aae1] truncate max-w-[150px]">
            {patient.cohorte}
          </span>
        </div>
      </div>
    </div>
  );
};

