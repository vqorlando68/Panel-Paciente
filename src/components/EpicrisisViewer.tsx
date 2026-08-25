import React, { useState } from 'react';
import { FileText, Activity, Code, Stethoscope } from 'lucide-react';

interface EpicrisisViewerProps {
  epicrisisRaw?: string | null;
}

export function parseEpicrisisData(raw?: string | null): {
  isJson: boolean;
  cleanText: string;
  data?: any;
} {
  if (!raw) {
    return { isJson: false, cleanText: '' };
  }

  let obj: any = raw;

  if (typeof obj === 'object' && obj !== null) {
    return { isJson: true, data: obj, cleanText: JSON.stringify(obj, null, 2) };
  }

  for (let pass = 0; pass < 5; pass++) {
    if (typeof obj !== 'string') break;

    let s = obj.trim();

    // 1. If wrapped in outer quotes e.g. '"{\r\n ...}"'
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      try {
        const unquoted = JSON.parse(s);
        obj = unquoted;
        if (typeof obj === 'object' && obj !== null) {
          return { isJson: true, data: obj, cleanText: JSON.stringify(obj, null, 2) };
        }
        continue;
      } catch {
        s = s.slice(1, -1).trim();
      }
    }

    // 2. Direct JSON parse
    try {
      const parsed = JSON.parse(s);
      obj = parsed;
      if (typeof obj === 'object' && obj !== null) {
        return { isJson: true, data: obj, cleanText: JSON.stringify(obj, null, 2) };
      }
      continue;
    } catch {
      // 3. Unescape literal \r\n, \n, \", \\
      const unescaped = s
        .replace(/\\r\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');

      try {
        const parsed = JSON.parse(unescaped);
        obj = parsed;
        if (typeof obj === 'object' && obj !== null) {
          return { isJson: true, data: obj, cleanText: JSON.stringify(obj, null, 2) };
        }
      } catch {
        // Try fixing missing closing brace
        try {
          let fixedStr = unescaped;
          if (!fixedStr.endsWith('}')) {
            const lastQuote = fixedStr.lastIndexOf('"');
            if (lastQuote > 0) fixedStr = fixedStr.substring(0, lastQuote + 1);
            fixedStr += '}';
          }
          const parsedFixed = JSON.parse(fixedStr);
          if (parsedFixed && typeof parsedFixed === 'object') {
            return { isJson: true, data: parsedFixed, cleanText: unescaped };
          }
        } catch {
          // Break loop
        }
        obj = unescaped;
        break;
      }
    }
  }

  if (typeof obj === 'object' && obj !== null) {
    return { isJson: true, data: obj, cleanText: JSON.stringify(obj, null, 2) };
  }

  return { isJson: false, cleanText: typeof obj === 'string' ? obj : String(obj) };
}

export const EpicrisisViewer: React.FC<EpicrisisViewerProps> = ({ epicrisisRaw }) => {
  const [showRawJson, setShowRawJson] = useState(false);

  const { isJson, cleanText, data } = parseEpicrisisData(epicrisisRaw);

  if (!epicrisisRaw || !cleanText) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-[#0f172a]/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-xs text-gray-500 dark:text-gray-400 font-sans">
        <span className="font-semibold block text-xs text-[#035476] dark:text-[#94a3b8] uppercase mb-1">Epicrisis del Paciente</span>
        <span>Sin epicrisis clínica registrada para este paciente.</span>
      </div>
    );
  }

  // Render list or string helper
  const renderBulletListOrText = (val: any) => {
    if (!val) return null;
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-2 pt-1 font-sans">
          {val.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#334155] dark:text-[#cbd5e1]">
              <span className="w-2 h-2 rounded-full bg-[#00aae1] dark:bg-[#38bdf8] mt-1.5 shrink-0" />
              <span className="leading-relaxed font-sans">{typeof item === 'object' ? (item.descripcion || item.texto || item.resumen || JSON.stringify(item)) : String(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p className="text-xs text-[#334155] dark:text-[#cbd5e1] leading-relaxed whitespace-pre-wrap font-sans">
        {String(val)}
      </p>
    );
  };

  if (isJson && data) {
    const antecedentes = data.antecedentes && typeof data.antecedentes === 'object' ? data.antecedentes : null;
    const rawLineaTiempo = Array.isArray(data.linea_tiempo) ? data.linea_tiempo : [];
    
    // Sort lineaTiempo in descending order (most recent event first)
    const lineaTiempo = [...rawLineaTiempo].sort((a, b) => {
      const getEventDate = (raw: any) => {
        let obj: any = raw;
        if (typeof raw === 'string') {
          try {
            let s = raw.trim();
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
              s = JSON.parse(s);
            }
            obj = JSON.parse(s);
          } catch {
            obj = {};
          }
        }
        const dStr = String(obj?.fecha || obj?.date || obj?.fecha_consulta || '').trim();
        if (!dStr) return 0;
        const parsedDate = new Date(dStr);
        if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();
        const parts = dStr.split(/[-/ :]/);
        if (parts.length >= 3) {
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
        }
        return 0;
      };
      return getEventDate(b) - getEventDate(a);
    });
    const diagnosticos = Array.isArray(data.diagnosticos_historicos || data.diagnosticos) ? (data.diagnosticos_historicos || data.diagnosticos) : [];
    const medicamentos = Array.isArray(data.medicamentos_recientes || data.medicamentos) ? (data.medicamentos_recientes || data.medicamentos) : [];

    const rawActasMedicas = Array.isArray(data.actas_medicas || data.actas) ? (data.actas_medicas || data.actas) : [];
    
    // Sort actasMedicas in descending order (most recent first)
    const actasMedicas = [...rawActasMedicas].sort((a, b) => {
      const getActaDate = (raw: any) => {
        let obj: any = raw;
        if (typeof raw === 'string') {
          try {
            let s = raw.trim();
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
              s = JSON.parse(s);
            }
            obj = JSON.parse(s);
          } catch {
            obj = {};
          }
        }
        const dStr = String(obj?.fecha_acta_medica || obj?.fecha || '').trim();
        if (!dStr) return 0;
        const parsedDate = new Date(dStr);
        if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();
        const parts = dStr.split(/[-/ :]/);
        if (parts.length >= 3) {
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
        }
        return 0;
      };
      return getActaDate(b) - getActaDate(a);
    });

    const consultasProcesadas = Array.isArray(data.consultas_procesadas || data.consultas) ? (data.consultas_procesadas || data.consultas) : [];

    // Track keys that were rendered
    const handledKeys = new Set([
      'version', 'id_usuario', 'fecha_actualizacion', 'fecha_ultima_consulta_incluida',
      'total_consultas_historicas_incluidas', 'total_consultas_historicas', 'ultima_evolucion_individual',
      'resumen_evolucion', 'antecedentes', 'linea_tiempo', 'diagnosticos_historicos', 'diagnosticos',
      'medicamentos_recientes', 'medicamentos', 'actas_medicas', 'actas', 'consultas_procesadas', 'consultas',
      'plan_manejo_vigente', 'plan_manejo', 'plan',
      'conducta_vigente', 'conducta', 'hallazgos_relevantes', 'hallazgos',
      'recomendaciones_vigentes', 'recomendaciones', 'seguimiento'
    ]);

    const extraFields = Object.entries(data).filter(([key, val]) => {
      return !handledKeys.has(key) && val !== null && val !== undefined && String(val).trim() !== '';
    });

    return (
      <div className="space-y-6 font-sans text-xs">
        {/* Toggle JSON button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className="px-3 py-1.5 text-xs font-bold text-[#00aae1] dark:text-[#38bdf8] bg-white dark:bg-[#1e293b] border border-[#00aae1]/30 hover:bg-[#00aae1]/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRawJson ? 'Vista Gráfica Estructurada' : 'Ver JSON Formateado'}</span>
          </button>
        </div>

        {showRawJson ? (
          <div className="bg-[#0f172a] text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-emerald-900/50 shadow-inner max-h-96">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Section 1: Información General */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00aae1]" />
                Información General
              </h4>
              <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {data.ultima_evolucion_individual && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">Última evolución individual</span>
                    <strong className="font-mono text-[#0f172a] dark:text-[#f8fafc] font-bold">{data.ultima_evolucion_individual}</strong>
                  </div>
                )}
                {data.fecha_actualizacion && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">Fecha de actualización</span>
                    <strong className="font-mono text-[#0f172a] dark:text-[#f8fafc] font-bold">{data.fecha_actualizacion}</strong>
                  </div>
                )}
                {data.fecha_ultima_consulta_incluida && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">Última consulta incluida</span>
                    <strong className="font-mono text-[#0f172a] dark:text-[#f8fafc] font-bold">{data.fecha_ultima_consulta_incluida}</strong>
                  </div>
                )}
                {(data.total_consultas_historicas_incluidas !== undefined || data.total_consultas_historicas !== undefined) && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748b] dark:text-[#94a3b8] font-medium">Consultas históricas incluidas</span>
                    <strong className="font-bold text-[#0f172a] dark:text-[#f8fafc]">
                      {data.total_consultas_historicas_incluidas ?? data.total_consultas_historicas}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Resumen de Evolución */}
            {data.resumen_evolucion && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Resumen de Evolución
                </h4>
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                  <p className="text-xs text-[#334155] dark:text-[#cbd5e1] leading-relaxed font-sans whitespace-pre-wrap">
                    {data.resumen_evolucion}
                  </p>
                </div>
              </div>
            )}

            {/* Section 3: Antecedentes */}
            {antecedentes && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Antecedentes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(antecedentes).map(([key, val]) => {
                    const textVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '').trim();
                    if (!textVal) return null;

                    const titleMap: Record<string, string> = {
                      patologicos: 'PATOLÓGICOS',
                      quirurgicos: 'QUIRÚRGICOS',
                      traumaticos: 'TRAUMÁTICOS',
                      personales: 'PERSONALES',
                      familiares: 'FAMILIARES',
                      alergicos: 'ALÉRGICOS',
                      farmacologicos: 'FARMACOLÓGICOS',
                      otros: 'OTROS',
                    };

                    const uppercaseTitle = titleMap[key.toLowerCase()] || key.toUpperCase();

                    return (
                      <div key={key} className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs space-y-1.5">
                        <span className="font-bold text-[11px] text-[#64748b] dark:text-[#94a3b8] block tracking-wider uppercase">
                          {uppercaseTitle}
                        </span>
                        <p className="text-xs text-[#334155] dark:text-[#cbd5e1] leading-relaxed font-sans">
                          {textVal}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4: Línea de Tiempo */}
            {lineaTiempo.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Línea de Tiempo
                </h4>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-5 shadow-2xs">
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-[#00aae1]/30 dark:before:bg-[#38bdf8]/30">
                    {lineaTiempo.map((item: any, idx: number) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[23.5px] top-1 w-3 h-3 rounded-full bg-[#00aae1] dark:bg-[#38bdf8] ring-4 ring-white dark:ring-[#1e293b]" />
                        <span className="font-mono text-xs font-bold text-[#00aae1] dark:text-[#38bdf8] block">
                          {item.fecha || item.date || '—'}
                        </span>
                        <p className="text-xs text-[#334155] dark:text-[#cbd5e1] mt-0.5 leading-relaxed font-sans">
                          {item.resumen || item.descripcion || item.texto || JSON.stringify(item)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section: Actas Médicas */}
            {actasMedicas.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Actas Médicas
                </h4>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-[#f1f5f9] dark:border-[#334155] text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8]">
                        <th className="px-4 py-3 min-w-[110px]">Fecha Acta</th>
                        <th className="px-4 py-3 min-w-[100px] text-center">Nivel Riesgo</th>
                        <th className="px-4 py-3">Análisis y Plan</th>
                        <th className="px-4 py-3">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {actasMedicas.map((rawActa: any, idx: number) => {
                        let acta: any = rawActa;
                        if (typeof rawActa === 'string') {
                          try {
                            let s = rawActa.trim();
                            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
                              s = JSON.parse(s);
                            }
                            acta = JSON.parse(s);
                          } catch {
                            acta = { analisis_plan: rawActa };
                          }
                        }

                        const riesgoNum = Number(acta.nivel_riesgo);
                        const riesgoBadge =
                          riesgoNum === 1 || acta.nivel_riesgo === 'High' ? { label: 'Alto (1)', color: 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200' } :
                          riesgoNum === 4 || acta.nivel_riesgo === 'Critical' ? { label: 'Crítico (4)', color: 'bg-rose-100 dark:bg-rose-900 text-rose-800 border-rose-300 font-black' } :
                          riesgoNum === 2 || acta.nivel_riesgo === 'Medium' ? { label: 'Medio (2)', color: 'bg-amber-50 dark:bg-amber-950 text-amber-600 border-amber-200' } :
                          riesgoNum === 3 || acta.nivel_riesgo === 'Low' ? { label: 'Bajo (3)', color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-200' } :
                          { label: acta.nivel_riesgo ? String(acta.nivel_riesgo) : '—', color: 'bg-gray-50 text-gray-600 border-gray-200' };

                        const analisisText = String(acta.analisis_plan || acta.analisis || acta.plan || '—')
                          .replace(/\\n/g, '\n')
                          .replace(/\\r/g, '');
                        const obsText = String(acta.observaciones || acta.obs || '')
                          .replace(/\\n/g, '\n')
                          .replace(/\\r/g, '');

                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#0f172a]/50 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-[#00aae1] dark:text-[#38bdf8] whitespace-nowrap">
                              {acta.fecha_acta_medica || acta.fecha || '—'}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${riesgoBadge.color}`}>
                                {riesgoBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#334155] dark:text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
                              {analisisText}
                            </td>
                            <td className="px-4 py-3 text-[#64748b] dark:text-[#94a3b8] leading-relaxed whitespace-pre-wrap">
                              {obsText || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {diagnosticos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Diagnósticos Históricos
                </h4>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-[#f1f5f9] dark:border-[#334155] text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8]">
                        <th className="px-4 py-3">CIE-10</th>
                        <th className="px-4 py-3">Descripción</th>
                        <th className="px-4 py-3 text-right">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {diagnosticos.map((dx: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#0f172a]/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#00aae1] dark:text-[#38bdf8]">
                            {dx.cie10 || dx.codigo || dx.id || '—'}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#0f172a] dark:text-[#f8fafc]">
                            {dx.descripcion || dx.nombre || '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[10px] text-[#64748b] dark:text-[#94a3b8] uppercase">
                            {dx.tipo || 'DX PRINCIPAL'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section: Consultas Procesadas */}
            {consultasProcesadas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                    Consultas Procesadas
                  </h4>
                  <span className="text-[11px] font-bold text-[#00aae1] dark:text-[#38bdf8] bg-[#00aae1]/10 px-2.5 py-0.5 rounded-full">
                    Total: {consultasProcesadas.length}
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {consultasProcesadas.map((rawItem: any, idx: number) => {
                      let item: any = rawItem;
                      if (typeof rawItem === 'string') {
                        try {
                          let s = rawItem.trim();
                          if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
                            s = JSON.parse(s);
                          }
                          item = JSON.parse(s);
                        } catch {
                          item = { id_cita: '—', fecha: rawItem };
                        }
                      }

                      const idCita = item.id_cita ?? item.codigo_cita ?? item.id ?? '—';
                      const fecha = item.fecha ?? item.fecha_cita ?? item.fecha_consulta ?? '—';
                      const espec = item.especialidad || item.nombre_especialidad;

                      return (
                        <div
                          key={idx}
                          className="bg-[#f8fafc] dark:bg-[#0f172a] p-3 rounded-xl border border-[#e2e8eb] dark:border-[#334155] space-y-1.5 hover:border-[#00aae1]/50 transition-all shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
                              Cita #{idCita}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-[#00aae1] dark:bg-[#38bdf8]" />
                          </div>
                          <div className="font-mono text-xs font-bold text-[#0f172a] dark:text-[#f8fafc]">
                            {fecha}
                          </div>
                          {espec && (
                            <span className="text-[10px] text-[#00aae1] dark:text-[#38bdf8] font-semibold block truncate">
                              {espec}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Section 6: Medicamentos Recientes */}
            {medicamentos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Medicamentos Recientes
                </h4>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-[#f1f5f9] dark:border-[#334155] text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8]">
                        <th className="px-4 py-3">Medicamento</th>
                        <th className="px-4 py-3">Dosis</th>
                        <th className="px-4 py-3">Frecuencia</th>
                        <th className="px-4 py-3">Duración</th>
                        <th className="px-4 py-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {medicamentos.map((med: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#0f172a]/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#0f172a] dark:text-[#f8fafc]">
                            {med.medicamento || med.nombre || '—'}
                          </td>
                          <td className="px-4 py-3 text-[#334155] dark:text-[#cbd5e1]">{med.dosis || '—'}</td>
                          <td className="px-4 py-3 text-[#334155] dark:text-[#cbd5e1]">{med.frecuencia || '—'}</td>
                          <td className="px-4 py-3 text-[#334155] dark:text-[#cbd5e1]">{med.duracion || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200">
                              {med.estado || 'Activo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 7: Plan de Manejo Vigente */}
            {(data.plan_manejo_vigente || data.plan_manejo || data.plan) && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Plan de Manejo Vigente
                </h4>
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                  {renderBulletListOrText(data.plan_manejo_vigente || data.plan_manejo || data.plan)}
                </div>
              </div>
            )}

            {/* Section 8: Conducta Vigente */}
            {(data.conducta_vigente || data.conducta) && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Conducta Vigente
                </h4>
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                  {renderBulletListOrText(data.conducta_vigente || data.conducta)}
                </div>
              </div>
            )}

            {/* Section 9: Hallazgos Relevantes */}
            {(data.hallazgos_relevantes || data.hallazgos) && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Hallazgos Relevantes
                </h4>
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                  {renderBulletListOrText(data.hallazgos_relevantes || data.hallazgos)}
                </div>
              </div>
            )}

            {/* Section 10: Recomendaciones Vigentes */}
            {(data.recomendaciones_vigentes || data.recomendaciones) && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Recomendaciones Vigentes
                </h4>
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                  {renderBulletListOrText(data.recomendaciones_vigentes || data.recomendaciones)}
                </div>
              </div>
            )}

            {/* Section 11: Seguimiento */}
            {data.seguimiento && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
                  Seguimiento
                </h4>
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                  {renderBulletListOrText(data.seguimiento)}
                </div>
              </div>
            )}

            {/* Extra Dynamic Fields */}
            {extraFields.length > 0 && (
              <div className="space-y-3 pt-2">
                {extraFields.map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc] capitalize">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-4 shadow-2xs">
                      {renderBulletListOrText(val)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Plain Text Fallback
  return (
    <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl border border-[#f1f5f9] dark:border-[#334155] p-5 shadow-2xs space-y-2 font-sans">
      <h4 className="font-bold text-sm text-[#0f172a] dark:text-[#f8fafc]">
        Informe de Epicrisis
      </h4>
      <p className="text-xs text-[#334155] dark:text-[#cbd5e1] whitespace-pre-wrap leading-relaxed font-sans">
        {cleanText}
      </p>
    </div>
  );
};
