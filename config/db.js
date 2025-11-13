const mysql = require('mysql2/promise');
const url = require('url');
require('dotenv').config();

const connectionString = process.env.MYSQL_URL;

if (!connectionString) {
  console.error("❌ ERRO CRÍTICO: Variável de conexão MYSQL_URL não encontrada!");
  process.exit(1);
}

try {
  // Extrai dados da URL de conexão
  const params = url.parse(connectionString);
  const [user, password] = params.auth.split(':');

  const dbConfig = {
    host: params.hostname,
    user,
    password,
    database: params.pathname.replace('/', ''),
    port: params.port ? parseInt(params.port) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: false, // Necessário para Railway
    },
  };

  // Cria o pool de conexões
  const pool = mysql.createPool(dbConfig);

  // Testa conexão inicial
  pool.getConnection()
    .then(conn => {
      console.log('✅ Conexão com o MySQL no Railway estabelecida com sucesso!');
      conn.release();
    })
    .catch(err => {
      console.error('🚨 ERRO AO TESTAR CONEXÃO INICIAL COM MYSQL:');
      console.error(err);
      process.exit(1);
    });

  // Exporta o pool (agora acessível fora do escopo)
  module.exports = pool;

} catch (error) {
  console.error('🚨 ERRO FATAL AO CONFIGURAR CONEXÃO MYSQL:');
  console.error(error);
  process.exit(1);
}
