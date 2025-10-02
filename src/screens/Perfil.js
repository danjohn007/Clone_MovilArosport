import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Text,
  Modal,
  FlatList,
  Share,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Icon, Stack } from "native-base";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Logo from "../componentes/Logo";
import CustomButton from "../componentes/Buttons";
import MostrarDatosPerfil from "../componentes/MostrarDatosPerfil";
import ProfileChip from "../componentes/ComponetePerfil";
import BannerAd from "../componentes/BannerAd";
import Icono from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIManager from "../componentes/API/APIManager.jsx";
import colors from "../styles/colors.js";
import * as ImagePicker from "expo-image-picker";
import URL from "../Helper/URL";
import CambiarContrasena from "../modales/CambiarContrasena";
import * as Location from "expo-location";
import Geolocalizacion from "../componentes/Geolocalizacion";
import GeolocalizacionHuawei from "../componentes/GeolocalizacionHuawei";
import * as Device from "expo-device";
import UbicacionPerfil from "../modales/UbicacionPerfil";
import SelectCategoria from "../componentes/SelectCategoria";
import { obtenerDireccionFormateada } from "../config/googleGeocoding";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { obtenerEstadoYPaisDesdeCoordenadas } from "../config/googleGeocoding";
import Categorias from "../componentes/Categorias";
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from "react-native";
import { useAuth } from "./Auth/AuthContext";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;

const Perfil = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [modalVisible, setModalVisible3] = useState(false);
  const [modalUbicacion, setModalUbicacion] = useState(false);
  const BASE_URL = URL.IMAGENES;
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState("");
  const [idStripe, setStripe] = useState("");
  const [idUsuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [sexo, setSexo] = useState("");
  const [usuario, setNomUsuario] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const nombreRef = useRef(null);
  const telefonoRef = useRef(null);
  const correoRef = useRef(null);
  const [actualizando, setActualizando] = useState(false);
  const [estatusCategoria, setEstatusCategoria] = useState(0);
  console.log("estatus de juego", estatusCategoria);
  const [errors, setErrors] = useState({});
  const showModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const showModal2 = () => {
    setModalVisible2(true);
  };

  const closeModal2 = () => {
    setModalVisible2(false);
  };

  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  console.log("ubicacion actual de perfil", ubicacionUsuario);

  const handleOpenUbicacion = async () => {
    if (!ubicacionUsuario) {
      await obtenerUbicacionActual();
    }
    setModalUbicacion(true);
  };

  const handleCloseUbicacion = () => {
    setModalUbicacion(false);
  };

  const actualizaImagen = async (imageUri) => {
    setLoading(true);
    const formData = new FormData();
    const base64Image = await convertImageToBase64(imageUri);
    formData.append("img_url", base64Image);
    formData.append("img_extension", imageUri.split(".").pop());

    try {
      const response = await APIManager({
        url: "Perfil/upload_image",
        method: "POST",
        data: formData,
      });
      if (response && response.res) {
        setImagen(response.us_foto);
        Alert.alert("Éxito", "Imagen actualizada correctamente");
      } else {
        Alert.alert("Alerta", "Error al actualizar la imagen1");
      }
    } catch (error) {
      Alert.alert("Alerta", "Error al actualizar la imagen2");
    } finally {
      getDatos();
      setLoading(false);
    }
  };

  const convertImageToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAvatarEdit = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      actualizaImagen(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "¿Seguro que deseas cerrar sesión?",
      "",
      [
        {
          text: "Volver",
          onPress: () => console.log("Cancel"),
        },
        {
          text: "Salir",
          onPress: () => {
            logOut();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const STORAGE_KEYS = {
    EMAIL: "@stored_email",
    PASSWORD: "@stored_password",
    NOTIFICATIONS: "notifications",
  };

  const { logout } = useAuth();

  const logOut = async () => {
    try {
      const response = await APIManager({
        url: "Login/logout",
        method: "POST",
        data: JSON.stringify({ id_usuario: idUsuario }),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Respuesta de logout:", response);

      if (response && response.success) {
        const keysToKeep = [
          STORAGE_KEYS.EMAIL,
          STORAGE_KEYS.PASSWORD,
          STORAGE_KEYS.NOTIFICATIONS,
          "genero_usuario",
          "categoria_usuario",
        ];
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter((key) => !keysToKeep.includes(key));
        await AsyncStorage.multiRemove(keysToRemove);
        console.log("Sesión cerrada, credenciales mantenidas", keysToKeep);
        await logout();
        Alert.alert(
          "Sesión cerrada",
          "Has cerrado sesión exitosamente.",
          [
            {
              text: "Cerrar",
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo cerrar sesión. Por favor, inténtalo de nuevo."
        );
      }
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
      Alert.alert("Error", "Ocurrió un error al cerrar sesión.");
    }
  };

  const esValidoNombre = (texto) => {
    const regex = /^[A-Za-zÀ-ÿ\s]+$/;
    return texto.length >= 2 && regex.test(texto);
  };

  const Actualizar = async () => {
    console.log("🚀 Iniciando Actualizar()...");

    const esValido = validarFormulario();
    if (!esValido) {
      console.log("❗Formulario inválido. Corrige los errores.");
      return;
    }

    const direccionParts = direccion.split(",");
    console.log("📌 Partes de la dirección:", direccionParts);

    const calle = direccionParts[0]?.trim();
    const num_ext = direccionParts[1]?.trim();
    const colonia = direccionParts[2]?.trim();
    const cp = direccionParts[3]?.trim();

    console.log("✅ Dirección separada:", { calle, num_ext, colonia, cp });

    const latitud = ubicacionUsuario?.latitude || null;
    const longitud = ubicacionUsuario?.longitude || null;
    console.log("📍 Ubicación:", { latitud, longitud });

    setActualizando(true);

    const dataUser = new FormData();
    dataUser.append("nombre", nombre);
    dataUser.append("correo", correo);
    dataUser.append("telefono", telefono);
    dataUser.append("calle", calle);
    dataUser.append("num_ext", num_ext);
    dataUser.append("colonia", colonia);
    dataUser.append("cp", cp);
    dataUser.append("latitud", latitud);
    dataUser.append("longitud", longitud);
    dataUser.append("descripcion", "Ubicación del usuario");
    dataUser.append("id_categoria", idCategoriaSeleccionada);
    console.log("Datos y dirección dataUser", dataUser);

    const response = await APIManager({
      url: `Perfil/update_user`,
      method: "POST",
      data: dataUser,
    });
    console.log("Datos y dirección response", response);

    if (response.status === true) {
      getDatos();
      Alert.alert(
        "!Éxito!",
        "¡Tus datos se han actualizado correctamente!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Perfil"),
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        "!Alerta!",
        "Lo siento, no hay cambios modificados.",
        [
          {
            text: "OK",
            onPress: () => console.log("Error en la actualización"),
          },
        ],
        { cancelable: false }
      );
    }

    nombreRef.current?.blur();
    correoRef.current?.blur();
    telefonoRef.current?.blur();
    setActualizando(false);
  };

  useFocusEffect(
    useCallback(() => {
      getDatos();
      setErrors({});
    }, [])
  );

  function quitarAcentos(texto) {
    return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  }

  const obtenerUbicacionActual = async () => {
    try {
      setDireccion("Cargando ubicación...");
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permiso de ubicación denegado");
        setDireccion("No se pudo obtener la ubicación");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const direccion_completa = await obtenerDireccionFormateada(
        latitude,
        longitude
      );
      let { estado, pais } = await obtenerEstadoYPaisDesdeCoordenadas(
        latitude,
        longitude,
        "usuario"
      );

      if (estado) {
        await AsyncStorage.setItem("estado_usuario", estado);
        console.log("📍 Estado guardado:", estado);
      }
      if (pais) {
        await AsyncStorage.setItem("pais_usuario", pais);
        console.log("🌍 País guardado:", pais);
      }

      estado = quitarAcentos(estado).toLowerCase().trim();
      pais = quitarAcentos(pais).toLowerCase().trim();

      const nuevaUbicacion = {
        latitude,
        longitude,
        direccion_completa,
      };
      setUbicacionUsuario(nuevaUbicacion);
      setDireccion(direccion_completa);

      console.log("Ubicación obtenida:", nuevaUbicacion);

      await guardarDireccionAutomaticamente(
        latitude,
        longitude,
        direccion_completa,
        estado,
        pais
      );

      return { estado, pais };
    } catch (error) {
      console.log("Error al obtener ubicación:", error);
      setDireccion("No se pudo obtener la ubicación");
      return { estado: null, pais: null };
    }
  };

  const guardarDireccionAutomaticamente = async (
    latitude,
    longitude,
    direccionCompleta,
    estado = null,
    pais = null
  ) => {
    try {
      console.log("📍 Guardando dirección automáticamente...");
      const direccionParts = direccionCompleta.split(",");
      const calle = direccionParts[0]?.trim() || "";
      const num_ext = direccionParts[1]?.trim() || "";
      const colonia = direccionParts[2]?.trim() || "";
      const cp = direccionParts[3]?.trim() || "";

      const dataDireccion = new FormData();
      dataDireccion.append("calle", calle);
      dataDireccion.append("num_ext", num_ext);
      dataDireccion.append("colonia", colonia);
      dataDireccion.append("cp", cp);
      dataDireccion.append("latitud", latitude);
      dataDireccion.append("longitud", longitude);
      dataDireccion.append(
        "descripcion",
        "Ubicación actualizada por el usuario"
      );
      if (estado) dataDireccion.append("estado", estado);
      if (pais) dataDireccion.append("pais", pais);

      console.log("📦 Datos a enviar:", dataDireccion);

      const response = await APIManager({
        url: `Perfil/update_direccion`,
        method: "POST",
        data: dataDireccion,
      });

      console.log("📨 Respuesta del servidor:", response);

      if (response.status === true) {
        console.log(
          "✅ Dirección actualizada",
          "Se actualizó tu ubicación correctamente."
        );
      } else {
        console.log("⚠️ Error", "No se pudo actualizar la dirección.");
      }
    } catch (error) {
      console.log("❗ Error guardando dirección:", error);
    }
  };

  const getDatos = async () => {
    const res = await APIManager({
      url: "Perfil/get_info",
      method: "get",
    });
    console.log("datos del perfil", res);
    setNombre(res.data.nombre);
    setApellido(res.data.apellido);
    setSexo(res.data.sexo);
    setNomUsuario(res.data.usuario);
    setCorreo(res.data.us_correo);
    setTelefono(res.data.us_telefono);
    setImagen(res.data.us_foto);
    setStripe(res.data.stripe_id);
    setUsuario(res.data.id_usuario);
    setEmail(res.data.us_correo);

    const categoria = res.data.id_categoria;
    const nombreCategoria = res.data.categoria;

    setCategoriaSeleccionada(nombreCategoria);
    setIdCategoriaSeleccionada(categoria || null);
    setEstatusCategoria(res.data.estatus_categoria);

    if (res.data.sexo) {
      await AsyncStorage.setItem("genero_usuario", res.data.sexo);
    }
    if (categoria) {
      await AsyncStorage.setItem("categoria_usuario", String(categoria));
    }

    const { estado, pais } = await obtenerUbicacionActual();

    const ubicacion = {
      latitude: parseFloat(res.data.latitud) || 0,
      longitude: parseFloat(res.data.longitud) || 0,
      direccion_completa: "",
    };
    setUbicacionUsuario(ubicacion);
    setLoading(false);

    setErrors((prevErrors) => ({
      ...prevErrors,
      nombre: res.data.nombre ? "" : prevErrors.nombre,
      correo: res.data.us_correo ? "" : prevErrors.correo,
      telefono: res.data.us_telefono ? "" : prevErrors.telefono,
      idCategoriaSeleccionada: categoria
        ? ""
        : prevErrors.idCategoriaSeleccionada,
      direccion:
        res.data.latitud && res.data.longitud ? "" : prevErrors.direccion,
    }));
  };

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    "Seleccionar categoría:"
  );
  const [idCategoriaSeleccionada, setIdCategoriaSeleccionada] = useState(null);
  console.log("Categoría seleccionada", categoriaSeleccionada);
  console.log("ID de categoría seleccionada", idCategoriaSeleccionada);

  useEffect(() => {
    const getCategorias = async () => {
      try {
        const res = await APIManager({
          url: "Perfil/get_categorias",
          method: "get",
        });
        console.log("categorias", res);
        const categoriasData = res.map((categoria) => ({
          label: categoria.categoria,
          value: categoria.id_categoria,
        }));
        setCategorias(categoriasData);
      } catch (error) {
        console.log("Error al obtener las categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategorias();
  }, []);

  const handleCategoriaSeleccionada = (categoriaNombre) => {
    const categoria = categorias.find((c) => c.label === categoriaNombre);
    if (categoria) {
      setCategoriaSeleccionada(categoria.label);
      setIdCategoriaSeleccionada(categoria.value);
      handleValidation("idCategoriaSeleccionada", categoria.value);
    }
  };

  const [direccion, setDireccion] = useState("Obteniendo tu ubicación...");

  const handleUbicacionCambiada = (nuevaUbicacion) => {
    setUbicacionUsuario(nuevaUbicacion);
    setDireccion(nuevaUbicacion.direccion_completa);
    handleValidation("direccion", nuevaUbicacion.direccion_completa);
  };

  const handleValidation = (field, value) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: !value ? "Campo obligatorio" : "",
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nombre) nuevosErrores.nombre = "Campo obligatorio";
    if (!correo) {
      nuevosErrores.correo = "Campo obligatorio";
    } else {
      const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(correo)) {
        nuevosErrores.correo = "Correo inválido (ej. usuario@dominio.com)";
      }
    }
    if (!telefono) {
      nuevosErrores.telefono = "Campo obligatorio";
    } else {
      const telefonoRegex = /^\d{10}$/;
      if (!telefonoRegex.test(telefono)) {
        nuevosErrores.telefono = "El teléfono debe tener 10 dígitos";
      }
    }
    if (!idCategoriaSeleccionada)
      nuevosErrores.idCategoriaSeleccionada = "Debe seleccionar una categoría";
    if (!direccion) {
      nuevosErrores.direccion = "Campo obligatorio";
    } else {
      const direccionParts = direccion.split(",");
      if (direccionParts.length < 4) {
        nuevosErrores.direccion =
          "La dirección está incompleta. Usa formato: Calle, Número, Colonia, CP";
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleShareInvitation = async () => {
    try {
      const deepLink = `arosports://suscripciones?codigo=${usuario}`;
      const message = `¡Únete a Arosports! Usa mi código de invitación *${usuario}* y obtén un descuento en tu suscripción.`;
      const result = await Share.share({ message });
      if (result.action === Share.sharedAction) {
        console.log("Invitación compartida");
      }
    } catch (error) {
      console.log("Error al compartir:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Logo />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icono name="log-out-outline" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.formContainer}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={-80}
          keyboardOpeningTime={0}
          showsVerticalScrollIndicator={false}
        >
          {/* Contenedor principal para nombre y foto */}
          <View style={styles.namePhotoContainer}>
            <View style={styles.nameInputWrapper}>
              <MostrarDatosPerfil
                ref={nombreRef}
                iconName="person-outline"
                placeholder="Nombre"
                value={nombre}
                onChangeText={(value) => {
                  setNombre(value);
                  handleValidation("nombre", value);
                }}
                editable={true}
              />
              {errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre}*</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.profileImageWrapper}
              onPress={handleAvatarEdit}
            >
              {loading ? (
                <ActivityIndicator size="large" color={colors.azulMarino} />
              ) : (
                <Image
                  style={styles.profileHeaderImage}
                  resizeMode="cover"
                  source={
                    imagen
                      ? { uri: `${BASE_URL}profiles/${imagen}` }
                      : require("../../assets/icon_no_profile.png")
                  }
                />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <MostrarDatosPerfil
              ref={correoRef}
              iconName="mail-outline"
              placeholder="Correo"
              value={correo}
              onChangeText={(value) => {
                setCorreo(value);
                handleValidation("correo", value);
              }}
              editable={true}
            />
            {errors.correo && (
              <Text style={styles.errorText}>{errors.correo}*</Text>
            )}
            <MostrarDatosPerfil
              ref={telefonoRef}
              iconName="phone-portrait-outline"
              placeholder="Teléfono"
              value={telefono}
              onChangeText={(value) => {
                setTelefono(value);
                handleValidation("telefono", value);
              }}
              keyboardType="numeric"
              maxLength={10}
              editable={true}
            />
            {errors.telefono && (
              <Text style={styles.errorText}>{errors.telefono}*</Text>
            )}
            <Categorias
              iconName="list"
              placeholder="Selecciona una categoría"
              options={categorias.map((cat) => cat.label)}
              selectedValue={categoriaSeleccionada}
              onValueChange={handleCategoriaSeleccionada}
              onPress={
                estatusCategoria === 1
                  ? () => {
                      Alert.alert(
                        "Atención",
                        "No puedes cambiar la categoría porque ya jugaste.",
                        [{ text: "OK" }]
                      );
                    }
                  : undefined
              }
            />
            {errors.idCategoriaSeleccionada && (
              <Text style={styles.errorText}>
                {errors.idCategoriaSeleccionada}*
              </Text>
            )}
            <MostrarDatosPerfil
              iconName="location-outline"
              tittle={direccion}
              isButton={true}
              onPress={
                direccion !== "No se pudo obtener la ubicación" &&
                direccion !== ""
                  ? handleOpenUbicacion
                  : null
              }
              placeholder={direccion}
              editable={
                direccion !== "No se pudo obtener la ubicación" &&
                direccion !== ""
              }
            />
            {errors.direccion && (
              <Text style={styles.errorText}>{errors.direccion}*</Text>
            )}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible3(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Selecciona una categoría
                  </Text>
                  <FlatList
                    data={categorias}
                    keyExtractor={(item) => item.value.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleCategoriaSeleccionada(item)}
                      >
                        <Text style={styles.modalOptionText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible3(false)}
                  >
                    <Text style={styles.modalCloseText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => Actualizar()}
                isLoading={actualizando}
                isLoadingText="Guardando..."
              >
                {actualizando ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loginButtonText}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Actualizar datos</Text>
                )}
              </TouchableOpacity>
            </View>
            <MostrarDatosPerfil
              iconName="key-outline"
              isButton={true}
              tittle="Cambiar Contraseña"
              placeholder="Cambiar contraseña"
              onPress={showModal}
            />
            <MostrarDatosPerfil
              iconName="card-outline"
              placeholder="Suscripción"
              isButton={true}
              tittle="Suscripción"
              onPress={() =>
                navigation.navigate("Suscripciones", {
                  stripeCustomer: idStripe,
                  id_usuario: idUsuario,
                  userEmail: email,
                  userNombre: nombre,
                  userApellido: apellido,
                  userSexo: sexo,
                  usuarioNom: usuario,
                })
              }
            />
            {/*Código de Invitación para la proxima version*/}
            {/*<MostrarDatosPerfil
              iconName="share-social-outline"
              isButton={true}
              tittle="Compartir Código de Invitación"
              placeholder="Compartir Código"
              onPress={handleShareInvitation}
            /> */}
          </View>
        </KeyboardAwareScrollView>
      </View>
      <CambiarContrasena visible={isModalVisible} closeModal={closeModal} />
      <UbicacionPerfil
        visible={modalUbicacion}
        closeModal={handleCloseUbicacion}
        ubicacionUsuario={ubicacionUsuario}
        onUbicacionCambiada={handleUbicacionCambiada}
      />
      <View style={styles.containerBaner}>
        <BannerAd />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e2e2e",
    padding: 16,
  },
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#2E2E2E",
  },
  namePhotoContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  logoutButton: {
    position: "absolute",
    right: 15,
    marginTop: 65,
  },
  nameInputWrapper: {
    flex: 1,
    marginRight: scale(10),
    justifyContent: "center",
  },
  profileImageWrapper: {
    width: 55,
    height: 55,
    marginTop: -10,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.azulMarino,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.blanco,
  },
  profileHeaderImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: scale(5),
    right: scale(2),
    backgroundColor: colors.azulMarino,
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.blanco,
  },
  nameInputContainer: {
    flex: 1,
    marginLeft: scale(10),
  },
  formContainer: {
    flex: 1,
    zIndex: 0,
    marginTop: 20,
    marginBottom: 50,
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingBottom: 30,
  },
  inputContainer: {
    width: "90%",
    marginTop: -10,
  },
  errorText: {
    color: "colors.error",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "colors.primary",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "colors.primary",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalCloseText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "center",
    marginVertical: 10,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "colors.primary",
    width: 205,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Perfil;
