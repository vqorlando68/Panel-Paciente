import React, { useState } from 'react';
import { SpecialistInfo, SpecialistKey, Patient } from '../types';
import { X, Calendar, User, Clock, AlertTriangle, Save, Check } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(patient.id, specialistKey, formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Atención: {formData.specialistTitle}</h3>
            <p className="text-xs text-white/80">{patient.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#033d59]">
          {/* Professional Name */}
          <div>
            <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
              Nombre del Profesional
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.professionalName}
                onChange={(e) => setFormData({ ...formData, professionalName: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
              <User className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Last Attention Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
              Fecha de Última Atención
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.lastAttentionDate}
                onChange={(e) => setFormData({ ...formData, lastAttentionDate: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
              <Calendar className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
              Frecuencia / Periodicidad
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej: Cada 30 días, Trimestral..."
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
              <Clock className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
              Fecha Objetivo (Próxima Cita)
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md pl-8 pr-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
              <Calendar className="w-3.5 h-3.5 text-[#035476] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Overdue Flag Override */}
          <div className="bg-[#fffbeb] p-3 rounded-lg border border-[#fbbf24]/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#b45309]">
              <AlertTriangle className="w-4 h-4 text-[#fbbf24]" />
              <div>
                <p className="font-semibold text-xs">Estado de Vencimiento</p>
                <p className="text-[10px] text-[#b45309]/80">Marcar alerta si excede la fecha</p>
              </div>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-[#b45309]">
              <input
                type="checkbox"
                checked={formData.isOverdue ?? false}
                onChange={(e) => setFormData({ ...formData, isOverdue: e.target.checked })}
                className="w-4 h-4 accent-[#fbbf24] rounded"
              />
              Vencido
            </label>
          </div>

          <div className="pt-3 border-t border-[#e2e8eb] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#035476] hover:bg-[#f9fafb] rounded-lg transition-colors cursor-pointer"
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
    </div>
  );
};
