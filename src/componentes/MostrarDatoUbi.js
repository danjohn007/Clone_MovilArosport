import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Device from 'react-native-device-info';
import MostrarDatos from './MostrarDatos';  // Ensure the correct path to your MostrarDatos component
import Geolocalizacion from './Geolocalizacion'; // Adjust path
import GeolocalizacionHuawei from './GeolocalizacionHuawei'; // Adjust path

const MostrarDatoUbi = () => {
  const [ubicacion, setUbicacion] = useState('');

  const handleUbicacionObtenida = (locationData) => {
    // Assuming locationData is an object containing latitude and longitude
    setUbicacion(`${locationData.latitude}, ${locationData.longitude}`);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MostrarDatos
        iconName="location-outline"
        placeholder="Ubicación"
        value={ubicacion}
        onChangeText={(text) => setUbicacion(text)} // Updates the state when the input changes
      />

      <Text>Ubicación:</Text>
      {Device.manufacturer.toLocaleLowerCase() !== 'huawei' ? (
        <Geolocalizacion
          estilo={{ width: '100%', height: 200 }} // Update styles accordingly
          onUbicacionObtenida={handleUbicacionObtenida}
        />
      ) : (
        <GeolocalizacionHuawei estilo={{ width: '100%', height: 200 }} />
      )}
    </View>
  );
};

export default MostrarDatoUbi;
