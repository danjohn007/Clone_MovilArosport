import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import colors from "../styles/colors";

const ModalUnirmeJugadaaPublica = ({
  visible,
  closeModal,
  data,
  ubicacion,
  onSolicitarUnirme,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        {/* Encabezado */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>DETALLE DE JUGADA</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeModal}
            activeOpacity={0.7}
          >
            <Icon name="close" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>UBICACIÓN</Text>
            {ubicacion?.latitud && ubicacion?.longitud ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: parseFloat(ubicacion.latitud),
                  longitude: parseFloat(ubicacion.longitud),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(ubicacion.latitud),
                    longitude: parseFloat(ubicacion.longitud),
                  }}
                  title={ubicacion.nombre_club || data?.nombre || "Ubicación"}
                  description={
                    ubicacion.calle && ubicacion.colonia
                      ? `${ubicacion.calle}${ubicacion.num_ext ? ` ${ubicacion.num_ext}` : ""}, ${ubicacion.colonia}`
                      : ""
                  }
                />
              </MapView>
            ) : (
              <Text style={styles.errorText}>No hay ubicación disponible</Text>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>DETALLES</Text>

            <View style={styles.detailRow}>
              <Icon name="tennisball-outline" size={16} color={colors.primary} />
              <Text style={styles.detailLabel}>Nombre:</Text>
              <Text style={styles.detailValue}>{data?.nombre || "-"}</Text>
            </View>

            {ubicacion?.nombre_club && (
              <View style={styles.detailRow}>
                <Icon name="business-outline" size={16} color={colors.primary} />
                <Text style={styles.detailLabel}>Club:</Text>
                <Text style={styles.detailValue}>{ubicacion.nombre_club}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Icon name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.detailLabel}>Dirección:</Text>
              <Text style={styles.detailValue}>
                {ubicacion?.calle && ubicacion?.colonia && ubicacion?.cp
                  ? `${ubicacion.calle}${ubicacion.num_ext ? ` ${ubicacion.num_ext}` : ""}, ${ubicacion.colonia}, CP ${ubicacion.cp}`
                  : "No hay dirección disponible"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="trophy-outline" size={16} color={colors.primary} />
              <Text style={styles.detailLabel}>Categoría:</Text>
              <Text style={styles.detailValue}>{data?.categoria || "-"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="list-outline" size={16} color={colors.primary} />
              <Text style={styles.detailLabel}>Modalidad:</Text>
              <Text style={styles.detailValue}>{data?.modo_juego || "-"}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onSolicitarUnirme}
            activeOpacity={0.8}
          >
            <Icon name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>SOLICITAR UNIRME</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

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
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    flex: 1,
    textTransform: "uppercase",
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
    color: colors.primary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  map: {
    height: 200,
    width: "100%",
    borderRadius: 8,
    marginBottom: 8,
  },
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
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    textTransform: "uppercase",
  },
});

export default ModalUnirmeJugadaaPublica;