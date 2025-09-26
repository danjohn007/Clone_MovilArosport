import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const ListaJugadores = ({ jugadores }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jugadores Agregados</Text>
      <FlatList
        data={jugadores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.jugador}>
            <Text style={styles.jugadorTexto}>{item.nombre}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jugador: {
    padding: 10,
    backgroundColor: '#F9F9F9',
    marginVertical: 5,
    borderRadius: 5,
  },
  jugadorTexto: {
    fontSize: 16,
  },
});

export default ListaJugadores;
