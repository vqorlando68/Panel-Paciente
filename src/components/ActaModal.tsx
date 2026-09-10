import React, { useState, useEffect } from 'react';
import { Patient, UserRole, ActaInfo, ActaUsuarioDB } from '../types';
import { PatientService } from '../services/patientService';
import { VerActaModal } from './VerActaModal';
import {
  X,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Plus,
  Save,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
  Building2,
  UserCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface ActaModalProps {
  patient: Patient;
  activeRole?: UserRole;
  initialMode?: 'view' | 'create';
  onSaveActa?: (patientId: string, newActa: ActaInfo) => void;
  onClose: () => void;
}

const formatActaDate = (rawDate?: string | null): string => {
  if (!rawDate) return '—';
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch (e) {}
  return String(rawDate).replace('T', ' ');
};

export const ActaModal: React.FC<ActaModalProps> = ({
  patient,
  activeRole,
  initialMode = 'view',
  onSaveActa,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'create'>(initialMode);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [selectedActaIdForDetail, setSelectedActaIdForDetail] = useState<number | string | null>(null);
  
  // Actas loaded from Oracle DB (pkgcn_cohortes.p_actas_x_usuario)
  const [actasDb, setActasDb] = useState<ActaUsuarioDB[]>([]);
  const [loadingActas, setLoadingActas] = useState<boolean>(true);

  const fetchActas = async () => {
    setLoadingActas(true);
    try {
      const data = await PatientService.getActasPorUsuario(patient.id);
      setActasDb(data);
    } catch (err) {
      console.error('Error cargando actas de paciente:', err);
    } finally {
      setLoadingActas(false);
    }
  };

  useEffect(() => {
    fetchActas();
  }, [patient.id]);

  // New Acta Form State
  const nextNum = (actasDb[0]?.id_acta || patient.acta?.numero || 100) + 1;
  const [actaNumero, setActaNumero] = useState<number>(nextNum);
  const [actaFecha, setActaFecha] = useState<string>(
    new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [actaResumen, setActaResumen] = useState<string>('');
  const [actaIntegrantes, setActaIntegrantes] = useState<string>(
    'Dra. Camila Morales (Líder Comité), Dr. Juan Carlos Restrepo (Cardiólogo), Enf. Beatriz Viana'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const isComite = activeRole === 'comite_medico';

  const currentActa = patient.acta && patient.acta.numero > 0 ? [patient.acta] : [];
  const historyActas = patient.actasHistory || [];
  const fallbackActas: ActaInfo[] = [
    ...currentActa,
    ...historyActas.filter(a => !currentActa.some(c => c.numero === a.numero))
  ];

  // Total de actas registradas para el paciente (la última que se muestra arriba + las anteriores)
  const totalActas = actasDb.length > 0 ? actasDb.length : fallbackActas.length;
  // Solo se muestra el bloque de Historial de Actas si existe más de una acta
  const hasMultipleActas = totalActas > 1;
  // En el Historial de Actas inferior solo se incluyen las actas anteriores (excluyendo la primera/última)
  const historialActasDb = actasDb.length > 1 ? actasDb.slice(1) : [];
  const historialFallback = fallbackActas.length > 1 ? fallbackActas.slice(1) : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actaResumen.trim()) return;

    const newActa: ActaInfo = {
      numero: actaNumero,
      fecha: actaFecha,
      resumen: actaResumen,
      integrantes: actaIntegrantes.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (onSaveActa) {
      onSaveActa(patient.id, newActa);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab('view');
      setExpandedIndex(0);
      fetchActas();
    }, 1200);
  };

  const modalTitle = activeTab === 'create'
    ? 'Registrar Nueva Acta del Comité'
    : actasDb.length > 0
    ? `Acta de Comité Médico #${actasDb[0].id_acta}`
    : patient.acta?.numero
    ? `Acta de Comité Médico #${patient.acta.numero}`
    : 'Actas de Comité Médico';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] rounded-2xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {modalTitle}
              </h3>
              <p className="text-xs text-white/80">{patient.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-[#e2e8eb] dark:border-[#334155] bg-[#f9fafb] dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'view'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b]'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Actas Registradas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b]'
                : 'border-transparent text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Acta</span>
          </button>
        </div>

        {/* Tab 1: View Actas */}
        {activeTab === 'view' && (
          <div className="p-5 space-y-4 text-xs text-[#033d59] dark:text-[#f8fafc] flex-1 overflow-y-auto">
            {/* Loading Indicator */}
            {loadingActas && (
              <div className="p-4 bg-[#effaff] dark:bg-[#00aae1]/10 rounded-xl border border-[#00aae1]/30 flex items-center justify-center gap-2.5 text-[#00aae1] dark:text-[#38bdf8] text-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Consultando actas registradas... (pkgcn_cohortes.p_actas_x_usuario)</span>
              </div>
            )}

            {/* Latest Acta Banner from Oracle DB or local patient */}
            {!loadingActas && actasDb.length > 0 && (
              <div className="space-y-3 p-4 bg-[#f0f9ff] dark:bg-[#00aae1]/10 rounded-xl border border-[#00aae1]/30">
                <div className="flex items-center justify-between pb-2 border-b border-[#00aae1]/20 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#00aae1] text-white font-mono font-bold text-xs">
                      #{actasDb[0].id_acta}
                    </span>
                    <span className="font-bold text-[#033d59] dark:text-[#f8fafc]">Última Acta Registrada</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedActaIdForDetail(actasDb[0].id_acta)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00aae1] hover:bg-[#0196d4] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title="Ver información clínica completa del acta llamando a pkgcn_cohortes.f_ver_acta"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Información Completa</span>
                    </button>
                    <span className="flex items-center gap-1 text-[#035476] dark:text-[#38bdf8] font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                      {formatActaDate(actasDb[0].fecha_acta)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] dark:bg-emerald-950 text-[#01ae6c] dark:text-emerald-300 text-[10px] font-bold border border-[#01ae6c]/20 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Aprobada
                    </span>
                  </div>
                </div>

                {/* Metadata Row: Convenio & Firmante */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white/60 dark:bg-[#0f172a]/60 p-2 rounded-lg border border-[#e2e8eb]/80 dark:border-[#334155]/80">
                  {actasDb[0].nombre_convenio && (
                    <div className="flex items-center gap-1.5 text-[#035476] dark:text-[#94a3b8]">
                      <Building2 className="w-3.5 h-3.5 text-[#00aae1] shrink-0" />
                      <span className="font-medium truncate" title={actasDb[0].nombre_convenio}>
                        {actasDb[0].nombre_convenio}
                      </span>
                    </div>
                  )}
                  {actasDb[0].usuario_firma && (
                    <div className="flex items-center gap-1.5 text-[#035476] dark:text-[#94a3b8]">
                      <UserCheck className="w-3.5 h-3.5 text-[#01ae6c] shrink-0" />
                      <span className="font-medium truncate" title={actasDb[0].usuario_firma}>
                        Firma: {actasDb[0].usuario_firma}
                      </span>
                    </div>
                  )}
                </div>

                {/* Análisis y Plan */}
                {actasDb[0].analisis_plan && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#00aae1] dark:text-[#38bdf8] uppercase tracking-wider text-[10px]">
                      Análisis y Plan
                    </h4>
                    <p className="text-xs text-[#033d59] dark:text-[#f8fafc] leading-relaxed whitespace-pre-wrap font-sans">
                      {actasDb[0].analisis_plan}
                    </p>
                  </div>
                )}

                {/* Observaciones Clínicas */}
                {actasDb[0].observaciones && (
                  <div className="space-y-1 pt-1 border-t border-[#00aae1]/10">
                    <h4 className="font-bold text-[#035476] dark:text-[#94a3b8] uppercase tracking-wider text-[10px]">
                      Observaciones Clínicas
                    </h4>
                    <p className="text-xs text-[#033d59] dark:text-[#f8fafc] leading-relaxed whitespace-pre-wrap font-sans">
                      {actasDb[0].observaciones}
                    </p>
                  </div>
                )}

                {/* Observaciones Operativas */}
                {actasDb[0].observaciones_operativas && (
                  <div className="space-y-1 pt-1 border-t border-[#00aae1]/10">
                    <h4 className="font-bold text-[#b45309] dark:text-[#fbbf24] uppercase tracking-wider text-[10px]">
                      Observaciones Operativas
                    </h4>
                    <p className="text-xs text-[#033d59] dark:text-[#f8fafc] leading-relaxed whitespace-pre-wrap font-sans">
                      {actasDb[0].observaciones_operativas}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Fallback to patient.acta if actasDb is empty and not loading */}
            {!loadingActas && actasDb.length === 0 && patient.acta && (
              <div className="space-y-3 p-3.5 bg-[#f0f9ff] dark:bg-[#00aae1]/10 rounded-xl border border-[#00aae1]/30">
                <div className="flex items-center justify-between pb-2 border-b border-[#00aae1]/20">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#00aae1] text-white font-mono font-bold text-xs">
                      #{patient.acta.numero}
                    </span>
                    <span className="font-bold text-[#033d59] dark:text-[#f8fafc]">Última Acta Registrada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[#035476] dark:text-[#38bdf8] font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                      {patient.acta.fecha}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] dark:bg-emerald-950 text-[#01ae6c] dark:text-emerald-300 text-[10px] font-bold border border-[#01ae6c]/20 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Aprobada
                    </span>
                  </div>
                </div>

                {patient.acta.observaciones_clinicas ? (
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#00aae1] dark:text-[#38bdf8] uppercase tracking-wider text-[10px]">
                      Observaciones Clínicas
                    </h4>
                    <p className="text-xs text-[#033d59] dark:text-[#f8fafc] leading-relaxed whitespace-pre-wrap font-sans">
                      {patient.acta.observaciones_clinicas}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider text-[10px]">
                      Resumen de Decisiones
                    </h4>
                    <p className="text-xs text-[#033d59] dark:text-[#f8fafc] leading-relaxed whitespace-pre-wrap font-sans">
                      {patient.acta.resumen}
                    </p>
                  </div>
                )}

                {patient.acta.observaciones_operativas && (
                  <div className="space-y-1 pt-1 border-t border-[#00aae1]/10">
                    <h4 className="font-bold text-[#b45309] dark:text-[#fbbf24] uppercase tracking-wider text-[10px]">
                      Observaciones Operativas
                    </h4>
                    <p className="text-xs text-[#033d59] dark:text-[#f8fafc] leading-relaxed whitespace-pre-wrap font-sans">
                      {patient.acta.observaciones_operativas}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje si no hay actas registradas */}
            {!loadingActas && totalActas === 0 && (
              <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-xs bg-gray-50 dark:bg-[#0f172a] rounded-xl border border-dashed border-[#e2e8eb] dark:border-[#334155]">
                No hay actas registradas para este paciente.
              </div>
            )}

            {/* Historial de Actas Accordion (Solo se muestra si existe más de una acta) */}
            {hasMultipleActas && (
              <div className="pt-2 border-t border-[#e2e8eb] dark:border-[#334155]">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="font-bold text-[#033d59] dark:text-[#f8fafc] uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span>Historial de Actas</span>
                    <span className="text-[10px] font-mono text-gray-400 font-normal">
                      ({totalActas} {totalActas === 1 ? 'acta' : 'actas'})
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={fetchActas}
                    disabled={loadingActas}
                    className="p-1 text-gray-400 hover:text-[#00aae1] transition-colors rounded cursor-pointer"
                    title="Actualizar actas desde Oracle BD"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingActas ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {actasDb.length > 0 && historialActasDb.length > 0 ? (
                  /* Render from Oracle DB actas (anteriores) */
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {historialActasDb.map((actaItem, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const previewText = actaItem.analisis_plan || actaItem.observaciones || 'Acta Registrada';
                    const shortDesc =
                      previewText.length > 45 ? `${previewText.slice(0, 45)}...` : previewText;

                    return (
                      <div
                        key={`${actaItem.id_acta}-${idx}`}
                        className="rounded-lg border border-[#e2e8eb] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#0f172a] shadow-2xs transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                          className="w-full p-2.5 flex items-center justify-between gap-2 hover:bg-[#effaff]/60 dark:hover:bg-[#334155]/60 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="px-2 py-0.5 rounded bg-[#033d59] text-white font-mono font-bold text-[10px] shrink-0">
                              #{actaItem.id_acta}
                            </span>
                            <span className="text-[#035476] dark:text-[#38bdf8] font-mono font-semibold text-[11px] shrink-0">
                              {formatActaDate(actaItem.fecha_acta)}
                            </span>
                            <span className="text-gray-300 shrink-0">•</span>
                            <span className="text-[#033d59] dark:text-[#f8fafc] font-medium text-[11px] truncate flex-1 min-w-0">
                              {shortDesc}
                            </span>
                          </div>

                          <div className="p-0.5 rounded text-gray-400 hover:text-[#00aae1] shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#00aae1]" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3 bg-[#f9fafb] dark:bg-[#1e293b] border-t border-[#e2e8eb] dark:border-[#334155] space-y-2 text-xs text-[#033d59] dark:text-[#f8fafc] animate-in fade-in duration-150">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-bold text-[#033d59] dark:text-[#f8fafc] text-[11px]">
                                Acta #{actaItem.id_acta} - Detalle
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedActaIdForDetail(actaItem.id_acta);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00aae1] hover:bg-[#0196d4] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                                  title={`Ver información clínica completa del acta #${actaItem.id_acta} (pkgcn_cohortes.f_ver_acta)`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ver Información Completa</span>
                                </button>
                                <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] dark:bg-emerald-950 text-[#01ae6c] dark:text-emerald-300 text-[10px] font-bold border border-[#01ae6c]/20 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Aprobada
                                </span>
                              </div>
                            </div>

                            {/* Firmante y Convenio */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] p-2 bg-white dark:bg-[#0f172a] rounded-md border border-[#e2e8eb] dark:border-[#334155]">
                              {actaItem.usuario_firma && (
                                <div className="flex items-center gap-1 text-[#035476] dark:text-[#94a3b8]">
                                  <span className="font-bold text-[#00aae1]">Firma:</span>
                                  <span>{actaItem.usuario_firma}</span>
                                </div>
                              )}
                              {actaItem.nombre_convenio && (
                                <div className="flex items-center gap-1 text-[#035476] dark:text-[#94a3b8]">
                                  <span className="font-bold text-[#00aae1]">Convenio:</span>
                                  <span>{actaItem.nombre_convenio}</span>
                                </div>
                              )}
                            </div>

                            {/* Análisis y Plan */}
                            {actaItem.analisis_plan && (
                              <div className="space-y-1">
                                <span className="font-bold text-[#00aae1] dark:text-[#38bdf8] text-[10px] uppercase block tracking-wider">
                                  Análisis y Plan:
                                </span>
                                <p className="p-2.5 bg-white dark:bg-[#0f172a] rounded-md border border-[#e2e8eb] dark:border-[#334155] leading-relaxed text-[#033d59] dark:text-[#f8fafc] whitespace-pre-wrap font-sans">
                                  {actaItem.analisis_plan}
                                </p>
                              </div>
                            )}

                            {/* Observaciones */}
                            {actaItem.observaciones && (
                              <div className="space-y-1">
                                <span className="font-bold text-[#035476] dark:text-[#94a3b8] text-[10px] uppercase block tracking-wider">
                                  Observaciones Clínicas:
                                </span>
                                <p className="p-2.5 bg-white dark:bg-[#0f172a] rounded-md border border-[#e2e8eb] dark:border-[#334155] leading-relaxed text-[#033d59] dark:text-[#f8fafc] whitespace-pre-wrap font-sans">
                                  {actaItem.observaciones}
                                </p>
                              </div>
                            )}

                            {/* Observaciones Operativas */}
                            {actaItem.observaciones_operativas && (
                              <div className="space-y-1">
                                <span className="font-bold text-[#b45309] dark:text-[#fbbf24] text-[10px] uppercase block tracking-wider">
                                  Observaciones Operativas:
                                </span>
                                <p className="p-2.5 bg-[#fffbeb] dark:bg-[#0f172a] rounded-md border border-[#fef3c7] dark:border-[#334155] leading-relaxed text-[#78350f] dark:text-[#fbbf24] whitespace-pre-wrap font-sans">
                                  {actaItem.observaciones_operativas}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback render */
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {historialFallback.map((actaItem, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const shortDesc =
                      actaItem.resumen.length > 40
                        ? `${actaItem.resumen.slice(0, 40)}...`
                        : actaItem.resumen;

                    return (
                      <div
                        key={`${actaItem.numero}-${idx}`}
                        className="rounded-lg border border-[#e2e8eb] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#0f172a] shadow-2xs transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                          className="w-full p-2.5 flex items-center justify-between gap-2 hover:bg-[#effaff]/60 dark:hover:bg-[#334155]/60 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="px-2 py-0.5 rounded bg-[#033d59] text-white font-mono font-bold text-[10px] shrink-0">
                              #{actaItem.numero}
                            </span>
                            <span className="text-[#035476] dark:text-[#38bdf8] font-mono font-semibold text-[11px] shrink-0">
                              {actaItem.fecha}
                            </span>
                            <span className="text-gray-300 shrink-0">•</span>
                            <span className="text-[#033d59] dark:text-[#f8fafc] font-medium text-[11px] truncate flex-1 min-w-0">
                              {shortDesc}
                            </span>
                          </div>

                          <div className="p-0.5 rounded text-gray-400 hover:text-[#00aae1] shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#00aae1]" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3 bg-[#f9fafb] dark:bg-[#1e293b] border-t border-[#e2e8eb] dark:border-[#334155] space-y-2 text-xs text-[#033d59] dark:text-[#f8fafc] animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#033d59] dark:text-[#f8fafc] text-[11px]">
                                Acta #{actaItem.numero} - Detalle Completo
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] dark:bg-emerald-950 text-[#01ae6c] dark:text-emerald-300 text-[10px] font-bold border border-[#01ae6c]/20 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Aprobada
                              </span>
                            </div>

                            {actaItem.observaciones_clinicas ? (
                              <div className="space-y-1">
                                <span className="font-bold text-[#00aae1] dark:text-[#38bdf8] text-[10px] uppercase block tracking-wider">
                                  Observaciones Clínicas:
                                </span>
                                <p className="p-2.5 bg-white dark:bg-[#0f172a] rounded-md border border-[#e2e8eb] dark:border-[#334155] leading-relaxed text-[#033d59] dark:text-[#f8fafc] whitespace-pre-wrap font-sans">
                                  {actaItem.observaciones_clinicas}
                                </p>
                              </div>
                            ) : (
                              <p className="p-2.5 bg-white dark:bg-[#0f172a] rounded-md border border-[#e2e8eb] dark:border-[#334155] leading-relaxed text-[#033d59] dark:text-[#f8fafc] whitespace-pre-wrap font-sans">
                                {actaItem.resumen}
                              </p>
                            )}

                            {actaItem.observaciones_operativas && (
                              <div className="space-y-1">
                                <span className="font-bold text-[#b45309] dark:text-[#fbbf24] text-[10px] uppercase block tracking-wider">
                                  Observaciones Operativas:
                                </span>
                                <p className="p-2.5 bg-[#fffbeb] dark:bg-[#0f172a] rounded-md border border-[#fef3c7] dark:border-[#334155] leading-relaxed text-[#78350f] dark:text-[#fbbf24] whitespace-pre-wrap font-sans">
                                  {actaItem.observaciones_operativas}
                                </p>
                              </div>
                            )}

                            {actaItem.integrantes && actaItem.integrantes.length > 0 && (
                              <div className="pt-1">
                                <span className="font-semibold text-[#035476] dark:text-[#94a3b8] text-[10px] uppercase block mb-1">
                                  Integrantes Firmantes:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {actaItem.integrantes.map((m, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded bg-white dark:bg-[#0f172a] text-[10px] text-[#035476] dark:text-[#94a3b8] border border-[#e2e8eb] dark:border-[#334155]"
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

            <div className="pt-3 border-t border-[#e2e8eb] dark:border-[#334155] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Create / View New Acta */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs text-[#033d59] dark:text-[#f8fafc]">
            {!isComite && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 font-medium rounded-lg flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Modo Consulta: La edición y registro de actas está reservada únicamente para el Comité Médico.</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3 bg-[#ebfef4] dark:bg-emerald-950 border border-[#01ae6c]/30 text-[#01ae6c] dark:text-emerald-300 font-bold rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>¡Acta registrada exitosamente por el Cuadro Médico!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase mb-1">N° de Acta</label>
                <input
                  type="number"
                  disabled={!isComite}
                  value={actaNumero}
                  onChange={(e) => setActaNumero(parseInt(e.target.value, 10))}
                  className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-2.5 py-1.5 font-bold font-mono text-[#033d59] dark:text-[#f8fafc] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase mb-1">Fecha Sesión</label>
                <input
                  type="text"
                  disabled={!isComite}
                  value={actaFecha}
                  onChange={(e) => setActaFecha(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-[#033d59] dark:text-[#f8fafc] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase mb-1">
                Resumen de Decisiones del Cuadro Médico
              </label>
              <textarea
                rows={4}
                disabled={!isComite}
                value={actaResumen}
                onChange={(e) => setActaResumen(e.target.value)}
                placeholder={isComite ? "Escriba los acuerdos, decisiones clínicas y plan de seguimiento aprobado por el cuadro médico..." : "Sin acta redatada (Solo consulta)"}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md p-2.5 text-[#033d59] dark:text-[#f8fafc] focus:outline-none focus:border-[#00aae1] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#035476] dark:text-[#94a3b8] uppercase mb-1">
                Integrantes Firmantes (separados por coma)
              </label>
              <input
                type="text"
                disabled={!isComite}
                value={actaIntegrantes}
                onChange={(e) => setActaIntegrantes(e.target.value)}
                className="w-full bg-[#f9fafb] dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-[#033d59] dark:text-[#f8fafc] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            <div className="pt-3 border-t border-[#e2e8eb] dark:border-[#334155] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#035476] dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#334155] rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={!isComite}
                title={!isComite ? "Acceso deshabilitado para Coordinadora SIAU" : "Registrar esta acta"}
                className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 ${
                  isComite
                    ? 'text-white bg-[#00aae1] hover:bg-[#0196d4] cursor-pointer'
                    : 'text-gray-400 bg-gray-200 border border-gray-300 cursor-not-allowed opacity-60'
                }`}
              >
                <Save className="w-4 h-4" />
                Registrar Acta
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Modal de Información Completa del Acta (pkgcn_cohortes.f_ver_acta) */}
      <VerActaModal
        isOpen={Boolean(selectedActaIdForDetail)}
        idActa={selectedActaIdForDetail}
        onClose={() => setSelectedActaIdForDetail(null)}
      />
    </div>
  );
};
