const mysql = require('mysql2/promise');
const url = require('url');
require('dotenv').config();

const connectionString = process.env.MYSQL_URL;

if (!connectionString) {
  console.error("❌ ERRO CRÍTICO: Variável de conexão MYSQL_URL não encontrada!");
  process.exit(1);
}

(async () => {
  try {
    // Quebrar a URL para extrair os dados
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
        rejectUnauthorized: false, // necessário para Railway
      },
    };

    const pool = mysql.createPool(dbConfig);

    // Teste de conexão
    const connection = await pool.getConnection();
    console.log('✅ Conexão com o MySQL no Railway estabelecida com sucesso!');
    connection.release();

    module.exports = pool;
  } catch (error) {
    console.error('🚨 ERRO FATAL AO CONECTAR AO MYSQL:');
    console.error(error);
    process.exit(1);
  }
})();
