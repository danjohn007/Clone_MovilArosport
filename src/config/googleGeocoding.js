import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_MAPS_API_KEY } from './apiKeys';

// Función para generar las claves únicas, dependiendo si es usuario o club
const getCacheKey = (lat, lng, tipo = 'usuario', id = null) => {
  if (id) {
    return `coordenadas_${tipo}_${id}`;
  }
  return `coordenadas_${tipo}_${lat.toFixed(4)}_${lng.toFixed(4)}`;
};

export const obtenerEstadoYPaisDesdeCoordenadas = async (lat, lng, tipo = 'usuario', id = null) => {
  try {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (isNaN(latitude) || isNaN(longitude)) throw new Error("Coordenadas no válidas");

    const cacheKey = getCacheKey(latitude, longitude, tipo, id);
    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const components = data.results?.[0]?.address_components || [];

    const estado = components.find(c => c.types.includes("administrative_area_level_1"))?.long_name || null;
    const pais = components.find(c => c.types.includes("country"))?.long_name || null;

    const resultado = { estado, pais };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(resultado));

    return resultado;
  } catch (error) {
    console.log("Error al obtener estado y país:", error);
    return { estado: null, pais: null };
  }
};

 export const obtenerDireccionFormateadaPerfil = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=false&key=AIzaSyCI78o_JODtkwvB7ydLkvU-GCHwdOT8qv8`; // Reemplaza TU_API_KEY con tu clave de API de Google Maps
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const location = data;
      console.log("UBICACION ACTUAL", location.results[0].formatted_address);
  
      let estado = '';
      let municipio = '';
      let calle = '';
      let numero = '';
      let colonia = '';
      let codigoPostal = '';
  
      location.results[0].address_components.forEach(component => {
        if (component.types.includes('administrative_area_level_1')) {
          estado = component.long_name; // Obtener el nombre completo del estado
        }
  
        if (component.types.includes('locality')) {
          municipio = component.long_name; // Obtener el municipio
        }
  
        if (component.types.includes('route')) {
          calle = component.long_name; // Obtener la calle
        }
  
        if (component.types.includes('street_number')) {
          numero = component.long_name; // Obtener el número de la calle
        }
  
        if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
          colonia = component.long_name; // Obtener la colonia
        }
  
        if (component.types.includes('postal_code')) {
          codigoPostal = component.long_name; // Obtener el código postal
        }
      });
  
      // Formatear la dirección en el formato adecuado
      const formattedAddress = `${calle || "Calle desconocida"}, ${numero || "S/N"}, ${colonia || "Colonia desconocida"}, ${codigoPostal || "C.P. No disponible"}`;
  
      return formattedAddress;
  
    } catch (error) {
      console.log("Alerta al obtener la dirección:", error);
      return "Dirección no disponible";
    }
  };

export  const obtenerDireccionFormateada = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=false&key=AIzaSyCI78o_JODtkwvB7ydLkvU-GCHwdOT8qv8`; // Reemplaza TU_API_KEY con tu clave de API de Google Maps

    try {
      const response = await fetch(url);
      const data = await response.json();

      const location = data;
      console.log("UBICACION ACTUAL", location.results[0].formatted_address);

      let estado = '';
      let municipio = '';
      let calle = '';
      let numero = '';
      let colonia = '';
      let codigoPostal = '';

      location.results[0].address_components.forEach(component => {
        if (component.types.includes('administrative_area_level_1')) {
          estado = component.long_name; // Obtener el nombre completo del estado
        }

        if (component.types.includes('locality')) {
          municipio = component.long_name; // Obtener el municipio
        }

        if (component.types.includes('route')) {
          calle = component.long_name; // Obtener la calle
        }

        if (component.types.includes('street_number')) {
          numero = component.long_name; // Obtener el número de la calle
        }

        if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
          colonia = component.long_name; // Obtener la colonia
        }

        if (component.types.includes('postal_code')) {
          codigoPostal = component.long_name; // Obtener el código postal
        }
      });

      // Formatear la dirección en el formato adecuado
      const direccionBD = `${calle}, ${numero}, ${colonia}, ${codigoPostal}`;
      // Crear el objeto de ubicación con latitud, longitud y la dirección formateada
      const ubicacion = {
        latitude: latitude,
        longitude: longitude,
        direccion_completa: direccionBD,
      };

      // Actualizar el estado con la ubicación
      //setUbicacionUsuario(ubicacion);

      return direccionBD;

    } catch (error) {
      console.log("Alerta al obtener la dirección:", error);
      return "Dirección no disponible";
    }
  };  