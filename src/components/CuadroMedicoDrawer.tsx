import React from 'react';
import { Patient } from '../types';
import { X, Users, Phone, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CuadroMedicoDrawerProps {
  patient: Patient;
  onClose: () => void;
}

export const CuadroMedicoDrawer: React.FC<CuadroMedicoDrawerProps> = ({ patient, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-[#e2e8eb] flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#033d59] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00aae1] rounded-lg text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Cuadro Médico del Paciente</h3>
              <p className="text-xs text-white/80">{patient.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-[#033d59]">
          <div className="bg-[#effaff] p-3 rounded-xl border border-[#00aae1]/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#035476] font-semibold uppercase block">Convenio Asignado</span>
              <span className="font-bold text-[#033d59] text-xs">{patient.convenioNombre}</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#00aae1]" />
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[#033d59] uppercase tracking-wide">
              Profesionales e IPS Asignadas ({patient.cuadroMedico.length})
            </h4>

            {patient.cuadroMedico.length === 0 ? (
              <p className="text-gray-500 py-6 text-center italic">No hay profesionales registrados en el cuadro médico.</p>
            ) : (
              patient.cuadroMedico.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-[#e2e8eb] rounded-xl hover:border-[#00aae1]/40 shadow-2xs transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#00aae1] uppercase tracking-wider block">
                        {item.specialty}
                      </span>
                      <h5 className="font-bold text-sm text-[#033d59]">{item.professional}</h5>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.inNetwork
                          ? 'bg-[#ebfef4] text-[#01ae6c] border border-[#01ae6c]/20'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {item.inNetwork ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Dentro de Red</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Fuera de Red</span>
                        </>
                      )}
                    </span>
                  </div>

                  {item.phone && (
                    <div className="pt-2 border-t border-[#e2e8eb] flex items-center gap-2 text-[11px] text-[#035476]">
                      <Phone className="w-3.5 h-3.5 text-[#00aae1]" />
                      <span className="font-mono">{item.phone}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f9fafb] border-t border-[#e2e8eb] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#033d59] bg-white border border-[#e2e8eb] hover:bg-gray-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
