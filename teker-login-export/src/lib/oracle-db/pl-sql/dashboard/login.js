import OracleDB from "oracledb";
import { executePLSQL } from "@/lib/oracle-db/main";
import { readClob } from "@/lib/oracle-db/utils/readClob";

const accessCodePL = `
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

const allowedRoles = `
  SELECT id_rol
  FROM tkr_roles_accesos
  WHERE id_acceso = :accessId
`;

export const loginUser = async (connection, data) => {
  const { roleId } = data;

  console.log("[loginUser] Starting execution...");
  const t0 = performance.now();

  const result1 = await executePLSQL(connection, accessCodePL, {
    res: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
    accessId: {
      dir: OracleDB.BIND_IN,
      type: OracleDB.NUMBER,
      val: Number(data.accessId),
    },
    code: {
      dir: OracleDB.BIND_IN,
      type: OracleDB.NUMBER,
      val: Number(data.code),
    },
    roleId: {
      dir: OracleDB.BIND_IN,
      type: OracleDB.NUMBER,
      val: Number(roleId || 3),
    },
    CLOBaccess: { dir: OracleDB.BIND_OUT, type: OracleDB.CLOB },
    CLOBuser: { dir: OracleDB.BIND_OUT, type: OracleDB.CLOB },
    CLOBpartner: { dir: OracleDB.BIND_OUT, type: OracleDB.CLOB },
  });

  const t1 = performance.now();
  console.log(
    `[loginUser] executePLSQL (accessCodePL) took ${(t1 - t0).toFixed(2)}ms`,
  );

  const { res, CLOBaccess, CLOBuser, CLOBpartner } = result1.outBinds;

  if (res === 0) {
    return { errorCode: 1, errorMsg: "Acceso y clave incorrectos" };
  }

  let accessData = undefined;
  let userData = undefined;
  let partnerData = undefined;

  if (CLOBaccess) {
    const {
      ID: accessId,
      ID_ROL_DEFECTO: roleId,
      ...rest
    } = JSON.parse(await readClob(CLOBaccess));

    const t2 = performance.now();

    const exe = await executePLSQL(connection, allowedRoles, {
      accessId: { type: OracleDB.NUMBER, dir: OracleDB.BIND_IN, val: accessId },
    });

    const t3 = performance.now();
    console.log(
      `[loginUser] executePLSQL (allowedRoles) took ${(t3 - t2).toFixed(2)}ms`,
    );

    accessData = {
      accessId,
      roleId,
      code: data.code,
      roles: exe.rows
        .filter((r) => ![7, 8].includes(r[0]))
        .map((r) => ({ id_rol: r[0] })),
      ...rest,
    };
  }
  if (CLOBuser) {
    const x = JSON.parse(await readClob(CLOBuser));
    const {
      ID,
      NOMBRES,
      APELLIDOS,
      FECHA_NACIMIENTO,
      USUARIO,
      ID_CIUDAD_RESIDENCIA,
      DIRECCION,
      CORREO_ELECTRONICO,
      ID_PRESTADOR_SALUD,
      ID_GENERO,
      ID_TIPO_IDENTIFICACION,
      IDENTIFICACION,
      ID_REGIMEN_ASEGURAMIENTO,
      ID_MEDIO,
      REGIMEN_SIMPLE,
      ID_PAIS,
      TELEFONO,
      SISBEN,
      ETNIA,
      FECHA_EXPEDICION_IDENTIFICACION,
      ID_ESTADO_CIVIL,
      ID_OCUPACION,
      ESPECIALIDADES,
      ESTADO_CAPACITACION,
    } = x;
    userData = {
      ID,
      NOMBRES,
      APELLIDOS,
      FECHA_NACIMIENTO,
      USUARIO,
      ID_CIUDAD_RESIDENCIA,
      DIRECCION,
      CORREO_ELECTRONICO,
      ID_PRESTADOR_SALUD,
      ID_GENERO,
      ID_TIPO_IDENTIFICACION,
      IDENTIFICACION,
      ID_REGIMEN_ASEGURAMIENTO,
      ID_MEDIO,
      REGIMEN_SIMPLE,
      ID_PAIS,
      TELEFONO,
      SISBEN,
      ETNIA,
      FECHA_EXPEDICION_IDENTIFICACION,
      ID_ESTADO_CIVIL,
      ID_OCUPACION,

      ...(roleId === 4 && { ESPECIALIDADES, ESTADO_CAPACITACION }),
    };
  }
  if (CLOBpartner) {
    partnerData = JSON.parse(await readClob(CLOBpartner))[0];
  }

  const tEnd = performance.now();
  console.log(`[loginUser] Total execution took ${(tEnd - t0).toFixed(2)}ms`);

  return {
    accessData,
    userData,
    partnerData,
    errorCode: 0,
  };
};

export const allowedRolesByAccess = async (connection, accessId) => {
  const exe = await executePLSQL(connection, allowedRoles, {
    accessId: { type: OracleDB.NUMBER, dir: OracleDB.BIND_IN, val: accessId },
  });

  return exe.rows.map((r) => r[0]);
};
