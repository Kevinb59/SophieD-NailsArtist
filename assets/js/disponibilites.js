document.addEventListener("DOMContentLoaded", function () {
    // Sélection des éléments HTML
    const prestationSelect = document.getElementById("prestation");
    const dateInput = document.getElementById("date");
    const horaireSelect = document.getElementById("horaire");

    // Ajout des écouteurs d'événements pour mise à jour dynamique
    prestationSelect.addEventListener("change", updateDisponibilites);
    dateInput.addEventListener("change", updateDisponibilites);
});

async function updateDisponibilites() {
    const prestation = document.getElementById("prestation").value;
    const date = document.getElementById("date").value;
    const horaireSelect = document.getElementById("horaire");

    // Vérifier que prestation et date sont bien sélectionnées
    if (!prestation || !date) {
        horaireSelect.innerHTML = '<option value="">- Sélectionner un créneau -</option>';
        return;
    }

    // Indiquer le chargement en cours
    horaireSelect.innerHTML = '<option value="">Chargement...</option>';

    try {
        // Appel du script Google Apps
        const response = await fetch(`https://script.google.com/macros/s/AKfycbz5w_XFxJQXX_KHsPGssl9OOjJ_RqQSAHNS81MUmzrF7JDxjaqJRlO7H1FiVeRyHvkD/exec?prestation=${encodeURIComponent(prestation)}&date=${encodeURIComponent(date)}`);
        const data = await response.json();

        // Vérifier si la requête a réussi
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
