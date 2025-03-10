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

    // Vérifie si l'élément existe avant d'initialiser Flatpickr
    if (dateInput) {
        let flatpickrInstance = flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            disable: [], // Désactivation des jours mise à jour dynamiquement
            locale: "fr",
            minDate: "today", // Désactiver tous les jours passés
            onOpen: updateCalendar // Met à jour les jours disponibles lors de l'ouverture
        });

        // Stocke l'instance de Flatpickr pour la mise à jour dynamique
        dateInput.flatpickrInstance = flatpickrInstance;
    } else {
        console.error("❌ L'élément #date n'a pas été trouvé dans le DOM.");
    }

    prestationSelect.addEventListener("change", async function () {
        await updateCalendar();
        await updateDisponibilites();
    });

    dateInput.addEventListener("change", updateDisponibilites);
});

// ** Met à jour les jours activés/désactivés dans Flatpickr **
async function updateCalendar() {
    const dateInput = document.getElementById("date");
    if (!dateInput || !dateInput.flatpickrInstance) {
        console.error("❌ Erreur: Flatpickr n'est pas initialisé sur #date");
        return;
    }

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
        const dureePrestation = parseInt(prestationData.duree);

        // Déterminer les jours réellement disponibles pour la prestation
        let joursDisponibles = [];
        let derniereDateReelle = null; // La vraie dernière date où il y a un créneau dispo

        for (let dispo of disponibilites) {
            let heureDebut = parseTime(dispo.heure_début);
            let heureFin = parseTime(dispo.heure_fin);

            let rdvsJour = rdvs.filter(r => r.date === dispo.date);
            let rdvIntervals = rdvsJour.map(r => ({
                debut: parseTime(r.heure_début),
                fin: parseTime(r.heure_fin)
            }));

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

            if (libre) {
                joursDisponibles.push(dispo.date);
                derniereDateReelle = dispo.date; // Met à jour la dernière date où il y a un créneau disponible
            }
        }

        console.log("✅ Jours valides pour cette prestation :", joursDisponibles);
        console.log("📅 Dernière date réelle avec créneau :", derniereDateReelle);

        // Désactiver tous les jours sauf ceux disponibles
        let allDays = [];
        let currentDate = new Date();
        let maxDate = derniereDateReelle ? new Date(derniereDateReelle) : new Date(); // Utiliser la dernière date réelle
        currentDate.setHours(0, 0, 0, 0);
        maxDate.setHours(23, 59, 59, 999);

        while (currentDate <= maxDate) {
            let formattedDate = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
            if (!joursDisponibles.includes(formattedDate)) {
                allDays.push(formattedDate);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Bloquer tous les jours après la dernière date réelle
        let afterLastDate = [];
        let futureDate = new Date(maxDate);
        futureDate.setDate(futureDate.getDate() + 1);
        while (futureDate <= new Date(2099, 11, 31)) { // Bloquer jusqu'à une date lointaine
            afterLastDate.push(futureDate.toISOString().split('T')[0]);
            futureDate.setDate(futureDate.getDate() + 1);
        }

        allDays = allDays.concat(afterLastDate);

        console.log("🚫 Jours désactivés dans Flatpickr :", allDays);

        // Appliquer la désactivation des jours
        dateInput.flatpickrInstance.set("disable", allDays);
        dateInput.flatpickrInstance.redraw();

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
