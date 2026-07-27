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
                {formData.nombre} • Identificación: {formData.identificacion}
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
          {/* Row 1: ID, Nombre Completo, Identificación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                ID Paciente
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full bg-[#e5e7eb]/60 border border-[#e2e8eb] rounded-md px-3 py-2 text-gray-600 font-mono font-bold cursor-not-allowed"
              />
            </div>

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
                Identificación
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

          {/* Row 3: ID Convenio, Estado Cohorte, N° Carga */}
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
                Estado Cohorte
              </label>
              <select
                value={formData.cohorte}
                onChange={(e) => setFormData({ ...formData, cohorte: e.target.value })}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              >
                {COHORTE_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
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

          {/* Row 4: Riesgo, Etiqueta, Fase, Retroalimentación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#effaff] p-3.5 rounded-lg border border-[#00aae1]/20">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Nivel de Riesgo
              </label>
              <select
                value={formData.riesgo}
                onChange={(e) => setFormData({ ...formData, riesgo: e.target.value as NivelRiesgo })}
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2.5 py-1.5 font-semibold text-[#033d59]"
              >
                <option value="Critical">Critical (Triángulo Rojo)</option>
                <option value="High">High (Círculo Rojo)</option>
                <option value="Medium">Medium (Círculo Amarillo)</option>
                <option value="Low">Low (Círculo Verde)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Prioridad Inicial
              </label>
              <select
                value={formData.prioridadInicial ?? 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prioridadInicial: parseInt(e.target.value, 10),
                  })
                }
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2.5 py-1.5 font-bold text-[#033d59]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pNum) => (
                  <option key={pNum} value={pNum}>
                    P-{pNum} (Prioridad {pNum})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase flex items-center justify-between">
                <span>Fase</span>
                {!isComite && (
                  <span className="text-[9px] text-[#b45309] font-normal lowercase">(solo lectura)</span>
                )}
              </label>
              <select
                disabled={!isComite}
                value={formData.fase}
                onChange={(e) => setFormData({ ...formData, fase: e.target.value as FasePaciente })}
                className={`w-full border border-[#e2e8eb] rounded-md px-2.5 py-1.5 font-semibold ${
                  isComite ? 'bg-white text-[#033d59]' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                }`}
              >
                <option value="E">E - Evaluación</option>
                <option value="D">D - Diagnóstico</option>
                <option value="I">I - Intervención</option>
                <option value="M/E">M/E - Mantenimiento/Egreso</option>
              </select>
            </div>
          </div>

          {/* Retroalimentación Checkbox */}
          <div className="bg-[#fff1f2] p-3 rounded-lg border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="retroInconforme"
                checked={formData.retroalimentacion === 'Inconforme'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retroalimentacion: e.target.checked ? 'Inconforme' : '',
                  })
                }
                className="w-4 h-4 text-[#00aae1] rounded border-rose-300 focus:ring-[#00aae1] cursor-pointer"
              />
              <label htmlFor="retroInconforme" className="text-xs font-semibold text-[#033d59] cursor-pointer select-none">
                Marcar Retroalimentación como <span className="text-rose-700 font-bold uppercase">Inconforme</span>
              </label>
            </div>
            {formData.retroalimentacion === 'Inconforme' && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                Inconforme
              </span>
            )}
          </div>

          {/* Coordinador */}
          <div>
            <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
              Coordinador Asignado
            </label>
            <select
              value={formData.coordinador}
              onChange={(e) => setFormData({ ...formData, coordinador: e.target.value })}
              className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-3 py-2 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
            >
              {COORDINADORES_LIST.map((coord) => (
                <option key={coord} value={coord}>
                  {coord}
                </option>
              ))}
            </select>
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
