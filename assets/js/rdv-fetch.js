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
                let priceRaw = cols[21]?.trim();

                if (date && name && priceRaw) {
                    let price = priceRaw.replace("€", "").trim(); // Supprime l'euro
                    let formattedDate = new Date(date).toLocaleDateString("fr-FR");
                    let optionText = `${formattedDate} - ${name} - ${price}`;
                    let option = new Option(optionText, price);
                    select.add(option);
                }
            });
        });

    document.getElementById("rdv-select").addEventListener("change", function() {
        document.getElementById("amount").value = this.value; // Met à jour l'input amount
    });
});
