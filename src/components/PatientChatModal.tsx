import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Patient, ColumnGroup } from '../types';
import { PatientService } from '../services/patientService';
import {
  MessageSquareText,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Code2,
  ChevronDown,
  Search,
  CheckCircle2,
  Stethoscope,
  LayoutList,
  Minimize2,
  AlertCircle,
  AlertTriangle,
  Activity,
  Heart,
  ShieldAlert,
} from 'lucide-react';

interface PatientChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  initialPatient?: Patient | null;
  columnGroup: ColumnGroup;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  sessionId?: string | null;
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Cuantas citas ha tenido el paciente',
  '¿Cuál fue el último contacto y por qué canal?',
  '¿Presenta señales de riesgo o barreras de adherencia?',
  'Recomendación para el abordaje del paciente',
  'Resumen de adherencia y citas pendientes',
];

const getInitials = (name?: string | null): string => {
  if (!name) return 'PA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getRiesgoBadgeStyle = (riesgo?: string | null): string => {
  const r = (riesgo || '').toLowerCase();
  if (r.includes('crit') || r.includes('critical')) {
    return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  }
  if (r.includes('alto') || r.includes('high')) {
    return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  }
  if (r.includes('med') || r.includes('medium') || r.includes('mod')) {
    return 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
  }
  return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
};

/**
 * Renderizador ligero y estilizado de texto Markdown (negritas, cursivas, viñetas, citas)
 */
const FormattedMarkdownText: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = useMemo(() => {
    return content.split(/\n\s*\n/);
  }, [content]);

  const renderInline = (text: string) => {
    // Dividir por negritas **texto**
    const parts = text.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-[#033d59] dark:text-[#38bdf8]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={idx} className="italic text-[#035476] dark:text-[#93c5fd]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-[#0f172a] dark:text-[#e2e8f0]">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Lista de viñetas con * o -
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={pIdx} className="space-y-1.5 my-2 pl-2">
              {lines.map((line, lIdx) => {
                const bulletText = line.replace(/^[\*\-]\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00aae1] dark:bg-[#38bdf8] shrink-0 mt-1.5" />
                    <span className="flex-1">{renderInline(bulletText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Cita o recomendación destacada
        if (trimmed.startsWith('> ') || trimmed.startsWith('**Recomendación')) {
          return (
            <div
              key={pIdx}
              className="my-2.5 p-3.5 rounded-xl bg-[#effaff] dark:bg-[#00aae1]/10 border-l-4 border-[#00aae1] dark:border-[#38bdf8] text-[#035476] dark:text-[#cbd5e1] shadow-2xs"
            >
              {renderInline(trimmed.replace(/^>\s*/, ''))}
            </div>
          );
        }

        return <p key={pIdx}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
};

export const PatientChatModal: React.FC<PatientChatModalProps> = ({
  isOpen,
  onClose,
  patients,
  initialPatient,
  columnGroup,
}) => {
  // Paciente actualmente seleccionado para el chat
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [questionInput, setQuestionInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messagesByPatient, setMessagesByPatient] = useState<Record<string, ChatMessage[]>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSqlViewer, setShowSqlViewer] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Estado para el selector personalizado bonito de paciente
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState<boolean>(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  const [appPatients, setAppPatients] = useState<Patient[]>([]);
  const [isSearchingAppPatients, setIsSearchingAppPatients] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Rol computado según el requerimiento:
  // "en rol va 'coordinator' cuando esta parado en el Grupo Coordinador, si esta en el Grupo Clínico debe enviar doctor"
  const currentRole: 'coordinator' | 'doctor' = columnGroup === 'clinico' ? 'doctor' : 'coordinator';

  // Cargar lista inicial de pacientes del aplicativo (paciente_giris = 'S') al abrir
  useEffect(() => {
    if (isOpen) {
      PatientService.searchAllPatientsChat().then((list) => {
        if (list && list.length > 0) {
          setAppPatients(list);
        }
      });
    }
  }, [isOpen]);

  // Búsqueda remota en la base de datos Oracle al escribir en el buscador
  useEffect(() => {
    if (!isOpen || !isPatientDropdownOpen) return;
    const timer = setTimeout(() => {
      setIsSearchingAppPatients(true);
      PatientService.searchAllPatientsChat(patientSearchTerm)
        .then((results) => {
          if (results && results.length > 0) {
            setAppPatients(results);
          }
        })
        .finally(() => {
          setIsSearchingAppPatients(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [patientSearchTerm, isOpen, isPatientDropdownOpen]);

  // Combinar los pacientes de la pantalla con los del aplicativo (paciente_giris = 'S')
  const allSelectablePatients = useMemo(() => {
    const map = new Map<string, Patient>();
    // Prioridad 1: pacientes de la pantalla
    patients.forEach((p) => {
      if (p.identificacion) map.set(String(p.identificacion), p);
    });
    // Prioridad 2: pacientes del aplicativo completo
    appPatients.forEach((p) => {
      if (p.identificacion && !map.has(String(p.identificacion))) {
        map.set(String(p.identificacion), p);
      }
    });
    return Array.from(map.values());
  }, [patients, appPatients]);

  // Sincronizar paciente inicial al abrir o cambiar
  useEffect(() => {
    if (initialPatient && initialPatient.identificacion) {
      setSelectedPatientId(initialPatient.identificacion);
    } else if (allSelectablePatients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(allSelectablePatients[0].identificacion);
    }
  }, [initialPatient, allSelectablePatients]);

  // Cerrar dropdown de selección al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };
    if (isPatientDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPatientDropdownOpen]);

  // Obtener objeto de paciente seleccionado
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId && allSelectablePatients.length > 0) return allSelectablePatients[0];
    return allSelectablePatients.find((p) => String(p.identificacion) === String(selectedPatientId)) || allSelectablePatients[0] || null;
  }, [selectedPatientId, allSelectablePatients]);

  // Pacientes filtrados en el buscador del dropdown
  const filteredPatientsForSelector = useMemo(() => {
    if (!patientSearchTerm.trim()) return allSelectablePatients;
    const term = patientSearchTerm.toLowerCase();
    return allSelectablePatients.filter((p) => {
      const name = (p.nombreCompleto || p.nombre || '').toLowerCase();
      const id = String(p.identificacion || '').toLowerCase();
      const cohorte = (p.cohorte || '').toLowerCase();
      return name.includes(term) || id.includes(term) || cohorte.includes(term);
    });
  }, [allSelectablePatients, patientSearchTerm]);

  // Mensajes para el paciente actual
  const currentMessages = useMemo(() => {
    const key = selectedPatient ? String(selectedPatient.identificacion) : 'default';
    return messagesByPatient[key] || [];
  }, [selectedPatient, messagesByPatient]);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (!isMinimized && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, isLoading, isOpen, isMinimized]);

  if (!isOpen) return null;

  // Manejar envío de mensaje
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || questionInput).trim();
    if (!text || !selectedPatient || isLoading) return;

    const patientKey = String(selectedPatient.identificacion);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    // Actualizar historial con mensaje del usuario
    setMessagesByPatient((prev) => ({
      ...prev,
      [patientKey]: [...(prev[patientKey] || []), userMsg],
    }));

    setQuestionInput('');
    setIsLoading(true);

    try {
      const response = await PatientService.sendPatientChatMessage({
        identificacion: selectedPatient.identificacion,
        question: text,
        rol: currentRole,
      });

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sessionId: response.session_id,
        isError: !response.success,
      };

      setMessagesByPatient((prev) => ({
        ...prev,
        [patientKey]: [...(prev[patientKey] || []), assistantMsg],
      }));
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error al procesar la respuesta: ${err?.message || 'Error de conexión'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };

      setMessagesByPatient((prev) => ({
        ...prev,
        [patientKey]: [...(prev[patientKey] || []), errorMsg],
      }));
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (!selectedPatient) return;
    const patientKey = String(selectedPatient.identificacion);
    setMessagesByPatient((prev) => {
      const next = { ...prev };
      delete next[patientKey];
      return next;
    });
  };

  // Generar script PL/SQL exacto para visualización
  const generatedSqlScript = `declare
    v_json_entrada  CLOB;
    v_json_salida   CLOB;
begin
    v_json_entrada := '{
  "identificacion": "${selectedPatient?.identificacion || '12345678'}",
  "metodo": "/patients/{id}/chat",
  "cuerpo": {
    "question": "${questionInput.trim() || 'Cuantas citas ha tenido el paciente'}",
    "rol": "${currentRole}"
  }
}';
    pkgln_big_query.p_chat_usuario_cohorte(v_json_entrada, v_json_salida);
    dbms_output.put_line(v_json_salida);
end;`;

  const patientName = selectedPatient?.nombreCompleto || selectedPatient?.nombre || 'Paciente';

  // Si está minimizado, mostrar botón flotante expandible
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#008cb9] to-[#00c0f7] text-white font-bold shadow-xl shadow-[#00aae1]/30 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border border-white/20"
          title="Restaurar Chat IA"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="text-xs">Chat Asistente IA</span>
          {selectedPatient && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium max-w-[130px] truncate">
              {patientName}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-2xl h-[92vh] max-h-[820px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] flex flex-col overflow-hidden transition-all">
        {/* Header Principal con Gradiente */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#033d59] via-[#035476] to-[#008cb9] text-white flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#7ee787] shadow-inner border border-white/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Asistente IA Teker
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </h3>
                {/* Badge de Rol actual */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs ${
                    currentRole === 'coordinator'
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/50'
                      : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/50'
                  }`}
                  title={
                    currentRole === 'coordinator'
                      ? 'Grupo Coordinador activo: enviando rol "coordinator"'
                      : 'Grupo Clínico activo: enviando rol "doctor"'
                  }
                >
                  {currentRole === 'coordinator' ? (
                    <>
                      <LayoutList className="w-2.5 h-2.5" />
                      Rol: coordinator
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-2.5 h-2.5" />
                      Rol: doctor
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-white/85 truncate max-w-sm">
                Consulta clínica 360° para <strong className="text-white font-bold">{patientName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowSqlViewer(!showSqlViewer)}
              className={`p-1.5 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer ${
                showSqlViewer ? 'bg-white/25 text-white shadow-inner' : 'hover:bg-white/15'
              }`}
              title={showSqlViewer ? 'Ocultar Script PL/SQL' : 'Ver Script PL/SQL generado'}
            >
              <Code2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Minimizar ventana de chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Cerrar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Selección de Paciente (Diseño Bonito con Tarjeta y Dropdown interactivo) */}
        <div ref={dropdownRef} className="relative px-5 py-2.5 bg-[#f1f5f9] dark:bg-[#0f172a] border-b border-[#e2e8eb] dark:border-[#334155] shrink-0 z-30">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Tarjeta de Paciente Seleccionado */}
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <button
                type="button"
                onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] hover:border-[#00aae1] dark:hover:border-[#38bdf8] shadow-xs hover:shadow-md transition-all cursor-pointer group text-left"
                title="Clic para seleccionar otro paciente de la pantalla actual"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* Avatar con Iniciales y Gradiente */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#035476] to-[#00aae1] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-inner ring-2 ring-white dark:ring-[#1e293b]">
                    {getInitials(patientName)}
                  </div>

                  {/* Datos del Paciente */}
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#033d59] dark:text-[#f8fafc] group-hover:text-[#00aae1] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                        {patientName}
                      </span>
                      {selectedPatient?.riesgo && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${getRiesgoBadgeStyle(selectedPatient.riesgo)}`}>
                          {selectedPatient.riesgo}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#035476] dark:text-[#94a3b8] font-medium pt-0.5">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10.5px] text-[#033d59] dark:text-[#cbd5e1]">
                        {selectedPatient?.tipoIdentificacion || 'CC'} {selectedPatient?.identificacion || '—'}
                      </span>
                      <span>•</span>
                      <span className="text-[#00aae1] dark:text-[#38bdf8] font-semibold truncate max-w-[140px]">
                        {selectedPatient?.cohorte || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón Cambiar Paciente */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#effaff] dark:bg-[#00aae1]/10 text-[#00aae1] dark:text-[#38bdf8] font-bold text-xs border border-[#00aae1]/20 group-hover:bg-[#00aae1] group-hover:text-white transition-all shrink-0">
                  <span className="hidden sm:inline">Cambiar</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPatientDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </div>

            {currentMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="flex items-center gap-1 text-[11px] font-medium text-[#64748b] dark:text-[#94a3b8] hover:text-[#e11d48] dark:hover:text-[#f43f5e] transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                title="Borrar historial de preguntas de este paciente"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {/* Menú Desplegable Flotante para Selección de Pacientes */}
          {isPatientDropdownOpen && (
            <div className="absolute left-5 right-5 top-[60px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-[#cbd5e1] dark:border-[#334155] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Buscador de pacientes del aplicativo */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  placeholder="Buscar cualquier paciente (paciente_giris = 'S') por nombre o cédula..."
                  className="w-full text-xs bg-[#f8fafc] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] border border-[#cbd5e1] dark:border-[#475569] rounded-xl pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#00aae1]/50 placeholder:text-[#94a3b8]"
                  autoFocus
                />
                {isSearchingAppPatients && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[#00aae1] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00aae1] animate-ping" />
                    <span>Buscando...</span>
                  </div>
                )}
              </div>

              {/* Lista scrollable de pacientes */}
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider px-2 py-1">
                  <span>Pacientes del aplicativo (paciente_giris = 'S'):</span>
                  <span className="font-mono text-[#00aae1] dark:text-[#38bdf8] font-bold">
                    {filteredPatientsForSelector.length} {filteredPatientsForSelector.length === 1 ? 'paciente' : 'pacientes'}
                  </span>
                </div>
                {filteredPatientsForSelector.length === 0 ? (
                  <div className="text-xs text-center py-5 text-[#94a3b8] italic">
                    {isSearchingAppPatients ? 'Consultando en la base de datos...' : `No se encontró ningún paciente con "${patientSearchTerm}"`}
                  </div>
                ) : (
                  filteredPatientsForSelector.map((p) => {
                    const isSelected = String(p.identificacion) === String(selectedPatient?.identificacion);
                    const pName = p.nombreCompleto || p.nombre || 'Sin nombre';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(p.identificacion);
                          setIsPatientDropdownOpen(false);
                          setPatientSearchTerm('');
                        }}
                        className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#effaff] dark:bg-[#00aae1]/15 border border-[#00aae1] dark:border-[#38bdf8] shadow-xs'
                            : 'hover:bg-gray-100 dark:hover:bg-[#0f172a] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-[#00aae1] text-white shadow-xs'
                              : 'bg-gray-200 dark:bg-gray-700 text-[#033d59] dark:text-gray-200'
                          }`}>
                            {getInitials(pName)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold truncate ${
                                isSelected ? 'text-[#00aae1] dark:text-[#38bdf8]' : 'text-[#033d59] dark:text-[#f8fafc]'
                              }`}>
                                {pName}
                              </span>
                              {p.riesgo && (
                                <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${getRiesgoBadgeStyle(p.riesgo)}`}>
                                  {p.riesgo}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                              <span className="font-mono">{p.tipoIdentificacion || 'CC'} {p.identificacion}</span>
                              <span>•</span>
                              <span className="truncate">{p.cohorte || 'General'}</span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#00aae1] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Visor opcional del Script PL/SQL */}
        {showSqlViewer && (
          <div className="px-5 py-3 bg-[#0f172a] text-[#38bdf8] border-b border-[#1e293b] font-mono text-[11px] shrink-0 relative animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-white/60 text-[10px] uppercase font-bold tracking-wider">
              <span>Script PL/SQL que se ejecutará en Oracle:</span>
              <button
                type="button"
                onClick={() => handleCopy(generatedSqlScript, 'sql-script')}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                {copiedId === 'sql-script' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre leading-snug max-h-36 scrollbar-thin text-white/90">
              {generatedSqlScript}
            </pre>
          </div>
        )}

        {/* Cuerpo de Mensajes del Chat */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-[#1e293b]">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4">
              {/* Tarjeta Hero del Paciente Activo */}
              <div className="w-full max-w-md p-4 rounded-2xl bg-gradient-to-br from-[#effaff] to-[#f8fafc] dark:from-[#00aae1]/10 dark:to-[#0f172a] border border-[#00aae1]/25 dark:border-[#00aae1]/30 shadow-xs flex items-center gap-3.5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#008cb9] to-[#00c0f7] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md ring-4 ring-white dark:ring-[#1e293b]">
                  {getInitials(patientName)}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#033d59] dark:text-[#f8fafc] truncate">
                      {patientName}
                    </h4>
                    {selectedPatient?.riesgo && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${getRiesgoBadgeStyle(selectedPatient.riesgo)}`}>
                        {selectedPatient.riesgo}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#035476] dark:text-[#94a3b8] font-medium pt-0.5">
                    ID: <strong className="font-mono">{selectedPatient?.identificacion || '—'}</strong> • Cohorte: <strong className="text-[#00aae1] dark:text-[#38bdf8]">{selectedPatient?.cohorte || 'General'}</strong>
                  </p>
                  {selectedPatient?.convenioNombre && (
                    <p className="text-[10px] text-[#64748b] dark:text-[#64748b] truncate pt-0.5">
                      {selectedPatient.convenioNombre}
                    </p>
                  )}
                </div>
              </div>

              <div className="max-w-md space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-[#033d59] dark:text-[#f8fafc]">
                  ¿Qué deseas consultar sobre este paciente?
                </h4>
                <p className="text-xs text-[#035476] dark:text-[#94a3b8] leading-relaxed">
                  El Asistente IA consultará la base de datos para entregarte citas atendidas, fechas de último contacto, barreras operativas y recomendaciones.
                </p>
              </div>

              {/* Sugerencias de Preguntas */}
              <div className="w-full max-w-lg pt-1">
                <p className="text-[11px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider mb-2 text-left">
                  Preguntas sugeridas:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(sug)}
                      disabled={isLoading || !selectedPatient}
                      className="text-left text-xs bg-[#effaff] dark:bg-[#0f172a] hover:bg-[#00aae1]/15 text-[#035476] dark:text-[#38bdf8] border border-[#00aae1]/25 rounded-xl px-3 py-1.5 transition-all cursor-pointer hover:border-[#00aae1]/50 shadow-2xs disabled:opacity-50"
                    >
                      💡 {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#008cb9] to-[#00c0f7] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 ring-2 ring-white dark:ring-[#1e293b]">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] sm:max-w-[82%] rounded-2xl p-4 shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-[#008cb9] to-[#00aae1] text-white rounded-br-none shadow-md shadow-[#00aae1]/20'
                        : msg.isError
                        ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-200 rounded-bl-none'
                        : 'bg-[#f8fafc] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-bl-none'
                    }`}
                  >
                    {/* Encabezado del mensaje */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] opacity-75">
                      <span className="font-bold">
                        {isUser ? 'Tú' : 'Asistente Clínico IA'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Contenido del mensaje */}
                    {isUser ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-normal">
                        {msg.text}
                      </p>
                    ) : msg.isError ? (
                      <div className="flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-rose-800 dark:text-rose-300">
                            Aviso / Error del servicio
                          </p>
                          <div className="font-mono text-[11px] bg-white/90 dark:bg-black/40 border border-rose-200 dark:border-rose-900/60 p-2 rounded-lg break-all select-all shadow-inner text-rose-950 dark:text-rose-100">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FormattedMarkdownText content={msg.text} />
                    )}

                    {/* Botón para copiar respuesta del asistente */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                        <span className="text-[10px] italic">
                          {msg.sessionId ? `Sesión: ${msg.sessionId.slice(0, 8)}...` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 hover:text-[#00aae1] dark:hover:text-[#38bdf8] transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                          title="Copiar texto de la respuesta"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#035476] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Indicador de Carga */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#008cb9] to-[#00c0f7] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#f8fafc] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-2xl rounded-bl-none p-3.5 text-xs text-[#035476] dark:text-[#94a3b8] flex items-center gap-2 shadow-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00aae1] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#00aae1] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#00aae1] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Consultando con la base de datos Oracle vía pkgln_big_query...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input Box */}
        <div className="p-3 sm:p-4 bg-[#f8fafc] dark:bg-[#0f172a] border-t border-[#e2e8eb] dark:border-[#334155] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu propia pregunta"
                rows={2}
                disabled={isLoading || !selectedPatient}
                className="w-full text-xs sm:text-sm bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#f8fafc] border border-[#cbd5e1] dark:border-[#475569] rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#00aae1]/50 resize-none transition-all placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] shadow-2xs disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !questionInput.trim() || !selectedPatient}
              className="h-[44px] px-4 rounded-xl bg-gradient-to-r from-[#008cb9] to-[#00aae1] hover:from-[#007b9e] hover:to-[#009acb] active:scale-95 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#00aae1]/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Enviar pregunta (Enter)"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Enviar</span>
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[10px] text-[#64748b] dark:text-[#94a3b8] px-1">
            <span>
              Presiona <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-[9px]">Enter</kbd> para enviar,{' '}
              <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-[9px]">Shift+Enter</kbd> para nueva línea
            </span>
            <span className="font-semibold text-[#035476] dark:text-[#38bdf8] truncate max-w-[280px] text-right">
              Paciente: <strong className="font-bold text-[#033d59] dark:text-white">{patientName}</strong> ({selectedPatient?.identificacion || '—'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
