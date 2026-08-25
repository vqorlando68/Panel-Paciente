import React, { useState, useMemo } from 'react';
import { Patient, NoteEntry, UserRole, SpecialistInfo } from '../types';
import { X, Pencil, Stethoscope, Send, User, Clock, MessageSquare, Plus, UserCheck, FileText } from 'lucide-react';
import { EpicrisisViewer } from './EpicrisisViewer';

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

  const professionalBase = useMemo(() => {
    const map = new Map<string, string>();

    BASE_PROFESIONALES.forEach((p) => map.set(p.name, p.specialty));

    if (patient.cuadroMedico) {
      patient.cuadroMedico.forEach((cm) => {
        if (cm.professional && cm.professional !== '—' && cm.professional.toLowerCase() !== 'sin asignar') {
          map.set(cm.professional, cm.specialty || 'General');
        }
      });
    }

    if (patient.specialists) {
      Object.values(patient.specialists).forEach((s: SpecialistInfo) => {
        if (s && s.professionalName && s.professionalName !== '—' && s.professionalName.toLowerCase() !== 'sin asignar') {
          map.set(s.professionalName, s.specialistTitle || 'Especialidad');
        }
      });
    }

    return Array.from(map.entries()).map(([name, specialty]) => ({ name, specialty }));
  }, [patient]);

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex justify-end font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] h-full shadow-2xl flex flex-col border-l border-[#e2e8eb] dark:border-[#334155] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className={`p-4 border-b border-[#e2e8eb] dark:border-[#334155] flex items-center justify-between ${
          isOperational ? 'bg-[#f9fafb] dark:bg-[#0f172a]' : 'bg-[#effaff] dark:bg-[#00aae1]/10'
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
              <h3 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">
                {isOperational ? 'Notas Operativas (SIAU)' : 'Evolución y Epicrisis Clínica'}
              </h3>
              <p className="text-xs text-[#035476] dark:text-[#94a3b8]">
                {patient.nombre} • <span className="font-mono">{patient.identificacion}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#035476] dark:text-[#94a3b8] hover:text-[#033d59] dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Quick Context Strip */}
        <div className="bg-[#f9fafb] dark:bg-[#0f172a] px-4 py-2 border-b border-[#e2e8eb] dark:border-[#334155] flex items-center justify-between text-xs">
          <span className="text-[#035476] dark:text-[#94a3b8]">
            Convenio: <strong className="text-[#033d59] dark:text-[#f8fafc]">{patient.idConvenio}</strong>
          </span>
          <span className="text-[#035476] dark:text-[#94a3b8]">
            Coord: <strong className="text-[#033d59] dark:text-[#f8fafc]">{patient.coordinador}</strong>
          </span>
        </div>

        {/* Body Container (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9fafb]/50 dark:bg-[#0f172a]/50">
          {/* Epicrisis del Paciente (campo epicrisis_paciente del JSON de f_cargar_gestion) */}
          {!isOperational && (
            <EpicrisisViewer epicrisisRaw={patient.epicrisis} />
          )}

          {/* Notes Timeline Stream Header */}
          <div className="pt-2 border-t border-[#e2e8eb]/60 dark:border-[#334155]/60">
            <h4 className="text-[11px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider mb-2">
              Histórico de Evoluciones Clínicas
            </h4>
          </div>
          {notesList.length === 0 ? (
            <div className="text-center py-12 text-[#035476] dark:text-[#94a3b8] space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-[#035476]/40 dark:text-gray-600" />
              <p className="text-xs">No hay {isOperational ? 'notas operativas' : 'notas clínicas'} registradas para este paciente.</p>
              <p className="text-[11px] text-[#035476]/80 dark:text-gray-400">Escriba abajo para agregar la primera anotación.</p>
            </div>
          ) : (
            notesList.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-[#0f172a] rounded-lg p-3 border border-[#e2e8eb] dark:border-[#334155] shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-[#033d59] dark:text-[#f8fafc] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#00aae1]" />
                    {note.author} ({note.role})
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 font-mono text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {note.timestamp}
                  </span>
                </div>
                <p className="text-xs text-[#033d59] dark:text-[#f8fafc] whitespace-pre-wrap leading-relaxed font-sans">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Note Input Area */}
        <form onSubmit={handleAdd} className="p-3 bg-white dark:bg-[#1e293b] border-t border-[#e2e8eb] dark:border-[#334155] space-y-2 shrink-0">
          {isOperational && (
            <div className="bg-[#fff1f2] dark:bg-[#be123c]/20 p-2.5 rounded-lg border border-rose-200 dark:border-[#be123c]/40 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="isRehusoCheck" className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="isRehusoCheck"
                    checked={isRehuso}
                    onChange={(e) => setIsRehuso(e.target.checked)}
                    className="w-4 h-4 text-[#e11d48] rounded border-rose-300 focus:ring-[#e11d48] cursor-pointer"
                  />
                  <span>Registrar Novedad de Rehúso</span>
                </label>
                {isRehuso && (
                  <span className="px-2 py-0.5 rounded bg-[#e11d48] text-white font-bold text-[9px]">
                    REHÚSO ACTIVO
                  </span>
                )}
              </div>

              {isRehuso && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-rose-900 dark:text-rose-200 uppercase mb-0.5">Profesional *</label>
                    <input
                      type="text"
                      placeholder="Ej: Dr. Carlos Mendoza"
                      value={rehusoProfessional}
                      onChange={(e) => setRehusoProfessional(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white dark:bg-[#0f172a] border border-rose-300 dark:border-rose-800 rounded text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#e11d48]"
                      required={isRehuso}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-rose-900 dark:text-rose-200 uppercase mb-0.5">Especialidad *</label>
                    <input
                      type="text"
                      placeholder="Ej: Medicina General"
                      value={rehusoSpecialty}
                      onChange={(e) => setRehusoSpecialty(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white dark:bg-[#0f172a] border border-rose-300 dark:border-rose-800 rounded text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#e11d48]"
                      required={isRehuso}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              rows={2}
              placeholder={`Escriba una ${isOperational ? 'nota operativa' : 'nota clínica'}...`}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="flex-1 p-2.5 text-xs bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-xl text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1] resize-none"
            />
            <button
              type="submit"
              disabled={!newNoteContent.trim()}
              className="px-3.5 bg-[#00aae1] hover:bg-[#0196d4] text-white rounded-xl font-bold text-xs flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
