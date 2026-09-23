import OracleDB from "oracledb";
import { executePLSQL } from "@/lib/oracle-db/main";

const registerLogPL = `
  BEGIN
    pkgln_logs.p_registrar_log(
      :data,
      :errorCode,
      :errorMsg
    );
  END;
`;

export const registerLog = async (connection, data) => {
  const result = await executePLSQL(connection, registerLogPL, {
    data: {
      dir: OracleDB.BIND_IN,
      type: OracleDB.STRING,
      val: JSON.stringify(data),
    },
    errorCode: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
    errorMsg: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.STRING,
      maxSize: 1000,
    },
  });

  return result.outBinds;
};
