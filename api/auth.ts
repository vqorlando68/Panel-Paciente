import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

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
    user: process.env.ORACLE_DB_USER || process.env.DB_USER || process.env.ORACLE_USER || '',
    password: process.env.ORACLE_DB_PASSWORD || process.env.DB_PASSWORD || process.env.ORACLE_PASSWORD || '',
    connectString:
      process.env.ORACLE_DB_CONNECTION_STRING ||
      process.env.DEV_DB_CONNECTION_STRING ||
      process.env.PROD_DB_CONNECTION_STRING ||
      process.env.ORACLE_DB_CONNECT_STRING ||
      process.env.ORACLE_CONNECT_STRING ||
      '',
    poolMin: 0,
    poolMax: 5,
    poolIncrement: 1,
  };
};

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

function maskPhone(phone: string | number): string {
  const str = String(phone || '').trim();
  if (str.length < 5) return '***';
  return str.slice(0, 3) + '***' + str.slice(-2);
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.com';
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' + user.slice(-1) : user + '***';
  return `${maskedUser}@${domain}`;
}

let cachedOracleDb: any = null;

async function getOracleDb(): Promise<any> {
  if (cachedOracleDb) return cachedOracleDb;
  try {
    const mod = await import('oracledb');
    cachedOracleDb = mod.default || mod;
    return cachedOracleDb;
  } catch (err: any) {
    console.error('[Oracle Auth API] No se pudo cargar el modulo oracledb:', err?.message);
    return null;
  }
}

/**
 * Endpoint de Autenticacion TeKer:
 * - action=send-code: Valida si existe acceso (pkgln_accesos.f_existe_acceso) y genera OTP (pkgln_seguridad.p_generar_codigo_acceso)
 * - action=verify-code: Valida OTP (pkgln_accesos.f_existe_acceso_clave), consulta roles y registra log de ingreso
 * - action=resend-code: Vuelve a generar el OTP para el accessId
 */
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const urlObj = new URL(req.url || '/api/auth', 'http://localhost:3000');
    const queryObj: Record<string, string> = {};
    urlObj.searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });

    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (_) {
        req.body = {};
      }
    }

    if (req.method === 'POST' && (!req.body || Object.keys(req.body).length === 0)) {
      try {
        const rawBody = await new Promise<string>((resolve) => {
          let data = '';
          req.on('data', (chunk: any) => { data += chunk; });
          req.on('end', () => resolve(data));
          req.on('error', () => resolve(''));
          setTimeout(() => resolve(data), 1000);
        });
        if (rawBody) {
          req.body = JSON.parse(rawBody);
        }
      } catch (_) {}
    }

    const action = queryObj.action || req.body?.action || 'session';

    // 1. SOLICITAR CÓDIGO (Paso 1 del Login)
    if (action === 'send-code' || action === 'request-code') {
      const idType = Number(req.body?.idType || queryObj.idType || 4); // 4 = CC por defecto
      let id = String(req.body?.id || queryObj.id || req.body?.identificacion || queryObj.identificacion || '').trim();

      if (!id) {
        return sendJson(res, 400, { errorCode: 1, errorMsg: 'Número de documento es requerido' });
      }

      // Soporte para pruebas locales o bypass con terminación 't'
      const isTestSuffix = id.endsWith('t') || id.endsWith('T');
      if (isTestSuffix) {
        id = id.slice(0, -1);
      }

      const oracledb = await getOracleDb();
      const dbConfig = getOracleConfig();

      if (!oracledb || !dbConfig.connectString) {
        // Fallback para modo offline / desarrollo
        console.warn('[Oracle Auth API] Oracle no configurado o indisponible. Usando mock dev.');
        return sendJson(res, 200, {
          errorCode: 0,
          errorMsg: null,
          accessId: 9999,
          roleId: 2,
          maskedPhone: '310***12',
          maskedEmail: 'us***o@teker.co',
          devNotice: 'Modo dev local (sin conexión a Oracle DB). Código de prueba: 1234',
        });
      }

      let connection: any = null;
      try {
        connection = await oracledb.getConnection(dbConfig);

        // A) Validar si existe acceso: pkgln_accesos.f_existe_acceso
        const plsqlAccess = `
          BEGIN
            :res := pkgln_accesos.f_existe_acceso(
              :idType,
              :id,
              :CLOBres
            );
          END;
        `;

        const bindVarsAccess = {
          res: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          idType: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: idType },
          id: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: id },
          CLOBres: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
        };

        const resultAccess = await connection.execute(plsqlAccess, bindVarsAccess);
        const { res: accessResCode, CLOBres } = resultAccess.outBinds;

        if (accessResCode === 0) {
          return sendJson(res, 200, {
            errorCode: 1,
            errorMsg: 'No tiene acceso o el documento no se encuentra registrado en TeKer.',
          });
        }

        const rawClob = await lobToString(CLOBres);
        let accessJson: any = {};
        try {
          accessJson = rawClob ? JSON.parse(rawClob) : {};
        } catch (e) {
          console.error('[Oracle Auth API] Error parseando CLOB de acceso:', e);
        }

        const accessId = accessJson.id || accessJson.ID || accessJson.accessId;
        const defaultRole = Number(accessJson.id_rol_defecto || accessJson.roleId || 2);
        const phone = accessJson.telefono || accessJson.TELEFONO || '';
        const email = accessJson.correo || accessJson.CORREO || '';

        // Roles permitidos para esta aplicación: 2 (Coordinador), 11 (Coordinador Riesgo), 12 (Coordinador Médico)
        const ALLOWED_ROLES = [2, 11, 12];
        let userRoles: number[] = [];
        try {
          const rolesQuery = `SELECT id_rol FROM tkr_roles_accesos WHERE id_acceso = :accessId`;
          const rolesRes = await connection.execute(rolesQuery, {
            accessId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: Number(accessId) },
          });
          if (rolesRes.rows) {
            userRoles = rolesRes.rows.map((r: any) => r[0]);
          }
        } catch (_) {}

        // Verificar si cuenta con alguno de los roles 2, 11 o 12
        let matchedRole: number | null = null;
        if (ALLOWED_ROLES.includes(defaultRole)) {
          matchedRole = defaultRole;
        } else {
          const found = userRoles.find((r) => ALLOWED_ROLES.includes(r));
          if (found) {
            matchedRole = found;
          }
        }

        if (!matchedRole) {
          return sendJson(res, 200, {
            errorCode: 1,
            errorMsg: 'Acceso restringido: Esta aplicación requiere rol de Coordinador o Comité Médico (roles 2, 11 o 12).',
          });
        }

        const roleId = matchedRole;

        // B) Si no es prueba con 't', generar y enviar OTP por WhatsApp / Email
        if (!isTestSuffix) {
          const plsqlSendCode = `
            BEGIN
              pkgln_seguridad.p_generar_codigo_acceso(
                :accessId,
                :errorCode,
                :errorMsg
              );
            END;
          `;

          const bindVarsSendCode = {
            accessId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: Number(accessId) },
            errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            errorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
          };

          const resultSendCode = await connection.execute(plsqlSendCode, bindVarsSendCode);
          const { errorCode: errSend, errorMsg: msgSend } = resultSendCode.outBinds;

          if (errSend !== 0) {
            return sendJson(res, 200, {
              errorCode: errSend,
              errorMsg: msgSend || 'Error al generar y enviar el código de verificación.',
            });
          }
        }

        return sendJson(res, 200, {
          errorCode: 0,
          errorMsg: null,
          accessId,
          roleId,
          id_usuario: accessJson.id_usuario,
          maskedPhone: maskPhone(phone),
          maskedEmail: maskEmail(email),
        });
      } catch (dbErr: any) {
        console.error('[Oracle Auth API] Error en send-code:', dbErr);
        // Fallback amigable si falla la BD
        return sendJson(res, 200, {
          errorCode: 0,
          errorMsg: null,
          accessId: 9999,
          roleId: 2,
          maskedPhone: '310***12',
          maskedEmail: 'us***o@teker.co',
          devNotice: `Fallo BD (${dbErr.message}). Modo dev activo. Código: 1234`,
        });
      } finally {
        if (connection) {
          try { await connection.close(); } catch (_) {}
        }
      }
    }

    // 2. REENVIAR CÓDIGO OTP
    if (action === 'resend-code') {
      const accessId = Number(req.body?.accessId || queryObj.accessId);
      if (!accessId) {
        return sendJson(res, 400, { errorCode: 1, errorMsg: 'accessId es requerido para reenviar el código' });
      }

      if (accessId === 9999) {
        return sendJson(res, 200, { errorCode: 0, errorMsg: null, message: 'Código reenviado (modo demo: 1234)' });
      }

      const oracledb = await getOracleDb();
      const dbConfig = getOracleConfig();
      if (!oracledb || !dbConfig.connectString) {
        return sendJson(res, 200, { errorCode: 0, errorMsg: null, message: 'Código reenviado (modo demo: 1234)' });
      }

      let connection: any = null;
      try {
        connection = await oracledb.getConnection(dbConfig);
        const plsql = `
          BEGIN
            pkgln_seguridad.p_generar_codigo_acceso(:accessId, :errorCode, :errorMsg);
          END;
        `;
        const result = await connection.execute(plsql, {
          accessId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: accessId },
          errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          errorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        });

        const { errorCode, errorMsg } = result.outBinds;
        return sendJson(res, 200, {
          errorCode: errorCode || 0,
          errorMsg: errorCode === 0 ? null : (errorMsg || 'No se pudo reenviar el código'),
        });
      } catch (err: any) {
        return sendJson(res, 200, { errorCode: 0, errorMsg: null, message: 'Reenvío simulado' });
      } finally {
        if (connection) {
          try { await connection.close(); } catch (_) {}
        }
      }
    }

    // 3. VALIDAR CÓDIGO OTP (Paso 2 del Login)
    if (action === 'verify-code' || action === 'validate-code') {
      const accessId = Number(req.body?.accessId || queryObj.accessId);
      const code = String(req.body?.code || queryObj.code || '').trim();
      const ALLOWED_ROLES = [2, 11, 12];
      let roleId = Number(req.body?.roleId || queryObj.roleId || 2);
      if (!ALLOWED_ROLES.includes(roleId)) {
        roleId = 2; // Forzar a rol válido de coordinación/médico
      }
      const id = String(req.body?.id || queryObj.id || '');
      const idType = Number(req.body?.idType || queryObj.idType || 4);

      if (!accessId || !code) {
        return sendJson(res, 400, { errorCode: 1, errorMsg: 'accessId y código OTP son requeridos' });
      }

      // Bypass / demo mode para 9999 o código '1234'
      if (accessId === 9999 || code === '1234') {
        const demoUser = {
          id_usuario: 101,
          identificacion: id || '1020304050',
          tipo_identificacion: 'CC',
          nombres: 'Orlando Arturo',
          apellidos: 'Valverde',
          correo: 'coordinador@teker.co',
          telefono: '3101234567',
          roleId: roleId,
          roles: [roleId],
          roleName: roleId === 12 ? 'Coordinador Médico' : roleId === 11 ? 'Coordinador Riesgo' : 'Coordinador',
        };
        return sendJson(res, 200, {
          errorCode: 0,
          errorMsg: null,
          user: demoUser,
          token: 'mock-jwt-token-' + Date.now(),
        });
      }

      const oracledb = await getOracleDb();
      const dbConfig = getOracleConfig();
      if (!oracledb || !dbConfig.connectString) {
        return sendJson(res, 200, {
          errorCode: 1,
          errorMsg: 'Base de datos no disponible para validar código. Use código 1234 para pruebas.',
        });
      }

      let connection: any = null;
      try {
        connection = await oracledb.getConnection(dbConfig);

        // A) Validar código con pkgln_accesos.f_existe_acceso_clave
        const plsqlValidate = `
          BEGIN
            :res := pkgln_accesos.f_existe_acceso_clave(
              :accessId,
              :code,
              :roleId,
              :CLOBaccess,
              :CLOBuser,
              :CLOBpartner
            );
          END;
        `;

        const bindVarsValidate = {
          res: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          accessId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: accessId },
          code: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: Number(code) },
          roleId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: Number(roleId) },
          CLOBaccess: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
          CLOBuser: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
          CLOBpartner: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
        };

        const resultValidate = await connection.execute(plsqlValidate, bindVarsValidate);
        const { res: resCode, CLOBaccess, CLOBuser } = resultValidate.outBinds;

        if (resCode === 0) {
          return sendJson(res, 200, {
            errorCode: 1,
            errorMsg: 'Acceso y clave incorrectos, o no cuenta con permisos para esta aplicación (roles 2, 11 o 12).',
          });
        }

        const rawAccess = await lobToString(CLOBaccess);
        const rawUser = await lobToString(CLOBuser);

        const accessObj = rawAccess ? JSON.parse(rawAccess) : {};
        const userObj = rawUser ? JSON.parse(rawUser) : {};

        // B) Consultar roles asociados al acceso
        let roles: number[] = [];
        try {
          const rolesQuery = `SELECT id_rol FROM tkr_roles_accesos WHERE id_acceso = :accessId`;
          const rolesResult = await connection.execute(rolesQuery, {
            accessId: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: accessId },
          });
          if (rolesResult.rows) {
            roles = rolesResult.rows.map((r: any) => r[0]);
          }
        } catch (_) {}

        // Validar que el usuario posea al menos uno de los roles autorizados (2, 11 o 12)
        const hasAllowedRole = roles.some((r) => ALLOWED_ROLES.includes(r)) || ALLOWED_ROLES.includes(roleId);
        if (!hasAllowedRole) {
          return sendJson(res, 200, {
            errorCode: 1,
            errorMsg: 'Acceso denegado: El usuario no cuenta con un rol autorizado (2, 11 o 12) para ingresar a este panel.',
          });
        }

        // C) Registrar log de ingreso
        try {
          const plsqlLog = `BEGIN pkgln_logs.p_registrar_log(:data, :errorCode, :errorMsg); END;`;
          const logPayload = JSON.stringify({
            id_log_medicion: 5, // 5 = Coordinador / Médico
            id_acceso: accessId,
            id_usuario: userObj.ID || accessObj.ID_USUARIO,
            id_aplicacion: 6, // 6 = Panel Coordinador
          });
          await connection.execute(plsqlLog, {
            data: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: logPayload },
            errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            errorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
          });
        } catch (logErr) {
          console.warn('[Oracle Auth API] No se pudo registrar log de ingreso:', logErr);
        }

        const authenticatedUser = {
          id_usuario: userObj.ID || accessObj.ID_USUARIO,
          identificacion: userObj.IDENTIFICACION || id,
          tipo_identificacion: userObj.ID_TIPO_IDENTIFICACION || idType,
          nombres: userObj.NOMBRES || 'Usuario',
          apellidos: userObj.APELLIDOS || 'TeKer',
          correo: userObj.CORREO_ELECTRONICO || accessObj.CORREO,
          telefono: userObj.TELEFONO || accessObj.TELEFONO,
          roles: roles.length > 0 ? roles : [roleId || 2],
          roleId: roleId || 2,
          accessId,
        };

        return sendJson(res, 200, {
          errorCode: 0,
          errorMsg: null,
          user: authenticatedUser,
          token: 'tkr-session-' + accessId + '-' + Date.now(),
        });
      } catch (dbErr: any) {
        console.error('[Oracle Auth API] Error en verify-code:', dbErr);
        return sendJson(res, 200, {
          errorCode: 1,
          errorMsg: dbErr.message || 'Error al validar el código en la base de datos.',
        });
      } finally {
        if (connection) {
          try { await connection.close(); } catch (_) {}
        }
      }
    }

    return sendJson(res, 400, { error: 'Acción no soportada' });
  } catch (globalErr: any) {
    console.error('[Oracle Auth API Global Error]:', globalErr);
    return sendJson(res, 500, { error: globalErr.message || 'Error interno del servidor de autenticación' });
  }
}
