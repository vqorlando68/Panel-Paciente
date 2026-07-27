import React, { useState } from 'react';
import { SpecialistInfo, SpecialistKey, Patient } from '../types';
import { X, Calendar, User, Clock, Save, ClipboardList, PanelRightClose } from 'lucide-react';

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
  const [showDetail, setShowDetail] = useState(false);

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
      <div className={`bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full transition-all duration-300 overflow-hidden ${
        showDetail ? 'max-w-4xl' : 'max-w-md'
      }`}>
        <div className={`grid grid-cols-1 ${showDetail ? 'md:grid-cols-2 divide-y md:divide-y-0 md:divide-x' : ''} divide-[#e2e8eb]`}>
          
          {/* PANEL 1: Edición de Especialista (Left Side) */}
          <div className="flex flex-col">
            <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Atención: {formData.specialistTitle}</h3>
                <p className="text-xs text-white/90 font-medium">{patient.nombre}</p>
              </div>
              {!showDetail && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#033d59] flex-1 flex flex-col justify-between">
              <div className="space-y-4">
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

                {/* FECHA OBJETIVO (PRÓXIMA ATENCIÓN) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase tracking-wide">
                    Fecha Objetivo (Próxima Atención) (DD/MM/YYYY HH:MM AM/PM)
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

                {/* BUTTON: Detalle de Atenciones... */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDetail(!showDetail)}
                    className={`w-full py-2.5 px-3 border rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      showDetail
                        ? 'bg-[#00aae1] text-white border-[#00aae1]'
                        : 'bg-[#effaff] text-[#00aae1] border-[#00aae1]/30 hover:bg-[#00aae1]/10'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>{showDetail ? '📋 Ocultar Detalle Lateral' : '📋 Detalle de Atenciones (Al lado)...'}</span>
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-[#e2e8eb] flex justify-end gap-2.5 mt-4">
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
          </div>

          {/* PANEL 2: Panel de Detalle (Right Side - Appears next to edition panel) */}
          {showDetail && (
            <div className="flex flex-col bg-[#fafafa] animate-in fade-in slide-in-from-left-4 duration-200">
              <div className="bg-[#033d59] text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#00aae1]" />
                    Detalle de Atenciones
                  </h3>
                  <p className="text-xs text-white/80">{formData.specialistTitle} — {patient.nombre}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-[#033d59]">
                <div className="bg-white p-3 rounded-lg border border-[#e2e8eb] shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-[#035476] uppercase tracking-wider block">Profesional Asignado</span>
                  <p className="text-[#00aae1] font-bold text-sm">{formData.professionalName}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#035476]">
                    <span>Última atenc.: <strong className="text-[#033d59]">{formData.lastAttentionDate}</strong></span>
                    <span>Obj.: <strong className="text-[#00aae1]">{formData.targetDate}</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[#033d59] uppercase tracking-wide flex items-center justify-between">
                    <span>Histórico de Atenciones</span>
                    <span className="text-[10px] font-normal text-[#035476]">{historyList.length} registros</span>
                  </h4>

                  <div className="border border-[#e2e8eb] rounded-lg overflow-hidden divide-y divide-[#e2e8eb] bg-white shadow-2xs">
                    <div className="bg-[#f9fafb] px-3 py-2 font-bold text-[10px] text-[#035476] grid grid-cols-2 gap-2 uppercase tracking-wider">
                      <span>Fecha y Hora</span>
                      <span>Estado Atención</span>
                    </div>

                    {historyList.map((item, idx) => (
                      <div key={item.id || idx} className="px-3 py-2.5 grid grid-cols-2 gap-2 items-center hover:bg-[#effaff]/40 transition-colors">
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

              {/* Panel Footer */}
              <div className="p-3 bg-white border-t border-[#e2e8eb] flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#035476]">
                  Vista paralela de atenciones
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#035476] hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-[#e2e8eb]"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                  Cerrar Panel Lateral
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
