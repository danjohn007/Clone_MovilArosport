import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');  // Obtiene el ancho de la pantalla

const BotonesChicos = ({ title, type, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === 'cancel' ? styles.cancelButton : styles.changeButton,
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.buttonText,
        type === 'cancel' ? styles.cancelText : styles.changeText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: width * 0.80, // 10% del ancho de la pantalla
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderWidth: 2,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#00B2FF',
    borderColor: '#FFFFFF', // Borde blanco
  },
  changeButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00B2FF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
  },
  changeText: {
    color: '#000000',
  },
});

export default BotonesChicos;
