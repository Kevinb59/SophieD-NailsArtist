import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Montant invalide' });
        }

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Paiement personnalisé',
                    },
                    unit_amount: amount * 100, // Convertir en centimes
                },
                quantity: 1,
            }],
        });

        res.status(200).json({ url: paymentLink.url });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
