import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { getOracleConfig } from './oracle-config';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function getOracleDb() {
  try {
    const mod = await import('oracledb');
    return mod.default || mod;
  } catch (err: any) {
    console.error('[Oracle API] Error al cargar el módulo node-oracledb:', err);
    throw new Error(`Error al importar el paquete node-oracledb en Vercel: ${err.message}`);
  }
}

export interface ApiRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  body?: any;
  method?: string;
  url?: string;
}

export interface ApiResponse extends ServerResponse {
  status?: (statusCode: number) => ApiResponse;
  json?: (data: any) => void;
}

/**
 * Vercel Serverless Function: /api/patients
 *
 * REGLA DE ARQUITECTURA:
 * Sin sentencias DML (SELECT/INSERT/UPDATE/DELETE) en este código.
 * Toda interacción con la base de datos se realiza EXCLUSIVAMENTE invocando
 * el paquete de PL/SQL: pkgln_pacientes_giris.
 *   - prc_obtener_total_paginas (Cálculo de paginación)
 *   - prc_obtener_pacientes_pagina (Obtención de datos de página con especialidades ordenadas)
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    if (res.status && res.json) {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  // Parse query parameters
  const urlObj = new URL(req.url || '/api/patients', 'http://localhost:3000');
  const queryObj: Record<string, string> = {};
  urlObj.searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });

  const action = queryObj.action || req.body?.action || 'pagina';

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

  // Diagnostic Connection Test Endpoint
  if (action === 'test') {
    const startTime = Date.now();
    let connTest;
    try {
      const testConfig = getOracleConfig();
      if (!testConfig.user || !testConfig.connectString) {
        const testPayload = {
          status: 'error_missing_env_vars',
          mensaje: 'Variables de entorno de Oracle (ORACLE_DB_USER / ORACLE_DB_CONNECTION_STRING) no configuradas en Vercel Dashboard.',
          variables_detectadas: {
            ORACLE_DB_USER: testConfig.user ? 'Configurada' : 'FALTA',
            ORACLE_DB_CONNECTION_STRING: testConfig.connectString ? 'Configurada' : 'FALTA',
            ORACLE_DB_PASSWORD: testConfig.password ? 'Configurada' : 'FALTA',
          }
        };
        if (res.status && res.json) return res.status(200).json(testPayload);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(testPayload));
      }

      const oracledb = await getOracleDb();
      connTest = await oracledb.getConnection(testConfig);
      const testResult: any = await connTest.execute('SELECT 1 AS TEST_VAL FROM DUAL');
      await connTest.close();
      connTest = null;

      const durationMs = Date.now() - startTime;
      const successPayload = {
        status: 'connection_success',
        mensaje: '¡Conexión a la Base de Datos Oracle exitosa!',
        tiempo_respuesta_ms: durationMs,
        prueba_query: testResult.rows,
        variables_detectadas: {
          ORACLE_DB_USER: testConfig.user,
          ORACLE_DB_CONNECTION_STRING: testConfig.connectString,
          ORACLE_DB_PASSWORD: '****'
        }
      };
      if (res.status && res.json) return res.status(200).json(successPayload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(successPayload));
    } catch (testErr: any) {
      if (connTest) { try { await connTest.close(); } catch (e) {} }
      const errPayload = {
        status: 'connection_failed',
        mensaje: `Error al conectar a Oracle BD: ${testErr.message}`,
        error_code: testErr.code || testErr.number,
        tiempo_respuesta_ms: Date.now() - startTime
      };
      if (res.status && res.json) return res.status(200).json(errPayload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }
  }

  let connection;
  try {
    const config = getOracleConfig();
    console.log('[Oracle API] Connecting to Oracle DB at:', config.connectString, 'User:', config.user);

    if (!config.user || !config.connectString) {
      const errMsg = 'Variables de entorno de Oracle (ORACLE_DB_USER / ORACLE_DB_CONNECTION_STRING) no configuradas en Vercel.';
      console.warn('[Oracle API Error]:', errMsg);
      const errPayload = {
        codigo_respuesta: -1,
        mensaje_respuesta: errMsg,
        pacientes: []
      };
      if (res.status && res.json) return res.status(200).json(errPayload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }

    const oracledb = await getOracleDb();
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

    console.log(`[Oracle API] Executing pkgln_pacientes_giris.${procedureName}`);

    const result: any = await connection.execute(executeSql, bindParams);

    await connection.close();

    const rawSalida = result.outBinds.p_json_salida;
    console.log('[Oracle API] Response length from PL/SQL package:', rawSalida ? rawSalida.length : 0);
    console.log('[Oracle API Payload]:', rawSalida);

    const jsonSalida = JSON.parse(rawSalida);

    if (res.status && res.json) {
      return res.status(200).json(jsonSalida);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(jsonSalida));
    }
  } catch (error: any) {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
    console.error('[Oracle API Error] Failed executing PL/SQL package:', error.message);
    
    const errPayload = {
      codigo_respuesta: -1,
      mensaje_respuesta: `Error al conectar o ejecutar pkgln_pacientes_giris: ${error.message}`,
      pacientes: []
    };

    if (res.status && res.json) {
      return res.status(200).json(errPayload);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }
  }
}
