"use server";

import { WithDatabase } from "@/lib/oracle-db/main";
import { registerLog } from "@/lib/oracle-db/pl-sql/general/registerLog";
import { wompiAccess } from "@/lib/oracle-db/pl-sql/general/wompiAccess";

export async function regLogAction(data) {
  const t0 = performance.now();

  const result = await WithDatabase(async (connection) => {
    return await registerLog(connection, data);
  });

  console.log(`[regLogAction] took ${(performance.now() - t0).toFixed(2)}ms`);

  return result;
}

export async function wompiAccessAction(data) {
  return await WithDatabase(async (connection) => {
    return await wompiAccess(connection, data);
  });
}
