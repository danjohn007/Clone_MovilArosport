import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SeleccionarMostrarDato = ({ iconName, placeholder, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name={iconName} size={24}  color={colors.primary}  style={styles.icon} />
      <Text style={styles.text}>{placeholder}</Text>
    </TouchableOpacity>
  );
};

//HSHHS
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 3,
        borderColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: Platform.OS === 'ios' ? 15 : 15, // Ajuste uniforme para todos los dispositivos
        marginBottom: 10,
        color: '#000',
        width: '100%',
        alignItems: 'center',  // Asegura que los elementos se alineen en el centro verticalmente
        justifyContent: 'space-between', // Coloca el ícono, texto y botón de forma que no se muevan
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#838080',
  },
});

export default SeleccionarMostrarDato;