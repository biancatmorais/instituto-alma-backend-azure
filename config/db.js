const mysql = require('mysql2');
const url = require('url'); 

// Railway fornece a string de conexão como MYSQL_URL ou DATABASE_URL.
// Usamos MYSQL_URL pois é o que apareceu no seu painel.
const connectionString = process.env.MYSQL_URL; 

if (!connectionString) {
    // ⚠️ Esta verificação garante que o Railway não trave se a variável estiver faltando.
    console.error("ERRO CRÍTICO: Variável de String de Conexão do Banco de Dados (MYSQL_URL) não encontrada.");
    
    // Se a conexão for crucial, lançamos um erro para o Railway reiniciar o app, 
    // mas por segurança, vamos deixar um fallback mais suave para ver o erro no log.
    console.error("O servidor não pode iniciar sem a conexão com o BD.");
    // Retorna um módulo vazio para que o server.js não trave no 'require'
    module.exports = null; 
} else {
    // 💡 No Railway, a string de conexão é no formato URI, mas o mysql2 
    // prefere que ela seja destrinchada ou passada em um objeto.

    // Usamos o url.parse para quebrar a string de conexão completa (necessário no Node.js)
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
        // 💡 Configuração de SSL: Railway exige TLS/SSL
        ssl: {
            // Em ambiente de nuvem, rejectUnauthorized: false é frequentemente necessário para evitar falhas de handshake TLS
            rejectUnauthorized: false, 
        }
    };

    const pool = mysql.createPool(dbConfig);

    // Teste de conexão: Essencial para registrar o sucesso ou falha no log do Railway.
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('--- ERRO FATAL AO CONECTAR AO MYSQL ---');
            console.error('Causa:', err.code);
            console.error('Detalhes:', err.stack);
            // Deixamos o aplicativo cair para que o Railway tente novamente e você veja o erro.
        } else {
            console.log('>>> POOL de Conexões MySQL iniciado com sucesso!');
            connection.release();
        }
    });

    module.exports = pool;
}