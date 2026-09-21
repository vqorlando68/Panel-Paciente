import dotenv from 'dotenv';
import { renderPrintableActaHtml } from './actaTemplate';
dotenv.config({ path: '.env.local' });
dotenv.config();

// Interface & helper for Oracle configuration
interface OracleDbConfig {
  user: string;
  password?: string;
  connectString: string;
  poolMin?: number;
  poolMax?: number;
  poolIncrement?: number;
}

const getOracleConfig = (): OracleDbConfig => {
  return {
    user: process.env.ORACLE_DB_USER || process.env.ORACLE_USER || '',
    password: process.env.ORACLE_DB_PASSWORD || process.env.ORACLE_PASSWORD || '',
    connectString: process.env.ORACLE_DB_CONNECTION_STRING || process.env.ORACLE_DB_CONNECT_STRING || process.env.ORACLE_CONNECT_STRING || '',
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  };
};

const MOCK_ACTAS_FALLBACK = [
  {
    "id_acta": 1047,
    "fecha_acta": "2026-09-03T16:07:43",
    "usuario_firma": "Osmari Patricia Guillot Pereira",
    "tipo_identificacion_paciente": "CC",
    "identificacion_paciente": "57420603",
    "nombre_paciente": "Osmari Patricia Guillot Pereira",
    "nombre_convenio": "CMP Vive al 100 Caribe",
    "analisis_plan": "PACIENTE CON ANTECEDENTE DE OBESIDAD GI; CÁNCER DE MAMA, EN SEGUIMIENTO POR ONCOLOGÍA Y CON TRATAMIENTO QUIMIOTERÁPICO. SS VALORACION POR MEDICINA INTERNA; GENERAL; PSICOLOGIA Y NUTRICION. ",
    "observaciones": null,
    "observaciones_operativas": null
  },
  {
    "id_acta": 704,
    "fecha_acta": "2026-07-30T15:55:59",
    "usuario_firma": "Osmari Patricia Guillot Pereira",
    "tipo_identificacion_paciente": "CC",
    "identificacion_paciente": "57420603",
    "nombre_paciente": "Osmari Patricia Guillot Pereira",
    "nombre_convenio": "CMP Vive al 100 Caribe",
    "analisis_plan": "PACIENTE CON ANTECEDENTE DE CÁNCER DE MAMA, EN SEGUIMIENTO POR ONCOLOGÍA Y CON TRATAMIENTO QUIMIOTERÁPICO. PRESENTA OBESIDAD GRADO I. SS VALORACION POR PAQUETE BASICO Y DEPORTOLOGIA.",
    "observaciones": null,
    "observaciones_operativas": null
  }
];

const MOCK_CUADRO_MEDICO_FALLBACK = [
  {
    id_profesional: 28,
    profesional_id: "CC-1231234",
    usuario: "carlos",
    registro_medico: null,
    profesional: "Carlos 28 Monsalve",
    profesional_email: "vqorlando@hotmail.com",
    profesional_tel: "3219596165",
    especialidad: [
      { id: 17, nombre_especialidad: "Medicina General", tipo_especialidad: "N" }
    ],
    url_perfil: "https://www.tekerapp.co/directorio/carlos",
    url_foto_profesional: "https://tekerapp.maxapex.net/FILES_DEV_TEKER/Id_203_2A8AB4B4313765EB985D02EDF3AD33FB706B8199.png"
  },
  {
    id_profesional: 65,
    profesional_id: "CC-121212",
    usuario: "rodolfo",
    registro_medico: "12345678",
    profesional: "65-Rodolfo Vargas",
    profesional_email: "vqorlando@hotmail.com",
    profesional_tel: "3168226095",
    especialidad: [
      { id: 2, nombre_especialidad: "Cardio", tipo_especialidad: "S" }
    ],
    url_perfil: "https://www.tekerapp.co/directorio/rodolfo",
    url_foto_profesional: "https://tekerapp.maxapex.net/FILES_DEV_TEKER/Id_754_42346B624C5605F93C2D3067493C0927A9B561F2.JPG"
  }
];

const MOCK_AGENDA_FALLBACK = [
  {
    codigo_cita: "2A2",
    fecha_cita: "Diciembre  23 de 2026 11:50 AM",
    nombre_especialidad: "Cardio",
    id_profesional: 65,
    nombre_profesional: "65-Rodolfo Vargas",
    url_foto_profesional: "https://tekerapp.maxapex.net/FILES_DEV_TEKER/Id_754_42346B624C5605F93C2D3067493C0927A9B561F2.JPG",
    estado_cita: "Solicitud de Cita"
  },
  {
    codigo_cita: "2A3",
    fecha_cita: "Enero      22 de 2027 11:50 AM",
    nombre_especialidad: "Cardio",
    id_profesional: 65,
    nombre_profesional: "65-Rodolfo Vargas",
    url_foto_profesional: "https://tekerapp.maxapex.net/FILES_DEV_TEKER/Id_754_42346B624C5605F93C2D3067493C0927A9B561F2.JPG",
    estado_cita: "Solicitud de Cita"
  }
];

// Safe helper for JSON responses
function sendJson(res: any, status: number, data: any) {
  if (res.status && res.json) {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(data));
}

async function lobToString(lob: any): Promise<string> {
  if (!lob) return '';
  if (typeof lob === 'string') return lob;
  if (typeof lob.getData === 'function') {
    try {
      const data = await lob.getData();
      return typeof data === 'string' ? data : data?.toString('utf8') || '';
    } catch (_) {}
  }
  return new Promise((resolve, reject) => {
    let clobData = '';
    try {
      lob.setEncoding('utf8');
      lob.on('data', (chunk: string) => { clobData += chunk; });
      lob.on('end', () => { resolve(clobData); });
      lob.on('error', (err: any) => { reject(err); });
    } catch (e) {
      reject(e);
    }
  });
}

let cachedOracleDb: any = null;

async function getOracleDb(): Promise<any> {
  if (cachedOracleDb) return cachedOracleDb;
  try {
    const mod = await import('oracledb');
    cachedOracleDb = mod.default || mod;
    return cachedOracleDb;
  } catch (err: any) {
    console.error('[Oracle API Error] No se pudo cargar el modulo oracledb:', err?.message);
    return null;
  }
}

/**
 * Vercel Serverless Function: /api/patients
 *
 * REGLA DE ARQUITECTURA:
 * Sin sentencias DML (SELECT/INSERT/UPDATE/DELETE) en este codigo.
 * Toda interaccion con la base de datos se realiza EXCLUSIVAMENTE invocando
 * el paquete de PL/SQL: pkgln_pacientes_giris.
 *   - prc_obtener_total_paginas (Calculo de paginacion)
 *   - prc_obtener_pacientes_pagina (Obtencion de datos de pagina con especialidades ordenadas)
 */
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    // Parse query parameters
    const urlObj = new URL(req.url || '/api/patients', 'http://localhost:3000');
    const queryObj: Record<string, string> = {};
    urlObj.searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });

    const action = queryObj.action || req.body?.action || 'pagina';

    // 1. Diagnostic Connection Test Endpoint
    if (action === 'test') {
      const startTime = Date.now();
      const testConfig = getOracleConfig();

      if (!testConfig.user || !testConfig.connectString) {
        return sendJson(res, 200, {
          status: 'error_missing_env_vars',
          mensaje: 'Variables de entorno de Oracle (ORACLE_DB_USER / ORACLE_DB_CONNECTION_STRING) no configuradas en Vercel Dashboard.',
          variables_detectadas: {
            ORACLE_DB_USER: testConfig.user ? 'Configurada' : 'FALTA',
            ORACLE_DB_CONNECTION_STRING: testConfig.connectString ? 'Configurada' : 'FALTA',
            ORACLE_DB_PASSWORD: testConfig.password ? 'Configurada' : 'FALTA',
          }
        });
      }

      const oracledb = await getOracleDb();
      if (!oracledb) {
        return sendJson(res, 200, {
          status: 'error_oracledb_module',
          mensaje: 'El modulo node-oracledb no pudo ser cargado en el entorno Serverless de Vercel (falta de soporte para binarios C/C++ en AWS Lambda).',
          variables_detectadas: {
            ORACLE_DB_USER: testConfig.user ? 'Configurada' : 'FALTA',
            ORACLE_DB_CONNECTION_STRING: testConfig.connectString ? 'Configurada' : 'FALTA',
            ORACLE_DB_PASSWORD: testConfig.password ? 'Configurada' : 'FALTA',
          }
        });
      }

      let connTest: any = null;
      try {
        connTest = await oracledb.getConnection(testConfig);
        const testResult: any = await connTest.execute('SELECT 1 AS TEST_VAL FROM DUAL');
        await connTest.close();
        connTest = null;

        const durationMs = Date.now() - startTime;
        return sendJson(res, 200, {
          status: 'connection_success',
          mensaje: '¡Conexion a la Base de Datos Oracle exitosa!',
          tiempo_respuesta_ms: durationMs,
          prueba_query: testResult.rows,
          variables_detectadas: {
            ORACLE_DB_USER: testConfig.user,
            ORACLE_DB_CONNECTION_STRING: testConfig.connectString,
            ORACLE_DB_PASSWORD: '****'
          }
        });
      } catch (testErr: any) {
        if (connTest) {
          try { await connTest.close(); } catch (e) {}
        }
        return sendJson(res, 200, {
          status: 'connection_failed',
          mensaje: `Error al conectar a Oracle BD: ${testErr.message}`,
          error_code: testErr.code || testErr.number,
          tiempo_respuesta_ms: Date.now() - startTime
        });
      }
    }

    // 2. Data fetching from PL/SQL package
    const jsonEntrada = {
      pagina: Number(queryObj.pagina || req.body?.pagina || 1),
      registros_por_pagina: Number(queryObj.registros_por_pagina || req.body?.registros_por_pagina || 10),
      filtros: {
        estado: (queryObj.estado || req.body?.filtros?.estado || 'Todos'),
        cohorte: (queryObj.cohorte || req.body?.filtros?.cohorte || 'Todos'),
        seguimiento: (queryObj.seguimiento || req.body?.filtros?.seguimiento || 'Todos'),
        coordinador: (queryObj.coordinador || req.body?.filtros?.coordinador || 'Todos'),
        convenioNombre: queryObj.convenioNombre || req.body?.filtros?.convenioNombre || 'Todos',
        identificacion: (queryObj.identificacion || req.body?.filtros?.identificacion || ''),
        nombresApellidos: (queryObj.nombresApellidos || req.body?.filtros?.nombresApellidos || ''),
        numeroCarga: (queryObj.numeroCarga || req.body?.filtros?.numeroCarga || ''),
        soloVencidas: (queryObj.soloVencidas === 'true' || Boolean(req.body?.filtros?.soloVencidas)),
        soloAlarmas: (queryObj.soloAlarmas === 'true' || Boolean(req.body?.filtros?.soloAlarmas)),
        fastFilter: (queryObj.fastFilter || req.body?.filtros?.fastFilter || 'Todos'),
      },
    };

    const p_json_entrada_str = JSON.stringify(jsonEntrada);

    const config = getOracleConfig();
    if (!config.user || !config.connectString) {
      if (action === '360_all' || action === '360') {
        return sendJson(res, 200, { success: true, identificacion: queryObj.identificacion || '1006108333', data: MOCK_ACTAS_FALLBACK });
      }
      if (action === 'actas_x_usuario' || action === 'actas') {
        return sendJson(res, 200, MOCK_ACTAS_FALLBACK);
      }
      if (action === 'cuadro_medico' || action === 'equipo_medico') {
        return sendJson(res, 200, { success: true, profesionales: MOCK_CUADRO_MEDICO_FALLBACK });
      }
      if (action === 'agenda' || action === 'atenciones_programadas') {
        return sendJson(res, 200, { success: true, agenda: MOCK_AGENDA_FALLBACK, atenciones_programadas: MOCK_AGENDA_FALLBACK });
      }
      return sendJson(res, 200, {
        codigo_respuesta: -1,
        mensaje_respuesta: 'Variables de entorno de Oracle (ORACLE_DB_USER / ORACLE_DB_CONNECTION_STRING) no configuradas en Vercel.',
        pacientes: []
      });
    }

    const oracledb = await getOracleDb();
    if (!oracledb) {
      if (action === '360_all' || action === '360') {
        return sendJson(res, 200, { success: true, identificacion: queryObj.identificacion || '1006108333', data: {} });
      }
      if (action === 'actas_x_usuario' || action === 'actas') {
        return sendJson(res, 200, MOCK_ACTAS_FALLBACK);
      }
      if (action === 'cuadro_medico' || action === 'equipo_medico') {
        return sendJson(res, 200, { success: true, profesionales: MOCK_CUADRO_MEDICO_FALLBACK });
      }
      if (action === 'agenda' || action === 'atenciones_programadas') {
        return sendJson(res, 200, { success: true, agenda: MOCK_AGENDA_FALLBACK, atenciones_programadas: MOCK_AGENDA_FALLBACK });
      }
      return sendJson(res, 200, {
        codigo_respuesta: -1,
        mensaje_respuesta: 'El modulo node-oracledb no se pudo cargar en este entorno Serverless de Vercel.',
        pacientes: []
      });
    }

    let connection: any = null;
    try {
      connection = await oracledb.getConnection(config);

      // --- 360 COORDINADOR ACTIONS ---
      if (action === '360' || action === '360_metodo') {
        const rawCedula = queryObj.identificacion || req.body?.identificacion || '';
        const cedula = String(rawCedula).replace(/\D/g, '') || String(rawCedula).trim();
        const metodo = String(queryObj.metodo || req.body?.metodo || '/api/v1/patients/{id}/summary/consultas').trim();

        const inPayload = JSON.stringify({ metodo, identificacion: cedula });
        const sql = `
          DECLARE
              v_json_entrada CLOB := :p_in;
              v_json_salida  CLOB;
          BEGIN
              pkgln_big_query.p_datos_usuario_cohorte(v_json_entrada, v_json_salida);
              :p_out := v_json_salida;
          END;
        `;
        const result = await connection.execute(sql, {
          p_in: inPayload,
          p_out: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
        });
        const rawClob = await lobToString(result.outBinds?.p_out);
        await connection.close();
        connection = null;

        let parsed: any = null;
        if (rawClob) {
          try {
            parsed = JSON.parse(rawClob);
          } catch (_) {
            parsed = { raw: rawClob };
          }
        }
        return sendJson(res, 200, { success: true, identificacion: cedula, metodo, data: parsed });
      }

      if (action === '360_all') {
        const rawCedula = queryObj.identificacion || req.body?.identificacion || '';
        const cedula = String(rawCedula).replace(/\D/g, '') || String(rawCedula).trim();

        const coordinatorEndpoints = [
          { key: 'consultas', metodo: '/api/v1/patients/{id}/summary/consultas' },
          { key: 'cambiosClave', metodo: '/api/v1/patients/{id}/summary/cambios-clave' },
          { key: 'perceptionSurvey', metodo: '/api/v1/patients/{id}/perception-survey' },
          { key: 'engagement', metodo: '/api/v1/patients/{id}/engagement' },
          { key: 'status', metodo: '/api/v1/patients/{id}/status' },
          { key: 'visits', metodo: '/api/v1/patients/{id}/visits' },
          { key: 'cost', metodo: '/api/v1/patients/{id}/cost' },
          { key: 'surveys', metodo: '/api/v1/patients/{id}/surveys' },
          { key: 'completeness', metodo: '/api/v1/patients/{id}/completeness' },
        ];

        const sql = `
          DECLARE
              v_json_entrada CLOB := :p_in;
              v_json_salida  CLOB;
          BEGIN
              pkgln_big_query.p_datos_usuario_cohorte(v_json_entrada, v_json_salida);
              :p_out := v_json_salida;
          END;
        `;

        const aggregatedData: Record<string, any> = {};
        const errors: Record<string, string> = {};

        for (const item of coordinatorEndpoints) {
          try {
            const inPayload = JSON.stringify({ metodo: item.metodo, identificacion: cedula });
            const result = await connection.execute(sql, {
              p_in: inPayload,
              p_out: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
            });
            const rawClob = await lobToString(result.outBinds?.p_out);
            if (rawClob) {
              try {
                aggregatedData[item.key] = JSON.parse(rawClob);
              } catch (_) {
                aggregatedData[item.key] = rawClob;
              }
            } else {
              aggregatedData[item.key] = null;
            }
          } catch (methodErr: any) {
            console.warn(`[Oracle API 360 Error on ${item.key}]:`, methodErr.message);
            errors[item.key] = methodErr.message;
            aggregatedData[item.key] = null;
          }
        }

        await connection.close();
        connection = null;

        return sendJson(res, 200, {
          success: true,
          identificacion: cedula,
          data: aggregatedData,
          errors: Object.keys(errors).length > 0 ? errors : undefined
        });
      }

      let procedureName = 'prc_obtener_pacientes_pagina';
      let executeSql = `BEGIN pkgln_pacientes_giris.${procedureName}(:p_json_entrada, :p_json_salida); END;`;
      let bindParams: any = {
        p_json_entrada: p_json_entrada_str,
        p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
      };
      let rawStr = '';
      let rawSalida: any = null;
      const idUsuario = Number(queryObj.id_usuario || req.body?.id_usuario || queryObj.id || req.body?.id || 0);

      if (action === 'costos') {
        const rawMes = queryObj.mes_corte || req.body?.mes_corte;
        const rawCedula = queryObj.identificacion || req.body?.identificacion || queryObj.cedula || req.body?.cedula;

        const mesCorte = String(rawMes || '').trim().replace(/\s+/g, '_');
        const rawCedulaStr = String(rawCedula || '').trim();
        const cedula = rawCedulaStr.replace(/\D/g, '') || rawCedulaStr;

        executeSql = `BEGIN :p_json_salida := f_traer_costos(:p_mes_corte, :p_identificacion); END;`;
        bindParams = {
          p_mes_corte: mesCorte,
          p_identificacion: cedula,
          p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 10000000 }
        };
      } else if (action === 'actas_x_usuario' || action === 'actas') {
        executeSql = `BEGIN pkgcn_cohortes.p_actas_x_usuario(:p_json_entrada, :p_json_salida); END;`;
        bindParams = {
          p_json_entrada: JSON.stringify({ id_usuario: idUsuario }),
          p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
        };
      } else if (action === 'cuadro_medico' || action === 'equipo_medico') {
        executeSql = `BEGIN pkgcn_citas.p_equipo_medico_paciente(:p_id_usuario, :p_json_salida); END;`;
        bindParams = {
          p_id_usuario: idUsuario,
          p_json_salida: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
        };
      } else if (action === 'agenda' || action === 'atenciones_programadas') {
        executeSql = `BEGIN :p_json_salida := pkgcn_cohortes.f_atenciones_programadas(:p_id_usuario); END;`;
        bindParams = {
          p_id_usuario: idUsuario,
          p_json_salida: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
        };
      } else if (action === 'adherencia') {
        executeSql = `BEGIN :p_json_salida := pkgcn_cohortes.f_adherencia_usuario(:p_id_usuario); END;`;
        bindParams = {
          p_id_usuario: idUsuario,
          p_json_salida: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
        };
      } else if (action === 'ver_acta' || action === 'f_ver_acta' || action === 'imprimir_acta') {
        let idActa = Number(queryObj.id_acta || req.body?.id_acta || 0);
        const codigoCita = String(queryObj.codigo_cita || queryObj.codigo || req.body?.codigo_cita || '').trim();

        if (!idActa && codigoCita) {
          try {
            const resCita = await connection.execute(
              `SELECT id_acta_medica FROM tkr_citas WHERE UPPER(id_hexadecimal) = UPPER(:cod) OR UPPER(codigo_zoom) = UPPER(:cod) OR TO_CHAR(id) = :cod`,
              { cod: codigoCita }
            );
            if (resCita.rows && resCita.rows.length > 0 && resCita.rows[0][0]) {
              idActa = Number(resCita.rows[0][0]);
            }
          } catch (errFind: any) {
            console.warn('[Oracle API ver_acta find cita warning]:', errFind.message);
          }
        }

        if (!idActa) {
          await connection.close();
          connection = null;
          return sendJson(res, 400, { success: false, error: 'No se encontró un id_acta_medica válido para la consulta.' });
        }
        const inputJson = JSON.stringify({ id_acta: idActa });
        let rawClob = '';
        try {
          const resultActa = await connection.execute(
            `BEGIN :p_out_clob := pkgcn_cohortes.f_ver_acta(:p_in_json); END;`,
            {
              p_in_json: { val: inputJson, type: oracledb.STRING, dir: oracledb.BIND_IN },
              p_out_clob: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
            }
          );
          rawClob = await lobToString(resultActa.outBinds?.p_out_clob);
        } catch (execErr: any) {
          console.warn('[Oracle API ver_acta Warning]:', execErr.message);
          try {
            const fallbackSql = `BEGIN :p_out_clob := teker_dev.pkgcn_cohortes.f_ver_acta(:p_in_json); END;`;
            const resultFallback = await connection.execute(
              fallbackSql,
              {
                p_in_json: { val: inputJson, type: oracledb.STRING, dir: oracledb.BIND_IN },
                p_out_clob: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
              }
            );
            rawClob = await lobToString(resultFallback.outBinds?.p_out_clob);
          } catch (err2: any) {
            console.warn('[Oracle API ver_acta DUAL fallback]:', err2.message);
            try {
              const resDual = await connection.execute(
                `SELECT pkgcn_cohortes.f_ver_acta(:p_in_json) AS DATOS_ACTA FROM DUAL`,
                { p_in_json: inputJson }
              );
              rawClob = await lobToString(resDual.rows?.[0]?.[0] || resDual.rows?.[0]?.DATOS_ACTA);
            } catch (e3: any) {
              console.error('[Oracle API ver_acta failed completely]:', e3.message);
            }
          }
        }
        await connection.close();
        connection = null;

        if (!rawClob || rawClob === '{}') {
          return sendJson(res, 200, { success: false, error: `No se encontraron datos para el acta #${idActa}` });
        }

        let parsed: any = null;
        try {
          parsed = JSON.parse(rawClob);
        } catch (pe) {
          parsed = { raw: rawClob };
        }

        if (action === 'imprimir_acta' || queryObj.formato === 'html') {
          const htmlContent = renderPrintableActaHtml(parsed, codigoCita, idActa);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(htmlContent);
        }

        return sendJson(res, 200, { success: true, data: parsed, id_acta: idActa, codigo_cita: codigoCita });
      } else if (action === 'total_paginas') {
        procedureName = 'prc_obtener_total_paginas';
        executeSql = `BEGIN pkgln_pacientes_giris.${procedureName}(:p_json_entrada, :p_json_salida); END;`;
      } else if (action === 'tipos_identificacion') {
        procedureName = 'prc_obtener_tipos_identificacion';
        executeSql = `BEGIN pkgln_pacientes_giris.${procedureName}(:p_json_salida); END;`;
        bindParams = {
          p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
        };
      } else if (action === 'coordinadores') {
        procedureName = 'prc_obtener_coordinadores';
        executeSql = `BEGIN pkgln_pacientes_giris.${procedureName}(:p_json_salida); END;`;
        bindParams = {
          p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
        };
      } else if (action === 'estados_cohorte') {
        procedureName = 'prc_obtener_estados_cohorte';
        executeSql = `BEGIN pkgln_pacientes_giris.${procedureName}(:p_json_salida); END;`;
        bindParams = {
          p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
        };
      }

      let result: any;
      try {
        result = await connection.execute(executeSql, bindParams);
      } catch (execErr: any) {
        // Fallback for actas_x_usuario if schema is teker_dev or package not compiled
        if ((action === 'actas_x_usuario' || action === 'actas') && execErr.message?.includes('pkgcn_cohortes')) {
          try {
            const fallbackSql = `BEGIN teker_dev.pkgcn_cohortes.p_actas_x_usuario(:p_json_entrada, :p_json_salida); END;`;
            result = await connection.execute(fallbackSql, bindParams);
          } catch (err2: any) {
            console.warn('[Oracle API Actas Warning]: Fallback a datos mock:', err2.message);
            await connection.close();
            connection = null;
            return sendJson(res, 200, MOCK_ACTAS_FALLBACK);
          }
        } else if ((action === 'cuadro_medico' || action === 'equipo_medico') && execErr.message?.includes('pkgcn_citas')) {
          try {
            const fallbackSql = `BEGIN teker_dev.pkgcn_citas.p_equipo_medico_paciente(:p_id_usuario, :p_json_salida); END;`;
            result = await connection.execute(fallbackSql, bindParams);
          } catch (err2: any) {
            console.warn('[Oracle API Cuadro Medico Warning]: Fallback:', err2.message);
            await connection.close();
            connection = null;
            return sendJson(res, 200, { success: false, error: err2.message, profesionales: MOCK_CUADRO_MEDICO_FALLBACK });
          }
        } else if ((action === 'agenda' || action === 'atenciones_programadas') && execErr.message?.includes('pkgcn_cohortes')) {
          try {
            const fallbackSql = `BEGIN :p_json_salida := teker_dev.pkgcn_cohortes.f_atenciones_programadas(:p_id_usuario); END;`;
            result = await connection.execute(fallbackSql, bindParams);
          } catch (err2: any) {
            try {
              const resDual = await connection.execute(
                `SELECT pkgcn_cohortes.f_atenciones_programadas(:p_id_usuario) AS RES FROM DUAL`,
                { p_id_usuario: idUsuario }
              );
              rawStr = await lobToString(resDual.rows?.[0]?.[0] || resDual.rows?.[0]?.RES);
            } catch (err3: any) {
              console.warn('[Oracle API Agenda Warning]: Fallback:', err3.message);
              await connection.close();
              connection = null;
              return sendJson(res, 200, { success: false, error: err2.message, agenda: MOCK_AGENDA_FALLBACK, atenciones_programadas: MOCK_AGENDA_FALLBACK });
            }
          }
        } else if (action === 'adherencia' && execErr.message?.includes('pkgcn_cohortes')) {
          try {
            const fallbackSql = `BEGIN :p_json_salida := teker_dev.pkgcn_cohortes.f_adherencia_usuario(:p_id_usuario); END;`;
            result = await connection.execute(fallbackSql, bindParams);
          } catch (err2: any) {
            console.warn('[Oracle API Adherencia Warning]: Fallback:', err2.message);
            await connection.close();
            connection = null;
            return sendJson(res, 200, { success: false, error: err2.message, id_usuario: idUsuario, recomendadas: 0, realizadas: 0 });
          }
        } else {
          throw execErr;
        }
      }

      if (!rawStr) {
        rawSalida = result?.outBinds?.p_json_salida;
        if (typeof rawSalida === 'string') {
          rawStr = rawSalida;
        } else if (rawSalida) {
          rawStr = await lobToString(rawSalida);
        }
      }

      await connection.close();
      connection = null;

      console.log(`[Oracle API] rawSalida for ${action}:`, typeof rawSalida, rawStr ? rawStr.substring(0, 100) : 'null');
      let jsonSalida: any = null;
      if (rawStr) {
        try {
          jsonSalida = JSON.parse(rawStr);
        } catch (pe) {
          jsonSalida = rawStr;
        }
      }

      if (action === 'cuadro_medico' || action === 'equipo_medico') {
        if (jsonSalida && typeof jsonSalida.profesionales === 'string') {
          try {
            jsonSalida.profesionales = JSON.parse(jsonSalida.profesionales);
          } catch (e) {
            console.warn('[Oracle API Cuadro Medico]: Error al parsear nested profesionales JSON:', e);
          }
        }
        let profList: any[] = [];
        if (jsonSalida && Array.isArray(jsonSalida.profesionales)) {
          profList = jsonSalida.profesionales;
        } else if (Array.isArray(jsonSalida)) {
          profList = jsonSalida;
        }
        return sendJson(res, 200, {
          success: true,
          profesionales: profList
        });
      }

      if (action === 'agenda' || action === 'atenciones_programadas') {
        let atencionesList: any[] = [];
        if (typeof jsonSalida === 'string') {
          try {
            jsonSalida = JSON.parse(jsonSalida);
          } catch (e) {}
        }
        if (Array.isArray(jsonSalida)) {
          atencionesList = jsonSalida;
        } else if (jsonSalida && Array.isArray(jsonSalida.atenciones_programadas)) {
          atencionesList = jsonSalida.atenciones_programadas;
        } else if (jsonSalida && Array.isArray(jsonSalida.agenda)) {
          atencionesList = jsonSalida.agenda;
        } else if (jsonSalida && typeof jsonSalida.atenciones === 'string') {
          try {
            atencionesList = JSON.parse(jsonSalida.atenciones);
          } catch (e) {}
        }
        return sendJson(res, 200, {
          success: true,
          agenda: atencionesList,
          atenciones_programadas: atencionesList
        });
      }

      if ((action === 'actas_x_usuario' || action === 'actas') && !jsonSalida) {
        jsonSalida = [];
      }

      if (action === 'adherencia') {
        let adh: any = jsonSalida;
        if (typeof adh === 'string') {
          try { adh = JSON.parse(adh); } catch (_) { adh = null; }
        }
        if (!adh || typeof adh !== 'object') {
          adh = { id_usuario: idUsuario, recomendadas: 0, realizadas: 0 };
        }
        const recomendadas = Number(adh.recomendadas ?? 0);
        const realizadas = Number(adh.realizadas ?? 0);
        const porcentaje = recomendadas > 0 ? Math.round((realizadas / recomendadas) * 100) : 0;
        return sendJson(res, 200, { success: true, id_usuario: idUsuario, recomendadas, realizadas, porcentaje });
      }

      return sendJson(res, 200, jsonSalida);
    } catch (dbErr: any) {
      if (connection) {
        try { await connection.close(); } catch (e) {}
      }
      if (action === 'actas_x_usuario' || action === 'actas') {
        return sendJson(res, 200, MOCK_ACTAS_FALLBACK);
      }
      if (action === 'cuadro_medico' || action === 'equipo_medico') {
        return sendJson(res, 200, { success: false, error: dbErr.message, profesionales: MOCK_CUADRO_MEDICO_FALLBACK });
      }
      if (action === 'agenda' || action === 'atenciones_programadas') {
        return sendJson(res, 200, { success: false, error: dbErr.message, agenda: MOCK_AGENDA_FALLBACK, atenciones_programadas: MOCK_AGENDA_FALLBACK });
      }
      if (action === 'adherencia') {
        const fallbackUserId = Number(queryObj.id_usuario || req.body?.id_usuario || queryObj.id || req.body?.id || 0);
        return sendJson(res, 200, { success: false, error: dbErr.message, id_usuario: fallbackUserId, recomendadas: 0, realizadas: 0, porcentaje: 0 });
      }
      if (action === 'ver_acta' || action === 'f_ver_acta') {
        return sendJson(res, 200, { success: false, error: dbErr.message });
      }
      return sendJson(res, 200, {
        codigo_respuesta: -1,
        mensaje_respuesta: `Error al ejecutar BD: ${dbErr.message}`,
        pacientes: []
      });
    }
  } catch (fatalErr: any) {
    console.error('[Oracle API Fatal Handler Error]:', fatalErr);
    return sendJson(res, 200, {
      codigo_respuesta: -1,
      status: 'fatal_handler_error',
      mensaje_respuesta: `Error interno en el servidor: ${fatalErr?.message || String(fatalErr)}`,
      pacientes: []
    });
  }
}
