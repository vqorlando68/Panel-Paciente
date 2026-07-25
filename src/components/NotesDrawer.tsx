import React, { useState } from 'react';
import { Patient, NoteEntry, UserRole } from '../types';
import { X, Pencil, Stethoscope, Send, User, Clock, MessageSquare, Plus } from 'lucide-react';

interface NotesDrawerProps {
  patient: Patient;
  type: 'op' | 'cli';
  activeRole: UserRole;
  onAddNote: (patientId: string, type: 'op' | 'cli', noteContent: string) => void;
  onClose: () => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  patient,
  type,
  activeRole,
  onAddNote,
  onClose,
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');

  const notesList = type === 'op' ? patient.operationalNotes : patient.clinicalNotes;
  const isOperational = type === 'op';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    onAddNote(patient.id, type, newNoteContent.trim());
    setNewNoteContent('');
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
        <form onSubmit={handleAdd} className="p-4 bg-white border-t border-[#e2e8eb] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#035476]">
            <span className="font-semibold text-[#033d59]">Agregar Nueva Nota</span>
            <span className="text-[11px]">
              Autor: <strong className="text-[#00aae1]">{activeRole === 'comite_medico' ? 'Comité Médico' : 'Coordinación SIAU'}</strong>
            </span>
          </div>

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
              disabled={!newNoteContent.trim()}
              className="text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] disabled:bg-[#e2e8eb] disabled:text-[#9ca3af] px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              Guardar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
