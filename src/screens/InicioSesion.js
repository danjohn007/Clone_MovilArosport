import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Checkbox } from "native-base";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomButton from "../componentes/Buttons";
import MostrarDatos from "../componentes/MostrarDatos";
import APIManager from "../componentes/API/APIManager.jsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./Auth/AuthContext";
import colors from "../styles/colors.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icon from "react-native-vector-icons/Ionicons";



const InicioSesion = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { setToken, setUserId } = useAuth();

  const [email, setCorreo] = useState("");
  const [password, setContrasena] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorContrasena, setErrorContrasena] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleIconPress = () => {
    setSecureTextEntry((prevState) => !prevState);
  };

  // Validar formato de correo
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formato de contraseña
  const validarContrasena = (password) => {
    if (!password.trim()) {
      return "La contraseña es obligatoria.";
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (password.length > 20) {
      return "La contraseña no puede tener más de 20 caracteres.";
    }
    if (!/\d/.test(password)) {
      return "La contraseña debe contener al menos un número.";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "La contraseña debe contener al menos un carácter especial (!@#$%^&*).";
    }
    return "";
  };

  const STORAGE_KEYS = {
    EMAIL: "@stored_email",
    PASSWORD: "@stored_password",
  };

  const storeCredentials = async (email, password) => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(STORAGE_KEYS.EMAIL, email);
        await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD, password);
        console.log("Credentials saved successfully");
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.EMAIL);
        await AsyncStorage.removeItem(STORAGE_KEYS.PASSWORD);
        console.log("Credentials removed");
      }
    } catch (e) {
      console.log("Error managing credentials: ", e);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.EMAIL);
      const savedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD);
      console.log(
        "Loading saved credentials:",
        savedEmail,
        savedPassword ? "********" : null
      );

      if (savedEmail !== null) {
        setCorreo(savedEmail);
        setRememberMe(true);
      }
      if (savedPassword !== null) {
        setContrasena(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.log("Error loading saved credentials:", error);
    }
  };

  useEffect(() => {
    const initializeCredentials = async () => {
      
      // Si hay parámetros de navegación, priorízalos
      if (route.params?.correo && route.params?.password) {
        console.log("Parámetros recibidos desde Registro:", {
          correo: route.params.correo,
          password: route.params.password,
        });
        setCorreo(route.params.correo);
        setContrasena(route.params.password);
        if (rememberMe) {
          await storeCredentials(route.params.correo, route.params.password);
        }
      } else {
        // Si no hay parámetros, carga credenciales guardadas
        await loadSavedCredentials();
      }
    };

    initializeCredentials();
  }, [route.params]);

  const handleCorreoChange = (text) => {
    setCorreo(text);
    setErrorCorreo("");
  };

  const handleContrasenaChange = (text) => {
    setContrasena(text);
    setErrorContrasena(validarContrasena(text));
  };

  const Login = async () => {
    setLoading(true);
    setErrorCorreo("");
    setErrorContrasena("");

    // Validaciones locales
    if (!email.trim()) {
      setErrorCorreo("El correo es obligatorio.");
      setLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setErrorCorreo("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }
    const errorContrasena = validarContrasena(password);
    if (errorContrasena) {
      setErrorContrasena(errorContrasena);
      setLoading(false);
      return;
    }

    const dataLogin = new FormData();
    dataLogin.append("us_correo", email.trim());
    dataLogin.append("us_contrasena", password);

    try {
      console.log("Enviando datos:", { us_correo: email.trim(), us_contrasena: "********" });

      const res = await APIManager({
        url: "Login/inicio_sesion",
        method: "POST",
        data: dataLogin,
      });

      console.log("Respuesta del backend:", res);

      if (res.estatus === false) {
        if (res.error === "correo_incorrecto") {
          setErrorCorreo("El correo no está registrado.");
        } else if (res.error === "contrasena_incorrecta") {
          setErrorContrasena("La contraseña ingresada es incorrecta.");
        } else if (res.error === "login") {
          setErrorContrasena("El usuario ya tiene una sesión activa.");
        } else {
          setErrorCorreo("Error al iniciar sesión. Por favor intenta de nuevo.");
        }
        setLoading(false);
      } else {
        await storeCredentials(email.trim(), password);
        setToken(res.token);
        setUserId(res.id_usuario);
        Alert.alert(
          "Inicio de sesión exitoso",
          res.mensaje,
          [
            {
              text: "OK",
            },
          ],
          { cancelable: false }
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Alerta",
        "Ha ocurrido un error de conexión. Por favor intenta de nuevo.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerLogo}>
        <Image
          source={require("../../assets/logoAro.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardOpeningTime={0}
      >
        <View style={styles.inputContainer}>
          {/* Campo de correo electrónico */}
          <MostrarDatos
            iconName="mail-outline"
            placeholder="Ingresa tu correo"
            autoCapitalize="none"
            value={email}
            onChangeText={handleCorreoChange}
          />

          {/* Campo de contraseña */}
          <MostrarDatos
            iconName="lock-closed-outline"
            placeholder="Ingresa tu contraseña"
            onChangeText={handleContrasenaChange}
            autoCapitalize="none"
            secureTextEntry={secureTextEntry}
            onPressIcon={handleIconPress}
            value={password}
          />
          {errorCorreo && (
            <View style={styles.errorContainer}>
              <Icon
                name="alert-circle-outline"
                size={16}
                color={colors.error}
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{errorCorreo}</Text>
            </View>
          )}
          {errorContrasena && (
            <View style={styles.errorContainer}>
              <Icon
                name="alert-circle-outline"
                size={16}
                color={colors.error}
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{errorContrasena}</Text>
            </View>
          )}

          {/* Switch para "Recordar datos" */}
          <View style={styles.rememberMeContainer}>
            <Checkbox
              value="rememberMe"
              isChecked={rememberMe}
              onChange={(isChecked) => setRememberMe(isChecked)}
              colorScheme="blue"
              borderColor={colors.azulMarino}
              _checked={{
                bg: colors.azulMarino,
                borderColor: colors.azulMarino,
              }}
            />
            <Text style={styles.rememberMeText}>Recordar mi información</Text>
          </View>
        </View>

        {/* Botón de inicio de sesión */}
        <CustomButton
          buttonText={loading ? "Iniciando..." : "Iniciar Sesión"}
          onPress={Login}
          disabled={loading}
        />

        {loading && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={{ marginTop: 10 }}
          />
        )}

        {/* Opciones adicionales */}
        <TouchableOpacity
          onPress={() => navigation.navigate("RecuperarContrasena")}
        >
          <Text style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
          <Text style={styles.forgotPasswordText}>
            ¿Aún no tienes cuenta?{" "}
            <Text style={styles.boldText}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  containerLogo: {
    marginTop: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logo: {
    marginTop: -200,
    width: 200,
    height: 390,
    marginBottom: -60,
  },
  inputContainer: {
    width: "80%",
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Poppins",
    marginTop: 20,
  },
  boldText: {
    fontWeight: "bold",
    color: "white",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "3%",
    marginRight: "32%",
  },
  rememberMeText: {
    fontSize: 14,
    color: "white",
    marginLeft: "8%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    fontSize: 12,
    color: "colors.error",
    marginTop: 2,
    marginLeft: 4,
  },
});

export default InicioSesion;