import { getOracleConfig } from './oracle-config';

// Safe helper for JSON responses
function sendJson(res: any, status: number, data: any) {
  if (res.status && res.json) {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
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
          mensaje: 'El modulo node-oracledb no pudo ser cargado en el entorno Serverless de Vercel.',
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
      return sendJson(res, 200, {
        codigo_respuesta: -1,
        mensaje_respuesta: 'Variables de entorno de Oracle (ORACLE_DB_USER / ORACLE_DB_CONNECTION_STRING) no configuradas en Vercel.',
        pacientes: []
      });
    }

    const oracledb = await getOracleDb();
    if (!oracledb) {
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

      if (action === 'total_paginas') {
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

      const result: any = await connection.execute(executeSql, bindParams);
      await connection.close();
      connection = null;

      const rawSalida = result.outBinds.p_json_salida;
      const jsonSalida = typeof rawSalida === 'string' ? JSON.parse(rawSalida) : rawSalida;
      return sendJson(res, 200, jsonSalida);
    } catch (dbErr: any) {
      if (connection) {
        try { await connection.close(); } catch (e) {}
      }
      return sendJson(res, 200, {
        codigo_respuesta: -1,
        mensaje_respuesta: `Error al ejecutar pkgln_pacientes_giris: ${dbErr.message}`,
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
