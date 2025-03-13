document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formulaire");
    const submitBtn = document.querySelector("input[type='submit']");
    const imageInput = document.getElementById("image");
    const uploadBtn = document.querySelector(".actions .button"); // Bouton d'upload

    let imageUrl = ""; // Stocke l'URL de l'image après upload sur Cloudinary

    // ▶ Gestion de l'upload sur Cloudinary
    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];
        if (!file) return;

        uploadBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Envoi de l’image...'; // Animation d'upload

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "sophiednailartist"); // Ton preset Cloudinary

        fetch("https://api.cloudinary.com/v1_1/dkp7f3q6o/image/upload", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                imageUrl = data.secure_url; // Stocke le lien de l'image
                uploadBtn.innerHTML = "Image ajoutée ✅"; // Message de succès
            })
            .catch(() => {
                uploadBtn.innerHTML = "Échec de l’upload ❌"; // Message d'erreur
            });
    });

    // ▶ Gestion de l'envoi du formulaire via GET (comme dans ton test)
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitBtn.value = "Envoi en cours...";
        submitBtn.disabled = true;

        const formData = {
            nom: encodeURIComponent(document.getElementById("nom").value),
            email: encodeURIComponent(document.getElementById("email").value),
            telephone: encodeURIComponent("'" + document.getElementById("telephone").value), // Préserve le 0
            date: encodeURIComponent(document.getElementById("date").value),
            heure: encodeURIComponent(document.getElementById("horaire").value.split(" - ")[0]), // Garde l'heure de début
            prestation: encodeURIComponent(document.getElementById("prestation").value),
            message: encodeURIComponent(document.getElementById("message").value),
            newsletter: document.getElementById("newsletter").checked ? "TRUE" : "",
            supp_ep: document.getElementById("effet-poudre").checked ? "TRUE" : "",
            supp_p: document.getElementById("paillettes").checked ? "TRUE" : "",
            supp_s10: document.getElementById("strass-10").checked ? "TRUE" : "",
            supp_s20: document.getElementById("strass-20").checked ? "TRUE" : "",
            supp_t: encodeURIComponent(document.getElementById("nail-art-travaille").value || "0"),
            supp_s: encodeURIComponent(document.getElementById("nail-art-simple").value || "0"),
            supp_3d: encodeURIComponent(document.getElementById("chrome-3d").value || "0"),
            nailart_libre: encodeURIComponent(document.querySelector('input[name="longueur"]:checked') ? 
                document.querySelector('input[name="longueur"]:checked').value : ""),
            image: encodeURIComponent(imageUrl) // Lien de l’image Cloudinary
        };

        // Construction de l'URL GET avec les paramètres
        const scriptURL = "https://script.google.com/macros/s/AKfycbyyEeoAMU-Z4Iz2QUm_-AiC0dCNBZbZyIPVHwpfWkxZFXWx0aQeaFXcEbh5L3G03AZu/exec";
        const queryParams = Object.keys(formData).map(key => `${key}=${formData[key]}`).join("&");
        const fullUrl = scriptURL + "?" + queryParams;

        // Envoi des données via Fetch (GET)
        fetch(fullUrl, { method: "GET" })
            .then(response => response.text()) // Récupère la réponse en texte
            .then(data => {
                console.log("Réponse brute du serveur:", data);
                try {
                    const jsonData = JSON.parse(data); // Essaie de le parser en JSON
                    if (jsonData.status === "success") {
                        alert("Réservation envoyée avec succès !");
                        submitBtn.value = "Réservation envoyée";
                    } else {
                        throw new Error(jsonData.message);
                    }
                } catch (e) {
                    console.error("Erreur de parsing JSON:", e);
                    alert("Erreur inattendue. Vérifie la console.");
                }
            })
            .catch(error => {
                console.error("Erreur :", error);
                alert("Une erreur est survenue, veuillez réessayer.");
                submitBtn.value = "Réserver";
                submitBtn.disabled = false;
            });
    });
});
