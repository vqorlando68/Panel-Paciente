import React from 'react';
import { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-2.5 bg-white rounded-lg border border-[#e2e8eb] hover:border-[#00aae1] hover:shadow-xs transition-all cursor-pointer space-y-1 text-xs select-none w-full max-w-[230px]"
      title="Clic para Editar Ficha del Paciente"
    >
      {/* Line 1: 👤 Nombre Completo del Paciente */}
      <div className="font-bold text-[#033d59] hover:text-[#00aae1] text-xs flex items-center gap-1.5 truncate leading-tight">
        <span className="shrink-0">👤</span>
        <span className="truncate">{patient.nombre}</span>
      </div>

      {/* Line 2: ID: 45769 | CC 52.849.182 */}
      <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1 truncate">
        <span>ID: {patient.numeroCarga || '45769'}</span>
        <span className="text-[#00aae1] font-bold">|</span>
        <span className="truncate">{patient.identificacion}</span>
      </div>

      {/* Line 3: 📞 300 123 4567 | 📍 Cra 15 # 20-30, Bogotá */}
      <div className="text-[10px] text-gray-600 flex items-center gap-1 truncate">
        <span className="shrink-0">📞 {patient.telefono}</span>
        <span className="text-[#00aae1] font-bold mx-0.5 shrink-0">|</span>
        <span className="truncate">📍 {patient.direccion}</span>
      </div>

      {/* Line 4: ✉️ paciente@email.com */}
      <div className="text-[10px] text-[#035476] truncate font-medium flex items-center gap-1">
        <span className="shrink-0">✉️</span>
        <span className="truncate">{patient.email}</span>
      </div>
    </div>
  );
};
