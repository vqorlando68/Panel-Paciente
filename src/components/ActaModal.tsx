import React, { useState } from 'react';
import { Patient, UserRole, ActaInfo } from '../types';
import { X, FileText, Calendar, Users, CheckCircle, Plus, Save, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface ActaModalProps {
  patient: Patient;
  activeRole?: UserRole;
  initialMode?: 'view' | 'create';
  onSaveActa?: (patientId: string, newActa: ActaInfo) => void;
  onClose: () => void;
}

export const ActaModal: React.FC<ActaModalProps> = ({
  patient,
  activeRole,
  initialMode = 'view',
  onSaveActa,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'create'>(initialMode);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  
  // New Acta Form State
  const nextNum = (patient.acta?.numero || 100) + 1;
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
  const allActas: ActaInfo[] = [
    ...currentActa,
    ...historyActas.filter(a => !currentActa.some(c => c.numero === a.numero))
  ];

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
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] rounded-xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#00aae1] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {activeTab === 'create' ? 'Registrar Nueva Acta del Comité' : `Acta de Comité Médico #${patient.acta?.numero || 101}`}
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
          <div className="p-5 space-y-4 text-xs text-[#033d59] dark:text-[#f8fafc] max-h-[75vh] overflow-y-auto">
            {/* Main Active/Latest Acta Banner */}
            {patient.acta && (
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

                {patient.acta.integrantes && patient.acta.integrantes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#035476] dark:text-[#94a3b8] mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#00aae1]" />
                      Integrantes Firmantes
                    </h4>
                    <ul className="flex flex-wrap gap-1.5 pt-0.5">
                      {patient.acta.integrantes.map((member, i) => (
                        <li key={i} className="px-2 py-0.5 rounded bg-white dark:bg-[#0f172a] text-[10.5px] text-[#033d59] dark:text-[#f8fafc] border border-[#e2e8eb] dark:border-[#334155] font-medium">
                          {member}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Historial de Actas Accordion */}
            <div className="pt-2 border-t border-[#e2e8eb] dark:border-[#334155]">
              <h4 className="font-bold text-[#033d59] dark:text-[#f8fafc] mb-2.5 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Historial de Actas</span>
                <span className="text-[10px] font-mono text-gray-400 font-normal">
                  ({allActas.length} {allActas.length === 1 ? 'acta' : 'actas'})
                </span>
              </h4>

              {allActas.length === 0 ? (
                <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-xs bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-dashed border-[#e2e8eb] dark:border-[#334155]">
                  No hay historial de actas registrado.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {allActas.map((actaItem, idx) => {
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
    </div>
  );
};
