const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// --- CONFIGURAÇÃO DO MERCADO PAGO ---
if (!process.env.MP_ACCESS_TOKEN) {
    console.error("🚨 ERRO: Variável MP_ACCESS_TOKEN não configurada!");
}

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 }
});

const preferenceService = new Preference(client);
const paymentService = new Payment(client);

// --- CRIAR PREFERÊNCIA DE PAGAMENTO ---
exports.criarPreferencia = async (req, res) => {
    // CORRIGIDO: O frontend envia 'amount', renomeamos para 'valorDoacao'
    const { amount, doadorId } = req.body; 

    const FRONTEND_URL = process.env.FRONTEND_URL;
    const BACKEND_URL = process.env.BACKEND_URL;

    // 1. Verificação de ambiente
    if (!FRONTEND_URL || !BACKEND_URL) {
        console.error("🚨 ERRO: FRONTEND_URL ou BACKEND_URL não configuradas!");
        return res.status(500).json({ message: "URLs do ambiente não configuradas corretamente." });
    }

    // 2. VALIDAÇÃO E CONVERSÃO DE VALOR
    // O frontend garante que seja um número, mas convertemos explicitamente para garantir que
    // o Mercado Pago receba um tipo 'number' ou 'string numérica' válida.
    const valorNumerico = Number(amount); 

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
        return res.status(400).json({ message: "O valor da doação deve ser um número positivo." });
    }

    try {
        const preference = await preferenceService.create({
            body: {
                items: [
                    {
                        title: "Doação para o Instituto Alma",
                        // CORRIGIDO: Usamos o valor numérico puro.
                        unit_price: valorNumerico, 
                        currency_id: 'BRL',
                        quantity: 1
                    }
                ],
                external_reference: doadorId ? `DOACAO-${Date.now()}-${doadorId}` : `DOACAO-${Date.now()}`,
                back_urls: {
                    success: `${FRONTEND_URL}/doacao/sucesso`,
                    failure: `${FRONTEND_URL}/doacao/falha`,
                    pending: `${FRONTEND_URL}/doacao/pendente`
                },
                notification_url: `${BACKEND_URL}/api/pagamentos/webhook`
            }
        });

        res.status(200).json({
            id: preference.id,
            init_point: preference.init_point
        });
    } catch (error) {
        // Loga o erro completo do Mercado Pago (para ajudar na depuração do erro 500)
        console.error("❌ Erro ao criar preferência de pagamento:", error); 
        res.status(500).json({ message: "Erro ao iniciar o pagamento. Verifique o token MP." });
    }
};

// --- WEBHOOK: RECEBER NOTIFICAÇÃO DO MERCADO PAGO ---
exports.receberWebhook = async (req, res) => {
    const paymentId = req.query['data.id'];
    const tipo = req.query.type;

    if (tipo === 'payment' && paymentId) {
        try {
            const paymentInfo = await paymentService.get({ id: Number(paymentId) });
            const status = paymentInfo.status;
            const externalReference = paymentInfo.external_reference;

            console.log(`💬 Webhook recebido! ID: ${paymentId}, Status: ${status}, Ref: ${externalReference}`);

            if (status === 'approved') {
                // Aqui você pode salvar no banco: valor, id do doador, data, etc.
                console.log("✅ Doação aprovada e registrada no banco.");
            }

        } catch (error) {
            console.error("❌ Erro ao processar Webhook:", error.message);
            return res.status(500).send("Erro ao processar a notificação.");
        }
    }

    // O Mercado Pago precisa receber um 204 para confirmar o recebimento.
    res.sendStatus(204);
};