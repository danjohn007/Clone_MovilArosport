import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import * as Location from "expo-location";
import { obtenerDireccionFormateadaPerfil } from "../config/googleGeocoding";
import APIManager from "../componentes/API/APIManager.jsx";
import { obtenerEstadoYPaisDesdeCoordenadas } from "../config/googleGeocoding";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UbicacionPerfil = ({
  visible,
  closeModal,
  ubicacionUsuario,
  onUbicacionCambiada,
  // 🆕 Nuevas props
  modo = "perfil", // "perfil" o "jugada"
  titulo = "UBICACIÓN",
  guardarEnBD = true, // true para perfil, false para jugada
}) => {
  const [loading, setLoading] = useState(true);
  const [ubicacion, setUbicacion] = useState(ubicacionUsuario);
  const [direccionActual, setDireccionActual] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (ubicacionUsuario) {
      setUbicacion(ubicacionUsuario);
      setDireccionActual(
        ubicacionUsuario.direccion_completa || "Ubicación no disponible"
      );
      setLoading(false);
    } else {
      // 🆕 Si no hay ubicación inicial, obtener ubicación actual
      obtenerUbicacionActual();
    }
  }, [ubicacionUsuario]);

  const handleMarkerDragEnd = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setDireccionActual("Obteniendo dirección...");
    const nuevaUbicacion = {
      latitude,
      longitude,
      direccion_completa: "Obteniendo dirección...",
    };
    setUbicacion(nuevaUbicacion);

    try {
      const direccionFormateada = await obtenerDireccionFormateadaPerfil(
        latitude,
        longitude
      );

      const ubicacionFinal = {
        latitude,
        longitude,
        direccion_completa:
          direccionFormateada || "No se pudo obtener la dirección",
      };
      setUbicacion(ubicacionFinal);
      setDireccionActual(
        direccionFormateada || "No se pudo obtener la dirección"
      );
      onUbicacionCambiada(ubicacionFinal);
    } catch (error) {
      console.log("Error al obtener la dirección:", error);
      setDireccionActual("Error al obtener la dirección");
    }
  };

  const obtenerUbicacionActual = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de ubicación denegado");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const { latitude, longitude } = location.coords;
      setDireccionActual("Obteniendo dirección...");

      const direccionFormateada = await obtenerDireccionFormateadaPerfil(
        latitude,
        longitude
      );

      // 🆕 Solo guardar estado y país en AsyncStorage para modo perfil
      if (modo === "perfil") {
        const { estado, pais } = await obtenerEstadoYPaisDesdeCoordenadas(
          latitude,
          longitude,
          "usuario"
        );

        if (estado) await AsyncStorage.setItem("estado_usuario", estado);
        if (pais) await AsyncStorage.setItem("pais_usuario", pais);
      }

      const nuevaUbicacion = {
        latitude,
        longitude,
        direccion_completa:
          direccionFormateada || "No se pudo obtener la dirección",
      };

      setUbicacion(nuevaUbicacion);
      setDireccionActual(
        direccionFormateada || "No se pudo obtener la dirección"
      );
      onUbicacionCambiada(nuevaUbicacion);
    } catch (error) {
      console.log("Error al obtener la ubicación actual:", error);
      setDireccionActual("Error al obtener la ubicación");
    } finally {
      setLoading(false);
    }
  };

  // Función modificada para manejar guardado según el modo
  const handleCambiarUbicacion = async () => {
    if (modo === "jugada") {
      // Para jugadas, solo cerrar el modal sin guardar en BD
      Alert.alert(
        "Ubicación seleccionada",
        "La ubicación se ha agregado a tu jugada.",
        [{ text: "OK", onPress: closeModal }]
      );
      return;
    }

    // Para perfil, guardar en BD como antes
    try {
      setIsSaving(true);
      const response = await guardarDireccionAutomaticamente(
        ubicacion.latitude,
        ubicacion.longitude,
        direccionActual
      );

      if (response?.status === true) {
        Alert.alert(
          "Ubicación actualizada",
          "Tu ubicación se guardó correctamente.",
          [{ text: "OK", onPress: closeModal }]
        );
      } else {
        Alert.alert(
          "Atención",
          "No se pudo actualizar tu ubicación. Inténtalo de nuevo."
        );
      }
    } catch (error) {
      console.log("Error guardando dirección:", error);
      Alert.alert("Atención", "Ocurrió un error al guardar tu ubicación.");
    } finally {
      setIsSaving(false);
    }
  };

  const guardarDireccionAutomaticamente = async (
    latitude,
    longitude,
    direccionCompleta
  ) => {
    try {
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

      const response = await APIManager({
        url: `Perfil/update_direccion`,
        method: "POST",
        data: dataDireccion,
      });

      return response;
    } catch (error) {
      console.log("Error guardando dirección:", error);
      return { status: false };
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{titulo}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#00baff" />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#00baff" />
            ) : ubicacion ? (
              <>
                {modo === "jugada" && (
                  <View style={styles.sectionContainer}>
                    <Text style={[styles.direccionText, { textAlign: "center" }]}>
                      Manten presionado el marcador para moverlo
                    </Text>
                  </View>
                )}

                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: ubicacion.latitude,
                    longitude: ubicacion.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsUserLocation={true}
                >
                  <Marker
                    coordinate={{
                      latitude: ubicacion.latitude,
                      longitude: ubicacion.longitude,
                    }}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                    title={modo === "jugada" ? "Ubicación de la jugada" : "Tu ubicación"}
                  />
                </MapView>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>
                    {modo === "jugada" ? "DIRECCIÓN DE LA JUGADA" : "DIRECCIÓN ACTUAL"}
                  </Text>
                  <Text style={styles.direccionText}>{direccionActual}</Text>
                </View>

                <TouchableOpacity
                  style={styles.currentLocationButton}
                  onPress={obtenerUbicacionActual}
                >
                  <Icon name="locate-outline" size={20} color="#00baff" />
                  <Text style={styles.currentLocationText}>
                    {modo === "jugada" 
                      ? "Usar mi ubicación actual" 
                      : "Usar mi ubicación actual"
                    }
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.errorText}>
                No se pudo cargar la ubicación
              </Text>
            )}
          </ScrollView>

          {/* Footer con botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCambiarUbicacion}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {modo === "jugada" ? "SELECCIONAR" : "GUARDAR"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 🆕 Estilos actualizados con los nuevos componentes
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00baff",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  map: {
    height: 200,
    width: "100%",
    borderRadius: 8,
    marginBottom: 16,
  },
  direccionText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  currentLocationButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    color: "#00baff",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#00baff",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "#c70039",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 16,
  },
});

export default UbicacionPerfil;