const apiUrl = "https://api.thecatapi.com/v1";
const options = {
    headers: {
        'x-api-key': 'live_9xAXeOySuZF12pqsDZzqNZy3lMzRgjHdcdFDViMWLt5kIahrWeNrkjQZ5QwzVkWA'
    }
}

export async function getBreeds(page, limit){
    try {
        const response = await fetch(`${apiUrl}/breeds?limit=${limit}&page=${page - 1}`, options); 
        if(!response.ok){
            throw new Error("Error " + response.status)
        }
        
        return await response.json();
    }catch (error) {
        console.error(error);
    }
}

export async function getBreedDetails(id) {
    try{
        const response = await fetch(`${apiUrl}/images/${id}`, options);

        if(!response.ok){
            const errorMessage = await response.text();
            throw new Error('Error: ' + errorMessage)
        }

        return await response.json();
    } catch(error){
        console.log(error);
    }
}