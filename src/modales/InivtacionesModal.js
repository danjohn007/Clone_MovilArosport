import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";

// Helper functions (same as before)
const getNivelLabel = (id) => {
  switch (Number(id)) {
    case 1:
      return "Open";
    case 2:
      return "Primera";
    case 3:
      return "Segunda";
    case 4:
      return "Tercera";
    case 5:
      return "Cuarta";
    case 6:
      return "Quinta";
    case 7:
      return "Libre";
    default:
      return id ? `Nivel ${id}` : "No especificado";
  }
};

const getNivelColor = (id) => {
  switch (Number(id)) {
    case 1:
      return "#FF9800";
    case 2:
      return "#F44336";
    case 3:
      return "#9C27B0";
    case 4:
      return "#2196F3";
    case 5:
      return "#4CAF50";
    case 6:
      return "#795548";
    case 7:
      return "#607D8B";
    default:
      return "#00BAFF";
  }
};

const getNivelDescription = (id) => {
  switch (Number(id)) {
    case 1:
      return "Nivel más alto. Jugadores con experiencia profesional o competitiva avanzada.";
    case 2:
      return "Jugadores con muy buen nivel técnico y experiencia en torneos.";
    case 3:
      return "Buen nivel técnico y táctico, varios años de experiencia.";
    case 4:
      return "Nivel intermedio, jugadores con conocimientos y práctica regular.";
    case 5:
      return "Nivel básico-intermedio, práctica ocasional.";
    case 6:
      return "Nivel básico, jugadores principiantes con poca experiencia.";
    case 7:
      return "Todas las categorías pueden participar sin restricción de nivel.";
    default:
      return "Información no disponible para este nivel.";
  }
};

const InvitacionesModal = ({
  visible,
  closeModal,
  data,
  onAceptar,
  onRechazar,
  mostrarFooter = true,
}) => {
  const [showNivelInfo, setShowNivelInfo] = useState(false);

  const toggleNivelInfo = () => setShowNivelInfo(!showNivelInfo);

  const handleAccept = () => {
    if (onAceptar && data?.id_juego) {
      onAceptar(data.id_juego);
      closeModal();
    }
  };

  const handleReject = () => {
    if (onRechazar) {
      onRechazar();
      closeModal();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Encabezado */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>INVITACIÓN DE JUEGO</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#00baff" />
            </TouchableOpacity>
          </View>

          {/* Contenido con scroll */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>UBICACIÓN</Text>
              {data?.latitud && data?.longitud ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: parseFloat(data.latitud),
                    longitude: parseFloat(data.longitud),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(data.latitud),
                      longitude: parseFloat(data.longitud),
                    }}
                    title={data.nombre_club || data.nombre || "Ubicación"}
                    description={
                      data.calle && data.colonia
                        ? `${data.calle}${data.num_ext ? ` ${data.num_ext}` : ""}, ${data.colonia}`
                        : ""
                    }
                  />
                </MapView>
              ) : (
                <Text style={styles.errorText}>
                  No hay ubicación disponible
                </Text>
              )}
            </View>

            {/* Detalles de dirección */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>DETALLES</Text>

              <View style={styles.detailRow}>
                <Icon name="tennisball-outline" size={16} color="#00baff" />
                <Text style={styles.detailLabel}>Nombre:</Text>
                <Text style={styles.detailValue}>{data?.nombre || "-"}</Text>
              </View>

              {data?.nombre_club && (
                <View style={styles.detailRow}>
                  <Icon name="business-outline" size={16} color="#00baff" />
                  <Text style={styles.detailLabel}>Club:</Text>
                  <Text style={styles.detailValue}>{data.nombre_club}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Icon name="location-outline" size={16} color="#00baff" />
                <Text style={styles.detailLabel}>Dirección:</Text>
                <Text style={styles.detailValue}>
                  {data?.calle && data?.colonia && data?.cp
                    ? `${data.calle}${data.num_ext ? ` ${data.num_ext}` : ""}, ${data.colonia}, CP ${data.cp}`
                    : "No hay dirección disponible"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Icon name="trophy-outline" size={16} color="#00baff" />
                <Text style={styles.detailLabel}>Categoria:</Text>
                <TouchableOpacity onPress={toggleNivelInfo}>
                  <Text style={styles.detailValue}>{data?.categoria || "-"}</Text>
                </TouchableOpacity>
              </View>

              {showNivelInfo && (
                <View
                  style={[
                    styles.infoContainer,
                    { borderLeftColor: getNivelColor(data?.id_categoria) },
                  ]}
                >
                  <Text style={styles.infoTitle}>
                    {getNivelLabel(data?.id_categoria)}
                  </Text>
                  <Text style={styles.infoText}>
                    {getNivelDescription(data?.id_categoria)}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Icon name="list-outline" size={16} color="#00baff" />
                <Text style={styles.detailLabel}>Modalidad:</Text>
                <Text style={styles.detailValue}>{data?.modalidad_nombre || "-"}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          {mostrarFooter && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleReject}
                activeOpacity={0.8}
              >
                <Icon name="close-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>RECHAZAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAccept}
                activeOpacity={0.8}
              >
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>ACEPTAR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Estilo base del modal
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

  // Encabezado
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

  // Contenido
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Secciones
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

  // Mapa
  map: {
    height: 200,
    width: "100%",
    borderRadius: 8,
    marginBottom: 8,
  },

  // Filas de detalle
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: RFValue(10, 667),
    fontWeight: "500",
    color: "#64748b",
    marginLeft: 8,
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "400",
    color: "#838080",
    flex: 1,
  },

  // Contenedor de información de nivel
  infoContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  infoText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },

  // Botones
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  acceptButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c70039",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Error
  errorText: {
    color: "#c70039",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 16,
  },
});

export default InvitacionesModal;