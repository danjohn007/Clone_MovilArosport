// CustomButton.js

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ onPress, buttonText }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.loginButton}  onPress={onPress}>
        <Text style={styles.loginButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center', // Centra el botón horizontalmente
    marginTop: 30,
  },
  loginButton: {
    backgroundColor: '#02B9FA',
    width: 205, // Establece el ancho a 205 píxeles
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomButton;
