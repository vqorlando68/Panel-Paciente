// console.log("Runtime iniciado", Date.now());
import OracleDB from "oracledb";

const POOL_ALIAS = "default";

const getPoolConfig = () => ({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionString: ["production", "demo"].includes(
    process.env.NEXT_PUBLIC_ENVIRONMENT,
  )
    ? process.env.PROD_DB_CONNECTION_STRING
    : process.env.DEV_DB_CONNECTION_STRING,
  poolAlias: POOL_ALIAS,
  // Pool configuration
  poolMin: 0, // Don't eagerly open connections; serverless instances are ephemeral
  poolMax: 5, // Low ceiling — many instances run in parallel on Vercel
  poolIncrement: 1,
  poolTimeout: 30, // Release idle connections faster
  queueTimeout: 10000,
  enableStatistics: false,
  poolPingInterval: 30,
});

const getOrCreatePool = async () => {
  // In development with HMR, modules can be re-evaluated while a pool
  // with the same alias already exists. Use a global singleton to avoid
  // creating duplicate pools and gracefully handle NJS-046.
  const globalAny = globalThis;

  if (!globalAny.__oraclePoolPromise) {
    globalAny.__oraclePoolPromise = (async () => {
      try {
        return OracleDB.getPool(POOL_ALIAS);
      } catch {
        try {
          const t0 = performance.now();
          const pool = await OracleDB.createPool(getPoolConfig());
          // console.log(`pool ${Math.round(performance.now() - t0)}ms`);
          return pool;
        } catch (err) {
          // If the pool alias already exists (e.g. due to HMR), reuse it
          const message = String(err?.message || "");
          if (
            err?.code === "NJS-046" ||
            err?.errorNum === 46 ||
            message.includes("NJS-046") ||
            message.includes("pool alias") // fallback heuristic
          ) {
            return OracleDB.getPool(POOL_ALIAS);
          }

          // console.error("[Oracle Pool] Error creating pool:", err.message);
          throw err;
        }
      }
    })();
  }

  return globalAny.__oraclePoolPromise;
};

export const connectToDatabase = async () => {
  try {
    const pool = await getOrCreatePool();
    const t0 = performance.now();
    const connection = await pool.getConnection();
    // console.log(`getConnection ${Math.round(performance.now() - t0)}ms`);
    connection.__debugId = Math.random().toString(36).slice(2, 8);
    // console.log(`[pool] conexión adquirida: ${connection.__debugId}`);
    return connection;
  } catch (err) {
    // console.error("[Oracle Pool] Error getting connection:", err.message);
    throw err;
  }
};

export const executePLSQL = async (connection, plsql, binds = {}, ...other) => {
  const t0 = performance.now();
  try {
    // Ensure binds is always a valid value for oracledb
    const safeBinds = binds ?? {};
    return await connection.execute(plsql, safeBinds, ...other);
  } finally {
    // console.log(`execute ${Math.round(performance.now() - t0)}ms`);
  }
};

const getFnHint = (fn) => {
  const s = fn.toString().replace(/\s+/g, " ").trim();
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
};

export const WithDatabase = async (fn) => {
  let connection;
  const start = performance.now();
  const caller = fn.name || getFnHint(fn);
  // console.log("");
  try {
    connection = await connectToDatabase();
    const result = await fn(connection);
    const elapsed = Math.round(performance.now() - start);
    // console.log(`${caller} ${elapsed}ms`);
    return result;
  } catch (err) {
    console.log(err);
    const elapsed = Math.round(performance.now() - start);
    // console.error(`${caller} ${elapsed}ms`, err.message, err.errorNum);

    return {
      errorCode: -1,
      errorMsg: err.message || "Error de conexión con la base de datos",
      errorDetails: {
        code: err.errorNum,
        offset: err.offset,
      },
    };
  } finally {
    if (connection) {
      // console.log(`[pool] cerrando conexión: ${connection.__debugId}`);
      try {
        await connection.close();
      } catch (closeErr) {
        // console.error("Error closing database connection:", closeErr);
      }
    }
    // console.log("");
  }
};

// export const connectToDatabase = async () => ({});

// export const executePLSQL = async (_conn, plsql, binds, ...other) => {
//   const docker = "http://localhost:4000";
//   const res = await fetch(`${docker}/execute`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ env: "STAGE", plsql, binds, ...other }),
//   });
//   const data = await res.json();
//   console.log(data, "<-- data from api");
//   return data;
// };

// export const WithDatabase = async (fn) => {
//   // conn is just a fake object; fn should ignore it
//   return await fn({});
// };
