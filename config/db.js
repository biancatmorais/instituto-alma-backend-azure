const mysql = require('mysql2');
// O módulo 'url' não é mais necessário se usarmos o padrão URI

// Railway deve fornecer a string de conexão completa para o BD
const connectionString = process.env.DATABASE_URL;


if (!connectionString) {
    // ⚠️ Se esta linha falhar, o Railway não está fornecendo o BD.
    console.error("ERRO CRÍTICO: Variável de String de Conexão do Banco de Dados (DATABASE_URL) não encontrada.");
    // Lançar um erro aqui faz o Railway falhar, mas é a única maneira de depurar!
    throw new Error("Conexão com o BD falhou. Variável de ambiente ausente.");
}

// O mysql2 (Pool) pode aceitar a string de conexão diretamente como URI
const dbConfig = {
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 💡 Configuração de SSL/TLS para ambiente de nuvem
    ssl: {
        rejectUnauthorized: false, // Usar false no Railway para simplificar o handshake SSL
    }
};

const pool = mysql.createPool(dbConfig);

// Teste de conexão: Essencial para confirmar que o pool foi criado com sucesso.
pool.getConnection((err, connection) => {
    if (err) {
        console.error('--- ERRO FATAL AO CONECTAR AO MYSQL ---');
        console.error('Causa:', err.code);
        console.error('Detalhes:', err.stack);
    } else {
        console.log('>>> POOL de Conexões MySQL iniciado com sucesso!');
        connection.release();
    }
});


module.exports = pool;