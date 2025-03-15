document.addEventListener("DOMContentLoaded", function() {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=142687818&single=true&output=csv')
        .then(response => response.text())
        .then(csv => {
            let rows = csv.split("\n").slice(1); // Ignorer l'en-tête
            let select = document.getElementById("rdv-select");

            rows.forEach(row => {
                let cols = row.split(",");
                let date = cols[0]?.trim();
                let name = cols[15]?.trim();
                let priceRaw = cols[21]?.trim().replace(/"/g, "").replace(" €", "").trim(); // Supprimer guillemets et €

                if (date && name && priceRaw) {
                    let formattedDate = date.replace(/-/g, "/"); // Format date JJ/MM/AAAA
                    let priceFormatted = parseFloat(priceRaw.replace(",", ".")).toFixed(2).replace(".", ","); // Assurer 2 décimales
                    let optionText = `${formattedDate} - ${name} - ${priceFormatted} €`;
                    let optionValue = priceFormatted.replace(",", "."); // Convertir pour input en format numérique

                    let option = new Option(optionText, optionValue);
                    select.add(option);
                }
            });
        });

    document.getElementById("rdv-select").addEventListener("change", function() {
        let selectedPrice = this.value;
        if (selectedPrice) {
            document.getElementById("amount").value = selectedPrice; // Insérer proprement dans l'input
        }
    });
});
