// paymentController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db'); 

// Chave do Webhook (corrigida com aspas, mas idealmente deve vir do .env)
const endpointSecret = 'whsec_c4a4c0c4154ff917860dbd2b59b170f61aed74338bcd4679f578a8a532d0f647'; 

// --- 1. Lógica para criar a intenção de pagamento ---
const createPaymentIntent = async (req, res) => {
    // Recebe o valor (amount) do frontend
    const { amount } = req.body; 
    
    // Converte reais para centavos (ex: R$ 10.00 -> 1000)
    const amountInCents = Math.round(parseFloat(amount) * 100); 

    if (!amountInCents || amountInCents < 50) {
        return res.status(400).json({ 
            success: false, 
            message: "Valor da doação inválido. O valor mínimo é R$ 0,50." 
        });
    }

    let donationId = null; 

    try {
        // 1. Cria o PaymentIntent no Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents, 
            currency: 'brl', 
            // Permite Pix e Cartão, o Stripe gerencia a confirmação no frontend
            automatic_payment_methods: { 
                enabled: true, 
            },
            description: `Doação Instituto Alma - R$ ${amount}`,
            metadata: {
                valor_reais: amount 
            },
        });

        // 2. Insere o registro inicial no banco de dados (status 'pendente')
        const initialStatus = 'pendente';
        
        // Assumindo que db.query retorna um objeto com a propriedade insertId:
        const [result] = await db.query(
            "INSERT INTO doacoes (stripe_id, valor_reais, status_doacao, criado_em) VALUES (?, ?, ?, NOW())", 
            [paymentIntent.id, amount, initialStatus]
        );
        donationId = result.insertId; 

        // 3. Retorna o clientSecret para o frontend (necessário para o CheckoutForm)
        return res.json({ 
            success: true, 
            clientSecret: paymentIntent.client_secret,
            message: 'Intenção de pagamento criada com sucesso.'
        });

    } catch (error) {
        console.error('Erro de Processamento Stripe/DB:', error);
        
        // Lógica de recuperação em caso de falha inicial
        if (donationId) {
            try {
                await db.query(
                    "UPDATE doacoes SET status_doacao = 'falha_inicial' WHERE id = ?", 
                    [donationId]
                );
            } catch (dbUpdateError) {
                console.error('Erro ao atualizar status de falha no DB:', dbUpdateError);
            }
        }
        
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Erro interno no servidor de pagamento.' 
        });
    }
};


// --- 2. Lógica do Stripe Webhook ---
const processStripeWebhook = async (req, res) => {
    // req.headers['stripe-signature'] contém a assinatura de segurança do Stripe
    const sig = req.headers['stripe-signature'];
    let event;

    // 1. VERIFICAÇÃO DE SEGURANÇA
    try {
        // Usa req.rawBody que foi populado no server.js
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
                await db.query(
                    "UPDATE doacoes SET status_doacao = ? WHERE stripe_id = ?", 
                    [statusAprovado, paymentIntent.id]
                );
                console.log(`✅ Doação aprovada e DB atualizado: ${paymentIntent.id}`);
            } catch (dbError) {
                console.error(`Erro ao atualizar DB na aprovação: ${dbError}`);
            }
            break;
            
        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled':
            const statusFalhou = 'falhou';
            try {
                await db.query(
                    "UPDATE doacoes SET status_doacao = ? WHERE stripe_id = ?", 
                    [statusFalhou, paymentIntent.id]
                );
                console.log(`❌ Doação falhou e DB atualizado: ${paymentIntent.id}`);
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

// As duas funções são exportadas e prontas para serem usadas pelas rotas.
module.exports = {
    createPaymentIntent,
    processStripeWebhook
};