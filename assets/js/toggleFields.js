document.addEventListener("DOMContentLoaded", function() {
    function toggleFields() {
        var prestation = document.getElementById("prestation");
        var supplements = document.getElementById("supplements");
        var longueurOngles = document.getElementById("longueur-ongles");

        if (prestation && supplements && longueurOngles) {
            if (prestation.value === "Nail Art Libre") {
                supplements.style.display = "none";  // Masque les suppléments
                longueurOngles.style.display = "block"; // Affiche Court / Long
            } else {
                supplements.style.display = "block";  // Affiche les suppléments
                longueurOngles.style.display = "none"; // Masque Court / Long
            }
        }
    }

    // Rendre la fonction accessible globalement
    window.toggleFields = toggleFields;

    // Exécute la fonction au chargement de la page
    toggleFields();

    // Ajoute un écouteur d'événement sur la liste déroulante des prestations
    var prestationDropdown = document.getElementById("prestation");
    if (prestationDropdown) {
        prestationDropdown.addEventListener("change", toggleFields);
    }
});
