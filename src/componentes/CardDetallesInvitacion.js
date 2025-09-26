import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CardDetallesInvitacion = ({ fechaHora, ubicacion, categoria, modalidad, onAceptar, onRechazar }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        <Text style={styles.title}>Fecha y hora: </Text>{fechaHora}
      </Text>
      <Text style={styles.label}>
        <Text style={styles.title}>Ubicación: </Text>{ubicacion}
      </Text>
      <Text style={styles.label}>
        <Text style={styles.title}>Categoría: </Text>{categoria}
      </Text>
      <Text style={styles.label}>
        <Text style={styles.title}>Modalidad: </Text>{modalidad}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.rejectButton} onPress={onRechazar}>
          <Text style={styles.buttonText}>RECHAZAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={onAceptar}>
          <Text style={styles.buttonText}>ACEPTAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#00BFFF',
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    margin: 10,
    width: 300,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  title: {
    color: '#00BFFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  rejectButton: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CardDetallesInvitacion;
