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










document.addEventListener("DOMContentLoaded", async function () {
    const dateInput = document.getElementById("date");
    const prestationSelect = document.getElementById("prestation");

    prestationSelect.addEventListener("change", updateCalendar);

    async function updateCalendar() {
        const prestation = prestationSelect.value;
        if (!prestation) return;

        console.log("🔍 Mise à jour du calendrier pour la prestation :", prestation);

        try {
            const [prestationsCSV, disposCSV, rdvCSV] = await Promise.all([
                fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=1742624469&single=true&output=csv").then(res => res.text()),
                fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?output=csv").then(res => res.text()),
                fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=1845008987&single=true&output=csv").then(res => res.text())
            ]);

            const prestations = parseCSV(prestationsCSV);
            const disponibilites = parseCSV(disposCSV);
            const rdvs = parseCSV(rdvCSV);

            console.log("📜 Disponibilités chargées :", disponibilites);
            console.log("📅 RDVs chargés :", rdvs);
            console.log("💼 Prestations chargées :", prestations);

            // Trouver la durée de la prestation sélectionnée
            const prestationData = prestations.find(p => p.prestation.trim().toLowerCase() === prestation.trim().toLowerCase());
            if (!prestationData) {
                console.warn("❌ Prestation non trouvée :", prestation);
                return;
            }

            const dureePrestation = parseInt(prestationData.duree); // Durée en minutes
            console.log("⏳ Durée de la prestation :", dureePrestation, "minutes");

            let joursDisponibles = [];

            disponibilites.forEach(dispo => {
                const date = dispo.date;
                let heureDebut = parseTime(dispo.heure_début);
                let heureFin = parseTime(dispo.heure_fin);

                // RDVs existants ce jour-là
                const rdvsJour = rdvs.filter(rdv => rdv.date === date);
                let rdvIntervals = rdvsJour.map(rdv => ({
                    debut: parseTime(rdv.heure_début),
                    fin: parseTime(rdv.heure_fin)
                }));

                console.log(`📆 Vérification du jour ${date} : ${formatTime(heureDebut)} - ${formatTime(heureFin)}`);

                let creneauxLibres = [];
                let derniereFin = heureDebut;

                // Trier les RDVs pour éviter les erreurs d'intervalles
                rdvIntervals.sort((a, b) => a.debut - b.debut);

                // Vérifier les créneaux entre les RDVs
                rdvIntervals.forEach(rdv => {
                    if (rdv.debut - derniereFin >= dureePrestation) {
                        creneauxLibres.push({
                            debut: derniereFin,
                            fin: rdv.debut
                        });
                    }
                    derniereFin = Math.max(derniereFin, rdv.fin);
                });

                // Vérifier si un créneau est dispo après le dernier RDV
                if (heureFin - derniereFin >= dureePrestation) {
                    creneauxLibres.push({
                        debut: derniereFin,
                        fin: heureFin
                    });
                }

                if (creneauxLibres.length > 0) {
                    joursDisponibles.push(date);
                    console.log(`✅ Jour dispo trouvé ${date}, créneaux libres :`, creneauxLibres.map(c => `${formatTime(c.debut)} - ${formatTime(c.fin)}`));
                } else {
                    console.log(`❌ Aucun créneau de ${dureePrestation} min dispo le ${date}`);
                }
            });

            console.log("📅 Jours finalement disponibles :", joursDisponibles);

            // Désactiver uniquement les jours sans créneaux
            flatpickr(dateInput, {
                dateFormat: "Y-m-d",
                minDate: "today",
                disable: [
                    function (date) {
                        return !joursDisponibles.includes(date.toISOString().split("T")[0]);
                    }
                ],
                locale: {
                    firstDayOfWeek: 1 // Lundi en premier
                }
            });
        } catch (error) {
            console.error("🚨 Erreur dans la récupération des créneaux :", error);
        }
    }

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

    function parseTime(hhmm) {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    }

    function formatTime(minutes) {
        let h = Math.floor(minutes / 60);
        let m = minutes % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
});
