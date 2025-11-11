const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// --- Configuração da SDK (SOLUÇÃO CORRIGIDA) ---
// Verifica se o token está configurado
if (!process.env.MP_ACCESS_TOKEN) {
    console.error("ERRO CRÍTICO: Token de acesso do Mercado Pago (MP_ACCESS_TOKEN) não configurado. Verifique o seu arquivo .env.");
}

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: {
        timeout: 5000 
    }
});

const preferenceService = new Preference(client);
const paymentService = new Payment(client); 

// --- Função 1: Criar Preferência de Pagamento ---
exports.criarPreferencia = async (req, res) => {
    const { valor, doadorId } = req.body; 
    
    // 🛑 IMPORTANTE: VOCÊ DEVE SUBSTITUIR ESTE TEXTO PELA URL HTTPS GERADA PELO NGROK 🛑
    // EXEMPLO: 'https://abcd123.ngrok-free.app'
    const FRONTEND_URL = 'https://COLE_A_URL_HTTPS_DO_NGROK_AQUI'; 
    
    // O BACKEND_URL é o endereço que o Mercado Pago vai notificar (Webhook)
    const BACKEND_URL = 'http://localhost:4000'; // Mantemos localhost para o Backend
    
    // Validação de segurança básica
    if (FRONTEND_URL.includes('COLE_A_URL_HTTPS_DO_NGROK_AQUI')) {
        console.error("ERRO CRÍTICO: FRONTEND_URL não configurada no pagamentoController.js!");
        return res.status(500).json({ message: "Configuração do Frontend URL pendente." });
    }

    try {
        const preference = await preferenceService.create({
            body: {
                items: [
                    {
                        title: "Doação para o Instituto Alma",
                        unit_price: Number(valor),
                        quantity: 1,
                    }
                ],
                external_reference: doadorId ? `DOACAO-${Date.now()}-${doadorId}` : `DOACAO-${Date.now()}`,
                
                // URLs de retorno - USANDO A URL HTTPS DO NGROK
                back_urls: {
                    success: `${FRONTEND_URL}/doacao/sucesso`,
                    failure: `${FRONTEND_URL}/doacao/falha`,
                    pending: `${FRONTEND_URL}/doacao/pendente`
                },
                // notification_url é a rota que o Mercado Pago chamará (Webhook)
                notification_url: `${BACKEND_URL}/api/pagamentos/webhook?type=payment&data.id=`, 
            }
        });
        
        // Retorna o link de pagamento para o Frontend
        res.status(200).json({ 
            id: preference.id,
            init_point: preference.init_point 
        });
    } catch (error) {
        console.error("Erro ao criar preferência (MP API):", error.message);
        // Exibe a mensagem de erro do Mercado Pago no console do Backend
        res.status(500).json({ message: "Erro ao iniciar o pagamento." });
    }
};

// --- Função 2: Receber Webhook (Notificação) ---
exports.receberWebhook = async (req, res) => {
    const paymentId = req.query['data.id'];

    if (req.query.type === 'payment' && paymentId) {
        try {
            // 1. Consultar o Mercado Pago para obter os detalhes do pagamento
            const paymentInfo = await paymentService.get({
                id: Number(paymentId)
            });
            
            const status = paymentInfo.status;
            const externalReference = paymentInfo.external_reference;
            
            // 2. Lógica de Atualização no Banco de Dados (MySQL)
            console.log(`--- WEBHOOK RECEBIDO ---`);
            console.log(`ID do Pagamento: ${paymentId}, Status: ${status}`);
            
            if (status === 'approved') {
                // EX: Lógica para registrar/atualizar a doação como APROVADA no MySQL
                console.log(`Ação: Doação APROVADA e registrada no MySQL.`);
            } 
            
        } catch (error) {
            console.error("Erro ao processar Webhook/Consultar MP:", error.message);
            // Retornar 500 para o Mercado Pago tentar reenviar a notificação
            return res.status(500).send("Erro ao processar a notificação.");
        }
    }
    
    // 3. Resposta Esperada
    // Retornar 204 (No Content) é obrigatório.
    res.sendStatus(204); 
};