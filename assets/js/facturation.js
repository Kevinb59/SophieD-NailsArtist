document.addEventListener("DOMContentLoaded", function() {
    let paymentUrl = "";

    document.getElementById("generate-btn").addEventListener("click", async function() {
        const amount = parseFloat(document.getElementById("amount").value);
        if (!amount || amount <= 0) {
            alert("Veuillez entrer un montant valide.");
            return;
        }

        const response = await fetch("/api/create-payment-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
        });

        const data = await response.json();
        if (data.url) {
            paymentUrl = data.url;
            document.getElementById("payment-link").innerHTML = `
                <a href="${data.url}" target="_blank">${data.url}</a>
            `;
            document.getElementById("share-btn").style.display = "inline"; // Afficher bouton "Partager"
            document.getElementById("copy-btn").style.display = "inline"; // Afficher bouton "Copier"
        } else {
            alert("Erreur : " + data.error);
        }
    });

    document.getElementById("share-btn").addEventListener("click", function() {
        if (navigator.share) {
            navigator.share({
                title: "Lien de paiement",
                text: "Voici votre lien de paiement :",
                url: paymentUrl
            }).catch(err => console.error("Erreur de partage :", err));
        } else {
            alert("Le partage n'est pas supporté sur ce navigateur. Copiez le lien manuellement.");
        }
    });

    document.getElementById("copy-btn").addEventListener("click", function() {
        navigator.clipboard.writeText(paymentUrl).then(() => {
            alert("Lien copié dans le presse-papier !");
        }).catch(err => console.error("Erreur de copie :", err));
    });
});
