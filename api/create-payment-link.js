import Stripe from 'stripe';

export default async function handler(req, res) {
    console.log("Requête reçue sur /api/create-payment-link");

    if (req.method !== 'POST') {
        console.error("Méthode non autorisée");
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("Clé Stripe non trouvée");
        return res.status(500).json({ error: "STRIPE_SECRET_KEY manquante" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { amount } = req.body;
        console.log("Montant reçu :", amount);

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("Montant invalide :", amount);
            return res.status(400).json({ error: 'Montant invalide' });
        }

        // Créer un prix temporaire pour le paiement
        const price = await stripe.prices.create({
            unit_amount: Math.round(amount * 100), // Convertir en centimes
            currency: 'eur',
            product_data: {
                name: 'Paiement personnalisé',
            },
        });

        // Créer le lien de paiement avec le prix généré
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{
                price: price.id,
                quantity: 1,
            }],
        });

        console.log("Lien généré :", paymentLink.url);
        res.status(200).json({ url: paymentLink.url });

    } catch (error) {
        console.error("Erreur Stripe :", error.message);
        res.status(500).json({ error: error.message });
    }
}
