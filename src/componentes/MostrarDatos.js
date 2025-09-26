import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";

const MostrarDatos = ({
  errorStyles = false,
  borderWidth = 3,
  RFValue2 = 12,
  iconName,
  placeholder,
  value,
  secureTextEntry = false,
  onChangeText,
  editable = true,
  onPressIcon,
  label,
  error,
  keyboardType = "default",
  maxLength,
}) => {
  const isPasswordField = iconName.includes("lock");

  return (
    <View style={styles.inputContainer}>
      <View style={[styles.inputBox, { borderWidth }]}>
        <Ionicons
          name={iconName}
          size={24}
          color="#02B9FA"
          style={styles.icon}
        />
        <TextInput
          style={[styles.textInput, { fontSize: RFValue(RFValue2, 667) }]}
          placeholder={placeholder}
          placeholderTextColor="#838080"
          value={value} // El valor controlado
          onChangeText={onChangeText} // Maneja el cambio de texto
          secureTextEntry={secureTextEntry} // Si es necesario para contraseñas
          autoCapitalize="none"
          editable={editable}
          keyboardType={keyboardType} // Aplica el tipo de teclado
          maxLength={maxLength} // Aplica el límite de caracteres
        />
        {/* Solo se muestra el ícono para mostrar/ocultar la contraseña si es un campo de contraseña */}
        {isPasswordField && (
          <TouchableOpacity onPress={onPressIcon}>
            <Ionicons
              name={secureTextEntry ? "eye-off-outline" : "eye-outline"} // Cambié los íconos por los de ojo
              size={20}
              color="#00BAFF"
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.labelContainer}>
        {error ? (
          <Text style={errorStyles ? styles.errorTextP : styles.errorText}>
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
  },
  inputBox: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    borderColor: "#02B9FA",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "100%",
    alignItems: "center",
    padding: 10, // ⬅ Ambos elementos tendrán el mismo padding
    height: 55, // ⬅ Tamaño fijo para uniformidad visual
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: "#838080",
    fontSize: 14,
    fontFamily: "Poppins",
    textAlignVertical: "center", // Ayuda a centrar verticalmente en Android
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
    color: "red",
    fontSize: 12,
    marginTop: -10,
  },
  errorTextP: {
    fontSize: 12,
   color: "red",
    marginBottom: 4,
    marginLeft: 2,
    marginTop: -4,
  },
});

export default MostrarDatos;