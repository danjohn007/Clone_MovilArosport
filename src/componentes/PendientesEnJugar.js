import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PendientesEnJugar = ({ jugadoresPendientes, siguienteRonda }) => {
  return (
    <View style={[styles.container, styles.rectangleLayout]}>
      <Text style={styles.title}>Parejas Pendientes:</Text>
      <Text style={styles.subTitle}>Estas parejas entraran en la próxima ronda:</Text>
      {jugadoresPendientes.length > 0 ? (
        jugadoresPendientes.map((jugador, index) => (
          <View key={index} style={styles.jugadorContainer}>
            <Text style={styles.jugadorNombre}>{jugador}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noPendientes}>No hay jugadores pendientes</Text>
      )}

      {/*siguienteRonda && (
        <View style={styles.siguienteRondaContainer}>
          <Text style={styles.siguienteRondaTitle}>Próxima Ronda</Text>
          {siguienteRonda.map((jugador, index) => (
            <View key={index} style={styles.jugadorContainer}>
              <Text style={styles.jugadorNombre}>{jugador}</Text>
            </View>
          ))}
        </View>
      )*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: 15,
    paddingVertical: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    //fontFamily: 'Poppins-Bold',
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  jugadorContainer: {
    padding: 6,
    backgroundColor: "colors.primary",
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  jugadorNombre: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  noPendientes: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  siguienteRondaContainer: {
    marginTop: 15,
    width: '100%',
  },
  siguienteRondaTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  rectangleLayout: {
    height: 'auto',
    width: '90%',
    marginTop: 18,
  },
});

export default PendientesEnJugar;
