import React, { useState } from 'react';
import { X, Database, Code, FileText, Check, Copy, HelpCircle, Layers } from 'lucide-react';

interface OracleDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OracleDocModal: React.FC<OracleDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'proc_listar' | 'proc_total' | 'fields' | 'test_connection'>('test_connection');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [copiedTest, setCopiedTest] = useState(false);

  const handleCopyTestResult = () => {
    if (!testResult) return;
    navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
    setCopiedTest(true);
    setTimeout(() => setCopiedTest(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/patients?action=test');
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          status: 'error_http_500',
          http_code: res.status,
          mensaje: `El servidor Vercel retornó una página de error en formato no-JSON (${res.status}): ${text.substring(0, 400)}...`,
          raw_response: text
        };
      }
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ status: 'error', mensaje: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  const jsonTotalEntradaEjemplo = JSON.stringify(
    {
      registros_por_pagina: 10,
      filtros: {
        estado: 'Activo',
        cohorte: 'ACTIVO',
        coordinador: 'Anyeli Ledezma',
        convenioNombre: 'EPS Suramericana Cuidate360',
        identificacion: '',
        nombresApellidos: ''
      }
    },
    null,
    2
  );

  const jsonTotalSalidaEjemplo = JSON.stringify(
    {
      codigo_respuesta: 0,
      mensaje_respuesta: "Cálculo de paginación realizado exitosamente",
      paginacion: {
        registros_por_pagina: 10,
        total_registros: 14,
        total_paginas: 2
      }
    },
    null,
    2
  );

  const jsonPaginaEntradaEjemplo = JSON.stringify(
    {
      pagina: 1,
      registros_por_pagina: 10,
      filtros: {
        estado: 'Activo',
        cohorte: 'ACTIVO',
        coordinador: 'Anyeli Ledezma',
        convenioNombre: 'EPS Suramericana Cuidate360'
      }
    },
    null,
    2
  );

  const jsonPaginaSalidaEjemplo = JSON.stringify(
    {
      codigo_respuesta: 0,
      mensaje_respuesta: "Página de pacientes obtenida exitosamente",
      paginacion: {
        pagina_actual: 1,
        registros_por_pagina: 10,
        total_registros: 14,
        total_paginas: 2
      },
      especialidades_orden: [
        { id_especialidad: 17, nombre: "Medicina General", key: "med_gen" },
        { id_especialidad: 36, nombre: "Psicología", key: "psicol" },
        { id_especialidad: 37, nombre: "Nutrición", key: "nutri" },
        { id_especialidad: 101, nombre: "Cardiología", key: "esp_1" },
        { id_especialidad: 102, nombre: "Endocrinología", key: "esp_2" },
        { id_especialidad: 103, nombre: "Nefrología", key: "esp_3" },
        { id_especialidad: 104, nombre: "Neurología", key: "esp_4" }
      ],
      pacientes: [
        {
          id: "PAT-001",
          nombre: "Valeria Restrepo Montoya",
          identificacion: "CC 52.849.182",
          telefono: "+57 312 458 9012",
          email: "valeria.restrepo@gmail.com",
          direccion: "Calle 45 #28-14, Medellín",
          idConvenio: "SURA-8492",
          convenioNombre: "EPS Suramericana Cuidate360",
          prioridadInicial: 1,
          fechaProximaRevision: "18/08/2026",
          cohorte: "ACTIVO",
          estado: "Activo",
          riesgo: "Critical",
          etiqueta: "",
          retroalimentacion: "Satisfecho",
          fase: "I",
          coordinador: "Anyeli Ledezma",
          numeroCarga: "CARGA-104",
          hasAlarm: true,
          alarmReasons: [
            "Paciente lleva > 3 meses sin visita de Medicina General"
          ],
          hasRehuso: false,
          acta: {
            numero: 142,
            fecha: "16 jul 2026",
            resumen: "Aprobación de tratamiento anticoagulante orales.",
            integrantes: ["Dr. Fernando Hoyos", "Dra. Sofía López"]
          },
          specialists: {
            med_gen: {
              specialistTitle: "MEDICO GEN.",
              professionalName: "Dr. Carlos Mendoza",
              lastAttentionDate: "10/01/2026 09:00 AM",
              frequency: "Mensual",
              targetDate: "10/02/2026 09:00 AM",
              isOverdue: true
            },
            psicol: {
              specialistTitle: "PSICOLOGIA",
              professionalName: "Dra. Claudia Ruiz",
              lastAttentionDate: "15/02/2026 02:00 PM",
              frequency: "Trimestral",
              targetDate: "15/05/2026 02:00 PM",
              isOverdue: false
            },
            nutri: {
              specialistTitle: "NUTRICIONISTA",
              professionalName: "Lic. Mariana Gómez",
              lastAttentionDate: "05/03/2026 11:00 AM",
              frequency: "Bimensual",
              targetDate: "05/05/2026 11:00 AM",
              isOverdue: false
            }
          }
        }
      ]
    },
    null,
    2
  );

  const handleCopySql = () => {
    const textToCopy = `EXEC pkgln_pacientes_giris.prc_obtener_pacientes_pagina(p_json_entrada => '${jsonPaginaEntradaEjemplo.replace(/\n/g, '')}', p_json_salida => :v_salida);`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] text-[#033d59] dark:text-[#f8fafc] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#e2e8eb] dark:border-[#334155] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e2e8eb] dark:border-[#334155] bg-[#effaff] dark:bg-[#1e293b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00aae1] text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-[#033d59] dark:text-[#f8fafc]">
                  Documentación Integración PL/SQL Oracle
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-[#00aae1]/10 text-[#00aae1] dark:bg-[#00aae1]/20 dark:text-[#38bdf8]">
                  pkgln_pacientes_giris
                </span>
              </div>
              <p className="text-xs text-[#035476] dark:text-[#94a3b8]">
                Atajo de teclado activo: <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-[#033d59] dark:text-gray-200 rounded font-mono text-[10px] border border-gray-300 dark:border-gray-700 shadow-2xs">Ctrl + Alt + D</kbd>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center px-6 border-b border-[#e2e8eb] dark:border-[#334155] bg-gray-50 dark:bg-[#1e293b]/50 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('test_connection')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'test_connection'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-[#00aae1]" />
            <span>🧪 Diagnóstico de Conexión en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('proc_listar')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'proc_listar'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>prc_obtener_pacientes_pagina</span>
          </button>

          <button
            onClick={() => setActiveTab('proc_total')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'proc_total'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>prc_obtener_total_paginas (Resumen Paginación)</span>
          </button>

          <button
            onClick={() => setActiveTab('fields')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'fields'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Regla Orden Especialidades (ID 17, 36, 37)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {activeTab === 'test_connection' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-[#e2e8eb] dark:border-[#334155] shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">
                      Prueba de Conexión a Oracle DB desde Servidor (Vercel API)
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Prueba en tiempo real ejecutando <code>SELECT 1 FROM DUAL</code> e inspección de variables de entorno.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-[#00aae1] hover:bg-[#0196d4] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <Database className="w-4 h-4" />
                    <span>{isTesting ? 'Probando conexión...' : 'Ejecutar Diagnóstico Ahora'}</span>
                  </button>
                </div>

                {testResult ? (
                  <div className="space-y-3 pt-3 border-t border-[#e2e8eb] dark:border-[#334155]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          testResult.status === 'connection_success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {testResult.status === 'connection_success' ? '✓ Conexión Exitosa' : '❌ Error de Conexión'}
                        </span>
                        {testResult.tiempo_respuesta_ms && (
                          <span className="font-mono text-xs text-gray-500">
                            ({testResult.tiempo_respuesta_ms} ms)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyTestResult}
                        className="px-3 py-1 bg-white dark:bg-[#1e293b] border border-[#e2e8eb] dark:border-[#334155] rounded-lg text-xs font-semibold text-[#035476] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        {copiedTest ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-gray-500" />
                            <span>Copiar Resultado</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-[#0f172a] text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-emerald-900/50 shadow-inner">
                      <pre>{JSON.stringify(testResult, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-[#0f172a] rounded-xl text-center text-xs text-gray-500 border border-dashed border-gray-300 dark:border-gray-700">
                    Haz clic en <strong>"Ejecutar Diagnóstico Ahora"</strong> para verificar el estado de la conexión a Oracle BD.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'proc_listar' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 shrink-0 text-[#00aae1] mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-sm mb-1">Procedimiento de Consulta de Página Activa:</p>
                  Recibe el número de página a mostrar (`pagina`) y `registros_por_pagina`. Analiza y devuelve los pacientes respetando el orden obligatorio de especialidades: <strong>1. ID 17 (Medicina General)</strong>, <strong>2. ID 36 (Psicología)</strong>, <strong>3. ID 37 (Nutrición)</strong> y posteriormente las demás especialidades asignadas.
                </div>
              </div>

              {/* Procedure Signature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">Firma del Procedimiento de PL/SQL:</h3>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-[#effaff] dark:bg-[#1e293b] text-[#00aae1] dark:text-[#38bdf8] border border-[#00aae1]/30 hover:bg-[#00aae1] hover:text-white transition-all cursor-pointer font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Ejemplo EXEC'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-gray-900 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner border border-gray-800">
{`PROCEDURE prc_obtener_pacientes_pagina (
  p_json_entrada IN  CLOB, -- JSON con pagina, registros_por_pagina y filtros
  p_json_salida  OUT CLOB  -- JSON con paginacion, especialidades_orden y lista de pacientes
);`}
                </pre>
              </div>

              {/* Grid with JSON Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* JSON Entrada */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#033d59] dark:text-[#e2e8f0] uppercase tracking-wider">
                      JSON de Entrada (<code className="font-mono text-[#00aae1]">p_json_entrada</code>)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono">
                      IN CLOB
                    </span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0f172a] text-sky-300 font-mono text-xs overflow-x-auto max-h-[380px] shadow-inner border border-slate-800 leading-relaxed">
{jsonPaginaEntradaEjemplo}
                  </pre>
                </div>

                {/* JSON Salida */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#033d59] dark:text-[#e2e8f0] uppercase tracking-wider">
                      JSON de Salida (<code className="font-mono text-[#01ae6c]">p_json_salida</code>)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                      OUT CLOB
                    </span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0f172a] text-amber-300 font-mono text-xs overflow-x-auto max-h-[380px] shadow-inner border border-slate-800 leading-relaxed">
{jsonPaginaSalidaEjemplo}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proc_total' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-sm mb-1">Procedimiento de Cálculo de Paginación y Totales:</p>
                  Recibe únicamente los filtros activos y `registros_por_pagina` para retornar de forma ultrarrápida el `total_registros` encontrados y la cantidad de `total_paginas` a renderizar en la barra de paginación del frontend.
                </div>
              </div>

              {/* Procedure Signature */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">Firma del Procedimiento de PL/SQL:</h3>
                <pre className="p-4 rounded-xl bg-gray-900 text-purple-400 font-mono text-xs overflow-x-auto shadow-inner border border-gray-800">
{`PROCEDURE prc_obtener_total_paginas (
  p_json_entrada IN  CLOB, -- JSON con registros_por_pagina y filtros
  p_json_salida  OUT CLOB  -- JSON con codigo_respuesta, total_registros y total_paginas
);`}
                </pre>
              </div>

              {/* Grid with JSON Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="font-bold text-xs text-[#033d59] dark:text-[#e2e8f0] uppercase tracking-wider block">
                    JSON de Entrada (<code className="font-mono text-[#00aae1]">p_json_entrada</code>)
                  </span>
                  <pre className="p-4 rounded-xl bg-[#0f172a] text-sky-300 font-mono text-xs overflow-x-auto max-h-[300px] shadow-inner border border-slate-800 leading-relaxed">
{jsonTotalEntradaEjemplo}
                  </pre>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-xs text-[#033d59] dark:text-[#e2e8f0] uppercase tracking-wider block">
                    JSON de Salida (<code className="font-mono text-[#01ae6c]">p_json_salida</code>)
                  </span>
                  <pre className="p-4 rounded-xl bg-[#0f172a] text-amber-300 font-mono text-xs overflow-x-auto max-h-[300px] shadow-inner border border-slate-800 leading-relaxed">
{jsonTotalSalidaEjemplo}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">Regla de Ordenamiento de Especialidades en la Tabla:</h3>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2 text-emerald-900 dark:text-emerald-200 text-xs">
                <p className="font-bold">Prioridad Obligatoria de Especialidades:</p>
                <ol className="list-decimal pl-5 space-y-1 font-mono">
                  <li><strong>ID Especialidad 17</strong>: Medicina General (llave en JSON: <code className="bg-emerald-200/50 dark:bg-emerald-900 px-1 py-0.5 rounded">med_gen</code>)</li>
                  <li><strong>ID Especialidad 36</strong>: Psicología (llave en JSON: <code className="bg-emerald-200/50 dark:bg-emerald-900 px-1 py-0.5 rounded">psicol</code>)</li>
                  <li><strong>ID Especialidad 37</strong>: Nutrición (llave en JSON: <code className="bg-emerald-200/50 dark:bg-emerald-900 px-1 py-0.5 rounded">nutri</code>)</li>
                  <li>Demás especialidades adicionales del paciente (<code className="bg-emerald-200/50 dark:bg-emerald-900 px-1 py-0.5 rounded">esp_1</code>, <code className="bg-emerald-200/50 dark:bg-emerald-900 px-1 py-0.5 rounded">esp_2</code>, <code className="bg-emerald-200/50 dark:bg-emerald-900 px-1 py-0.5 rounded">esp_3</code>, etc.)</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e2e8eb] dark:border-[#334155] bg-gray-50 dark:bg-[#1e293b] flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Archivo generado: <code className="font-mono text-[#00aae1]">pkgln_pacientes_giris.sql</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00aae1] hover:bg-[#0196d4] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Cerrar Documentación
          </button>
        </div>

      </div>
    </div>
  );
};
