import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Logo from "../componentes/Logo";
import CustomButton from "../componentes/Buttons";
import MostrarDatos from "../componentes/MostrarDatos";
import APIManager from "../componentes/API/APIManager.jsx";
import Titulo from "../componentes/Titulo";
import Categorias from "../componentes/Categorias.js";
import debounce from "lodash.debounce";

const Registro = () => {
  const navigation = useNavigation();
  const [Nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [categoria, setCategoria] = useState("Varonil");
  const [categoriaJuego, setCategoriaJuego] = useState(6);
  const [modalVisible, setModalVisible] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState(true);
  const [errors, setErrors] = useState({});
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validarCorreoEnServidor = debounce(async (correo) => {
    if (!correo || !correo.includes("@")) return;

    try {
      const res = await APIManager({
        url: `Registro/validar_correo_existe?correo=${encodeURIComponent(
          correo
        )}`,
        method: "GET",
      });

      if (res.existe) {
        setErrors((prev) => ({
          ...prev,
          correo: "El correo ya está registrado",
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.correo;
          return updated;
        });
      }
    } catch (error) {
      console.log("Error al validar correo:", error);
    }
  }, 500); // espera 500ms antes de ejecutar
  const validarUsuarioEnServidor = debounce(async (usuario) => {
    if (!usuario || usuario.length < 4) return;

    try {
      const res = await APIManager({
        url: `Registro/validar_usuario_existe?usuario=${encodeURIComponent(
          usuario
        )}`,
        method: "GET",
      });

      if (res.existe) {
        setErrors((prev) => ({
          ...prev,
          usuario: "El nombre de usuario ya está registrado",
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.usuario;
          return updated;
        });
      }
    } catch (error) {
      console.log("Error al validar usuario:", error);
    }
  }, 500);

  const validarTelefonoEnServidor = debounce(async (telefono) => {
    if (!telefono || telefono.length < 10) return;

    try {
      const res = await APIManager({
        url: `Registro/validar_telefono_existe?telefono=${encodeURIComponent(
          telefono
        )}`,
        method: "GET",
      });

      if (res.existe) {
        setErrors((prev) => ({
          ...prev,
          telefono: "El teléfono ya está registrado",
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.telefono;
          return updated;
        });
      }
    } catch (error) {
      console.log("Error al validar teléfono:", error);
    }
  }, 500);

  console.log("set usuario", usuario);
  useEffect(() => {
    const getCategorias = async () => {
      try {
        const res = await APIManager({
          url: "Registro/obtener_categorias",
          method: "get",
        });
        if (
          res &&
          res.status === "success" &&
          res.data &&
          Array.isArray(res.data)
        ) {
          const categoriasData = res.data.map((categoria) => ({
            label: categoria.categoria,
            value: String(categoria.id_categoria),
          }));
          setCategoriasOptions(categoriasData);
        } else {
          setCategoriasOptions([]);
        }
      } catch (error) {
        console.log("Error al obtener las categorías:", error);
        setCategoriasOptions([]);
      }
    };
    getCategorias();
  }, []);

  const handleIconPress = () => {
    setSecureTextEntry((prevState) => !prevState);
  };

  const handleIconPressConfirm = () => {
    setSecureTextEntryConfirm((prevState) => !prevState);
  };

  const seleccionarCategoria = (item) => {
    setCategoria(item);
    setModalVisible(false);
  };

  const crearClienteStripe = async (email, nombre, telef) => {
    try {
      const response = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer sk_test_51Qn0owBM5jYCkb8pa7pwBQHv2gH6QXKzv1fxTkJ5XhHHaKgk2GIJ8eBePnjwrx4O3OmEBH09LtgC5CMk0O73Lp8b00mz4OEdB6`,
        },
        body: new URLSearchParams({
          email: email,
          name: nombre,
          phone: telef,
        }).toString(),
      });

      const data = await response.json();
      return response.ok ? data : null;
    } catch (error) {
      console.log("Error al crear cliente en Stripe:", error);
      return null;
    }
  };

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

  const handleRegistro = async () => {
    
    const campos = {
      Nombre,
      correo,
      telefono,
      usuario,
      password,
      confirmPassword,
      categoria,
      categoriaJuego: String(categoriaJuego),
    };

    const nuevosErrores = {};

    // Validaciones locales
    Object.entries(campos).forEach(([key, value]) => {
      if (!value || !value.trim()) {
        nuevosErrores[key] = "Campo obligatorio*";
      } else {
        if (
          key === "correo" &&
          !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
        ) {
          nuevosErrores[key] = "Correo no válido";
        }
        if (key === "telefono") {
          if (!/^\d+$/.test(value)) {
            nuevosErrores[key] = "Solo se permiten números*";
          } else if (value.length < 10) {
            nuevosErrores[key] = "Debe tener 10 dígitos";
          }
        }
        if (key === "password") {
          const errorContrasena = validarContrasena(value);
          if (errorContrasena) {
            nuevosErrores[key] = errorContrasena;
          }
        }
        if (key === "confirmPassword") {
          const errorContrasena = validarContrasena(value);
          if (errorContrasena) {
            nuevosErrores[key] = errorContrasena;
          } else if (value !== password) {
            nuevosErrores[key] = "Las contraseñas no coinciden";
          }
        }
        if (key === "categoriaJuego") {
          if (!value || value === "0" || value === "") {
            nuevosErrores[key] = "Debe seleccionar una categoría*";
          }
        }
      }
    });

    setErrors(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    setIsLoading(true);

    // Proceder con el registro
    try {
      const stripeCustomer = await crearClienteStripe(
        correo.trim(),
        Nombre.trim(),
        telefono.trim()
      );

      if (!stripeCustomer) {
        throw new Error("No se pudo crear cliente en Stripe");
      }

      const sexo = categoria === "Varonil" ? "M" : "F";
      const url = `Registro/registrar_usuario?correo=${encodeURIComponent(
        correo
      )}&nombre=${encodeURIComponent(
        Nombre
      )}&sexo=${sexo}&nomUsuario=${encodeURIComponent(
        usuario
      )}&telefono=${telefono}&contrasena=${encodeURIComponent(
        password
      )}&stripe_id=${stripeCustomer.id}&id_categoria=${categoriaJuego}`;

      const response = await APIManager({ url, method: "GET" });

      if (response.status === "success") {
        setStripeCustomerId(stripeCustomer.id);
        // Limpiar formulario
        setNombre("");
        setCorreo("");
        setTelefono("");
        setUsuario("");
        setPassword("");
        setConfirmPassword("");
        setCategoria("Varonil");
        setErrors({});
        Alert.alert(
          "Registro Exitoso",
          "Usuario registrado correctamente. Ahora puedes iniciar sesión.",
          [{ text: "OK" }],
          { cancelable: false }
        );
        navigation.navigate("InicioSesion", {
          correo: correo.trim(),
          password: password.trim(),
        });
      } else {
        // Procesar errores específicos del backend
        const errorMessage =
          response.message || "No se pudo registrar el usuario";
        const nuevosErroresBackend = {};

        if (errorMessage === "El correo ya está registrado") {
          nuevosErroresBackend.correo = errorMessage;
        } else if (errorMessage === "El teléfono ya está registrado") {
          nuevosErroresBackend.telefono = errorMessage;
        } else if (errorMessage === "El nombre de usuario ya está registrado") {
          nuevosErroresBackend.usuario = errorMessage;
        } else {
          nuevosErroresBackend.api = errorMessage;
        }

        setErrors(nuevosErroresBackend);
      }
    } catch (error) {
      setErrors({ api: "Ocurrió un problema con la conexión al servidor" });
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (fieldName, value) => {
    let errorMsg = "";

    if (!value.trim()) {
      errorMsg = "Campo obligatorio*";
    } else {
      if (
        fieldName === "correo" &&
        !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
      ) {
        errorMsg = "Correo no válido*";
      }
      if (fieldName === "telefono") {
        if (!/^\d+$/.test(value)) {
          errorMsg = "Solo se permiten números*";
        } else if (value.length < 10) {
          errorMsg = "Debe tener 10 dígitos*";
        }
      }
      if (fieldName === "password") {
        errorMsg = validarContrasena(value);
      }
      if (fieldName === "confirmPassword") {
        errorMsg = validarContrasena(value);
        if (!errorMsg && value !== password) {
          errorMsg = "Las contraseñas no coinciden";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
  };

  return (
    <View style={styles.container}>
      <Logo />
      <View style={styles.header}>
        <Titulo titulo="REGISTRO" style={styles.titulo} />
      </View>
      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={50}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <MostrarDatos
                iconName="person-outline"
                placeholder="Ingresa tu nombre completo"
                value={Nombre}
                onChangeText={(text) => {
                  setNombre(text);
                  validateField("Nombre", text);
                }}
                style={styles.input}
              />
              {errors.Nombre && (
                <Text style={styles.errorText}>{errors.Nombre}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <MostrarDatos
                iconName="mail-outline"
                placeholder="Ingresa tu correo"
                value={correo}
                onChangeText={(text) => {
                  setCorreo(text);
                  validateField("correo", text);
                  validarCorreoEnServidor(text); // Validación con backend
                }}
                style={styles.input}
              />
              {errors.correo && (
                <Text style={styles.errorText}>{errors.correo}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <MostrarDatos
                iconName="call-outline"
                placeholder="Ingresa tu teléfono"
                value={telefono}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setTelefono(text);
                  validateField("telefono", text);
                  validarTelefonoEnServidor(text); // Validación con backend
                }}
                maxLength={10}
                style={styles.input}
              />
              {errors.telefono && (
                <Text style={styles.errorText}>{errors.telefono}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <MostrarDatos
                iconName="person-circle-outline"
                placeholder="Ingresa tu nombre de usuario"
                value={usuario}
                onChangeText={(text) => {
                  setUsuario(text);
                  validateField("usuario", text);
                  validarUsuarioEnServidor(text); // Validación con backend
                }}
                style={styles.input}
              />
              {errors.usuario && (
                <Text style={styles.errorText}>{errors.usuario}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <MostrarDatos
                iconName="lock-closed-outline"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validateField("password", text);
                }}
                secureTextEntry={secureTextEntry}
                onPressIcon={handleIconPress}
                maxLength={20}
                style={styles.input}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <MostrarDatos
                iconName="lock-closed-outline"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validateField("confirmPassword", text);
                }}
                secureTextEntry={secureTextEntryConfirm}
                onPressIcon={handleIconPressConfirm}
                maxLength={20}
                style={styles.input}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={[styles.inputBox, styles.input]}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons
                  name={categoria === "Varonil" ? "male" : "female"}
                  size={20}
                  color={colors.primary}
                  style={styles.genderIcon}
                />
                <Text style={styles.pickerText}>Género: {categoria}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Categorias
                iconName="list"
                placeholder="Seleccionar categoría"
                options={categoriasOptions.map((opt) => opt.label)}
                selectedValue={
                  categoriasOptions.find(
                    (opt) => opt.value === String(categoriaJuego)
                  )?.label || null
                }
                onValueChange={(label) => {
                  const found = categoriasOptions.find(
                    (opt) => opt.label === label
                  );
                  if (found) {
                    setCategoriaJuego(Number(found.value));
                    validateField("categoriaJuego", String(found.value));
                  }
                }}
                style={styles.input}
              />
              {errors.categoriaJuego && (
                <Text style={styles.errorText}>{errors.categoriaJuego}</Text>
              )}
            </View>
          </View>

          <CustomButton
            onPress={handleRegistro}
            buttonText={isLoading ? "Registrando..." : "Registrarse"}
            style={styles.registerButton}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}

          {errors.api && (
            <Text style={[styles.errorText, styles.apiError]}>
              {errors.api}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate("InicioSesion")}
            style={styles.loginLink}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.boldText}>Inicia Sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ScrollView contentContainerStyle={styles.pillsContainer}>
                  {["Varonil", "Femenil"].map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pill,
                        option === categoria && styles.pillSelected,
                      ]}
                      onPress={() => seleccionarCategoria(option)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          option === categoria && styles.pillTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  loadingContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 24,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 5,
  },
  input: {
    height: 50,
    fontSize: 16,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "colors.primary",
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 10,
  },
  genderIcon: {
    marginRight: 10,
  },
  pickerText: {
    flex: 1,
    color: "#727272",
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: "colors.error",
    marginBottom: 4,
    marginLeft: 2,
    marginTop: -4,
  },
  apiError: {
    textAlign: "center",
    marginVertical: 10,
  },
  registerButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold",
    color: "white",
  },
  loginLink: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "colors.primary",
    padding: 20,
    width: "85%",
    maxHeight: "80%",
  },
  pillsContainer: {
    width: "100%",
    paddingBottom: 10,
  },
  pill: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  pillSelected: {
    backgroundColor: "colors.primary",
    borderColor: "colors.primary",
  },
  pillText: {
    fontSize: 14,
    color: "#808191",
    textAlign: "center",
  },
  pillTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Registro;
