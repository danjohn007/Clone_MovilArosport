import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import CustomButton from "../componentes/Buttons";
import { Ionicons } from "@expo/vector-icons"; // Importación nueva
import APIManager from "../componentes/API/APIManager";

const Ubicacion = ({ visible, closeModal, id, tipo = "fraccionamiento" }) => {
  const [direccion, setDireccion] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUbicacion = async () => {
    try {
      setLoading(true);
      console.log(`Fetching data for ID: ${id}`); // Debugging log
      const res = await APIManager({
        url: `Club/Reservas/obtenerDireccion/${id}/${tipo}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", res); // Debugging log
      if (res && Array.isArray(res)) {
        setDireccion(res[0]); // Assuming the response is an array
      } else {
        setDireccion(null); // In case the response structure is not as expected
      }
    } catch (error) {
      console.log("Error al obtener la ubicación:", error);
      setDireccion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && visible) {
      fetchUbicacion();
    }
  }, [id, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>UBICACIÓN</Text>
            <TouchableOpacity
              style={styles.closeButtonHeader}
              onPress={closeModal}
            >
              <Ionicons name="close" size={24} color="#00baff" />
            </TouchableOpacity>
          </View>

          {/* Contenedor principal con mayor separación */}
          <View style={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00baff" />
              </View>
            ) : direccion ? (
              <>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: parseFloat(direccion.latitud),
                    longitude: parseFloat(direccion.longitud),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(direccion.latitud),
                      longitude: parseFloat(direccion.longitud),
                    }}
                    title={direccion.descripcion}
                  />
                </MapView>
                <View
                  style={[
                    styles.direccionRow,
                    { justifyContent: "center", alignItems: "center" },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#00baff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.direccionLabel}>Dirección:</Text>
                  <Text style={styles.direccionValor}>
                    {direccion
                      ? `${direccion.calle} ${direccion.num_ext}, ${direccion.colonia}, CP ${direccion.cp}`
                      : "No hay dirección disponible."}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  No hay ubicación disponible
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "95%",
    maxWidth: 500,
    maxHeight: "90%",
    borderWidth: 3,
    borderColor: "#00baff",
    overflow: "hidden",
    paddingBottom: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    marginLeft: 24,
  },
  closeButtonHeader: {
    padding: 4,
  },

  contentContainer: {
    paddingTop: 20,
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  map: {
    width: "95%",
    height: 300,
    marginTop: 15,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
  direccionContainer: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    elevation: 3,
    marginBottom: 16,
    marginTop: 15,
  },
  direccionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: {
    color: "#c70039",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
  errorIcon: {
    marginRight: 6,
  },
  closeButton: {
    backgroundColor: "#C9C9C9",
    paddingVertical: 12,
    borderRadius: 10,
    width: "60%",
    alignSelf: "center",
    marginBottom: 16,
    marginTop: 10, // Espacio sobre el botón
  },
  direccionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
  },
  direccionLabel: {
    color: "#64748b",
    fontSize: 13,
    marginRight: 14,
    fontWeight: "500",
  },
  direccionValor: {
    color: "#838080",
    fontSize: 13,
    flexShrink: 1,
    fontWeight: "400",
  },
});

export default Ubicacion;
