import OracleDB from "oracledb";
import { executePLSQL } from "@/lib/oracle-db/main";

const sendCodePL = `
  BEGIN
    pkgln_seguridad.p_generar_codigo_acceso(
      :accessId,
      :errorCode,
      :errorMsg
    );
  END;
`;

export const sendCode = async (connection, data) => {
  const result = await executePLSQL(connection, sendCodePL, {
    accessId: {
      type: OracleDB.NUMBER,
      dir: OracleDB.BIND_IN,
      val: Number(data.accessId),
    },

    errorCode: { type: OracleDB.NUMBER, dir: OracleDB.BIND_OUT },
    errorMsg: { type: OracleDB.STRING, dir: OracleDB.BIND_OUT },
  });

  return result.outBinds;
};
