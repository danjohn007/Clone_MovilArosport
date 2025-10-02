import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import URL from "../Helper/URL";
import colors from "../styles/colors";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const colors = {
  azulMarino: colors.primary,
  blanco: "#fff",
  grisTexto: "#808191",
};

const JugadorModal = ({
  visible,
  closeModal,
  data,
  idJuego,
  onAceptar,
  onRechazar,
  jugadorLoading,
  mostrarAcciones = true,
}) => {
  const BASE_URL = URL.IMAGENES;

  const handleAccept = () => {
    if (onAceptar && idJuego && data.id_jugador) {
      onAceptar(idJuego, data.id_jugador);
    }
  };

  const handleReject = () => {
    if (onRechazar && idJuego && data.id_jugador) {
      onRechazar(idJuego, data.id_jugador);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Encabezado */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>INFORMACIÓN DEL JUGADOR</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <View style={styles.modalContent}>
            {jugadorLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loader}
              />
            ) : !data ||
              typeof data !== "object" ||
              Object.keys(data).length === 0 ? (
              <Text style={styles.errorText}>No hay datos disponibles</Text>
            ) : (
              <View style={styles.profileHeaderContainer}>
                {/* Sección 1: Foto de perfil */}
                <View style={styles.profileImageWrapper}>
                  {data.us_foto ? (
                    <Image
                      style={styles.profileHeaderImage}
                      resizeMode="cover"
                      source={
                        data.us_foto
                          ? {
                              uri: data.us_foto.startsWith("http")
                                ? data.us_foto
                                : `${BASE_URL}profiles/${data.us_foto}`,
                            }
                          : require("../../assets/icon_no_profile.png")
                      }
                    />
                  ) : (
                    <View
                      style={[
                        styles.profileHeaderImage,
                        styles.avatarPlaceholder,
                      ]}
                    >
                      <Text style={styles.placeholderText}>Sin foto</Text>
                    </View>
                  )}
                </View>

                {/* Sección 2: Nombre y stats en 3 filas x 2 columnas */}
                <View style={styles.profileInfoCenter}>
                  <Text
                    style={styles.profileName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {data.us_nombre || "N/A"}
                  </Text>

                  {/* Fila 1: Puntos y Partidos */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Icon
                        name="trophy-outline"
                        size={14}
                        color={colors.azulMarino}
                      />
                      <Text style={styles.statText}>
                        {data.jug_puntos || "-"} pts
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon
                        name="podium-outline"
                        size={14}
                        color={colors.azulMarino}
                      />
                      <Text style={styles.statText}>
                        {data.num_partidos || "-"} partidos
                      </Text>
                    </View>
                  </View>

                  {/* Fila 2: Género y Categoría */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Icon
                        name="person-outline"
                        size={14}
                        color={colors.azulMarino}
                      />
                      <Text style={styles.statText}>{data.genero || "-"}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon
                        name="list-outline"
                        size={14}
                        color={colors.azulMarino}
                      />
                      <Text style={styles.statText}>
                        {data.categoria || "-"}
                      </Text>
                    </View>
                  </View>

                  {/* Fila 3: País y Estado */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Icon
                        name="flag-outline"
                        size={14}
                        color={colors.azulMarino}
                      />
                      <Text style={styles.statText}>{data.pais || "-"}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon
                        name="location-outline"
                        size={14}
                        color={colors.azulMarino}
                      />
                      <Text style={styles.statText}>{data.estado || "-"}</Text>
                    </View>
                  </View>
                </View>

                {/* Sección 3: Círculo de posición */}
                <View style={styles.rankingCircleBig}>
                  <Text style={styles.rankingNumberBig}>
                    {data.ranking || "-"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Botones de acción */}
          {mostrarAcciones && (
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
    borderColor: colors.primary,
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
    fontSize: RFValue(14, 667),
    fontWeight: "700",
    color: colors.primary,
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
  profileHeaderContainer: {
    backgroundColor: colors.blanco,
    marginBottom: scale(10),
    marginTop: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    alignSelf: "center",
    minHeight: scale(100),
  },
  profileImageWrapper: {
    width: "18%",
    aspectRatio: 1,
    minWidth: 50,
  },
  profileHeaderImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.azulMarino,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaeaea",
  },
  placeholderText: {
    fontSize: RFValue(10, 667),
    fontFamily: "Poppins-Regular",
    color: "#aaa",
  },
  profileInfoCenter: {
    flex: 1,
    marginHorizontal: scale(10),
    minWidth: 120,
  },
  profileName: {
    fontSize: RFValue(14, 667),
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    color: colors.grisTexto,
    textAlign: "center",
    marginBottom: scale(12),
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(4),
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    paddingHorizontal: scale(2),
  },
  statText: {
    fontSize: RFValue(10, 667),
    fontFamily: "Poppins-Regular",
    color: colors.grisTexto,
    marginLeft: scale(2),
    flexShrink: 1,
  },
  rankingCircleBig: {
    width: "12%",
    aspectRatio: 1,
    minWidth: 50,
    borderRadius: 999,
    backgroundColor: colors.azulMarino,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.blanco,
  },
  rankingNumberBig: {
    color: colors.blanco,
    fontSize: RFValue(16, 667),
    fontFamily: "Poppins-Bold",
    textAlign: "center",
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
  acceptButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.error,
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
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
    marginVertical: 16,
  },
  loader: {
    marginVertical: 16,
  },
});

export default JugadorModal;
