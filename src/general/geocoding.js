const axios = require("axios");
const e = require("express");

async function getCoordinates(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;
    
    const response = await axios.get(url);
    
    if (response.data.length === 0) {
      return null;
    }

    const location = response.data[0];
    return {
      latitude: location.lat,
      longitude: location.lon,
      country: location.address.country || null,
      city: location.address.city || null,
      street: location.address.street || null,
    };
  } catch (error) {
    return null;
  }
}

async function getAddressFromCoordinates(latitude, longitude) {
    try {
      // const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
  
      // const response = await axios.get(url);

      // Usar Nominatim para obter o endereço
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'MapaZzz/1.0 (justinocsoares123@gmail.com)'
          }
        }
      )

      const data = await response.json()
      // console.log(data.address)
      console.log("Sair :: " + JSON.stringify(data));
      if (response.ok) {
        return {
          country: data.address.country,
          city: data.address.suburb || data.address.city || data.address.municipality || data.address.county || data.address.state || " ",
          town: data.address.town,
          village: data.address.village,
          // suburb: data.address.suburb,
          county: data.address.county,
          municipality: data.address.municipality
        };
      }
      else {
        console.error("Erro ao obter endereço:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error.message);
      return null;
    }
}

module.exports = {
    getCoordinates,
    getAddressFromCoordinates,
};