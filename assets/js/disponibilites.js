document.addEventListener("DOMContentLoaded", function () {
    const prestationSelect = document.getElementById("prestation");
    const dateInput = document.getElementById("date");
    const horaireSelect = document.getElementById("horaire");

    prestationSelect.addEventListener("change", updateDisponibilites);
    dateInput.addEventListener("change", updateDisponibilites);
});

async function updateDisponibilites() {
    const prestation = document.getElementById("prestation").value;
    const date = document.getElementById("date").value;
    const horaireSelect = document.getElementById("horaire");

    horaireSelect.innerHTML = '<option value="">Chargement...</option>';

    if (!prestation || !date) {
        horaireSelect.innerHTML = '<option value="">- Sélectionner un créneau -</option>';
        return;
    }

    try {
        const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?output=csv";
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        const disponibilites = parseCSV(csvText);

        // Filtrer les disponibilités pour la date sélectionnée
        const creneauxDispo = disponibilites.filter(row => row.date === date);

        if (creneauxDispo.length > 0) {
            horaireSelect.innerHTML = creneauxDispo.map(creneau =>
                `<option value="${creneau.heure_debut}">${creneau.heure_debut} - ${creneau.heure_fin}</option>`
            ).join('');
        } else {
            horaireSelect.innerHTML = '<option value="">Aucun créneau disponible</option>';
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des créneaux :", error);
        horaireSelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

function parseCSV(csvText) {
    const rows = csvText.split("\n").map(row => row.split(","));
    const headers = rows.shift(); // Extraire l'en-tête

    return rows.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header.trim().toLowerCase().replace(" ", "_")] = row[index].trim();
        });
        return obj;
    });
}
