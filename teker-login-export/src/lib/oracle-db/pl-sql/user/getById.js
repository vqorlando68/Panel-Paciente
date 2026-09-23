import OracleDB from "oracledb";
import { executePLSQL } from "@/lib/oracle-db/main";
import { readClob } from "@/lib/oracle-db/utils/readClob";
import { drainUnusedLobs } from "../../utils/drainUnusedLobs";

const getByIdPL = `
  BEGIN
    pkgln_usuarios.p_existe_id_usuario(
      :userId,

      'N',
      :userCLOB,
      :exists,
      :paymentDataExists,
      :paymentDataCLOB,
      :pendingCLOB,
      :errorCode,
      :errorMsg
    );

    :accessRow := pkgca_tkr_accesos.f_json_x_id_usuario(
      :userId
    );
  END;
`;

export const getById = async (connection, userId) => {
  const result = await executePLSQL(connection, getByIdPL, {
    userId: {
      dir: OracleDB.BIND_IN,
      type: OracleDB.NUMBER,
      val: Number(userId),
    },
    userCLOB: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.CLOB,
    },
    exists: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.NUMBER,
    },
    paymentDataExists: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.NUMBER,
    },
    paymentDataCLOB: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.CLOB,
    },
    pendingCLOB: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.CLOB,
    },
    errorCode: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.NUMBER,
    },
    errorMsg: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.STRING,
    },
    accessRow: {
      dir: OracleDB.BIND_OUT,
      type: OracleDB.CLOB,
    },
  });

  const { userCLOB, paymentDataCLOB, pendingCLOB, accessRow, ...rest } =
    result.outBinds;

  let userOBJ = null;
  if (userCLOB !== null) {
    userOBJ = JSON.parse(await readClob(userCLOB));
  }

  let paymentData = null;
  if (paymentDataCLOB !== null) {
    const readPaymentDataCLOB = await readClob(paymentDataCLOB);
    const paymentDataOBJ = JSON.parse(readPaymentDataCLOB)[0];

    paymentData = {
      idPaymentData: paymentDataOBJ.id_dato_facturacion,
      idType: paymentDataOBJ.id_tipo_identificacion,
      id: paymentDataOBJ.identificacion,
      name: paymentDataOBJ.nombres,
      lastName: paymentDataOBJ.apellidos,
      email: paymentDataOBJ.correo,
      phoneNumber: paymentDataOBJ.telefono,
    };
  }

  let pending = null;
  if (pendingCLOB !== null) {
    const readPendingCLOB = await readClob(pendingCLOB);
    const pendingOBJ = JSON.parse(readPendingCLOB)[0];

    pending = {
      name: pendingOBJ.nombres_paciente,
      lastName: pendingOBJ.apellidos_paciente,
      idType: pendingOBJ.id_tipo_identificacion,
      id: pendingOBJ.identificacion,
      phoneNumber: pendingOBJ.telefono,
      address: pendingOBJ.direccion,
      cityId: pendingOBJ.id_ciudad_residencia,
      department: pendingOBJ.nombre_departamento,
      dateId: pendingOBJ.id,
      dateStatus: pendingOBJ.id_estado_cita,
      professionalId: pendingOBJ.id_profesional,
      professionalImage: pendingOBJ.imagen_profesional,
      professionalFullname: pendingOBJ.nombre_profesional,
      specialtie: pendingOBJ.especialidad,
      day: pendingOBJ.fecha_inicio_cita,
      hour: pendingOBJ.hora_inicio_cita,
      dateIdHexadecimal: pendingOBJ.codigo_cita,
      reason: pendingOBJ.motivo_consulta,
      value: pendingOBJ.valor_pago,
      amountInCents: pendingOBJ.monto_en_centavos,
      wompiData: {
        integrityKey: pendingOBJ.llave_integracion,
        paymentReference: pendingOBJ.referencia_pago,
        publicKey: pendingOBJ.llave_publica_del_comercio,
        redirec: pendingOBJ.redirect,
      },
    };
  }

  let user = null;
  if (userOBJ) {
    const { ID } = JSON.parse(await readClob(accessRow));
    user = {
      accessId: ID,
      idType: userOBJ.id_tipo_identificacion,
      idTitle: userOBJ.tipo_identificacion,
      id: userOBJ.identificacion,
      email: userOBJ.correo_electronico,
      name: userOBJ.nombres,
      lastName: userOBJ.apellidos,
      phoneNumber: userOBJ.telefono,
      address: userOBJ.direccion,
      department: userOBJ.nombre_departamento,
      city: userOBJ.nombre_ciudad,
      cityId: userOBJ.id_ciudad_residencia,
      rawUser: userOBJ,
    };
  }

  await drainUnusedLobs(result.outBinds, [
    ...(userCLOB !== null ? ["userCLOB"] : []),
    ...(paymentDataCLOB !== null ? ["paymentDataCLOB"] : []),
    ...(pendingCLOB !== null ? ["pendingCLOB"] : []),
    ...(userOBJ ? ["accessRow"] : []),
  ]);

  return { ...user, pending, paymentData, ...rest };
};
