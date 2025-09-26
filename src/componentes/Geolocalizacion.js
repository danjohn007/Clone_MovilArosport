import React, { useState, useEffect } from "react";
import { TextInput, StyleSheet } from "react-native";

import * as Location from "expo-location";

export default function Geolocalizacion(props) {
  const { estilo, accion, onUbicacionObtenida } = props;
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("Cargando ubicación...");


  
  const [ubicacion, setUbicacion] = useState({
    latitude: 0,
    longitud: 0,
    dir: "",
  });




  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permiso para acceder a la localización denegado");
        return;
      }
      try {
        const location = await Location.getCurrentPositionAsync({});
        await CoordToDireccion(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg("No se obtuvó la ubicación");
      }
    })();
  }, []);

  const CoordToDireccion = async (latitud, longitud) => {
    const url =
      "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
      latitud +
      "," +
      longitud +
      "&sensor=false&key=AIzaSyCI78o_JODtkwvB7ydLkvU-GCHwdOT8qv8"; // Reemplaza TU_API_KEY con tu clave de API de Google Maps
  
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
          calle = component.long_name;
        }
  
        if (component.types.includes('street_number')) {
          numero = component.long_name;
        }
  
        if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
          colonia = component.long_name;
        }
  
        if (component.types.includes('postal_code')) {
          codigoPostal = component.long_name;
        }
      });
  
      const formattedAddress = `${calle}, ${numero}, ${colonia}, ${codigoPostal} ${municipio}, ${estado}`;
  
      setUbicacion({
        latitude: latitud,
        longitud: longitud,
        dir: formattedAddress, // Utiliza la dirección formateada
        estado: estado, // Incluir el estado obtenido
        municipio: municipio // Incluir el municipio obtenido
      });
  
      setErrorMsg(true); // Indicar que no hay error
      onUbicacionObtenida({
      latitude: latitud,
      longitud: longitud,
      estado: estado,
      municipio: municipio,
      calle: calle,
      num_ext: numero,
      colonia: colonia,
      cp: codigoPostal,
      });
  
    } catch (error) {
      console.log("Alerta al obtener la dirección:", error);
      setErrorMsg("No se obtuvó la dirección");
    }
  };

   // Manejar el cambio de ubicación cuando el marcador se mueve
   const handleMarkerDragEnd = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    await CoordToDireccion(latitude, longitude); // Recalcular la dirección con las nuevas coordenadas
  };

  


  // Guardar direccion actual      PENDIENTE
  const agregaDireccion = async () => {
    let dataA = new FormData();
    dataA.append("idU", idU);
    dataA.append("calle", calle);
    dataA.append("colonia", colonia);
    dataA.append("numeroExterior", exterior);
    dataA.append("numeroInterior", interior);
    dataA.append("codigoPostal", cp);
    dataA.append("municipio", municipio);
    dataA.append("estado", estado);
    dataA.append("descripcion", referencia);

    const response = await APIManager({
      url: `cliente/Direcciones/insertar_direccion`,
      method: "POST",
      data: dataA,
    });
    accion(response); // Sirve para guardar el id de la direccion
    alert("Se guardó tu direccion");
  }; 
  // Validar que no se vayan a crear varias direcciones

  return (
    <>
      {errorMsg === true ? (
        <>
            <TextInput
        style={styles.textInput}
        multiline={true}  // Permitir varias líneas
        numberOfLines={4} // Número de líneas visibles por defecto
        value={ubicacion.dir} // Mostrar la ubicación
        editable={false} // Hacer el campo solo de lectura
      />
        </>
      ) : (
        <TextInput
        style={styles.textInput}
        multiline={true}  // Permitir varias líneas
        numberOfLines={4} // Número de líneas visibles por defecto
        value={errorMsg} // Mostrar el error si no se puede obtener la ubicación
        editable={false}
      />
      )}
    </>
  );
}
const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    color: '#838080',
    fontSize: 14,
    fontFamily: 'Poppins',
    textAlignVertical: 'top', // Alinea el texto verticalmente al inicio
    maxHeight: 60, // Limita la altura máxima del input
    overflow: 'hidden', // Evita que el texto se salga del cuadro
    multiline: true, // Permitir múltiples líneas
    alignItems: "center",
    justifyContent:"center",
    padding: -10,
  },
});