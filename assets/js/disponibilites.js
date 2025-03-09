document.addEventListener("DOMContentLoaded", function () {
    const prestationSelect = document.getElementById("prestation");
    const dateInput = document.getElementById("date");
    const horaireSelect = document.getElementById("horaire");

    prestationSelect.addEventListener("change", updateDisponibilites);
    dateInput.addEventListener("change", updateDisponibilites);
});

let lastRequestUrl = ""; // Stocke la dernière requête pour éviter les appels inutiles

async function updateDisponibilites() {
    const prestation = document.getElementById("prestation").value;
    const date = document.getElementById("date").value;
    const horaireSelect = document.getElementById("horaire");

    // Réinitialiser proprement la liste des créneaux
    horaireSelect.innerHTML = '<option value="">Chargement...</option>';

    if (!prestation || !date) {
        horaireSelect.innerHTML = '<option value="">- Sélectionner un créneau -</option>';
        return;
    }

    // Construire l'URL de requête vers Google Apps Script
    const scriptUrl = `https://script.google.com/macros/s/AKfycbznX5FsJxirqIacCwdUQQLQgGk2SjbrUK0_8I6UMjk35vS4sFUOvX7ZLoEwlwNTx1hg/exec?prestation=${encodeURIComponent(prestation)}&date=${encodeURIComponent(date)}`;

    // Vérifier si la même requête a déjà été envoyée récemment pour éviter les doublons
    if (scriptUrl === lastRequestUrl) return;
    lastRequestUrl = scriptUrl;

    try {
        const response = await fetch(scriptUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors" // Activer le mode CORS
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Vérifier si la réponse contient des créneaux disponibles
        if (data.success && data.creneaux.length > 0) {
            horaireSelect.innerHTML = data.creneaux.map(creneau =>
                `<option value="${creneau}">${creneau}</option>`
            ).join('');
        } else {
            horaireSelect.innerHTML = '<option value="">Aucun créneau disponible</option>';
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des créneaux :", error);
        horaireSelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}
