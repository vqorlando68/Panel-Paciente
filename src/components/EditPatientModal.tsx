import React, { useState } from 'react';
import { Patient, EstadoPaciente, NivelRiesgo, FasePaciente, UserRole, COHORTE_OPTIONS, COORDINADORES_LIST } from '../types';
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] rounded-xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#f9fafb] dark:bg-[#0f172a] px-6 py-4 border-b border-[#e2e8eb] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#effaff] dark:bg-[#00aae1]/20 text-[#00aae1] dark:text-[#38bdf8] font-bold flex items-center justify-center border border-[#00aae1]/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#033d59] dark:text-[#f8fafc]">
                Editar Ficha del Paciente
              </h3>
              <p className="text-xs text-[#035476] dark:text-[#94a3b8]">
                {formData.nombre} • Identificación: {formData.identificacion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Row 1: ID, Nombres, Apellidos, Identificación */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                ID Paciente
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full bg-[#e5e7eb]/60 dark:bg-[#0f172a]/60 border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-gray-500 dark:text-gray-400 font-mono font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Nombres
              </label>
              <input
                type="text"
                value={formData.nombres ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    nombres: val,
                    nombre: `${val} ${formData.apellidos || ''}`.trim(),
                  });
                }}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Apellidos
              </label>
              <input
                type="text"
                value={formData.apellidos ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    apellidos: val,
                    nombre: `${formData.nombres || ''} ${val}`.trim(),
                  });
                }}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Identificación
              </label>
              <input
                type="text"
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>
          </div>

          {/* Row 2: Teléfono, Email, Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
          </div>

          {/* Row 3: Convenio, N° Carga, Coordinador */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Convenio Nombre
              </label>
              <input
                type="text"
                value={formData.convenioNombre}
                onChange={(e) => setFormData({ ...formData, convenioNombre: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                N° de Carga
              </label>
              <input
                type="text"
                value={formData.numeroCarga || ''}
                onChange={(e) => setFormData({ ...formData, numeroCarga: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Coordinador Asignado
              </label>
              <select
                value={formData.coordinador || 'Angela Valencia'}
                onChange={(e) => setFormData({ ...formData, coordinador: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              >
                {COORDINADORES_LIST.map((coord) => (
                  <option key={coord} value={coord}>
                    {coord}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Estado, Nivel de Riesgo (Comité), Cohorte */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Estado del Paciente
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoPaciente })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              >
                <option value="Activo">Activo</option>
                <option value="Aceptado">Aceptado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase flex items-center gap-1">
                <span>Nivel de Riesgo</span>
                {!isComite && <ShieldAlert className="w-3 h-3 text-[#b45309]" title="Solo editable por Comité" />}
              </label>
              {isComite ? (
                <select
                  value={formData.riesgo}
                  onChange={(e) => setFormData({ ...formData, riesgo: e.target.value as NivelRiesgo })}
                  className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
                >
                  <option value="Critical">Critical (Rojo)</option>
                  <option value="High">High (Naranja)</option>
                  <option value="Medium">Medium (Amarillo)</option>
                  <option value="Low">Low (Verde)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.riesgo}
                  readOnly
                  className="w-full bg-[#e5e7eb]/60 dark:bg-[#0f172a]/60 border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-gray-500 font-bold cursor-not-allowed"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Estado Cohorte
              </label>
              <select
                value={formData.cohorte}
                onChange={(e) => setFormData({ ...formData, cohorte: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              >
                {COHORTE_OPTIONS.map((coh) => (
                  <option key={coh.code} value={coh.code}>
                    {coh.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Prioridad Inicial, Etiqueta, Fase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Prioridad Inicial (1 - 10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.prioridadInicial || 1}
                onChange={(e) => setFormData({ ...formData, prioridadInicial: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Retroalimentación / Etiqueta
              </label>
              <select
                value={formData.etiqueta || formData.retroalimentacion || 'Satisfecho'}
                onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value, retroalimentacion: e.target.value })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              >
                <option value="Satisfecho">Satisfecho</option>
                <option value="Inconforme">Inconforme</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase">
                Fase Clínica
              </label>
              <select
                value={formData.fase || 'I'}
                onChange={(e) => setFormData({ ...formData, fase: e.target.value as FasePaciente })}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-3 py-2 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1]"
              >
                <option value="I">Fase I (Ingreso)</option>
                <option value="M/E">Fase M/E (Mantenimiento)</option>
                <option value="C">Fase C (Control)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-[#f9fafb] dark:bg-[#0f172a] -mx-6 -mb-6 p-4 mt-6 border-t border-[#e2e8eb] dark:border-[#334155] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#035476] dark:text-[#94a3b8] hover:bg-gray-200 dark:hover:bg-[#334155] font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#00aae1] hover:bg-[#0196d4] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
