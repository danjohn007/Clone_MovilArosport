import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { TouchableOpacity } from 'react-native-gesture-handler';

const BASE_ICON = require('./default-avatar.png'); // Icono por defecto

export default function PantallaEquipos() {
  const [jugadoresParejas, setJugadoresParejas] = useState([]);
  const [jugadoresExtras, setJugadoresExtras] = useState([
    { id: '1', nombre: 'Carlos', us_foto: null },
    { id: '2', nombre: 'Ana', us_foto: null },
    { id: '3', nombre: 'Luis', us_foto: null },
    { id: '4', nombre: 'María', us_foto: null },
    { id: '5', nombre: 'Pedro', us_foto: null },
    { id: '6', nombre: 'Lucía', us_foto: null },
  ]);

  const moverJugador = (fromList, toList, setFrom, setTo, index) => {
    const jugador = fromList[index];
    const nuevaDesde = [...fromList];
    nuevaDesde.splice(index, 1);

    const nuevaHasta = [...toList, jugador];

    setFrom(nuevaDesde);
    setTo(nuevaHasta);
  };

  const renderJugador = ({ item, index, drag, isActive }, esPareja = false) => {
    const imageSource = item.us_foto ? { uri: item.us_foto } : BASE_ICON;
    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={false}
        style={[styles.jugador, isActive && styles.jugadorActivo]}
      >
        <Image source={imageSource} style={styles.avatar} />
        <Text style={styles.nombre}>{item.nombre}</Text>
        {esPareja && (
          <TouchableOpacity onPress={() => moverJugador(jugadoresParejas, jugadoresExtras, setJugadoresParejas, setJugadoresExtras, index)}>
            <Text style={styles.botonCambiar}>🡇</Text>
          </TouchableOpacity>
        )}
        {!esPareja && jugadoresParejas.length < 4 && (
          <TouchableOpacity onPress={() => moverJugador(jugadoresExtras, jugadoresParejas, setJugadoresExtras, setJugadoresParejas, index)}>
            <Text style={styles.botonCambiar}>🡅</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Parejas (2 parejas, 4 jugadores) */}
      <Text style={styles.titulo}>Parejas</Text>
      <DraggableFlatList
        data={jugadoresParejas}
        onDragEnd={({ data }) => setJugadoresParejas(data)}
        keyExtractor={(item) => item.id}
        renderItem={(props) => renderJugador(props, true)}
        contentContainerStyle={styles.lista}
        horizontal={false}
      />

      {/* Jugadores sobrantes */}
      <Text style={styles.titulo}>Jugadores disponibles</Text>
      <DraggableFlatList
        data={jugadoresExtras}
        onDragEnd={({ data }) => setJugadoresExtras(data)}
        keyExtractor={(item) => item.id}
        renderItem={(props) => renderJugador(props, false)}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  lista: {
    paddingBottom: 20,
  },
  jugador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
  },
  jugadorActivo: {
    backgroundColor: '#B2EBF2',
  },
  avatar: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  nombre: {
    flex: 1,
    fontSize: 16,
  },
  botonCambiar: {
    fontSize: 22,
    paddingHorizontal: 8,
    color: '#007AFF',
  },
});
