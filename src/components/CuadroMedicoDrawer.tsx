import React, { useState } from 'react';
import { Patient, CuadroMedicoItem, UserRole } from '../types';
import { X, Users, Phone, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Trash2, Edit3, Save, Lock } from 'lucide-react';

interface CuadroMedicoDrawerProps {
  patient: Patient;
  activeRole: UserRole;
  onSaveCuadroMedico?: (patientId: string, updatedItems: CuadroMedicoItem[]) => void;
  onClose: () => void;
}

export const CuadroMedicoDrawer: React.FC<CuadroMedicoDrawerProps> = ({
  patient,
  activeRole,
  onSaveCuadroMedico,
  onClose,
}) => {
  const isEditable = activeRole === 'comite_medico';
  const [items, setItems] = useState<CuadroMedicoItem[]>(patient.cuadroMedico || []);
  const [hasSaved, setHasSaved] = useState(false);

  const handleItemChange = (id: string, field: keyof CuadroMedicoItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setHasSaved(false);
  };

  const handleAddItem = () => {
    const newItem: CuadroMedicoItem = {
      id: `cm-${Date.now()}`,
      specialty: 'Medicina General',
      professional: '',
      inNetwork: true,
      phone: '',
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-[#e2e8eb] flex flex-col animate-in slide-in-from-right duration-200">
        
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

        {/* Mode Notification Banner */}
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${
          isEditable
            ? 'bg-[#effaff] text-[#00aae1] border-[#00aae1]/20'
            : 'bg-gray-100 text-gray-600 border-gray-200'
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-[#033d59]">
          <div className="bg-[#effaff] p-3 rounded-xl border border-[#00aae1]/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#035476] font-semibold uppercase block">Convenio Asignado</span>
              <span className="font-bold text-[#033d59] text-xs">{patient.convenioNombre}</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#00aae1]" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#033d59] uppercase tracking-wide">
                Profesionales e IPS Asignadas ({items.length})
              </h4>
              {isEditable && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#00aae1] hover:text-[#0196d4] bg-[#effaff] hover:bg-[#dbeafe] px-2.5 py-1 rounded-lg border border-[#00aae1]/30 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Profesional</span>
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 py-6 text-center italic">No hay profesionales registrados en el cuadro médico.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-[#e2e8eb] rounded-xl hover:border-[#00aae1]/40 shadow-2xs transition-all space-y-2.5"
                >
                  {isEditable ? (
                    /* Editable Item Controls */
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#035476] mb-0.5">
                            Especialidad / Rol *
                          </label>
                          <input
                            type="text"
                            value={item.specialty}
                            onChange={(e) => handleItemChange(item.id, 'specialty', e.target.value)}
                            placeholder="Ej: Cardiología"
                            className="w-full text-xs p-1.5 bg-white border border-[#e2e8eb] rounded text-[#033d59] focus:outline-none focus:border-[#00aae1] font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#035476] mb-0.5">
                            Nombre del Profesional / IPS *
                          </label>
                          <input
                            type="text"
                            value={item.professional}
                            onChange={(e) => handleItemChange(item.id, 'professional', e.target.value)}
                            placeholder="Ej: Dr. Roberto Silva"
                            className="w-full text-xs p-1.5 bg-white border border-[#e2e8eb] rounded text-[#033d59] focus:outline-none focus:border-[#00aae1] font-bold"
                          />
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
              ))
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

