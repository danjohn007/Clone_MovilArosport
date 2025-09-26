import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";

const CardJugadaPendiente = ({
  juego,
  fecha,
  hora,
  id_juego,
  solicitudes = [],
  onViewInfo,
  onPress,
}) => {
  // No renderizar si no hay solicitudes
  if (!solicitudes || solicitudes.length === 0) {
    return null;
  }

  return (
    <View style={styles.invitacionContainer}>
      {/* Encabezado con título y botón */}
      <View style={styles.header}>
        <Text
          style={styles.invitacionTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {juego}
        </Text>
        <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
          <Icon name="information-circle-outline" size={18} color="#fff" />
          <Text style={styles.detailsText}>DETALLES</Text>
        </TouchableOpacity>
      </View>

      {/* Información detallada */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color="#00baff" />
          <Text style={styles.infoText}>{fecha}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time-outline" size={16} color="#00baff" />
          <Text style={styles.infoText}>{hora}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="people-outline" size={16} color="#00baff" />
          <Text style={styles.infoText}>Solicitudes pendientes:</Text>
        </View>

        {/* Lista de solicitudes */}
        {solicitudes.map((solicitud, index) => (
          <TouchableOpacity
            key={solicitud.id_usuario || index}
            style={styles.solicitudRow}
            onPress={() => onViewInfo(solicitud.id_jugador, id_juego)}
            activeOpacity={0.7}
          >
            <Icon
              name="information-circle-outline"
              size={14}
              color="#00baff"
              style={styles.icon}
            />
            <Text style={styles.solicitudText}>
              {solicitud.us_nombre} ({solicitud.us_nomUsuario})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  invitacionContainer: {
    backgroundColor: "#ffffff",
    width: "95%",
    borderColor: "#00baff",
    borderWidth: 3,
    alignSelf: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  invitacionTitle: {
    fontSize: RFValue(14, 667),
    fontWeight: "700",
    color: "#00baff",
    flex: 1,
    marginRight: 10,
    marginTop: -15,
  },
  detailsButton: {
    backgroundColor: "#00bfff",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: -15,
    flexDirection: "row",
    alignItems: "center",
  },
  detailsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#838080",
    marginLeft: 8,
  },
  solicitudRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginLeft: 24,
  },
  icon: {
    marginRight: 8,
  },
  solicitudText: {
    fontSize: 13,
    color: "#838080",
    flex: 1,
  },
});

export default CardJugadaPendiente;
