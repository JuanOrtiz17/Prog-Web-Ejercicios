const catGrid = document.getElementById('catGrid');

export function showBreeds(breeds){
    catGrid.innerHTML = ''; // Limpiar cuadrícula
    breeds.forEach(breed => {
        const catCard = document.createElement('div');
        catCard.classList.add('cat-card');
        catCard.innerHTML = `
            <img src="${breed.image?.url || 'https://via.placeholder.com/150'}" alt="${breed.name}">
            <h3>${breed.name}</h3>
            <p>${breed.temperament || 'Temperamento no disponible'}</p>
            <a class="see-details-button" href="details.html?id=${breed.reference_image_id}" target="_blank">Ver detalles 
        `;
        catGrid.appendChild(catCard);
    });
}


export function updateButtons(currentPage, breedCount, limit){
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = breedCount < limit;
}
