document.addEventListener("DOMContentLoaded", async function () {
    const albumsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=93229033&single=true&output=csv";
    const photosUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=30306405&single=true&output=csv";

    const galleryContainer = document.getElementById("portfolio-gallery");
    const albumView = document.getElementById("album-view");
    const albumContent = document.getElementById("album-content");

    let albums = [];
    let photos = [];

    // 📌 Récupère et parse le fichier CSV en JSON
    async function fetchCSV(url) {
        const response = await fetch(url);
        const text = await response.text();
        return text.split("\n").slice(1).map(row => {
            const cols = row.split(",");
            return cols.map(col => col.replace(/"/g, "").trim());
        });
    }

    // 📌 Charge les albums
    async function loadAlbums() {
        albums = await fetchCSV(albumsUrl);
        galleryContainer.innerHTML = ""; // Vide la galerie avant ajout des albums

        albums.forEach(([albumId, albumName, miniatureUrl, description]) => {
            const article = document.createElement("article");
            article.innerHTML = `
                <header>
                    <h2>${albumName}</h2>
                </header>
                <a href="#" class="image fit"><img src="${miniatureUrl}" alt="${albumName}" class="album-thumbnail"/></a>
                <p class="description-text">${description}</p>
                <ul class="actions special">
                    <li><a href="#" class="button discover-btn" data-album-id="${albumId}">Découvrir</a></li>
                </ul>
            `;
            galleryContainer.appendChild(article);
        });

        attachDiscoverEvents();
    }

    // 📌 Charge les images d'un album
    async function fetchAlbumPhotos(albumId) {
        albumView.style.display = "block";
        galleryContainer.style.display = "none";
        albumContent.innerHTML = `<p>Chargement des images...</p>`;

        photos = await fetchCSV(photosUrl);
        const albumPhotos = photos.filter(photo => photo[0] === albumId);

        albumContent.innerHTML = ""; // Vide avant d'ajouter les images
        if (albumPhotos.length === 0) {
            albumContent.innerHTML = "<p>Aucune image trouvée pour cet album.</p>";
            return;
        }

        albumPhotos.forEach(([_, __, imageUrl]) => {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "Photo d'album";
            img.classList.add("thumbnail");
            img.addEventListener("click", function () {
                openFullscreen(this.src);
            });
            albumContent.appendChild(img);
        });
    }

    // 📌 Associe les événements aux boutons "Découvrir"
    function attachDiscoverEvents() {
        document.querySelectorAll(".discover-btn").forEach(button => {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                fetchAlbumPhotos(this.getAttribute("data-album-id"));
            });
        });

        document.getElementById("close-album").addEventListener("click", function () {
            albumView.style.display = "none";
            galleryContainer.style.display = "grid";
        });
    }

    // 📌 Ouvre une image en plein écran
    function openFullscreen(src) {
        const overlay = document.createElement("div");
        overlay.classList.add("fullscreen-overlay");

        const modal = document.createElement("div");
        modal.classList.add("fullscreen-modal");

        modal.innerHTML = `
            <img src="${src}" class="fullscreen-image" />
            <span class="close-modal">&times;</span>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        overlay.addEventListener("click", closeFullscreen);
        modal.querySelector(".close-modal").addEventListener("click", closeFullscreen);
    }

    function closeFullscreen() {
        document.querySelector(".fullscreen-overlay")?.remove();
        document.querySelector(".fullscreen-modal")?.remove();
    }

    // Démarre le chargement des albums
    loadAlbums();
});
