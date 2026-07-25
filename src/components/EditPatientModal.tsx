import React, { useState } from 'react';
import { Patient, EstadoPaciente, NivelRiesgo, FasePaciente, UserRole } from '../types';
import { X, Save, User, ShieldAlert, CheckCircle2, FileText } from 'lucide-react';

interface EditPatientModalProps {
  patient: Patient;
  activeRole: UserRole;
  onSave: (updatedPatient: Patient) => void;
  onClose: () => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patient,
  activeRole,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Patient>({ ...patient });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isComite = activeRole === 'comite_medico';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#f9fafb] px-6 py-4 border-b border-[#e2e8eb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#effaff] text-[#00aae1] font-bold flex items-center justify-center border border-[#00aae1]/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#033d59]">
                Editar Ficha del Paciente
              </h3>
              <p className="text-xs text-[#035476]">
                {patient.nombre} • ID: {patient.identificacion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#035476] hover:text-[#033d59] rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Row 1: Nombre & Identificacion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Identificación (CC / CE)
              </label>
              <input
                type="text"
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>
          </div>

          {/* Row 2: Teléfono, Email, Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
          </div>

          <hr className="border-[#e2e8eb]" />

          {/* Row 3: Convenio, Cohorte, Carga */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                ID Convenio
              </label>
              <input
                type="text"
                value={formData.idConvenio}
                onChange={(e) => setFormData({ ...formData, idConvenio: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Cohorte
              </label>
              <input
                type="text"
                value={formData.cohorte}
                onChange={(e) => setFormData({ ...formData, cohorte: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Número de Carga
              </label>
              <input
                type="text"
                value={formData.numeroCarga}
                onChange={(e) => setFormData({ ...formData, numeroCarga: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
          </div>

          {/* Row 4: Estado, Riesgo, Etiqueta, Fase */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#effaff] p-3 rounded-lg border border-[#00aae1]/20">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoPaciente })}
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] font-semibold"
              >
                <option value="Activo">Activo (Verde)</option>
                <option value="Aceptado">Aceptado (Azul)</option>
                <option value="Rechazado">Rechazado (Rojo)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase flex items-center gap-1">
                Nivel de Riesgo
                {!isComite && (
                  <span className="text-[9px] text-[#fbbf24] font-normal">(Solo Comité)</span>
                )}
              </label>
              <select
                disabled={!isComite}
                value={formData.riesgo}
                onChange={(e) => setFormData({ ...formData, riesgo: e.target.value as NivelRiesgo })}
                className={`w-full border border-[#e2e8eb] rounded-md px-2.5 py-1.5 font-semibold ${
                  isComite ? 'bg-white text-[#033d59]' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                }`}
              >
                <option value="Critical">Critical (Triángulo Rojo)</option>
                <option value="High">High (Círculo Rojo)</option>
                <option value="Medium">Medium (Círculo Amarillo)</option>
                <option value="Low">Low (Círculo Verde)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Etiqueta
              </label>
              <input
                type="text"
                value={formData.etiqueta}
                onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Fase
              </label>
              <select
                value={formData.fase}
                onChange={(e) => setFormData({ ...formData, fase: e.target.value as FasePaciente })}
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] font-semibold"
              >
                <option value="E">E - Evaluación</option>
                <option value="D">D - Diagnóstico</option>
                <option value="I">I - Intervención</option>
                <option value="M/E">M/E - Mantenimiento/Egreso</option>
              </select>
            </div>
          </div>

          {/* Coordinador */}
          <div>
            <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
              Coordinador Asignado
            </label>
            <input
              type="text"
              value={formData.coordinador}
              onChange={(e) => setFormData({ ...formData, coordinador: e.target.value })}
              className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#e2e8eb]">
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
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
