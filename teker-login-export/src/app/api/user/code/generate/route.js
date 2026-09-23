import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/oracle-db/main";
import { sendCode } from "@/lib/oracle-db/pl-sql/general/sendCode";

// PENDIENTE DE BACKEND (CTR-EIPD-0178) — throttle por IP para este endpoint,
// necesita tkr_intentos_acceso. Ver lib/oracle-db/pl-sql/user/loginAttempts.js.
// import {
//   recordLoginAttempt,
//   countRecentAttemptsByIp,
// } from "@/lib/oracle-db/pl-sql/user/loginAttempts";
// import {
//   getClientIp,
//   MAX_CODE_REQUESTS_IP,
//   CODE_REQUEST_WINDOW_MINUTES,
// } from "@/lib/auth/loginSecurity";

export async function POST(request) {
  const req = await request.json();
  // const ip = await getClientIp(); // PENDIENTE DE BACKEND

  let connection;

  try {
    connection = await connectToDatabase();

    // PENDIENTE DE BACKEND — throttle por IP.
    // const recentRequests = await countRecentAttemptsByIp(connection, {
    //   ip,
    //   windowMinutes: CODE_REQUEST_WINDOW_MINUTES,
    // });
    // if (recentRequests >= MAX_CODE_REQUESTS_IP) {
    //   return NextResponse.json({
    //     errorCode: 1,
    //     errorMsg:
    //       "Demasiadas solicitudes de código desde esta red. Intenta de nuevo más tarde.",
    //   });
    // }

    const generateCodeResp = await sendCode(connection, { accessId: req.id });

    // PENDIENTE DE BACKEND — registro de intentos.
    // await recordLoginAttempt(connection, {
    //   id_usuario: null,
    //   id_acceso: req.id,
    //   ip,
    //   success: true,
    // });

    return NextResponse.json(generateCodeResp);
  } catch (err) {
    console.log(err, "Error");
    return NextResponse.json({ err });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        return NextResponse.json({ err });
      }
    }
  }
}
