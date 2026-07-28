import React, { useState } from 'react';
import { Patient, UserRole, ActaInfo } from '../types';
import { X, FileText, Calendar, Users, CheckCircle, Plus, Save, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e2e8eb] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
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
        <div className="flex border-b border-[#e2e8eb] bg-[#f9fafb]">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'view'
                ? 'border-[#00aae1] text-[#00aae1] bg-white'
                : 'border-transparent text-[#035476] hover:bg-gray-100'
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
                ? 'border-[#00aae1] text-[#00aae1] bg-white'
                : 'border-transparent text-[#035476] hover:bg-gray-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Acta (Cuadro Médico)</span>
          </button>
        </div>

        {/* Tab 1: View Actas */}
        {activeTab === 'view' && (
          <div className="p-5 space-y-4 text-xs text-[#033d59] max-h-[75vh] overflow-y-auto">
            {/* Main Active/Latest Acta Banner */}
            {patient.acta && (
              <div className="space-y-3 p-3.5 bg-[#f0f9ff] rounded-xl border border-[#00aae1]/30">
                <div className="flex items-center justify-between pb-2 border-b border-[#00aae1]/20">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#00aae1] text-white font-mono font-bold text-xs">
                      #{patient.acta.numero}
                    </span>
                    <span className="font-bold text-[#033d59]">Última Acta Registrada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[#035476] font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                      {patient.acta.fecha}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] text-[#01ae6c] text-[10px] font-bold border border-[#01ae6c]/20 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Aprobada
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#035476] mb-1 uppercase tracking-wider text-[10px]">
                    Resumen de Decisiones
                  </h4>
                  <p className="text-xs text-[#033d59] leading-relaxed">
                    {patient.acta.resumen}
                  </p>
                </div>

                {patient.acta.integrantes && patient.acta.integrantes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#035476] mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#00aae1]" />
                      Integrantes Firmantes
                    </h4>
                    <ul className="flex flex-wrap gap-1.5 pt-0.5">
                      {patient.acta.integrantes.map((member, i) => (
                        <li key={i} className="px-2 py-0.5 rounded bg-white text-[10.5px] text-[#033d59] border border-[#e2e8eb] font-medium">
                          {member}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Historial de Actas Accordion */}
            <div className="pt-2 border-t border-[#e2e8eb]">
              <h4 className="font-bold text-[#033d59] mb-2.5 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Historial de Actas</span>
                <span className="text-[10px] font-mono text-gray-400 font-normal">
                  ({allActas.length} {allActas.length === 1 ? 'acta' : 'actas'})
                </span>
              </h4>

              {allActas.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs bg-gray-50 rounded-lg border border-dashed border-[#e2e8eb]">
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
                        className="rounded-lg border border-[#e2e8eb] overflow-hidden bg-white shadow-2xs transition-all"
                      >
                        {/* Accordion Row Header (# Acta, Fecha, Descripción Breve) */}
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                          className="w-full p-2.5 flex items-center justify-between gap-2 hover:bg-[#effaff]/60 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* # Acta */}
                            <span className="px-2 py-0.5 rounded bg-[#033d59] text-white font-mono font-bold text-[10px] shrink-0">
                              #{actaItem.numero}
                            </span>

                            {/* Fecha */}
                            <span className="text-[#035476] font-mono font-semibold text-[11px] shrink-0">
                              {actaItem.fecha}
                            </span>

                            {/* Divider */}
                            <span className="text-gray-300 shrink-0">•</span>

                            {/* Descripción Breve */}
                            <span className="text-[#033d59] font-medium text-[11px] truncate flex-1 min-w-0">
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

                        {/* Collapsible Unfolded Detail */}
                        {isExpanded && (
                          <div className="p-3 bg-[#f9fafb] border-t border-[#e2e8eb] space-y-2 text-xs text-[#033d59] animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#033d59] text-[11px]">
                                Acta #{actaItem.numero} - Detalle Completo
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-[#ebfef4] text-[#01ae6c] text-[10px] font-bold border border-[#01ae6c]/20 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Aprobada
                              </span>
                            </div>

                            <p className="p-2.5 bg-white rounded-md border border-[#e2e8eb] leading-relaxed text-[#033d59]">
                              {actaItem.resumen}
                            </p>

                            {actaItem.integrantes && actaItem.integrantes.length > 0 && (
                              <div className="pt-1">
                                <span className="font-semibold text-[#035476] text-[10px] uppercase block mb-1">
                                  Integrantes Firmantes:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {actaItem.integrantes.map((m, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded bg-white text-[10px] text-[#035476] border border-[#e2e8eb]"
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

            <div className="pt-3 border-t border-[#e2e8eb] flex justify-end">
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

        {/* Tab 2: Create New Acta */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs text-[#033d59]">
            {savedSuccess && (
              <div className="p-3 bg-[#ebfef4] border border-[#01ae6c]/30 text-[#01ae6c] font-bold rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>¡Acta registrada exitosamente por el Cuadro Médico!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">N° de Acta</label>
                <input
                  type="number"
                  value={actaNumero}
                  onChange={(e) => setActaNumero(parseInt(e.target.value, 10))}
                  className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 font-bold font-mono text-[#033d59]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">Fecha Sesión</label>
                <input
                  type="text"
                  value={actaFecha}
                  onChange={(e) => setActaFecha(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">
                Resumen de Decisiones del Cuadro Médico
              </label>
              <textarea
                rows={4}
                value={actaResumen}
                onChange={(e) => setActaResumen(e.target.value)}
                placeholder="Escriba los acuerdos, decisiones clínicas y plan de seguimiento aprobado por el cuadro médico..."
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md p-2.5 text-[#033d59] focus:outline-none focus:border-[#00aae1]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#035476] uppercase mb-1">
                Integrantes Firmantes (separados por coma)
              </label>
              <input
                type="text"
                value={actaIntegrantes}
                onChange={(e) => setActaIntegrantes(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e2e8eb] rounded-md px-2.5 py-1.5 text-[#033d59]"
              />
            </div>

            <div className="pt-3 border-t border-[#e2e8eb] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#035476] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
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
