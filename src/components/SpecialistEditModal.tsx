import React, { useState } from 'react';
import { SpecialistInfo, SpecialistKey, Patient } from '../types';
import { X, Calendar, User, Clock, Save, ClipboardList, ArrowLeft } from 'lucide-react';

interface SpecialistEditModalProps {
  patient: Patient;
  specialistKey: SpecialistKey;
  specialistData: SpecialistInfo;
  onSave: (patientId: string, specialistKey: SpecialistKey, updatedInfo: SpecialistInfo) => void;
  onClose: () => void;
}

export const SpecialistEditModal: React.FC<SpecialistEditModalProps> = ({
  patient,
  specialistKey,
  specialistData,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<SpecialistInfo>({ ...specialistData });
  const [currentStep, setCurrentStep] = useState<'stepA' | 'stepB'>('stepA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(patient.id, specialistKey, formData);
  };

  // Sample or actual attentions history
  const historyList = formData.attentionsHistory && formData.attentionsHistory.length > 0 
    ? formData.attentionsHistory 
    : [
        { id: '1', dateTime: `${formData.lastAttentionDate || '10/05/2026 09:00 AM'}`, professional: formData.professionalName, status: 'Atendida' },
        { id: '2', dateTime: `${formData.targetDate || '10/06/2026 09:00 AM'}`, professional: formData.professionalName, status: 'Programada' },
        { id: '3', dateTime: '15/04/2026 10:30 AM', professional: formData.professionalName, status: 'Atendida' }
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* STEP A: Modal Form */}
        {currentStep === 'stepA' && (
          <>
            <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Atención: {formData.specialistTitle}</h3>
                <p className="text-xs text-white/90 font-medium">{patient.nombre}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#033d59]">
              {/* NOMBRE DEL PROFESIONAL */}
              <div>
                <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wide">
                  Nombre del Profesional
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.professionalName}
                    onChange={(e) => setFormData({ ...formData, professionalName: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] font-medium focus:outline-none focus:border-[#00aae1] focus:bg-white"
                    required
                  />
                  <User className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* FECHA DE ÚLTIMA ATENCIÓN */}
              <div>
                <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wide">
                  Fecha de Última Atención (DD/MM/YYYY HH:MM AM/PM)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: 10/05/2026 09:00 AM"
                    value={formData.lastAttentionDate}
                    onChange={(e) => setFormData({ ...formData, lastAttentionDate: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] font-medium focus:outline-none focus:border-[#00aae1] focus:bg-white"
                    required
                  />
                  <Calendar className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* FRECUENCIA / PERIODICIDAD */}
              <div>
                <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wide">
                  Frecuencia / Periodicidad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: Quincenal, Cada 30 días..."
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] font-medium focus:outline-none focus:border-[#00aae1] focus:bg-white"
                    required
                  />
                  <Clock className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* FECHA OBJETIVO (PRÓXIMA CITA) */}
              <div>
                <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wide">
                  Fecha Objetivo (Próxima Cita) (DD/MM/YYYY HH:MM AM/PM)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: 10/06/2026 09:00 AM"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] font-medium focus:outline-none focus:border-[#00aae1] focus:bg-white"
                    required
                  />
                  <Calendar className="w-3.5 h-3.5 text-[#00aae1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* PROMINENT BUTTON: Detalle de Atenciones... */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('stepB')}
                  className="w-full py-2.5 px-3 bg-[#effaff] hover:bg-[#00aae1]/10 border border-[#00aae1]/30 rounded-lg text-[#00aae1] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs group"
                >
                  <ClipboardList className="w-4 h-4 text-[#00aae1] group-hover:scale-110 transition-transform" />
                  <span>📋 Detalle de Atenciones...</span>
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-[#e2e8eb] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#035476] hover:bg-[#f9fafb] rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP B: Panel de Detalle (READ ONLY) */}
        {currentStep === 'stepB' && (
          <div className="flex flex-col max-h-[85vh]">
            <div className="bg-[#033d59] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#00aae1]" />
                  Detalle de Atenciones ({formData.specialistTitle})
                </h3>
                <p className="text-xs text-white/80">{patient.nombre}</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('stepA')}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Volver"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs text-[#033d59]">
              <div className="bg-[#effaff] p-2.5 rounded-lg border border-[#00aae1]/20 text-[11px] text-[#035476]">
                <p className="font-semibold text-[#033d59]">Profesional asignado:</p>
                <p className="text-[#00aae1] font-bold">{formData.professionalName}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#033d59] uppercase tracking-wide">
                  Histórico y Citas Agendadas:
                </h4>

                <div className="border border-[#e2e8eb] rounded-lg overflow-hidden divide-y divide-[#e2e8eb]">
                  <div className="bg-[#f9fafb] px-3 py-2 font-bold text-[11px] text-[#035476] grid grid-cols-2 gap-2">
                    <span>FECHA Y HORA</span>
                    <span>ESTADO</span>
                  </div>

                  {historyList.map((item, idx) => (
                    <div key={item.id || idx} className="px-3 py-2.5 grid grid-cols-2 gap-2 items-center hover:bg-[#f9fafb] transition-colors">
                      <span className="font-mono text-xs font-semibold text-[#033d59]">
                        {item.dateTime}
                      </span>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Atendida' ? 'bg-[#ebfef4] text-[#01ae6c] border border-[#01ae6c]/20' :
                          item.status === 'Programada' ? 'bg-[#f0f9ff] text-[#0284c7] border border-[#0284c7]/20' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Read-Only Footer with Back / Close Button */}
            <div className="p-3 bg-[#f9fafb] border-t border-[#e2e8eb] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep('stepA')}
                className="px-3 py-1.5 text-xs font-semibold text-[#00aae1] hover:bg-[#effaff] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver a la edición
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-[#033d59] bg-white border border-[#e2e8eb] hover:bg-gray-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
