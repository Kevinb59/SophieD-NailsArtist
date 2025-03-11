document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formulaire");
    const submitBtn = document.querySelector("input[type='submit']");
    const imageInput = document.getElementById("image");
    const fileNameDisplay = document.getElementById("file-name");

    let imageUrl = ""; // Stocke l'URL Cloudinary après l'upload

    // ▶ Gestion de l'upload sur Cloudinary
    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];
        if (!file) return;

        fileNameDisplay.textContent = "Envoi de l’image...";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "sophiednailarstist"); // Ton preset Cloudinary

        fetch("https://api.cloudinary.com/v1_1/dkp7f3q6o/image/upload", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                imageUrl = data.secure_url; // URL de l’image
                fileNameDisplay.textContent = "Image envoyée avec succès !";
            })
            .catch(() => {
                fileNameDisplay.textContent = "Erreur lors de l’envoi de l’image.";
            });
    });

    // ▶ Gestion de l'envoi du formulaire
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitBtn.value = "Envoi en cours...";
        submitBtn.disabled = true;

        const formData = {
            nom: document.getElementById("nom").value,
            email: document.getElementById("email").value,
            telephone: "'" + document.getElementById("telephone").value, // Préserve le 0
            date: document.getElementById("date").value,
            heure: document.getElementById("horaire").value.split(" - ")[0], // Garde l'heure de début
            prestation: document.getElementById("prestation").value,
            message: document.getElementById("message").value,
            newsletter: document.getElementById("newsletter").checked ? "TRUE" : "",
            supp_ep: document.getElementById("effet-poudre").checked ? "TRUE" : "",
            supp_p: document.getElementById("paillettes").checked ? "TRUE" : "",
            supp_s10: document.getElementById("strass-10").checked ? "TRUE" : "",
            supp_s20: document.getElementById("strass-20").checked ? "TRUE" : "",
            supp_t: document.getElementById("nail-art-travaille").value || "0",
            supp_s: document.getElementById("nail-art-simple").value || "0",
            supp_3d: document.getElementById("chrome-3d").value || "0",
            nailart_libre: document.querySelector('input[name="nailart_libre"]:checked') ? 
                document.querySelector('input[name="nailart_libre"]:checked').value : "",
            image: imageUrl // Lien Cloudinary
        };

        fetch("https://script.google.com/macros/s/AKfycbyWAtq8cWDRaMdlYes3ZRdujqJYHsadSOpb0tt4CNZI9jHH2UMLSoxxLfJWjKvC8KuJ/exec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Réservation envoyée avec succès !");
                    submitBtn.value = "Réservation envoyée";
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                alert("Erreur lors de l’envoi, veuillez réessayer.");
                submitBtn.value = "Réserver";
                submitBtn.disabled = false;
            });
    });
});
