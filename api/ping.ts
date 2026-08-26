export default function handler(req: any, res: any) {
  if (res.status && res.json) {
    return res.status(200).json({
      status: 'ok',
      message: 'Vercel Serverless Function funcionando correctamente',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      env: {
        ORACLE_DB_USER: process.env.ORACLE_DB_USER ? 'Configurada' : 'No configurada',
        ORACLE_DB_CONNECTION_STRING: process.env.ORACLE_DB_CONNECTION_STRING ? 'Configurada' : 'No configurada',
        ORACLE_DB_PASSWORD: process.env.ORACLE_DB_PASSWORD ? 'Configurada' : 'No configurada',
      }
    });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    status: 'ok',
    message: 'Vercel Serverless Function funcionando correctamente',
    timestamp: new Date().toISOString(),
    node_version: process.version,
    env: {
      ORACLE_DB_USER: process.env.ORACLE_DB_USER ? 'Configurada' : 'No configurada',
      ORACLE_DB_CONNECTION_STRING: process.env.ORACLE_DB_CONNECTION_STRING ? 'Configurada' : 'No configurada',
      ORACLE_DB_PASSWORD: process.env.ORACLE_DB_PASSWORD ? 'Configurada' : 'No configurada',
    }
  }));
}
