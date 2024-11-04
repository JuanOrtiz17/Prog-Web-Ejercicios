import { getBreeds } from './api.js';
import { showBreeds, updateButtons } from './ui.js';

let currentPage = 1;
const limit = 4;

async function loadBreeds(page) {
    const breeds = await getBreeds(page, limit);
    showBreeds(breeds);
    updateButtons(currentPage, breeds.length, limit);
    
}

document.getElementById('prevPage').addEventListener('click', () => {
    if(currentPage > 1){
        currentPage--;
        loadBreeds(currentPage);
    }
})

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadBreeds(currentPage);
})



window.addEventListener('DOMContentLoaded', () => loadBreeds(currentPage));