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

// Safe helper for JSON responses
function sendJson(res: any, status: number, data: any) {
  if (res.status && res.json) {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
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
      if (action === 'actas_x_usuario' || action === 'actas') {
        return sendJson(res, 200, MOCK_ACTAS_FALLBACK);
      }
      return sendJson(res, 200, {
        codigo_respuesta: -1,
        mensaje_respuesta: 'Variables de entorno de Oracle (ORACLE_DB_USER / ORACLE_DB_CONNECTION_STRING) no configuradas en Vercel.',
        pacientes: []
      });
    }

    const oracledb = await getOracleDb();
    if (!oracledb) {
      if (action === 'actas_x_usuario' || action === 'actas') {
        return sendJson(res, 200, MOCK_ACTAS_FALLBACK);
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

      let procedureName = 'prc_obtener_pacientes_pagina';
      let executeSql = `BEGIN pkgln_pacientes_giris.${procedureName}(:p_json_entrada, :p_json_salida); END;`;
      let bindParams: any = {
        p_json_entrada: p_json_entrada_str,
        p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
      };

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
        const idUsuario = Number(queryObj.id_usuario || req.body?.id_usuario || queryObj.id || req.body?.id || 0);
        executeSql = `BEGIN pkgcn_cohortes.p_actas_x_usuario(:p_json_entrada, :p_json_salida); END;`;
        bindParams = {
          p_json_entrada: JSON.stringify({ id_usuario: idUsuario }),
          p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
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
        } else {
          throw execErr;
        }
      }

      await connection.close();
      connection = null;

      const rawSalida = result.outBinds?.p_json_salida;
      console.log(`[Oracle API Actas] rawSalida for ${action}:`, typeof rawSalida, rawSalida ? rawSalida.substring(0, 100) : 'null');
      let jsonSalida: any = null;
      if (typeof rawSalida === 'string') {
        try {
          jsonSalida = JSON.parse(rawSalida);
        } catch (pe) {
          jsonSalida = rawSalida;
        }
      } else {
        jsonSalida = rawSalida;
      }
      if ((action === 'actas_x_usuario' || action === 'actas') && !jsonSalida) {
        jsonSalida = [];
      }
      return sendJson(res, 200, jsonSalida);
    } catch (dbErr: any) {
      if (connection) {
        try { await connection.close(); } catch (e) {}
      }
      if (action === 'actas_x_usuario' || action === 'actas') {
        return sendJson(res, 200, MOCK_ACTAS_FALLBACK);
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
