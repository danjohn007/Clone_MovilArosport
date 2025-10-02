// En MostrarDatos.js
import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text , Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MostrarDatosPerfil = forwardRef(
  (
    {
      iconName,
      placeholder,
      value,
      secureTextEntry = false,
      onChangeText,
      editable = true,
      isButton,
      onPress,
      textStyle,
      tittle,
      keyboardType = "default",maxLength
    },
    ref
  ) => {
    const handlePress = () => {
      if (onPress) onPress();
    };

    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={handlePress}
        style={styles.inputContainer}
        disabled={!onPress}
      >

        <View style={[styles.inputBox]}>
          <Ionicons name={iconName} size={24} color={colors.primary} style={styles.icon} />

          {isButton ? (
            <Text
              style={[
                styles.textInput,
                textStyle,
                { color: value ? '#838080' : '#838080' }, // gris si no hay valor
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tittle || placeholder}
            </Text>
          ) : (
            <TextInput
              ref={ref}
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor="#838080"
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              editable={editable && !onPress}
              multiline={false}
                  keyboardType={keyboardType} // Aplica el tipo de teclado
          maxLength={maxLength} // Aplica el límite de caracteres
            />
          )}
        </View>
       
      </TouchableOpacity>
    );
  }
);

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
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical:5,
    width: '100%',
    alignItems: 'center',
    padding: 10, // ⬅ Ambos elementos tendrán el mismo padding
    height: 55,  // ⬅ Tamaño fijo para uniformidad visual
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#838080',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
    labelContainer: {
    flexDirection: "column", 
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: -7, // Espaciado entre label y error
    marginBottom: 7
  },
});


export default MostrarDatosPerfil;
