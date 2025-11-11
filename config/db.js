const mysql = require('mysql2');
const url = require('url'); // Precisamos do módulo URL para analisar a string de conexão

// Railway geralmente fornece MYSQL_URL (ou DATABASE_URL)
const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL; 


if (!connectionString) {
    console.error("ERRO CRÍTICO: Variável de String de Conexão do Banco de Dados (DATABASE_URL ou MYSQL_URL) não encontrada.");
    // ⚠️ Em produção, o servidor NÃO deve iniciar sem a conexão com o BD
    throw new Error("Conexão com o BD falhou. Variável de ambiente ausente.");
}

// O mysql2 (Pool) precisa que a string seja analisada em um objeto de configuração.
// Vamos usar o módulo 'url' para extrair os componentes da string do Railway.
const params = url.parse(connectionString);
const auth = params.auth ? params.auth.split(':') : [null, null];

const dbConfig = {
    host: params.hostname,
    user: auth[0],
    password: auth[1],
    database: params.pathname ? params.pathname.substring(1) : null,
    port: params.port || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 💡 IMPORTANTE: Configuração de SSL/TLS para ambiente de nuvem
    ssl: {
        rejectUnauthorized: true, 
        // Em alguns ambientes, pode ser necessário rejectUnauthorized: false para testes
    }
};

const pool = mysql.createPool(dbConfig);

// Teste de conexão: Essencial para confirmar que o pool foi criado com sucesso.
pool.getConnection((err, connection) => {
    if (err) {
        console.error('--- ERRO FATAL AO CONECTAR AO MYSQL NO RAILWAY ---');
        console.error('Causa:', err.code);
        console.error('Detalhes:', err.stack);
        // Não retornar, apenas registrar o erro e deixar o App falhar para depuração
    } else {
        console.log('>>> POOL de Conexões MySQL iniciado com sucesso! (Host:', dbConfig.host, ')');
        connection.release();
    }
});


module.exports = pool;