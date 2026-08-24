import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import oracledb from 'oracledb';
import { getOracleConfig } from './oracle-config';

dotenv.config({ path: '.env.local' });
dotenv.config();

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

  let connection;
  try {
    const config = getOracleConfig();
    console.log('[Oracle API] Connecting to Oracle DB at:', config.connectString, 'User:', config.user);

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
      return res.status(500).json(errPayload);
    } else {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }
  }
}
