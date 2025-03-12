document.addEventListener("DOMContentLoaded", function() {
    const nouveauClientCheckbox = document.getElementById("nouveau-client");
    const newsletterCheckbox = document.getElementById("newsletter");

    if (nouveauClientCheckbox && newsletterCheckbox) {
        nouveauClientCheckbox.addEventListener("change", function() {
            if (this.checked) {
                newsletterCheckbox.checked = true;
            }
        });
    }
});
