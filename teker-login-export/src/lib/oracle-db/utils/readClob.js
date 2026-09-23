export function readClob(lob) {
  if (lob === null || lob === undefined) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    let data = "";
    let settled = false;

    lob.setEncoding("utf8");

    lob.on("data", (chunk) => {
      data += chunk;
    });

    lob.on("error", (err) => {
      if (settled) return;
      settled = true;
      console.error(
        `[readClob] error en LOB a las ${new Date().toISOString()}:`,
        err.message,
      );
      reject(err);
    });

    lob.on("close", () => {
      if (settled) return;
      settled = true;
      resolve(data);
    });
  });
}
