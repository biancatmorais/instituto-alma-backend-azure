const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Ajuste o caminho conforme a localização do seu arquivo de conexão MySQL
const db = require('../config/db'); 

// Chave Secreta do Webhook
// 🚨 MODO DE TESTE LOCAL: Use o valor 'whsec_...' fornecido pelo comando 'stripe listen' no terminal.
// MODO DE PRODUÇÃO: Use process.env.STRIPE_WEBHOOK_SECRET (como estava antes).
const endpointSecret = "whsec_c4a4c0c4154ff917860dbd2b59b170f61aed74338bcd4679f578a8a532d0f647"; 
// const endpointSecret = "whsec_SEU_VALOR_AQUI_DO_TERMINAL"; // ⬅️ Use esta linha para testes locais

// --- 1. Lógica de Criação de Intenção de Pagamento ---

const createPaymentIntent = async (req, res) => {
    const { amount, paymentMethodId } = req.body;
    
    const amountInCents = Math.round(parseFloat(amount) * 100); 

    if (!amountInCents || amountInCents < 50) {
        return res.status(400).json({ 
            success: false, 
            message: "Valor da doação inválido. O valor mínimo é R$ 0,50." 
        });
    }

    let donationId = null; 
    
    // URL de retorno (usada no 3D Secure). 🚨 Mude para o domínio de PROD antes do deploy!
    const RETURN_URL = 'http://localhost:5173/doar'; 

    try {
        // Cria o Payment Intent no Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents, 
            currency: 'brl', 
            payment_method: paymentMethodId,
            description: `Doação Instituto Alma - R$ ${amount}`,
            confirm: true,
            return_url: RETURN_URL, 
            metadata: {
                valor_reais: amount 
            },
        });

        // Insere o registro inicial na tabela 'doacoes'
        const initialStatus = (paymentIntent.status === 'succeeded') ? 'aprovada' : 'pendente';
        
        // ** Assumindo que db.query retorna um objeto com a propriedade insertId **
        const [result] = await db.query(
            "INSERT INTO doacoes (stripe_id, valor_reais, status_doacao) VALUES (?, ?, ?)", 
            [paymentIntent.id, amount, initialStatus]
        );
        donationId = result.insertId; 

        // Retorna a resposta ao frontend
        if (paymentIntent.status === 'succeeded') {
            return res.json({ success: true, message: 'Doação aprovada!' });

        } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
            return res.json({ 
                success: false, 
                requiresAction: true, 
                clientSecret: paymentIntent.client_secret 
            });
        } else {
            return res.status(202).json({ 
                success: false, 
                message: 'Aguardando autenticação do pagamento.', 
                clientSecret: paymentIntent.client_secret 
            });
        }

    } catch (error) {
        console.error('Erro de Processamento Stripe/DB:', error);
        
        if (donationId) {
            // Atualiza status para 'falhou' se a transação Stripe falhou APÓS o registro inicial no DB
            await db.query(
                "UPDATE doacoes SET status_doacao = 'falhou' WHERE id = ?", 
                [donationId]
            );
        }
        
        return res.status(500).json({ success: false, message: error.message || 'Erro interno no servidor de pagamento.' });
    }
};

// --- 2. Lógica do Stripe Webhook ---

const processStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // 1. VERIFICAÇÃO DE SEGURANÇA (usa o corpo RAW da requisição)
    try {
        // ATENÇÃO: req.rawBody é onde o servidor.js armazena o corpo RAW da requisição
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(`⚠️ Erro na verificação do Webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. PROCESSAMENTO DO EVENTO
    const paymentIntent = event.data.object;
    
    switch (event.type) {
        case 'payment_intent.succeeded':
            const statusAprovado = 'aprovada';
            
            try {
                // Atualiza o status_doacao para 'aprovada' no MySQL
                await db.query(
                    "UPDATE doacoes SET status_doacao = ? WHERE stripe_id = ?", 
                    [statusAprovado, paymentIntent.id]
                );
            } catch (dbError) {
                console.error(`Erro ao atualizar DB na aprovação: ${dbError}`);
            }
            break;
            
        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled':
            const statusFalhou = 'falhou';
            
            try {
                 // Atualiza o status_doacao para 'falhou' no MySQL
                await db.query(
                    "UPDATE doacoes SET status_doacao = ? WHERE stripe_id = ?", 
                    [statusFalhou, paymentIntent.id]
                );
            } catch (dbError) {
                console.error(`Erro ao atualizar DB na falha: ${dbError}`);
            }
            break;

        default:
            console.log(`Evento Stripe ignorado: ${event.type}`);
    }

    // 3. Retorna resposta 200 OK para o Stripe
    res.json({ received: true });
};

module.exports = {
    createPaymentIntent,
    processStripeWebhook
};