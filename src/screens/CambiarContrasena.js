import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Logo from "../componentes/Logo";
import CustomButton from "../componentes/Buttons";
import Titulo from "../componentes/Titulo";
import Formulario from "../componentes/Formulario";
import Icon from "react-native-vector-icons/Ionicons";
import APIManager from "../componentes/API/APIManager.jsx";

const CambiarContrasena = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { correo, token } = route.params;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntryNew, setSecureTextEntryNew] = useState(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNewPassword, setErrorNewPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

  const handleIconPressNew = () => setSecureTextEntryNew((prev) => !prev);
  const handleIconPressConfirm = () =>
    setSecureTextEntryConfirm((prev) => !prev);

  // Validar formato de la contraseña
  const validarContrasena = (password) => {
    if (!password.trim()) {
      return "La contraseña es obligatoria";
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (password.length > 20) {
      return "La contraseña no puede tener más de 20 caracteres";
    }
    if (!/\d/.test(password)) {
      return "La contraseña debe contener al menos un número";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "La contraseña debe contener al menos un carácter especial (!@#$%^&*)";
    }
    return "";
  };

  // Validar nueva contraseña en tiempo real
  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    const error = validarContrasena(text);
    setErrorNewPassword(error);
    // Revalidar confirmación si ya hay texto
    if (confirmPassword) {
      setErrorConfirmPassword(
        text === confirmPassword ? "" : "Las contraseñas no coinciden"
      );
    }
  };

  // Validar confirmación de contraseña en tiempo real
  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (!text.trim()) {
      setErrorConfirmPassword("Debes confirmar tu contraseña");
    } else if (newPassword !== text) {
      setErrorConfirmPassword("Las contraseñas no coinciden");
    } else {
      setErrorConfirmPassword("");
    }
  };

  // Enviar solicitud al backend
  const handleUpdatePassword = async () => {
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("correo", correo.trim());
      data.append("contrasena", newPassword);
      data.append("token", token.trim());

      console.log("Enviando datos:", {
        correo: correo.trim(),
        token: token.trim(),
      }); // Depuración

      const response = await APIManager({
        url: "ActualizacionPassMovil/actualizarContrasena",
        method: "POST",
        data: data,
      });

      console.log("Respuesta del backend:", response); // Depuración

      if (response.resultado) {
        Alert.alert("Éxito", response.mensaje, [
          {
            text: "OK",
            onPress: () => navigation.navigate("InicioSesion"),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.mensaje || "Error al actualizar la contraseña"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Error de conexión. Intenta de nuevo");
    } finally {
      setIsLoading(false);
    }
  };

  // Validar antes de enviar
  const onPressButton = () => {
    const errorNew = validarContrasena(newPassword);
    const errorConfirm = !confirmPassword.trim()
      ? "Debes repetir la contraseña"
      : newPassword !== confirmPassword
      ? "Las contraseñas no coinciden"
      : "";

    setErrorNewPassword(errorNew);
    setErrorConfirmPassword(errorConfirm);

    if (errorNew || errorConfirm) return;

    handleUpdatePassword();
  };

  return (
    <View style={styles.container}>
      <Logo />

      <Titulo titulo="CAMBIAR CONTRASEÑA" />

      <KeyboardAwareScrollView
        style={styles.centeredContainer}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={70}
      >
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Requisitos:</Text>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>Al menos 8 caracteres</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>Al menos un número</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>
              Al menos un carácter especial (!@#$%^&*)
            </Text>
          </View>
        </View>

        {/* Formulario: Nueva contraseña */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Nueva Contraseña</Text>
          <Formulario
            iconName="lock-closed-outline"
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChangeText={handleNewPasswordChange}
            secureTextEntry={secureTextEntryNew}
            onPressIcon={handleIconPressNew}
            maxLength={20}
          />
          {errorNewPassword && (
            <Text style={styles.errorText}>{errorNewPassword}</Text>
          )}
        </View>

        {/* Formulario: Confirmar contraseña */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
          <Formulario
            iconName="lock-closed-outline"
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry={secureTextEntryConfirm}
            onPressIcon={handleIconPressConfirm}
            maxLength={20}
          />
          {errorConfirmPassword && (
            <Text style={styles.errorText}>{errorConfirmPassword}</Text>
          )}
        </View>

        <CustomButton
          onPress={onPressButton}
          buttonText={isLoading ? "Cambiando..." : "Cambiar Contraseña"}
          disabled={isLoading}
          style={styles.submitButton}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  centeredContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  instructionsContainer: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#E0E0E0",
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: "colors.error",
    marginTop: 2,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default CambiarContrasena;
