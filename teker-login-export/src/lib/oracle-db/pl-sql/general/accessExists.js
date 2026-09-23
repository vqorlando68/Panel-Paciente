import OracleDB from "oracledb";
import { executePLSQL } from "@/lib/oracle-db/main";
import { readClob } from "@/lib/oracle-db/utils/readClob";
import { drainUnusedLobs } from "@/lib/oracle-db/utils/drainUnusedLobs";

const accessExistsPL = `
  BEGIN
    :res := pkgln_accesos.f_existe_acceso(
      :idType,
      :id,
      :CLOBres
    );
  END;
`;

export const accessExists = async (connection, data) => {
  const { idType, id } = data;
  const result = await executePLSQL(connection, accessExistsPL, {
    res: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
    idType: {
      dir: OracleDB.BIND_IN,
      type: OracleDB.NUMBER,
      val: Number(idType),
    },
    id: { dir: OracleDB.BIND_IN, type: OracleDB.STRING, val: id },
    CLOBres: { dir: OracleDB.BIND_OUT, type: OracleDB.CLOB },
  });

  const { res, CLOBres } = result.outBinds;

  if (res === 0) {
    await drainUnusedLobs(result.outBinds, []);
    return { errorCode: 1, errorMsg: "No tiene acceso" };
  }

  const JSONdata = JSON.parse(await readClob(CLOBres));
  await drainUnusedLobs(result.outBinds, ["CLOBres"]);

  const { id_rol_defecto: role, id: accessId, ...rest } = JSONdata;

  return { accessId, roleId: role, ...rest, errorCode: 0, errorMsg: null };
};
