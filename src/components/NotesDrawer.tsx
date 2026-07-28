import React, { useState, useMemo } from 'react';
import { Patient, NoteEntry, UserRole, SpecialistInfo } from '../types';
import { X, Pencil, Stethoscope, Send, User, Clock, MessageSquare, Plus, UserCheck } from 'lucide-react';

interface NotesDrawerProps {
  patient: Patient;
  type: 'op' | 'cli';
  activeRole: UserRole;
  onAddNote: (
    patientId: string, 
    type: 'op' | 'cli', 
    noteContent: string, 
    rehusoInfo?: { isRehuso: boolean; professional: string; specialty: string }
  ) => void;
  onClose: () => void;
}

const BASE_PROFESIONALES = [
  { name: 'Dr. Carlos Mendoza', specialty: 'Medicina General' },
  { name: 'Lic. Mariana Gómez', specialty: 'Nutrición' },
  { name: 'Dra. Claudia Ruiz', specialty: 'Psicología' },
  { name: 'Dr. Roberto Silva', specialty: 'Cardiología' },
  { name: 'Dr. Andrés Parra', specialty: 'Nefrología' },
  { name: 'Dra. Sofía López', specialty: 'Endocrinología' },
  { name: 'Dr. Fernando Hoyos', specialty: 'Medicina Interna' },
  { name: 'Dra. Camila Morales', specialty: 'Medicina General' },
  { name: 'Dr. Juan Carlos Restrepo', specialty: 'Cardiología' },
  { name: 'Enf. Beatriz Viana', specialty: 'Enfermería' },
  { name: 'Dr. Alejandro Restrepo', specialty: 'Neumología' },
  { name: 'Dra. Patricia Gómez', specialty: 'Medicina Familiar' },
  { name: 'Dr. Gabriel Torres', specialty: 'Neurología' },
  { name: 'Dra. Elena Ramírez', specialty: 'Psiquiatría' },
  { name: 'Lic. Mónica Moreno', specialty: 'Trabajo Social' },
];

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  patient,
  type,
  activeRole,
  onAddNote,
  onClose,
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isRehuso, setIsRehuso] = useState(false);
  const [rehusoProfessional, setRehusoProfessional] = useState('');
  const [rehusoSpecialty, setRehusoSpecialty] = useState('');

  const notesList = type === 'op' ? patient.operationalNotes : patient.clinicalNotes;
  const isOperational = type === 'op';

  // Consolidated Base of Professionals & Specialties
  const professionalBase = useMemo(() => {
    const map = new Map<string, string>();

    // 1. Add static base professionals
    BASE_PROFESIONALES.forEach((p) => map.set(p.name, p.specialty));

    // 2. Add patient's cuadroMedico
    if (patient.cuadroMedico) {
      patient.cuadroMedico.forEach((cm) => {
        if (cm.professional && cm.specialty) {
          map.set(cm.professional, cm.specialty);
        }
      });
    }

    // 3. Add patient's specialists
    if (patient.specialists) {
      Object.values(patient.specialists).forEach((s) => {
        const spec = s as SpecialistInfo;
        if (spec?.professionalName && spec?.specialistTitle) {
          map.set(spec.professionalName, spec.specialistTitle);
        }
      });
    }

    return Array.from(map.entries()).map(([name, specialty]) => ({ name, specialty }));
  }, [patient]);

  const specialtyList = useMemo(() => {
    const set = new Set<string>();
    professionalBase.forEach((p) => {
      if (p.specialty) set.add(p.specialty);
    });
    return Array.from(set).sort();
  }, [professionalBase]);

  const handleProfessionalChange = (val: string) => {
    setRehusoProfessional(val);
    const match = professionalBase.find(
      (p) => p.name.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setRehusoSpecialty(match.specialty);
    }
  };

  const handleSpecialtyChange = (val: string) => {
    setRehusoSpecialty(val);
    const match = professionalBase.find(
      (p) => p.specialty.toLowerCase() === val.trim().toLowerCase()
    );
    if (match && !rehusoProfessional.trim()) {
      setRehusoProfessional(match.name);
    }
  };

  const handleSelectFromBase = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    if (!selectedName) return;
    const item = professionalBase.find((p) => p.name === selectedName);
    if (item) {
      setRehusoProfessional(item.name);
      setRehusoSpecialty(item.specialty);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    if (isRehuso && (!rehusoProfessional.trim() || !rehusoSpecialty.trim())) return;

    let fullContent = newNoteContent.trim();
    if (isOperational && isRehuso) {
      fullContent = `[REHÚSO REGISTRADO - Prof: ${rehusoProfessional.trim()} | Esp: ${rehusoSpecialty.trim()}]\n${fullContent}`;
    }

    onAddNote(
      patient.id, 
      type, 
      fullContent, 
      isOperational && isRehuso 
        ? { isRehuso: true, professional: rehusoProfessional.trim(), specialty: rehusoSpecialty.trim() } 
        : undefined
    );

    setNewNoteContent('');
    setIsRehuso(false);
    setRehusoProfessional('');
    setRehusoSpecialty('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-2xs flex justify-end animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8eb] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className={`p-4 border-b border-[#e2e8eb] flex items-center justify-between ${
          isOperational ? 'bg-[#f9fafb]' : 'bg-[#effaff]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
              isOperational ? 'bg-[#033d59]' : 'bg-[#00aae1]'
            }`}>
              {isOperational ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Stethoscope className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#033d59]">
                {isOperational ? 'Notas Operativas (SIAU)' : 'Notas Clínicas (Médicas)'}
              </h3>
              <p className="text-xs text-[#035476]">
                {patient.nombre} • <span className="font-mono">{patient.identificacion}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#035476] hover:text-[#033d59] rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Quick Context Strip */}
        <div className="bg-[#f9fafb] px-4 py-2 border-b border-[#e2e8eb] flex items-center justify-between text-xs">
          <span className="text-[#035476]">
            Convenio: <strong className="text-[#033d59]">{patient.idConvenio}</strong>
          </span>
          <span className="text-[#035476]">
            Coord: <strong className="text-[#033d59]">{patient.coordinador}</strong>
          </span>
        </div>

        {/* Notes Timeline Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f9fafb]/50">
          {notesList.length === 0 ? (
            <div className="text-center py-12 text-[#035476] space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-[#035476]/40" />
              <p className="text-xs">No hay {isOperational ? 'notas operativas' : 'notas clínicas'} registradas para este paciente.</p>
              <p className="text-[11px] text-[#035476]/80">Escriba abajo para agregar la primera anotación.</p>
            </div>
          ) : (
            notesList.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg p-3 border border-[#e2e8eb] shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-semibold text-[#033d59]">
                    <User className="w-3 h-3 text-[#00aae1]" />
                    <span>{note.author}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#effaff] text-[#00aae1] font-normal border border-[#00aae1]/20">
                      {note.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#035476] text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{note.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-[#033d59] leading-relaxed whitespace-pre-wrap pl-0.5">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Note Input Area */}
        {!isOperational && activeRole === 'coordinadora_siau' ? (
          <div className="p-4 bg-[#fff1f2] border-t border-rose-200 text-xs text-rose-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>Solo Consulta - Coordinadora SIAU</span>
            </p>
            <p className="text-[11px] text-rose-700 leading-snug">
              Las notas clínicas son de edición y creación exclusiva del Comité Médico.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="p-4 bg-white border-t border-[#e2e8eb] space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#035476]">
              <span className="font-semibold text-[#033d59]">Agregar Nueva Nota</span>
              <span className="text-[11px]">
                Autor: <strong className="text-[#00aae1]">{activeRole === 'comite_medico' ? 'Comité Médico' : 'Coordinación SIAU'}</strong>
              </span>
            </div>

            {/* Checkbox: Marcar Rehúso (Exclusivo Cuadro Médico / Comité Médico) */}
            {activeRole === 'comite_medico' ? (
              <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-2.5 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#e11d48]">
                  <input
                    type="checkbox"
                    checked={isRehuso}
                    onChange={(e) => setIsRehuso(e.target.checked)}
                    className="rounded border-rose-300 text-[#e11d48] focus:ring-[#e11d48] cursor-pointer"
                  />
                  <span>Marcar Rehúso</span>
                </label>

                {isRehuso && (
                  <div className="space-y-2 pt-1.5 border-t border-rose-200">
                    {/* Quick select from base */}
                    <div>
                      <label className="block text-[10px] font-bold text-rose-900 mb-0.5 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#e11d48]" />
                        <span>Seleccionar de Base de Profesional / Especialidad:</span>
                      </label>
                      <select
                        onChange={handleSelectFromBase}
                        className="w-full text-xs p-1.5 bg-white border border-rose-300 rounded text-[#033d59] focus:outline-none focus:border-[#e11d48] cursor-pointer"
                      >
                        <option value="">-- Buscar en Base de Profesionales --</option>
                        {professionalBase.map((p, idx) => (
                          <option key={idx} value={p.name}>
                            {p.name} ({p.specialty})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-rose-800 mb-0.5">
                          Nombre del Profesional *
                        </label>
                        <input
                          type="text"
                          list="profesionales-base-list"
                          required={isRehuso}
                          value={rehusoProfessional}
                          onChange={(e) => handleProfessionalChange(e.target.value)}
                          placeholder="Ej: Dr. Roberto Silva"
                          className="w-full text-xs p-1.5 bg-white border border-rose-300 rounded text-[#033d59] focus:outline-none focus:border-[#e11d48]"
                        />
                        <datalist id="profesionales-base-list">
                          {professionalBase.map((p, idx) => (
                            <option key={idx} value={p.name}>
                              {p.specialty}
                            </option>
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-rose-800 mb-0.5">
                          Especialidad *
                        </label>
                        <input
                          type="text"
                          list="especialidades-base-list"
                          required={isRehuso}
                          value={rehusoSpecialty}
                          onChange={(e) => handleSpecialtyChange(e.target.value)}
                          placeholder="Ej: Cardiología"
                          className="w-full text-xs p-1.5 bg-white border border-rose-300 rounded text-[#033d59] focus:outline-none focus:border-[#e11d48]"
                        />
                        <datalist id="especialidades-base-list">
                          {specialtyList.map((s, idx) => (
                            <option key={idx} value={s} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-[11px] text-gray-500 italic">
                El registro de Rehúso y sus datos de profesional y especialidad es exclusivo del Cuadro Médico. El coordinador SIAU solo lo visualiza.
              </div>
            )}

            <textarea
              rows={3}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder={
                isOperational
                  ? 'Escriba detalles de gestión de citas, autorizaciones, llamadas o novedades del paciente...'
                  : 'Escriba observaciones médicas, evoluciones, ajuste de medicamentos o decisiones del comité...'
              }
              className="w-full text-xs p-2.5 bg-white border border-[#e2e8eb] rounded-lg text-[#033d59] placeholder-[#035476]/60 focus:outline-none focus:border-[#00aae1] focus:ring-2 focus:ring-[#00aae1]/20 resize-none"
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={!newNoteContent.trim() || (isOperational && isRehuso && (!rehusoProfessional.trim() || !rehusoSpecialty.trim()))}
                className="text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] disabled:bg-[#e2e8eb] disabled:text-[#9ca3af] px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Guardar Nota
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
