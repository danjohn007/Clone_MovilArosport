// formulario.js
import React from 'react';
import { View, TextInput, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Formulario = ({ iconName, placeholder, value, onChangeText, secureTextEntry = false,   onPressIcon, keyboardType = "default",maxLength }) => {
    const isPasswordField = iconName.includes("lock");
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputBox}>
        <Ionicons name={iconName}  size={24} color={colors.primary} style={styles.icon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#838080"
          value={value} // Aquí usamos 'value' que viene de las props
          onChangeText={onChangeText} // Aquí usamos 'onChangeText' que viene de las props
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          keyboardType={keyboardType} // Aplica el tipo de teclado
          maxLength={maxLength} // Aplica el límite de caracteres
        />
                 {/* Solo se muestra el ícono para mostrar/ocultar la contraseña si es un campo de contraseña */}
                {isPasswordField && (
                  <TouchableOpacity onPress={onPressIcon}>
                    <Ionicons 
                     name={secureTextEntry ? "eye-off-outline" : "eye-outline"} // Cambié los íconos por los de ojo
                      size={20} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                )}
      </View>
    </View>
  );
};

// Estilos del InputField
const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',

  },
  inputBox: {
  flexDirection: 'row',
     backgroundColor: 'white',
     borderRadius: 16,
     borderWidth: 3,
     borderColor: colors.primary,
     paddingHorizontal: 10,
     paddingVertical: 5,
     marginBottom: 10,
     color: '#000',
     width: '100%',
     alignItems: "center",
     justifyContent:"center"
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
     flex: 1,
    color: '#838080',
    fontSize: 14,
    fontFamily: 'Poppins',
    textAlignVertical: 'center', // Ayuda a centrar verticalmente en Android
  },
});

export default Formulario;
