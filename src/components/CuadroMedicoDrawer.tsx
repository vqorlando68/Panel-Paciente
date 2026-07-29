import React, { useState } from 'react';
import { Patient, CuadroMedicoItem, UserRole } from '../types';
import { X, Users, Phone, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Trash2, Edit3, Save, Lock } from 'lucide-react';
import CUADRO_MEDICO_DATA from '../data/cuadroMedicoData.json';

interface CuadroMedicoDrawerProps {
  patient: Patient;
  activeRole: UserRole;
  onSaveCuadroMedico?: (patientId: string, updatedItems: CuadroMedicoItem[]) => void;
  onClose: () => void;
}

// Extract the 10 specialties and build a quick directory of professionals with phone numbers
const SPECIALTY_OPTIONS = CUADRO_MEDICO_DATA.map((item) => item.specialty);

const PROFESSIONAL_DIRECTORY: Record<string, { specialty: string; phone: string }> = {};
CUADRO_MEDICO_DATA.forEach((specItem) => {
  specItem.professionals.forEach((prof) => {
    PROFESSIONAL_DIRECTORY[prof.name] = {
      specialty: specItem.specialty,
      phone: prof.phone,
    };
  });
});

export const CuadroMedicoDrawer: React.FC<CuadroMedicoDrawerProps> = ({
  patient,
  activeRole,
  onSaveCuadroMedico,
  onClose,
}) => {
  const isEditable = activeRole === 'comite_medico';
  const [items, setItems] = useState<CuadroMedicoItem[]>(patient.cuadroMedico || []);
  const [hasSaved, setHasSaved] = useState(false);

  const getProfessionalsForSpecialty = (specialtyName: string) => {
    const found = CUADRO_MEDICO_DATA.find(
      (s) => s.specialty.toLowerCase() === specialtyName.toLowerCase()
    );
    if (found) return found.professionals;
    return CUADRO_MEDICO_DATA.flatMap((s) => s.professionals);
  };

  const handleSpecialtyChange = (id: string, newSpecialty: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const profs = getProfessionalsForSpecialty(newSpecialty);
        const profExists = profs.some((p) => p.name === item.professional);
        const newProf = profExists ? item.professional : (profs[0]?.name || '');
        const newPhone = PROFESSIONAL_DIRECTORY[newProf]?.phone || (profs[0]?.phone || '');

        return {
          ...item,
          specialty: newSpecialty,
          professional: newProf,
          phone: newPhone,
        };
      })
    );
    setHasSaved(false);
  };

  const handleProfessionalChange = (id: string, newProf: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const directoryMatch = PROFESSIONAL_DIRECTORY[newProf];
        return {
          ...item,
          professional: newProf,
          specialty: directoryMatch ? directoryMatch.specialty : item.specialty,
          phone: directoryMatch ? directoryMatch.phone : item.phone,
        };
      })
    );
    setHasSaved(false);
  };

  const handleItemChange = (id: string, field: keyof CuadroMedicoItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
    setHasSaved(false);
  };

  const handleAddItem = () => {
    const defaultSpec = 'Medicina General';
    const profs = getProfessionalsForSpecialty(defaultSpec);
    const newItem: CuadroMedicoItem = {
      id: `cm-${Date.now()}`,
      specialty: defaultSpec,
      professional: profs[0]?.name || '',
      inNetwork: true,
      phone: profs[0]?.phone || '',
    };
    setItems((prev) => [...prev, newItem]);
    setHasSaved(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setHasSaved(false);
  };

  const handleSave = () => {
    if (onSaveCuadroMedico) {
      onSaveCuadroMedico(patient.id, items);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-[#e2e8eb] dark:border-[#334155] animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cuadro Médico Asignado</h3>
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

        {/* Mode Notification Banner */}
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${
          isEditable
            ? 'bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] border-[#00aae1]/20'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-1.5">
            {isEditable ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edición Habilitada (Comité Médico)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Solo Lectura (Coordinadora SIAU)</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-normal italic">
            {isEditable ? 'Modifique profesionales e IPS' : 'Sin permisos de edición'}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-[#033d59] dark:text-[#f8fafc]">
          <div className="bg-[#effaff] dark:bg-[#00aae1]/10 p-3 rounded-xl border border-[#00aae1]/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#035476] dark:text-[#38bdf8] font-semibold uppercase block">Convenio Asignado</span>
              <span className="font-bold text-[#033d59] dark:text-[#f8fafc] text-xs">{patient.convenioNombre}</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#00aae1]" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#033d59] dark:text-[#f8fafc] uppercase tracking-wide">
                Profesionales e IPS Asignadas ({items.length})
              </h4>
              {isEditable && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#00aae1] dark:text-[#38bdf8] hover:text-[#0196d4] bg-[#effaff] dark:bg-[#00aae1]/10 hover:bg-[#dbeafe] dark:hover:bg-[#00aae1]/20 px-2.5 py-1 rounded-lg border border-[#00aae1]/30 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Profesional</span>
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 py-6 text-center italic">No hay profesionales registrados en el cuadro médico.</p>
            ) : (
              items.map((item) => {
                const availableProfessionals = getProfessionalsForSpecialty(item.specialty);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl hover:border-[#00aae1]/40 shadow-2xs transition-all space-y-2.5"
                  >
                    {isEditable ? (
                      /* Editable Item Controls with Dropdowns */
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] mb-0.5">
                              Especialidad / Rol *
                            </label>
                            <select
                              value={item.specialty}
                              onChange={(e) => handleSpecialtyChange(item.id, e.target.value)}
                              className="w-full text-xs p-1.5 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1] font-medium"
                            >
                              <option value="">Seleccionar Especialidad...</option>
                              {SPECIALTY_OPTIONS.map((spec) => (
                                <option key={spec} value={spec}>
                                  {spec}
                                </option>
                              ))}
                              {!SPECIALTY_OPTIONS.includes(item.specialty) && item.specialty && (
                                <option value={item.specialty}>{item.specialty}</option>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-[#035476] mb-0.5">
                              Nombre del Profesional / IPS *
                            </label>
                            <select
                              value={item.professional}
                              onChange={(e) => handleProfessionalChange(item.id, e.target.value)}
                              className="w-full text-xs p-1.5 bg-white border border-[#e2e8eb] rounded text-[#033d59] focus:outline-none focus:border-[#00aae1] font-bold"
                            >
                              <option value="">Seleccionar Profesional...</option>
                              {availableProfessionals.map((prof) => (
                                <option key={prof.name} value={prof.name}>
                                  {prof.name}
                                </option>
                              ))}
                              {!availableProfessionals.some((p) => p.name === item.professional) && item.professional && (
                                <option value={item.professional}>{item.professional}</option>
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-end pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-[#035476] mb-0.5">
                              Teléfono de Contacto
                            </label>
                            <input
                              type="text"
                              value={item.phone || ''}
                              onChange={(e) => handleItemChange(item.id, 'phone', e.target.value)}
                              placeholder="Ej: (604) 444-1234"
                              className="w-full text-xs p-1.5 bg-white border border-[#e2e8eb] rounded text-[#033d59] font-mono focus:outline-none focus:border-[#00aae1]"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => handleItemChange(item.id, 'inNetwork', !item.inNetwork)}
                              className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                item.inNetwork
                                  ? 'bg-[#ebfef4] text-[#01ae6c] border-[#01ae6c]/30'
                                  : 'bg-rose-50 text-rose-600 border-rose-200'
                              }`}
                            >
                              {item.inNetwork ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Dentro Red</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Fuera Red</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="Eliminar profesional"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Read-Only Item View (SIAU) */
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-[#00aae1] uppercase tracking-wider block">
                              {item.specialty}
                            </span>
                            <h5 className="font-bold text-sm text-[#033d59]">{item.professional || 'Sin asignar'}</h5>
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
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f9fafb] border-t border-[#e2e8eb] flex items-center justify-between">
          <div>
            {hasSaved && (
              <span className="text-xs font-bold text-[#01ae6c] flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Cambios guardados!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#035476] bg-white border border-[#e2e8eb] hover:bg-gray-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {isEditable && (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
