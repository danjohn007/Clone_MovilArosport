import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons"; // Asegúrate de instalar expo/vector-icons o react-native-vector-icons
import Icon from "react-native-vector-icons/Ionicons";

const CardSolicitudes = ({ gameName, date, user, time, status }) => {
  return (
    <View style={styles.card}>
      <View style={styles.gameTitleContainer}>
        <Text style={styles.gameTitle}>{gameName}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} style={styles.icon} />
          <Text style={styles.value}>{date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} style={styles.icon} />
          <Text style={styles.value}>{user}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} style={styles.icon} />
          <Text style={styles.value}>{time}</Text>
        </View>
      </View>

      <View style={[
        styles.statusContainer, 
        status === "confirmed" ? styles.confirmedStatus : styles.pendingStatus
      ]}>
        {status === "confirmed" ? (
          <>
            <MaterialIcons name="check-circle-outline" size={21} color="#4CAF50" />
            <Text style={styles.confirmationText}>CONFIRMÓ ASISTENCIA</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="remove-circle-outline" size={21} color="#FFC107" />
            <Text style={styles.pendingText}>PENDIENTE POR CONFIRMAR</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderColor: "#00AEEF",
    borderWidth: 3,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameTitleContainer: {
    width: "100%",
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#EEE",
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "colors.primary",
  },
  detailsContainer: {
    width: "100%",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center", 
    width: "100%",
    marginVertical: 2,
    marginLeft: 18,
  },
  label: {
    fontSize: 15,
    color: "colors.primary",
    marginRight: 10,
  },
  value: {
    fontSize: 15,
    color: "#555",
  },
  icon: {
    marginRight: 5,
    color: "colors.primary",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
  },
  confirmedStatus: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  pendingStatus: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
  },
  confirmationText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  pendingText: {
    color: "#FFC107",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default CardSolicitudes;
