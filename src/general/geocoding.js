const axios = require("axios");

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
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
  
      const response = await axios.get(url);
  
      if (!response.data.address) {
        return null;
      }
  
      const address = response.data.address;
      return {
        country: address.country || "",
        state: address.state || "",
        city: address.city || address.town || address.village || address.municipality || address.county || "",
        street: address.road || "",
        postalCode: address.postcode || "",
      };
    } catch (error) {
      console.error("Erro ao buscar endereço:", error.message);
      return null;
    }
}

module.exports = {
    getCoordinates,
    getAddressFromCoordinates,
};