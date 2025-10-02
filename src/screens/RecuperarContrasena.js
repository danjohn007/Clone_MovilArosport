import { View, StyleSheet, Text, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Titulo from "../componentes/Titulo";
import Logo from "../componentes/Logo";
import CustomButton from "../componentes/Buttons";
import Formulario from "../componentes/Formulario";
import APIManager from "../componentes/API/APIManager.jsx";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const RecuperarContrasena = () => {
  const navigation = useNavigation();
  const [correo, setCorreo] = useState("");
  const [token, setToken] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validación local del formato de correo
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEnviarCodigo = async () => {
    setErrorMessage("");

    // Validar formato de correo y eliminar espacios
    const trimmedCorreo = correo.trim();
    if (!isValidEmail(trimmedCorreo)) {
      setErrorMessage("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    setIsLoading(true);

    try {
      const dataCar = new FormData();
      dataCar.append("correo", trimmedCorreo);

      console.log("Enviando correo:", trimmedCorreo); // Depuración

      const response = await APIManager({
        url: "ActualizacionPassMovil/resetPass",
        method: "POST",
        data: dataCar,
      });

      console.log("Respuesta del backend:", response); // Depuración

      if (response.resultado) {
        setCodigoEnviado(true);
        Alert.alert("Éxito", response.mensaje);
      } else {
        setErrorMessage(response.mensaje || "No se pudo enviar el código.");
      }
    } catch (error) {
      console.error("ERROR:", error);
      setErrorMessage("Ocurrió un error al enviar el código. Verifica tu conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateEmail = async () => {
    setErrorMessage("");

    // Validar que el token no esté vacío
    if (!token.trim()) {
      setErrorMessage("Por favor, ingresa el código de verificación.");
      return;
    }

    setIsLoading(true);

    try {
      const dataCar = new FormData();
      dataCar.append("correo", correo.trim());
      dataCar.append("token", token.trim());

      console.log("Validando correo:", correo.trim(), "Token:", token.trim()); // Depuración

      const response = await APIManager({
        url: "ActualizacionPassMovil/validarToken",
        method: "POST",
        data: dataCar,
      });

      console.log("Respuesta del backend:", response); // Depuración

      if (response.resultado) {
        Alert.alert("Éxito", response.mensaje, [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("CambiarContrasena", {
                correo: correo.trim(),
                token: token.trim(),
              }),
          },
        ]);
      } else {
        setErrorMessage(response.mensaje || "Código inválido o expirado.");
      }
    } catch (error) {
      console.error("ERROR:", error);
      setErrorMessage("Ocurrió un error al validar el código. Verifica tu conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    await handleEnviarCodigo();
  };

  return (
    <View style={styles.container}>

        {/* Logo y Título en la parte superior */}
        <View style={styles.header}>
          <Logo />
          <Titulo titulo="RECUPERAR CONTRASEÑA" />
        </View>


      <KeyboardAwareScrollView
        style={styles.centeredContainer}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={50}
      >
        {/* Contenedor centrado para formulario y botón */}
        <View style={styles.centerContainer}>
          <Text style={styles.instructionText}>
            {codigoEnviado
              ? "Ingresa el código de verificación que recibiste en tu correo, esto puede tardar unos minutos"
              : "Ingresa el correo electrónico de la cuenta a recuperar para recibir un código de verificación"}
          </Text>

          <Formulario
            iconName={codigoEnviado ? "key-outline" : "mail-outline"}
            placeholder={codigoEnviado ? "Ingresar código" : "Ingresar correo"}
            value={codigoEnviado ? token : correo}
            onChangeText={codigoEnviado ? setToken : setCorreo}
            keyboardType={codigoEnviado ? "default" : "email-address"}
            maxLength={codigoEnviado ? 6 : undefined}
            autoCapitalize={codigoEnviado ? "characters" : "none"}
          />

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <CustomButton
            onPress={codigoEnviado ? handleValidateEmail : handleEnviarCodigo}
            buttonText={
              isLoading
                ? "Cargando..."
                : codigoEnviado
                ? "Validar Código"
                : "Enviar Código"
            }
            disabled={isLoading || (!correo.trim() && !codigoEnviado)}
          />

          {codigoEnviado && (
            <TouchableOpacity
              onPress={handleReenviarCodigo}
              disabled={isLoading}
              style={styles.reenviarLink}
            >
              <Text style={styles.reenviarText}>Reenviar código</Text>
            </TouchableOpacity>
          )}
        </View>
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
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  centerContainer: {
    marginHorizontal: 16,
    padding: 16,
  },
  instructionText: {
    color: "#B0B0B0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: "colors.error",
    marginTop: 2,
  },
  reenviarLink: {
    marginTop: 10,
    alignItems: "center",
  },
  reenviarText: {
    color: "colors.primary",
    fontSize: 14,
  },
});

export default RecuperarContrasena;