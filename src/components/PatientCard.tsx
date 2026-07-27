import React from 'react';
import { Patient } from '../types';
import { Phone, Mail, MapPin, User } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-2 bg-white rounded-lg border border-[#e2e8eb] hover:border-[#00aae1] hover:shadow-xs transition-all cursor-pointer space-y-1 text-xs select-none w-full max-w-[230px]"
      title="Clic para Editar Ficha del Paciente"
    >
      {/* Line 1: Nombre Completo del Paciente */}
      <div className="font-bold text-[#033d59] hover:text-[#00aae1] text-xs flex items-center gap-1.5 truncate leading-tight">
        <User className="w-3.5 h-3.5 text-[#00aae1] shrink-0" />
        <span className="truncate">{patient.nombre}</span>
      </div>

      {/* Line 2: ID Paciente */}
      <div className="text-[10.5px] text-[#035476] font-mono leading-tight pl-5">
        <span className="font-semibold text-[#033d59]">ID:</span>{' '}
        <span>{patient.identificacion}</span>
      </div>

      {/* Line 3: Phone (Cyan) */}
      <div className="text-[11px] text-[#00aae1] flex items-center gap-2 truncate pt-0.5">
        <Phone className="w-3.5 h-3.5 text-[#00aae1] shrink-0" />
        <span className="truncate font-semibold">{patient.telefono}</span>
      </div>

      {/* Line 4: Email (Dark Slate) */}
      <div className="text-[10.5px] text-[#035476] flex items-center gap-2 truncate">
        <Mail className="w-3.5 h-3.5 text-[#035476] shrink-0" />
        <span className="truncate">{patient.email}</span>
      </div>

      {/* Line 5: Address (Dark Slate) */}
      <div className="text-[10.5px] text-[#035476] flex items-center gap-2 truncate">
        <MapPin className="w-3.5 h-3.5 text-[#035476] shrink-0" />
        <span className="truncate">{patient.direccion}</span>
      </div>
    </div>
  );
};
