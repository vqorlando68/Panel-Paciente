import React, { useState } from 'react';
import { Patient, EstadoPaciente, NivelRiesgo, FasePaciente, COHORTE_OPTIONS, COORDINADORES_LIST } from '../types';
import { X, UserPlus, Plus } from 'lucide-react';

interface AddPatientModalProps {
  onAdd: (newPatient: Patient) => void;
  onClose: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ onAdd, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [idConvenio, setIdConvenio] = useState('SURA-8492');
  const [cohorte, setCohorte] = useState(COHORTE_OPTIONS[0].code);
  const [riesgo, setRiesgo] = useState<NivelRiesgo>('Medium');
  const [etiqueta, setEtiqueta] = useState('Prioritario');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [fase, setFase] = useState<FasePaciente>('E');
  const [coordinador, setCoordinador] = useState(COORDINADORES_LIST[0]);
  const [numeroCarga, setNumeroCarga] = useState('CARGA-104');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !identificacion) return;

    const newPatient: Patient = {
      id: `PAT-${Date.now().toString().slice(-4)}`,
      nombre,
      identificacion,
      telefono: telefono || '+57 300 000 0000',
      email: email || 'paciente@salud.com',
      direccion: direccion || 'Sin dirección registrada',
      idConvenio,
      cohorte,
      estado: 'Activo',
      riesgo,
      etiqueta,
      retroalimentacion,
      fase,
      acta: {
        numero: Math.floor(Math.random() * 100) + 100,
        fecha: new Date().toISOString().split('T')[0],
        resumen: 'Ingreso inicial registrado en sistema de monitoreo.',
      },
      coordinador,
      numeroCarga,
      specialists: {
        med_gen: {
          specialistTitle: 'Med. Gen.',
          professionalName: 'Dr. Carlos Mendoza',
          lastAttentionDate: new Date().toISOString().split('T')[0],
          frequency: 'Cada 30 días',
          targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          isOverdue: false,
        },
        nutri: {
          specialistTitle: 'Nutri.',
          professionalName: 'Lic. Mariana Gómez',
          lastAttentionDate: new Date().toISOString().split('T')[0],
          frequency: 'Cada 60 días',
          targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          isOverdue: false,
        },
        psicol: {
          specialistTitle: 'Psicol.',
          professionalName: 'Dra. Claudia Ruiz',
          lastAttentionDate: new Date().toISOString().split('T')[0],
          frequency: 'Cada 45 días',
          targetDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
          isOverdue: false,
        },
        esp_1: {
          specialistTitle: 'Especialidad 1',
          professionalName: 'Dr. Pendiente',
          lastAttentionDate: new Date().toISOString().split('T')[0],
          frequency: 'Trimestral',
          targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          isOverdue: false,
        },
        esp_2: {
          specialistTitle: 'Especialidad 2',
          professionalName: 'Dr. Pendiente',
          lastAttentionDate: new Date().toISOString().split('T')[0],
          frequency: 'Semestral',
          targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
          isOverdue: false,
        },
        esp_3: {
          specialistTitle: 'Especialidad 3',
          professionalName: 'Dr. Pendiente',
          lastAttentionDate: new Date().toISOString().split('T')[0],
          frequency: 'Anual',
          targetDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
          isOverdue: false,
        },
        esp_4: {
          specialistTitle: 'Especialidad 4',
          professionalName: 'Dr. Pendiente',
          lastAttentionDate: new Date().toISOString().split('T')[0],
          frequency: 'Anual',
          targetDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
          isOverdue: false,
        },
      },
      convenioNombre: 'EPS Suramericana Cuidate360',
      tasas: {
        cancelacionesPct: 0,
        cancelacionesNum: 0,
        inasistenciasPct: 0,
        inasistenciasNum: 0,
        reprogramacionesPct: 0,
        reprogramacionesNum: 0,
        history: [],
      },
      hasAlarm: false,
      alarmReasons: [],
      cuadroMedico: [
        { id: 'cm-1', specialty: 'Medicina General', professional: 'Dr. Carlos Mendoza', inNetwork: true, phone: '+57 300 111 2233' },
        { id: 'cm-2', specialty: 'Nutrición', professional: 'Lic. Mariana Gómez', inNetwork: true, phone: '+57 300 444 5566' },
      ],
      agenda: [],
      operationalNotes: [],
      clinicalNotes: [],
    };

    onAdd(newPatient);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold text-base">Registrar Nuevo Paciente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Nombre Completo *
              </label>
              <input
                type="text"
                placeholder="Ej: María Camila Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Identificación *
              </label>
              <input
                type="text"
                placeholder="Ej: CC 1.032.849.102"
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="+57 300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                ID Convenio
              </label>
              <input
                type="text"
                value={idConvenio}
                onChange={(e) => setIdConvenio(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Estado Cohorte
              </label>
              <select
                value={cohorte}
                onChange={(e) => setCohorte(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              >
                {COHORTE_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#effaff] p-3 rounded-lg border border-[#00aae1]/20">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Riesgo
              </label>
              <select
                value={riesgo}
                onChange={(e) => setRiesgo(e.target.value as NivelRiesgo)}
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2 py-1 text-[#033d59]"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Etiqueta
              </label>
              <input
                type="text"
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2 py-1 text-[#033d59]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Fase
              </label>
              <select
                value={fase}
                onChange={(e) => setFase(e.target.value as FasePaciente)}
                className="w-full bg-white border border-[#e2e8eb] rounded-md px-2 py-1 text-[#033d59]"
              >
                <option value="E">E - Evaluación</option>
                <option value="D">D - Diagnóstico</option>
                <option value="I">I - Intervención</option>
                <option value="M/E">M/E - Monit./Eval.</option>
              </select>
            </div>
          </div>

          {/* Retroalimentación Checkbox */}
          <div className="bg-[#fff1f2] p-3 rounded-lg border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="addRetroInconforme"
                checked={retroalimentacion === 'Inconforme'}
                onChange={(e) => setRetroalimentacion(e.target.checked ? 'Inconforme' : '')}
                className="w-4 h-4 text-[#00aae1] rounded border-rose-300 focus:ring-[#00aae1] cursor-pointer"
              />
              <label htmlFor="addRetroInconforme" className="text-xs font-semibold text-[#033d59] cursor-pointer select-none">
                Marcar Retroalimentación como <span className="text-rose-700 font-bold uppercase">Inconforme</span>
              </label>
            </div>
            {retroalimentacion === 'Inconforme' && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                Inconforme
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#035476] mb-1 uppercase">
                Coordinador
              </label>
              <select
                value={coordinador}
                onChange={(e) => setCoordinador(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              >
                {COORDINADORES_LIST.map((coord) => (
                  <option key={coord} value={coord}>
                    {coord}
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
                value={numeroCarga}
                onChange={(e) => setNumeroCarga(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
              />
            </div>
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
              className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
