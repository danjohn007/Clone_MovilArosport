import { View, Text, StyleSheet, Dimensions } from 'react-native';
import React from 'react';

// Obtener el ancho de la pantalla
const { width } = Dimensions.get('window');

const Titulo = ({ titulo }) => {
  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerText}>{titulo}</Text>
    </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  header: {
    backgroundColor: "#00bfff",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#fff",
    width: '95%', // Ocupa el 90% del ancho de la pantalla, adaptándose dinámicamente
    maxWidth: 500, // Limitar el ancho máximo en pantallas grandes
    height:'50px',
  },
  headerText: {
    color: "#fff",
    fontSize: 15, // El tamaño del texto será el 5% del ancho de la pantalla
    fontWeight: "bold",
    textAlign: "center", // Centrar el texto
  },
});

export default Titulo;
