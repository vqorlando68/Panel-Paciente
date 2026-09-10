import React, { useState } from 'react';
import {
  X,
  FlaskConical,
  Activity,
  Calendar,
  User,
  Building2,
  FileText,
  Copy,
  Check,
  Stethoscope,
  Lightbulb,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  BadgeAlert,
  Search,
} from 'lucide-react';

interface AnalisisArchivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileInfo?: any;
  analisisData?: any;
}

// Formatea fechas tipo "20260320" o "2026-03-20"
function formatFechaExamen(fechaStr?: string | number): string {
  if (!fechaStr) return '—';
  const s = String(fechaStr).trim();
  if (s.length === 8 && /^\d{8}$/.test(s)) {
    const y = s.substring(0, 4);
    const m = s.substring(4, 6);
    const d = s.substring(6, 8);
    return `${d}/${m}/${y}`;
  }
  return s;
}

export const AnalisisArchivoModal: React.FC<AnalisisArchivoModalProps> = ({
  isOpen,
  onClose,
  fileInfo,
  analisisData,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('todas');

  if (!isOpen || !analisisData) return null;

  // Extraer datos principales
  const examenes: any[] = Array.isArray(analisisData.examenes) ? analisisData.examenes : [];
  const profDoc = analisisData.profesional_documento || {};
  const instDoc = analisisData.institucion_documento || null;
  const fileName = fileInfo?.nombre_archivo || fileInfo?.titulo || analisisData.nombre_alternativo || 'Archivo Clínico';
  const fileId = fileInfo?.id_archivo || analisisData.id_archivo || null;
  const citaCode = fileInfo?.codigo_cita || fileInfo?.id_hexadecimal || null;

  // Copiar JSON completo al portapapeles
  const handleCopyJson = () => {
    try {
      const jsonStr = JSON.stringify(analisisData, null, 2);
      navigator.clipboard.writeText(jsonStr).then(() => {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      });
    } catch (e) {
      console.error('Error al copiar JSON', e);
    }
  };

  // Obtener disciplinas únicas para filtros
  const disciplinas = Array.from(
    new Set(
      examenes
        .map((e) => e.disciplina)
        .filter((d): d is string => Boolean(d && typeof d === 'string'))
    )
  );

  // Filtrado de exámenes
  const filteredExamenes = examenes.filter((e) => {
    const matchDisc =
      selectedDisciplina === 'todas' ||
      String(e.disciplina || '').toLowerCase() === selectedDisciplina.toLowerCase();

    if (!matchDisc) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const tipo = String(e.tipo_examen || '').toLowerCase();
    const cups = String(e.codigo_cups || '').toLowerCase();
    const cupsNom = String(e.nombre_cups || '').toLowerCase();
    const notasMed = String(e.notas_medico || '').toLowerCase();
    const notasPac = String(e.notas_paciente || '').toLowerCase();
    const subcat = String(e.subcategoria || '').toLowerCase();
    const hasParam = Array.isArray(e.resultados) && e.resultados.some((r: any) =>
      String(r.parametro || '').toLowerCase().includes(term) ||
      String(r.valor || '').toLowerCase().includes(term)
    );

    return (
      tipo.includes(term) ||
      cups.includes(term) ||
      cupsNom.includes(term) ||
      notasMed.includes(term) ||
      notasPac.includes(term) ||
      subcat.includes(term) ||
      hasParam
    );
  });

  // Badge para estado del resultado
  const renderEstadoBadge = (estado?: string) => {
    if (!estado) return null;
    const est = String(estado).toLowerCase().trim();
    if (est === 'normal' || est === 'negativo' || est === 'dentro de límites') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Normal</span>
        </span>
      );
    }
    if (est === 'alto' || est === 'elevado' || est === 'positivo' || est === 'anormal') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          <BadgeAlert className="w-3 h-3 text-rose-600" />
          <span className="capitalize">{estado}</span>
        </span>
      );
    }
    if (est === 'bajo' || est === 'disminuido') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span className="capitalize">{estado}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {estado}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc] rounded-2xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#00aae1] via-[#018ec2] to-[#035476] text-white flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base md:text-lg leading-tight tracking-tight truncate">
                  Análisis Clínico de Exámenes
                </h3>
                {analisisData.multi && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 border border-white/30 text-white tracking-wide uppercase">
                    Múltiples Exámenes ({examenes.length})
                  </span>
                )}
              </div>
              <p className="text-xs text-white/90 font-medium truncate mt-0.5">
                {fileName}
                {fileId && <span className="opacity-80 font-mono ml-1.5">(ID: {fileId})</span>}
                {citaCode && <span className="opacity-80 font-mono ml-1.5">· Cita: {citaCode}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
              title="Copiar JSON del análisis"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedJson ? 'Copiado' : 'Copiar JSON'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4 bg-[#f8fafc] dark:bg-[#0b1329]">
          
          {/* Ficha Resumen de Documento / Institución */}
          {(profDoc.nombre || profDoc.cargo || instDoc || analisisData.nombre_alternativo) && (
            <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs text-xs">
              {profDoc.nombre && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#00aae1]" />
                    <span>Profesional Emisor</span>
                  </div>
                  <div className="font-bold text-[#033d59] dark:text-[#f8fafc]">{profDoc.nombre}</div>
                  {profDoc.cargo && <div className="text-slate-500 text-[11px]">{profDoc.cargo}</div>}
                  {profDoc.registro && (
                    <div className="text-slate-400 font-mono text-[10px]">Reg: {profDoc.registro}</div>
                  )}
                </div>
              )}

              {instDoc && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#00aae1]" />
                    <span>Institución / Laboratorio</span>
                  </div>
                  <div className="font-bold text-[#033d59] dark:text-[#f8fafc]">{instDoc}</div>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#00aae1]" />
                  <span>Total Estudios Procesados</span>
                </div>
                <div className="font-bold text-[#033d59] dark:text-[#f8fafc]">
                  {examenes.length} {examenes.length === 1 ? 'estudio clínico' : 'estudios clínicos'}
                </div>
                {disciplinas.length > 0 && (
                  <div className="text-slate-500 text-[11px]">
                    {disciplinas.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Barra de Búsqueda y Filtro de Disciplina */}
          {examenes.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-[#1e293b] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por tipo de examen, CUPS o parámetro..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00aae1]"
                />
              </div>

              {disciplinas.length > 1 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedDisciplina('todas')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedDisciplina === 'todas'
                        ? 'bg-[#00aae1] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Todas ({examenes.length})
                  </button>
                  {disciplinas.map((disc) => {
                    const count = examenes.filter((e) => e.disciplina === disc).length;
                    const isActive = selectedDisciplina.toLowerCase() === disc.toLowerCase();
                    return (
                      <button
                        key={disc}
                        type="button"
                        onClick={() => setSelectedDisciplina(disc)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#00aae1] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {disc} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Lista de Exámenes */}
          {filteredExamenes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800">
              No se encontraron exámenes que coincidan con el filtro seleccionado.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredExamenes.map((ex: any, idx: number) => {
                const resultados: any[] = Array.isArray(ex.resultados) ? ex.resultados : [];
                const fechaFormateada = formatFechaExamen(ex.fecha);

                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:border-[#00aae1]/40 transition-colors"
                  >
                    {/* Encabezado del Examen */}
                    <div className="px-4 py-3 bg-[#effaff]/50 dark:bg-[#00aae1]/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-[#00aae1] text-white text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="font-extrabold text-sm text-[#033d59] dark:text-[#f8fafc] uppercase tracking-wide">
                          {ex.tipo_examen || 'Examen Clínico'}
                        </div>
                        {ex.subcategoria && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950/50 text-[#00aae1] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-900/60">
                            {ex.subcategoria}
                          </span>
                        )}
                        {ex.disciplina && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {ex.disciplina}
                          </span>
                        )}
                        {ex.codigo_cups && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
                            CUPS: {ex.codigo_cups}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#00aae1]" />
                        <span>{fechaFormateada}</span>
                      </div>
                    </div>

                    {/* Metadatos del Examen (Profesional, Institución, Región Anatómica) */}
                    {(ex.profesional || ex.institucion || ex.region_anatomica || ex.fhir_imaging_study) && (
                      <div className="px-4 py-2 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          {ex.profesional && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <strong className="text-slate-700 dark:text-slate-300">{ex.profesional}</strong>
                              {ex.cargo_profesional && ` (${ex.cargo_profesional})`}
                            </span>
                          )}
                          {ex.institucion && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{ex.institucion}</span>
                            </span>
                          )}
                        </div>

                        {(ex.region_anatomica || ex.fhir_imaging_study) && (
                          <div className="flex items-center gap-1 text-[#00aae1] font-semibold">
                            <span>Región: {ex.region_anatomica || ex.fhir_imaging_study?.region || '—'}</span>
                            {ex.fhir_imaging_study?.modality && (
                              <span className="font-mono text-[10px] px-1 bg-sky-100 dark:bg-sky-900/50 rounded">
                                {ex.fhir_imaging_study.modality}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cuerpo del Examen: Resultados */}
                    <div className="p-4 flex flex-col gap-3.5">
                      {resultados.length > 0 ? (
                        <div>
                          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[#00aae1]" />
                            <span>Parámetros y Resultados ({resultados.length})</span>
                          </div>

                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="p-2.5">Parámetro</th>
                                  <th className="p-2.5">Resultado</th>
                                  <th className="p-2.5">Unidad</th>
                                  <th className="p-2.5">Referencia</th>
                                  <th className="p-2.5 text-right">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {resultados.map((r: any, rIdx: number) => {
                                  return (
                                    <tr
                                      key={rIdx}
                                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                      <td className="p-2.5 font-semibold text-[#033d59] dark:text-[#f8fafc]">
                                        {r.parametro || 'Parámetro'}
                                        {r.nombre_cups && r.nombre_cups !== r.parametro && (
                                          <div className="text-[10px] font-normal text-slate-400">
                                            {r.nombre_cups}
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-2.5 font-bold font-mono text-sm text-[#00aae1] dark:text-[#38bdf8]">
                                        {r.valor !== null && r.valor !== undefined ? r.valor : '—'}
                                      </td>
                                      <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                                        {r.unidad || '—'}
                                      </td>
                                      <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                                        {r.referencia || '—'}
                                      </td>
                                      <td className="p-2.5 text-right">
                                        {renderEstadoBadge(r.estado)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic py-1">
                          No se especifican parámetros tabulados para este estudio.
                        </div>
                      )}

                      {/* Interpretaciones Clínicas y Explicación al Paciente */}
                      {(ex.notas_medico || ex.notas_paciente) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {ex.notas_medico && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                              <div className="font-bold text-[#033d59] dark:text-[#f8fafc] mb-1 flex items-center gap-1.5">
                                <Stethoscope className="w-3.5 h-3.5 text-[#00aae1]" />
                                <span>Interpretación Médica</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {ex.notas_medico}
                              </p>
                            </div>
                          )}

                          {ex.notas_paciente && (
                            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs">
                              <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Explicación para el Paciente</span>
                              </div>
                              <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed">
                                {ex.notas_paciente}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Mostrando <strong>{filteredExamenes.length}</strong> de <strong>{examenes.length}</strong> exámenes analizados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
