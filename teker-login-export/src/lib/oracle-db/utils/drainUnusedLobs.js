// utils/drainUnusedLobs.js
export async function drainUnusedLobs(outBinds, usedKeys) {
  await Promise.all(
    Object.entries(outBinds).map(async ([key, val]) => {
      if (usedKeys.includes(key)) return;
      if (val && typeof val.close === "function") {
        await val.close();
      }
    }),
  );
}
