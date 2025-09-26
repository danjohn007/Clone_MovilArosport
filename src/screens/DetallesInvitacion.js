import { View, StyleSheet } from 'react-native';
import React from 'react';
import Titulo from '../componentes/Titulo'; // Asegúrate de que la ruta sea correcta
import Logo from '../componentes/Logo';  // Importa el componente Logo
import CardDetallesInvitacion from '../componentes/CardDetallesInvitacion';
import colors from '../styles/colors';
import commonStyles from '../styles/styles';

const DetallesInvitacion = () => {
  const handleAceptar = () => {
    console.log('Invitación aceptada');
  };

  const handleRechazar = () => {
    console.log('Invitación rechazada');
  };

  return (
    <View style={styles.container}>
      <Logo /> 
        <Titulo titulo="Detalles" />
        <View style={styles.center}>
            <CardDetallesInvitacion 
                fechaHora="12/12/2024 7:00 am"
                ubicacion="Av. Palma Canaria 6400, Col. Valle Comercial Juriquilla"
                categoria="Tercera"
                modalidad="Juego Americano"
                onAceptar={handleAceptar}
                onRechazar={handleRechazar}
            />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 16,
    backgroundColor: colors.backgroundDark,
  },
  center: {
    alignItems: 'center', 
  },
});

export default DetallesInvitacion;
