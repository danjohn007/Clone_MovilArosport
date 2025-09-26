import {
  View,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import Titulo from "../componentes/Titulo";
import Logo from "../componentes/Logo";
import CustomButton from "./Buttons";
import MostrarDatos from "../componentes/MostrarDatos";
import { MaterialIcons } from "@expo/vector-icons";
import APIManager from "../componentes/API/APIManager.jsx";
import { useAuth } from "../screens/Auth/AuthContext.js";
import { useNavigation } from "@react-navigation/native";
import BannerAd from "../componentes/BannerAd";
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AccesoFraccionamiento = () => {
  const navigation = useNavigation();
  const { id_usuario } = useAuth();
  const [isFormVisible, setFormVisible] = useState(true);
  const [fraccionamientos, setFraccionamientos] = useState([]);
  const [selectedFraccionamiento, setSelectedFraccionamiento] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [casa, setCasa] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [selectedFraccionamientoNombre, setSelectedFraccionamientoNombre] =
    useState("Seleccione un fraccionamiento");
  const [fraccionamientoEnEspera, setFraccionamientoEnEspera] = useState(null);

  useEffect(() => {
    fetchFraccionamientos();
    verificarSolicitudEnEspera();
  }, []);

  const fetchFraccionamientos = async () => {
    setLoading(true);
    try {
      const url = "fraccionamientos/SolicitarAcceso/traer_fraccionamientos";
      console.log(`Llamando a la API: ${url}`);

      const response = await APIManager({
        url: url,
        method: "GET",
      });

      console.log("Respuesta recibida:", response);

      if (response.status) {
        if (!Array.isArray(response.data)) {
          console.log("Error: 'response.data' no es un array.", response.data);
          return;
        }

        setFraccionamientos(response.data);
        if (response.data.length > 0) {
          setSelectedFraccionamiento(""); // Almacena el ID
          setSelectedFraccionamientoNombre("Seleccione un fraccionamiento"); // El nombre solo para mostrar
        }
      } else {
        console.warn("Error en la respuesta de la API:", response.message);
        Alert.alert(
          "Error",
          response.message || "No se pudieron cargar los fraccionamientos"
        );
      }
    } catch (error) {
      console.log("Error al obtener fraccionamientos:", error);
      Alert.alert("Error", "Ocurrió un error al cargar los fraccionamientos");
    } finally {
      setLoading(false);
      console.log("Fetch finalizado");
    }
  };

  const handleEnviar = async () => {
    console.log("Verificando campos...");
    console.log("selectedFraccionamiento (ID):", selectedFraccionamiento); // Aquí debes ver el ID
    console.log("casa:", casa);
    console.log("numeroCasa:", numeroCasa);

    // Verificación antes de continuar
    if (!selectedFraccionamiento || selectedFraccionamiento === "") {
      console.log('Campo "Fraccionamiento" está vacío o no seleccionado');
      Alert.alert("Error", "Por favor, selecciona un fraccionamiento.");
      return;
    }

    if (!casa.trim()) {
      console.log('Campo "Casa" está vacío');
      Alert.alert(
        "Error",
        "Por favor, completa el campo Casa/Departamento/Torre."
      );
      return;
    }

    if (!numeroCasa.trim()) {
      console.log('Campo "N° Casa" está vacío');
      Alert.alert("Error", "Por favor, completa el campo N° Casa.");
      return;
    }

    setLoading(true);

    // Asegúrate de que estamos pasando el ID
    const url = `fraccionamientos/SolicitarAcceso/guardar_solicitud?id_usuario=${id_usuario}&fraccionamiento=${encodeURIComponent(
      selectedFraccionamiento
    )}&casa=${encodeURIComponent(casa)}&numeroCasa=${encodeURIComponent(
      numeroCasa
    )}`;

    console.log("URL para enviar solicitud:", url); // Verifica que la URL esté pasando el ID y no el nombre

    try {
      const response = await APIManager({
        url: url,
        method: "GET",
      });
      console.log("Respuesta de la API:", response);

      if (response && response.status) {
        if (response.status === true) {
          setFormVisible(false);
          console.log("Solicitud enviada correctamente");
        } else {
          console.log("Error en la respuesta de la API:", response.message);
          Alert.alert(
            "Error",
            response.message || "No se pudo enviar la solicitud."
          );
        }
      } else {
        console.log("No se recibió una respuesta válida de la API");
        Alert.alert("Error", "No se recibió una respuesta válida de la API.");
      }
    } catch (error) {
      console.log("Error al enviar solicitud:", error);
      Alert.alert("Error", "Ocurrió un error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const verificarSolicitudEnEspera = async () => {
    setLoading(true);
    try {
      const url = `fraccionamientos/SolicitarAcceso/verificar_solicitud/${id_usuario}`;
      const response = await APIManager({
        url: url,
        method: "GET",
      });
      console.log("Respuesta de la API de verificacion:", response);
      if (response.status) {
        if (response.id_status === "6") {
          setFraccionamientoEnEspera({
            fc_nombre: response.fraccionamiento,
            estatus: 6,
          });
        } else if (response.id_status === "8") {
          setFraccionamientoEnEspera({
            fc_nombre: response.fraccionamiento,
            estatus: 8,
          });
        } else if (response.id_status === "7") {
          console.log(
            "id_fraccionamientoclub:",
            response.id_fraccionamientoclub
          );
          navigation.navigate("ReservarFraccionamiento", {
            idFraccionamiento: response.id_fraccionamientoclub,
          });
        }
      }
    } catch (error) {
      console.log("Error al verificar la solicitud:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFraccionamientoSeleccionado = (item) => {
    console.log("Fraccionamiento seleccionado:", item); // Verifica que el 'item' tiene el ID correcto
    setSelectedFraccionamiento(item.id_fraccionamientoclub);
    setSelectedFraccionamientoNombre(item.fc_nombre); // Solo el nombre para mostrar
    setModalVisible(false);
    console.log("ID seleccionado:", item.id_fraccionamientoclub); // Verifica si el ID es correcto
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="SOLICITAR ACCESO" />
      {isFormVisible && !fraccionamientoEnEspera?.estatus ? (
        // Mostrar formulario solo si no hay solicitud en espera o si no tiene estatus 6 u 8
        <View style={styles.formContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => setModalVisible(true)}
            >
              <MaterialDesignIcons
                name="home-city-outline"
                size={24}
                color="#02B9FA"
              />
              <Text
                style={[
                  styles.selectorText,
                  selectedFraccionamientoNombre ===
                    "Seleccione un fraccionamiento" && { color: "#838080" },
                ]}
              >
                {selectedFraccionamientoNombre}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#02B9FA" />
            </TouchableOpacity>
          )}

          <MostrarDatos
            iconName="home-outline"
            placeholder="Casa/Departamento/Torre"
            value={casa}
            onChangeText={setCasa}
          />

          <MostrarDatos
            iconName="mail-outline"
            placeholder="N° Casa"
            value={numeroCasa}
            onChangeText={setNumeroCasa}
          />
          <CustomButton buttonText="Enviar" onPress={handleEnviar} />
        </View>
      ) : (
        // Mostrar mensaje si hay una solicitud pendiente (estatus 6 o 8)
        <View style={styles.messageContainer}>
          <MaterialIcons
            name="access-time"
            size={60}
            color="#02B9FA"
            style={styles.icon}
          />
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>
              {fraccionamientoEnEspera?.estatus === 6
                ? `Esperando a que el administrador acepte tu solicitud al Fraccionamiento “${fraccionamientoEnEspera.fc_nombre}”`
                : fraccionamientoEnEspera?.estatus === 8
                ? `Tu solicitud fue rechazada por el Fraccionamiento “${fraccionamientoEnEspera.fc_nombre}”`
                : ""}
            </Text>

            {fraccionamientoEnEspera?.estatus === 8 && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setFormVisible(true);
                  setFraccionamientoEnEspera(null); // Resetear el estado para mostrar el formulario
                }}
              >
                <Text style={styles.retryButtonText}>Solicitar acceso</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.containerBaner}>
        <BannerAd />
      </View>

      {/* MODAL DE SELECCIÓN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <FlatList
                  data={fraccionamientos}
                  style={{ width: "100%" }}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => {
                    const isSelected =
                      item.id_fraccionamientoclub === selectedFraccionamiento;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.modalOption,
                          isSelected && styles.modalOptionSelected,
                        ]}
                        onPress={() => handleFraccionamientoSeleccionado(item)}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            isSelected && styles.modalOptionTextSelected,
                          ]}
                        >
                          {item.fc_nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  retryButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#02B9FA",
    borderRadius: 8,
    alignSelf: "center", // Evita que el botón expanda su ancho
  },
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  icon: {
    padding: 8,
  },
  messageContent: {
    width: "80%",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2E2E2E",
  },
  formContainer: {
    marginTop: 20,
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  selectorContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#02B9FA",
    padding: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    height: 55,
  },
  selectorText: {
    color: "#808191",
    fontSize: 14,
    textAlign: "left",
    flex: 1,
    paddingLeft: 15,
  },
  messageContainer: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#02B9FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
  messageText: {
    color: "#838080",
    fontSize: 16,
    textAlign: "left",
    padding: 8,
    marginBottom: 10, // Espacio extra antes del botón
    flexShrink: 1, // Evita que el texto se oculte si el botón ocupa espacio
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
    borderWidth: 3,
    borderColor: "#02B9FA",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalOption: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // <-- Todas las pills ocupan el 100% del modal
    alignSelf: "center",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#808191",
    textAlign: "center",
    fontFamily: "Caveat",
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#02B9FA",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalCloseText: {
    color: "white",
    fontSize: 16,
  },
  modalOptionSelected: {
    backgroundColor: "#02B9FA", // Azul
    borderColor: "#02B9FA",
  },
  modalOptionTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AccesoFraccionamiento;
