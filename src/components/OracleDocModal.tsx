import React, { useState } from 'react';
import { X, Database, Code, FileText, Check, Copy, HelpCircle, Layers } from 'lucide-react';

interface OracleDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OracleDocModal: React.FC<OracleDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'proc_listar' | 'proc_guardar' | 'fields'>('proc_listar');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonEntradaEjemplo = JSON.stringify(
    {
      pagina: 1,
      registros_por_pagina: 10,
      filtros: {
        estado: 'Activo',
        cohorte: 'ACTIVO',
        seguimiento: 'Todos',
        coordinador: 'Anyeli Ledezma',
        convenioNombre: 'EPS Suramericana Cuidate360',
        identificacion: '52.849.182',
        nombresApellidos: 'Valeria',
        soloVencidas: false,
        soloAlarmas: true,
        fastFilter: 'Todos'
      }
    },
    null,
    2
  );

  const jsonSalidaEjemplo = JSON.stringify(
    {
      codigo_respuesta: 0,
      mensaje_respuesta: "Consulta realizada exitosamente",
      paginacion: {
        pagina_actual: 1,
        registros_por_pagina: 10,
        total_registros: 14,
        total_paginas: 2
      },
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
            }
          }
        }
      ]
    },
    null,
    2
  );

  const handleCopySql = () => {
    const textToCopy = `EXEC pkgln_pacientes_giris.prc_obtener_pacientes(p_json_entrada => '${jsonEntradaEjemplo.replace(/\n/g, '')}', p_json_salida => :v_salida);`;
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
                  Documentación Integración Oracle DB
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
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center px-6 border-b border-[#e2e8eb] dark:border-[#334155] bg-gray-50 dark:bg-[#1e293b]/50 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('proc_listar')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'proc_listar'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>prc_obtener_pacientes (JSON IN/OUT)</span>
          </button>

          <button
            onClick={() => setActiveTab('fields')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'fields'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catálogo de Campos</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#00aae1] text-[#00aae1] dark:text-[#38bdf8]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#033d59] dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Arquitectura y Conexión</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {activeTab === 'proc_listar' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 shrink-0 text-[#00aae1] mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-sm mb-1">Contrato de Comunicación Estricto:</p>
                  Todas las interacciones entre la aplicación React y el paquete Oracle <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200 font-bold">pkgln_pacientes_giris</code> se ejecutan sin sentencias DML directas, utilizando únicamente dos variables de tipo <strong>CLOB JSON</strong>.
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
{`PROCEDURE prc_obtener_pacientes (
  p_json_entrada IN  CLOB, -- Parámetros de filtros y paginación
  p_json_salida  OUT CLOB  -- Código de respuesta, paginación y arreglo de pacientes
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
{jsonEntradaEjemplo}
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
{jsonSalidaEjemplo}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">Explicación Detallada de Campos del Objeto Paciente:</h3>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-[#1e293b] text-[#033d59] dark:text-[#f8fafc] border-b border-gray-200 dark:border-gray-800 font-semibold">
                      <th className="p-3">Campo JSON</th>
                      <th className="p-3">Tipo Oracle</th>
                      <th className="p-3">Descripción / Valores posibles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">id</td>
                      <td className="p-3 font-mono text-gray-500">VARCHAR2(50)</td>
                      <td className="p-3">Identificador único del paciente (ej: "PAT-001")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">nombre</td>
                      <td className="p-3 font-mono text-gray-500">VARCHAR2(200)</td>
                      <td className="p-3">Nombres y apellidos completos</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">identificacion</td>
                      <td className="p-3 font-mono text-gray-500">VARCHAR2(50)</td>
                      <td className="p-3">Documento de identidad (ej: "CC 52.849.182")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">cohorte</td>
                      <td className="p-3 font-mono text-gray-500">VARCHAR2(100)</td>
                      <td className="p-3">Estado de cohorte ("ACTIVO", "ACEPTADO", "PROSPECTO", "RECHAZO EL SERVICIO", "FUERA DE AREA", etc.)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">estado</td>
                      <td className="p-3 font-mono text-gray-500">VARCHAR2(50)</td>
                      <td className="p-3">Estado clínico ("Activo", "Aceptado", "Rechazado")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">riesgo</td>
                      <td className="p-3 font-mono text-gray-500">VARCHAR2(50)</td>
                      <td className="p-3">Nivel de riesgo ("Critical", "High", "Medium", "Low")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">etiqueta / retroalimentacion</td>
                      <td className="p-3 font-mono text-gray-500">VARCHAR2(100)</td>
                      <td className="p-3">Indicador de satisfacción ("Inconforme", "Satisfecho")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">hasAlarm / alarmReasons</td>
                      <td className="p-3 font-mono text-gray-500">BOOLEAN / ARRAY</td>
                      <td className="p-3">Flag de alertas críticas e historial de causas de la alarma</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">specialists</td>
                      <td className="p-3 font-mono text-gray-500">OBJECT</td>
                      <td className="p-3">Objeto de atenciones por especialidad (med_gen, nutri, psicol, esp_1, esp_2, esp_3, esp_4) con flags de vencimiento <code className="font-mono text-amber-600 font-bold">isOverdue</code></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-[#00aae1]">acta</td>
                      <td className="p-3 font-mono text-gray-500">OBJECT</td>
                      <td className="p-3">Información del acta del comité médico (número, fecha, resumen, integrantes)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4 leading-relaxed">
              <h3 className="font-bold text-sm text-[#033d59] dark:text-[#f8fafc]">Configuración de Entorno de Base de Datos:</h3>
              <div className="p-4 rounded-xl bg-gray-900 text-gray-200 font-mono text-xs space-y-2 border border-gray-800">
                <p><span className="text-[#38bdf8]">ORACLE_DB_USER</span> = TEKER_DEV</p>
                <p><span className="text-[#38bdf8]">ORACLE_DB_CONNECTION_STRING</span> = tekersalud-db.maxapex.net:1521/orclpdb1</p>
                <p><span className="text-[#38bdf8]">PAQUETE PL/SQL</span> = pkgln_pacientes_giris</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
                <p className="font-bold mb-1">Cero Sentencias DML en Frontend / Backend Node:</p>
                El frontend ejecuta un llamado al endpoint <code className="font-mono font-bold bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">GET /api/patients</code>. Toda la lógica de negocio y filtrado se delega a <code className="font-mono font-bold bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">pkgln_pacientes_giris.prc_obtener_pacientes</code>.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e2e8eb] dark:border-[#334155] bg-gray-50 dark:bg-[#1e293b] flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Presiona <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-[#033d59] dark:text-gray-200 rounded font-mono text-[10px]">ESC</kbd> o <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-[#033d59] dark:text-gray-200 rounded font-mono text-[10px]">Ctrl + Alt + D</kbd> para cerrar.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00aae1] hover:bg-[#0196d4] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
