document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Empêche le rechargement de la page

            // Désactive le bouton pour éviter les envois multiples
            submitBtn.disabled = true;
            submitBtn.textContent = "Envoi en cours...";

            // Envoi du formulaire
            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
            })
                .then(response => {
                    if (response.ok) {
                        // Si l'envoi réussit, on vide le formulaire et change le bouton
                        form.reset();
                        submitBtn.textContent = "Message envoyé ✅";
                    } else {
                        submitBtn.textContent = "Erreur ❌";
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error("Erreur:", error);
                    submitBtn.textContent = "Erreur ❌";
                    submitBtn.disabled = false;
                });
        });
    }
});
