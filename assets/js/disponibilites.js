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

    // Vérifie si Flatpickr est déjà attaché, sinon l'initialiser
    if (!dateInput._flatpickr) {
        flatpickr(dateInput, {
            dateFormat: "d/m/Y",
            disable: [], // On désactivera les jours plus tard
            locale: "fr"
        });
    }
});

// Fonction pour mettre à jour les jours disponibles selon la prestation sélectionnée
async function updateCalendar() {
    const prestation = document.getElementById("prestation").value;
    if (!prestation) return;

    console.log("📅 Mise à jour du calendrier pour la prestation :", prestation);

    try {
        // Charger toutes les données CSV
        const [disposCSV, rdvCSV, prestationsCSV] = await Promise.all([
            fetch(csvLinks.disponibilites).then(res => res.text()),
            fetch(csvLinks.rdv).then(res => res.text()),
            fetch(csvLinks.prestations).then(res => res.text())
        ]);

        const disponibilites = parseCSV(disposCSV);
        const rdvs = parseCSV(rdvCSV);
        const prestations = parseCSV(prestationsCSV);

        console.log("📜 Disponibilités chargées :", disponibilites);
        console.log("📅 RDVs chargés :", rdvs);
        console.log("💼 Prestations chargées :", prestations);

        // Trouver la durée de la prestation sélectionnée (en minutes)
        const prestationData = prestations.find(p => p.prestation.trim().toLowerCase() === prestation.trim().toLowerCase());
        if (!prestationData) {
            console.error("❌ Prestation non trouvée :", prestation);
            return;
        }

        const dureePrestation = parseInt(prestationData.duree); // Déjà en minutes

        // Liste des jours disponibles en fonction des créneaux et des RDVs existants
        let joursDisponibles = [];

        disponibilites.forEach(dispo => {
            const heureDebut = parseTime(dispo.heure_début);
            const heureFin = parseTime(dispo.heure_fin);

            // Filtrer les RDVs de cette date
            const rdvsJour = rdvs.filter(r => r.date === dispo.date);
            const rdvIntervals = rdvsJour.map(r => ({
                debut: parseTime(r.heure_début),
                fin: parseTime(r.heure_fin)
            }));

            // Vérifier s'il reste un créneau disponible de la durée demandée
            let slotDisponible = false;
            for (let heure = heureDebut; heure + dureePrestation <= heureFin; heure += 30) {
                let finCreneau = heure + dureePrestation;

                // Vérifier si le créneau est libre
                let conflit = rdvIntervals.some(rdv => 
                    (heure < rdv.fin && finCreneau > rdv.debut) || // Chevauche un RDV existant
                    (heure >= rdv.debut && heure < rdv.fin) || // Commence à l'intérieur d'un RDV
                    (finCreneau > rdv.debut && finCreneau <= rdv.fin) // Termine à l'intérieur d'un RDV
                );

                if (!conflit) {
                    slotDisponible = true;
                    break; // On arrête dès qu'on trouve un créneau disponible
                }
            }

            if (slotDisponible) {
                joursDisponibles.push(dispo.date);
            }
        });

        console.log("✅ Jours valides pour cette prestation :", joursDisponibles);

        // Désactiver les jours où il n'y a PAS de créneaux valides dans Flatpickr
        const dateInput = document.getElementById("date");

        // Vérifie si Flatpickr est bien attaché avant de l'utiliser
        if (!dateInput._flatpickr) {
            console.error("❌ Flatpickr n'est pas initialisé sur dateInput !");
            return;
        }

        let allDays = [];
        let currentDate = new Date(dateInput._flatpickr.currentYear, dateInput._flatpickr.currentMonth, 1);

        while (currentDate.getMonth() === dateInput._flatpickr.currentMonth) {
            let formattedDate = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
            allDays.push(formattedDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        let joursDesactives = allDays.filter(date => !joursDisponibles.includes(date));

        console.log("🚫 Jours désactivés dans Flatpickr :", joursDesactives);

        // Appliquer les jours désactivés dans Flatpickr
        dateInput._flatpickr.set("disable", joursDesactives);
        dateInput._flatpickr.redraw();

    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du calendrier :", error);
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
    if (!hhmm) return 0;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

// Convertir minutes en HH:MM
function formatTime(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
