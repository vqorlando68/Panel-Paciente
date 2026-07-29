/**
 * Oracle Database Configuration & Connection Utility Template
 *
 * This file serves as the configuration bridge when connecting Vercel Serverless API
 * functions to your Oracle Database instance.
 *
 * Environment variables required in Vercel Dashboard (.env.production / .env.local):
 * - ORACLE_USER: Database username
 * - ORACLE_PASSWORD: Database password
 * - ORACLE_CONNECT_STRING: Connection string (e.g. host:port/service_name or TNS alias)
 */

export interface OracleDbConfig {
  user: string;
  password?: string;
  connectString: string;
  poolMin?: number;
  poolMax?: number;
  poolIncrement?: number;
}

export const getOracleConfig = (): OracleDbConfig => {
  return {
    user: process.env.ORACLE_DB_USER || process.env.ORACLE_USER || '',
    password: process.env.ORACLE_DB_PASSWORD || process.env.ORACLE_PASSWORD || '',
    connectString: process.env.ORACLE_DB_CONNECTION_STRING || process.env.ORACLE_CONNECT_STRING || '',
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  };
};

/**
 * Placeholder for calling Oracle Stored Procedures / Functions.
 * Once procedures are provided, this will execute queries using node-oracledb.
 */
export async function executeStoredProcedure<T>(
  procedureName: string,
  params: Record<string, any> = {}
): Promise<T | null> {
  console.log(`[Oracle DB] Calling procedure: ${procedureName} with params:`, params);
  // Stored procedure execution logic will be implemented here
  return null;
}
