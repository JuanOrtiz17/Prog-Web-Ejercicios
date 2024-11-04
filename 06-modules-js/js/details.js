import { getBreedDetails } from "./api.js";

const catImage = document.getElementById('catImage');
const catName = document.getElementById('catName');
const catTemperament = document.getElementById('catTemperament');
const catLifeSpan = document.getElementById('catLifeSpan');
const catDescription = document.getElementById('catDescription');
const childFriendly = document.getElementById('childFriendly');
const catFriendly = document.getElementById('catFriendly');
const origin = document.getElementById('origin');
const wikiLink = document.getElementById('wikiLink');

const breedId = new URLSearchParams(window.location.search).get('id');


function displayBreedDetails(breed){
    catImage.src= breed.url || 'https://via.placeholder.com/200';
    catName.textContent = breed.breeds[0]?.name || 'No disponible';
    catTemperament.textContent = breed.breeds[0]?.temperament || 'No disponible';
    catTemperament.textContent = breed.breeds[0]?.temperament || 'No disponible';
    catLifeSpan.textContent = breed.breeds[0]?.life_span || 'No disponible';
    catDescription.textContent = breed.breeds[0]?.description || 'No disponible';
    childFriendly.textContent = breed.breeds[0]?.child_friendly || 'No disponible';
    catFriendly.textContent = breed.breeds[0]?.dog_friendly || 'No disponible';
    origin.textContent = breed.breeds[0]?.origin || 'No disponible';
    wikiLink.href = breed.breeds[0]?.wikipedia_url || '#';
}

async function loadBreedDetails() {
    const breed = await getBreedDetails(breedId);
    displayBreedDetails(breed);
}

window.addEventListener('DOMContentLoaded', loadBreedDetails);