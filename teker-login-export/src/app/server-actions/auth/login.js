"use server";

import { revalidateTag } from "next/cache";
import { WithDatabase } from "@/lib/oracle-db/main";
import { loginUser } from "@/lib/oracle-db/pl-sql/dashboard/login";
import { sendCode } from "@/lib/oracle-db/pl-sql/general/sendCode";
import { getById } from "@/lib/oracle-db/pl-sql/user/getById";
import { changeRole } from "@/lib/oracle-db/pl-sql/dashboard/access";
import { accessExists } from "@/lib/oracle-db/pl-sql/general/accessExists";

// pkgln_seguridad (bloqueo permanente/manual) — desconectado del login real
// desde antes de este ticket. Se deja así a propósito, sin usarlo aquí.
// import { checkUserBlocked } from "@/lib/oracle-db/pl-sql/user/checkUserBlocked";

// PENDIENTE DE BACKEND (CTR-EIPD-0178) — depende de tkr_intentos_acceso /
// tkr_bloqueo_temporal (scripts/db-patches/2026-09-17_login_lockout_intentos.sql),
// que backend aún no ha aplicado. Ver lib/oracle-db/pl-sql/user/loginAttempts.js.
// Descomentar junto con los bloques marcados igual más abajo cuando exista el patch.
// import {
//   recordLoginAttempt,
//   countFailedAttemptsByUser,
//   countFailedAttemptsByIp,
//   getActiveLockout,
//   setTemporaryLockout,
// } from "@/lib/oracle-db/pl-sql/user/loginAttempts";
// import {
//   getClientIp,
//   MAX_ATTEMPTS_USER,
//   USER_WINDOW_MINUTES,
//   LOCKOUT_MINUTES,
//   MAX_ATTEMPTS_IP,
//   IP_WINDOW_MINUTES,
// } from "@/lib/auth/loginSecurity";

// const BLOCKED_MSG = "Usuario bloqueado. Contáctanos para más información."; // sin usar, ver abajo
// const LOCKED_MSG = `Demasiados intentos fallidos. Intenta de nuevo en unos ${LOCKOUT_MINUTES} minutos.`; // PENDIENTE DE BACKEND
// const IP_THROTTLED_MSG = "Demasiados intentos desde esta red. Intenta de nuevo más tarde."; // PENDIENTE DE BACKEND

// Comentada a propósito: pkgln_seguridad no estaba conectada al login real
// antes de este ticket y se deja así. No se llama a checkUserBlocked aquí.
// async function isAccountBlocked(connection, idUsuario) {
//   if (!idUsuario) return null;
//
//   const { blocked } = await checkUserBlocked(connection, { id: idUsuario });
//   if (blocked === 1) return BLOCKED_MSG;
//
//   // PENDIENTE DE BACKEND — bloqueo automático temporal (5 intentos / 15 min).
//   // const lockedUntil = await getActiveLockout(connection, idUsuario);
//   // if (lockedUntil) return LOCKED_MSG;
//
//   return null;
// }

export async function userByIdentification(data) {
  const { login } = data;
  // const ip = await getClientIp(); // PENDIENTE DE BACKEND

  // console.log("userByIdentification");
  return await WithDatabase(async (connection) => {
    const {
      accessId,
      roleId,
      errorCode: errC1,
      errorMsg: errM1,
      ...accessRest
    } = await accessExists(connection, data);

    if (errC1 === 1) {
      return {
        errorCode: errC1,
        errorMsg: errM1,
      };
    }

    let userData = null;
    const defaultRole = roleId === null || roleId === 3;
    if (defaultRole || !login) {
      userData = await getById(connection, accessRest.id_usuario);
    }

    if (login) {
      // Comentado a propósito — ver nota junto a isAccountBlocked más arriba.
      // const blockedMsg = await isAccountBlocked(connection, accessRest.id_usuario);
      // if (blockedMsg) {
      //   return { errorCode: 1, errorMsg: blockedMsg };
      // }

      // PENDIENTE DE BACKEND — throttle por IP (necesita tkr_intentos_acceso).
      // const ipFailures = await countFailedAttemptsByIp(connection, {
      //   ip,
      //   windowMinutes: IP_WINDOW_MINUTES,
      // });
      // if (ipFailures >= MAX_ATTEMPTS_IP) {
      //   return { errorCode: 1, errorMsg: IP_THROTTLED_MSG };
      // }

      const { errorCode, errorMsg } = await sendCode(connection, {
        accessId,
      });

      if (errorCode !== 0) {
        return { errorCode, errorMsg };
      }
    }

    return {
      accessData: { roleId, accessId, ...accessRest },
      ...userData,
      errorCode: errC1,
      errorMsg: errM1,
    };
  });
}

export async function loginAction(data) {
  const t0 = performance.now();
  // const { accessId, id_usuario } = data; // sin usar por ahora — ver notas arriba
  // const ip = await getClientIp(); // PENDIENTE DE BACKEND

  const result = await WithDatabase(async (connection) => {
    // Comentado a propósito — ver nota junto a isAccountBlocked más arriba.
    // const blockedMsg = await isAccountBlocked(connection, id_usuario);
    // if (blockedMsg) {
    //   return { errorCode: 1, errorMsg: blockedMsg };
    // }

    // PENDIENTE DE BACKEND — throttle por IP (necesita tkr_intentos_acceso).
    // const ipFailures = await countFailedAttemptsByIp(connection, {
    //   ip,
    //   windowMinutes: IP_WINDOW_MINUTES,
    // });
    // if (ipFailures >= MAX_ATTEMPTS_IP) {
    //   return { errorCode: 1, errorMsg: IP_THROTTLED_MSG };
    // }

    const loginResult = await loginUser(connection, data);

    // PENDIENTE DE BACKEND — registro de intentos + bloqueo automático por
    // cuenta (5 intentos / 15 min → bloqueo de 15 min). Necesita tkr_intentos_acceso
    // y tkr_bloqueo_temporal.
    // await recordLoginAttempt(connection, {
    //   id_usuario,
    //   id_acceso: accessId,
    //   ip,
    //   success: loginResult.errorCode === 0,
    // });
    //
    // if (loginResult.errorCode !== 0 && id_usuario) {
    //   const failures = await countFailedAttemptsByUser(connection, {
    //     id_usuario,
    //     windowMinutes: USER_WINDOW_MINUTES,
    //   });
    //
    //   if (failures >= MAX_ATTEMPTS_USER) {
    //     await setTemporaryLockout(connection, {
    //       id_usuario,
    //       minutes: LOCKOUT_MINUTES,
    //       motivo: "Bloqueo automático por intentos fallidos de login",
    //     });
    //
    //     return { errorCode: 1, errorMsg: LOCKED_MSG };
    //   }
    // }

    return loginResult;
  });

  console.log(
    `[loginAction] Total (incl. DB connection) took ${(performance.now() - t0).toFixed(2)}ms`,
  );

  return result;
}

export async function changeRoleAction(data) {
  const result = await WithDatabase(async (connection) => {
    const resp = await changeRole(connection, data);
    const r1 = await userByIdentification({ ...data, login: false });
    const r2 = await loginUser(connection, data);

    if (data?.partnerId) {
      if (resp) {
        return { ...r1, ...r2, partnerData: resp };
      }
      return null;
    }
    return { ...r1, ...r2 };
  });

  // revalidateTag("role-layout-data");
  // revalidateTag("dashboard-home-data");

  return result;
}
