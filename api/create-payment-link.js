import Stripe from "stripe";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Montant invalide" });
        }

        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

        // Création du lien de paiement Stripe
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Paiement",
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
        });

        return res.json({ url: paymentLink.url });

    } catch (error) {
        console.error("Erreur Stripe:", error);
        return res.status(500).json({ error: error.message });
    }
}
