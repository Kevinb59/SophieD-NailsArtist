document.addEventListener("DOMContentLoaded", function () {
    const prestationSelect = document.getElementById("prestation");
    const dateInput = document.getElementById("date");
    const horaireSelect = document.getElementById("horaire");

    prestationSelect.addEventListener("change", updateDisponibilites);
    dateInput.addEventListener("change", updateDisponibilites);
});

const csvLinks = {
    disponibilites: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?output=csv",
    rdv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=1845008987&single=true&output=csv",
    prestations: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=1742624469&single=true&output=csv"
};

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
        // Charger toutes les données en parallèle
        const [disposCSV, rdvCSV, prestationsCSV] = await Promise.all([
            fetch(csvLinks.disponibilites).then(res => res.text()),
            fetch(csvLinks.rdv).then(res => res.text()),
            fetch(csvLinks.prestations).then(res => res.text())
        ]);

        const disponibilites = parseCSV(disposCSV);
        const rdvs = parseCSV(rdvCSV);
        const prestations = parseCSV(prestationsCSV);

        console.log("Disponibilités chargées :", disponibilites);
        console.log("RDVs chargés :", rdvs);
        console.log("Prestations chargées :", prestations);

        // Trouver la durée de la prestation sélectionnée (en minutes)
        const prestationData = prestations.find(p => p.prestation.trim().toLowerCase() === prestation.trim().toLowerCase());

        if (!prestationData) {
            console.error("Prestation non trouvée :", prestation);
            horaireSelect.innerHTML = '<option value="">Erreur : Prestation inconnue</option>';
            return;
        }

        const dureePrestation = parseInt(prestationData.duree); // Déjà en minutes

        // Trouver les disponibilités pour la date sélectionnée
        const dispoJour = disponibilites.find(d => d.date === date);
        if (!dispoJour) {
            horaireSelect.innerHTML = '<option value="">Aucune disponibilité ce jour</option>';
            return;
        }

        const heureDebut = parseTime(dispoJour.heure_début);
        const heureFin = parseTime(dispoJour.heure_fin);

        // Trouver les RDVs existants sur cette date
        const rdvsJour = rdvs.filter(r => r.date === date);
        const rdvIntervals = rdvsJour.map(r => ({
            debut: parseTime(r.heure_début),
            fin: parseTime(r.heure_fin) // On prend l'heure de fin directement
        }));

        // Générer les créneaux de 30 minutes
        let creneauxDispo = [];

        for (let heure = heureDebut; heure + dureePrestation <= heureFin; heure += 30) {
            let finCreneau = heure + dureePrestation;

            // Vérifier si le créneau est libre
            let conflit = rdvIntervals.some(rdv => 
                (heure < rdv.fin && finCreneau > rdv.debut) || // Le créneau chevauche un RDV existant
                (heure >= rdv.debut && heure < rdv.fin) || // Le créneau commence à l'intérieur d'un RDV
                (finCreneau > rdv.debut && finCreneau <= rdv.fin) // Le créneau se termine à l'intérieur d'un RDV
            );

            if (!conflit) {
                creneauxDispo.push(`${formatTime(heure)} - ${formatTime(finCreneau)}`);
            }
        }

        // Affichage des créneaux disponibles
        if (creneauxDispo.length > 0) {
            horaireSelect.innerHTML = creneauxDispo.map(creneau =>
                `<option value="${creneau}">${creneau}</option>`
            ).join('');
        } else {
            horaireSelect.innerHTML = '<option value="">Aucun créneau disponible</option>';
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des créneaux :", error);
        horaireSelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

// Fonction pour parser un CSV en tableau d'objets
function parseCSV(csvText) {
    const rows = csvText.split("\n").map(row => row.split(","));
    const headers = rows.shift().map(header => header.trim().toLowerCase().replace(/\s+/g, "_"));

    return rows.map(row => {
        let obj = {};
        row.forEach((value, index) => {
            obj[headers[index]] = value ? value.trim() : "";
        });
        return obj;
    });
}

// Convertir HH:MM en minutes depuis minuit
function parseTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

// Convertir minutes en HH:MM
function formatTime(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}











document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("date");
    const prestationSelect = document.getElementById("prestation");
    const horaireSelect = document.getElementById("horaire");

    // Initialisation de Flatpickr avec désactivation des jours dynamiquement
    flatpickr(dateInput, {
        dateFormat: "d/m/Y",
        disable: [], // Les jours désactivés seront mis à jour dynamiquement
        locale: "fr",
        onOpen: updateCalendar // Met à jour les jours disponibles quand l'utilisateur ouvre le calendrier
    });

    prestationSelect.addEventListener("change", async function () {
        await updateCalendar();
        await updateDisponibilites();
    });

    dateInput.addEventListener("change", updateDisponibilites);
});

// ** Met à jour les jours activés/désactivés dans Flatpickr **
async function updateCalendar() {
    const prestation = document.getElementById("prestation").value;
    if (!prestation) return;

    console.log("📅 Mise à jour du calendrier pour la prestation :", prestation);

    try {
        // Charger toutes les données en parallèle
        const [disposCSV, rdvCSV, prestationsCSV] = await Promise.all([
            fetch(csvLinks.disponibilites).then(res => res.text()),
            fetch(csvLinks.rdv).then(res => res.text()),
            fetch(csvLinks.prestations).then(res => res.text())
        ]);

        const disponibilites = parseCSV(disposCSV);
        const rdvs = parseCSV(rdvCSV);
        const prestations = parseCSV(prestationsCSV);

        console.log("📋 Disponibilités chargées :", disponibilites);
        console.log("📋 RDVs chargés :", rdvs);
        console.log("📋 Prestations chargées :", prestations);

        // Trouver la durée de la prestation sélectionnée (en minutes)
        const prestationData = prestations.find(p => p.prestation.trim().toLowerCase() === prestation.trim().toLowerCase());
        if (!prestationData) {
            console.error("❌ Prestation non trouvée :", prestation);
            return;
        }
        const dureePrestation = parseInt(prestationData.duree); // Déjà en minutes

        // Déterminer les jours valides en fonction des disponibilités et RDVs existants
        let joursDisponibles = [];
        for (let dispo of disponibilites) {
            let heureDebut = parseTime(dispo.heure_début);
            let heureFin = parseTime(dispo.heure_fin);

            // Filtrer les RDVs de cette journée
            let rdvsJour = rdvs.filter(r => r.date === dispo.date);
            let rdvIntervals = rdvsJour.map(r => ({
                debut: parseTime(r.heure_début),
                fin: parseTime(r.heure_fin)
            }));

            // Vérifier s'il reste assez de temps libre pour placer la prestation
            let libre = false;
            for (let heure = heureDebut; heure + dureePrestation <= heureFin; heure += 30) {
                let finCreneau = heure + dureePrestation;

                let conflit = rdvIntervals.some(rdv =>
                    (heure < rdv.fin && finCreneau > rdv.debut) ||
                    (heure >= rdv.debut && heure < rdv.fin) ||
                    (finCreneau > rdv.debut && finCreneau <= rdv.fin)
                );

                if (!conflit) {
                    libre = true;
                    break;
                }
            }

            if (libre) joursDisponibles.push(dispo.date);
        }

        console.log("✅ Jours valides pour cette prestation :", joursDisponibles);

        // Désactiver tous les jours qui ne sont pas valides
        let allDays = [];
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 60; i++) { // Parcours sur 60 jours
            let formattedDate = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
            if (!joursDisponibles.includes(formattedDate)) {
                allDays.push(formattedDate);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log("🚫 Jours désactivés dans Flatpickr :", allDays);

        // Appliquer les jours désactivés à Flatpickr
        dateInput._flatpickr.set("disable", allDays);
        dateInput._flatpickr.redraw();

    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du calendrier :", error);
    }
}

// ** Fonction pour analyser un fichier CSV **
function parseCSV(csvText) {
    const rows = csvText.split("\n").map(row => row.split(","));
    const headers = rows.shift().map(header => header.trim().toLowerCase().replace(/\s+/g, "_"));

    return rows.map(row => {
        let obj = {};
        row.forEach((value, index) => {
            obj[headers[index]] = value ? value.trim() : "";
        });
        return obj;
    });
}

// ** Convertir HH:MM en minutes depuis minuit **
function parseTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

// ** Convertir minutes en HH:MM **
function formatTime(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
