import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import oracledb from 'oracledb';
import { getOracleConfig } from './oracle-config';

// Load local environment variables from .env.local / .env
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
 * el paquete de PL/SQL: pkgln_pacientes_giris.prc_obtener_pacientes.
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

  const jsonEntrada = {
    pagina: Number(queryObj.pagina || req.body?.pagina || 1),
    registros_por_pagina: Number(queryObj.registros_por_pagina || req.body?.registros_por_pagina || 50),
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

    const result: any = await connection.execute(
      `BEGIN pkgln_pacientes_giris.prc_obtener_pacientes(:p_json_entrada, :p_json_salida); END;`,
      {
        p_json_entrada: p_json_entrada_str,
        p_json_salida: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 5000000 }
      }
    );

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
    console.error('[Oracle API Error] Failed executing pkgln_pacientes_giris.prc_obtener_pacientes:', error.message);
    
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
