import React from 'react';
import { Patient, UserRole } from '../types';
import { X, FileText, Calendar, Users, CheckCircle } from 'lucide-react';

interface ActaModalProps {
  patient: Patient;
  activeRole?: UserRole;
  onClose: () => void;
}

export const ActaModal: React.FC<ActaModalProps> = ({ patient, activeRole, onClose }) => {
  const { acta } = patient;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Acta del Comité Médico #{acta.numero}</h3>
                {activeRole === 'coordinadora_siau' && (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-medium">
                    Consulta SIAU
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80">{patient.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-[#033d59]">
          <div className="flex items-center justify-between bg-[#effaff] p-3 rounded-lg border border-[#00aae1]/20">
            <div className="flex items-center gap-1.5 text-[#035476]">
              <Calendar className="w-4 h-4 text-[#00aae1]" />
              <span>Fecha de Sesión:</span>
              <strong className="text-[#033d59] font-mono">{acta.fecha}</strong>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] text-[#01ae6c] text-[11px] font-semibold border border-[#01ae6c]/20 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Aprobada
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-[#033d59] mb-1 uppercase tracking-wider text-[11px]">
              Resumen de Decisiones del Comité
            </h4>
            <div className="p-3 bg-[#f9fafb] rounded-lg border border-[#e2e8eb] text-xs leading-relaxed text-[#033d59]">
              {acta.resumen}
            </div>
          </div>

          {acta.integrantes && acta.integrantes.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#035476] mb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#00aae1]" />
                Integrantes del Comité Firmantes
              </h4>
              <ul className="space-y-1 pl-1">
                {acta.integrantes.map((member, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#033d59]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00aae1]" />
                    <span>{member}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-[#e2e8eb] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

