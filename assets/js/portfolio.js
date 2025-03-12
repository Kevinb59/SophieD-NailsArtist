document.addEventListener("DOMContentLoaded", function () {
    const albumsCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=93229033&single=true&output=csv";
    const photosCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRglKoc6L2ExSYRDD9H0exyRChQeDsGi-VXPY9s5_Pel-4HrzWFOA9SXyX4VQKFnNUlOIxRF8EBkW_j/pub?gid=30306405&single=true&output=csv";
    const galleryContainer = document.getElementById("portfolio-gallery");
    const albumContainer = document.getElementById("album-view");
    let albumsData = [];
    let photosData = [];

    // Fonction pour charger et parser un fichier CSV
    async function loadCSV(url) {
        const response = await fetch(url);
        const text = await response.text();
        return text.split("\n").slice(1).map(row => row.split(","));
    }

    // Charger et afficher les albums
    async function loadAlbums() {
        albumsData = await loadCSV(albumsCSV);
        galleryContainer.innerHTML = "";

        albumsData.forEach(album => {
            const [albumId, albumName, miniatureUrl, description] = album;
            const article = document.createElement("article");
            article.innerHTML = `
                <header>
                    <h2>${albumName}</h2>
                </header>
                <a href="#" class="image fit"><img src="${miniatureUrl}" alt="${albumName}" /></a>
                <p class="description-text">${description}</p>
                <ul class="actions special">
                    <li><a href="#" class="button discover-btn" data-album-id="${albumId}">Découvrir</a></li>
                </ul>
            `;
            galleryContainer.appendChild(article);
        });

        attachDiscoverEvents();
    }

    // Charger et afficher les photos d'un album
    async function loadAlbumPhotos(albumId) {
        photosData = await loadCSV(photosCSV);
        const albumPhotos = photosData.filter(photo => photo[0] === albumId);
        albumContainer.innerHTML = `
            <ul class="actions special">
                <li><a href="#" id="close-album" class="button primary icon solid fa-arrow-left">Retour aux albums</a></li>
            </ul>
            <div id="album-content" class="gallery"></div>
        `;

        const albumContent = document.getElementById("album-content");
        albumPhotos.forEach(photo => {
            const imageUrl = photo[2];
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "Photo d'album";
            img.classList.add("thumbnail");
            img.addEventListener("click", function () {
                openFullscreen(this.src);
            });
            albumContent.appendChild(img);
        });

        document.getElementById("close-album").addEventListener("click", function () {
            albumContainer.style.display = "none";
            galleryContainer.style.display = "grid";
        });
    }

    // Gérer les événements pour découvrir un album
    function attachDiscoverEvents() {
        document.querySelectorAll(".discover-btn").forEach(button => {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                const albumId = this.getAttribute("data-album-id");
                galleryContainer.style.display = "none";
                albumContainer.style.display = "grid";
                loadAlbumPhotos(albumId);
            });
        });
    }

    // Affichage plein écran des images
    function openFullscreen(src) {
        const overlay = document.createElement("div");
        overlay.classList.add("fullscreen-overlay");
        const modal = document.createElement("div");
        modal.classList.add("fullscreen-modal");
        modal.innerHTML = `<img src="${src}" class="fullscreen-image" /><span class="close-modal">&times;</span>`;
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        overlay.addEventListener("click", closeFullscreen);
        modal.querySelector(".close-modal").addEventListener("click", closeFullscreen);
    }

    function closeFullscreen() {
        document.querySelector(".fullscreen-overlay")?.remove();
        document.querySelector(".fullscreen-modal")?.remove();
    }

    loadAlbums();
});
