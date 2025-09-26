import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

const ComponenteNotificaciones = ({
  id,
  titulo,
  descripcion,
  fechaHora, // asegúrate de que se pase esta prop en formato legible
  leida,
  onSwipeLeft,
  isSelected,
  onToggleSelect,
  modoSeleccion,
}) => {
  const formatearFechaHora = (timestamp) => {
    const fecha = new Date(timestamp * 1000);
    const ahora = new Date();

    const esHoy =
      fecha.getDate() === ahora.getDate() &&
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear();

    if (esHoy) {
      // Mostrar solo la hora
      return fecha.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      // Mostrar solo la fecha: dd/mm
      const dia = fecha.getDate().toString().padStart(2, "0");
      const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
      return `${dia}/${mes}`;
    }
  };

  console.log("fecha ", fechaHora);
  const renderRightActions = (progress, dragX) => {
    const opacity = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

        return (
          <Animated.View style={[styles.fullDeleteBackground, { opacity }]}> 
            <View style={styles.trashIconContainer}>
              <TouchableOpacity onPress={onSwipeLeft} style={{alignItems: 'center', justifyContent: 'center'}}>
                <Ionicons name="trash-outline" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
  };

  // Eliminar el emoji de campana (🔔) si está presente en el título
  const tituloSinCampana = typeof titulo === "string" ? titulo.replace(/\uD83D\uDD14|🔔/g, "").trim() : titulo;

  return (
    <Swipeable
      key={`swipe-${id}-${Math.random()}`}
      renderRightActions={renderRightActions}
    >
      <TouchableOpacity
        style={[
          styles.notificationContainer,
          isSelected && { backgroundColor: "#e0f2ff" },
        ]}
        onPress={onToggleSelect}
        activeOpacity={0.85}
      >
        <View style={styles.notificationContent}>
          {/* Icono a la izquierda */}
          {modoSeleccion || isSelected ? (
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark"
                size={28}
                color="#00BAFF"
              />
            </View>
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons
                name={leida ? "notifications-outline" : "notifications"}
                size={28}
                color={leida ? "#8cc2f1ff" : "#00bfff"}
              />
            </View>
          )}
          {(modoSeleccion || isSelected) && (
            <Checkbox
              value={isSelected}
              onValueChange={onToggleSelect}
              color={isSelected ? "#00bfff" : "#00bfff"}
              style={{ marginRight: 16, marginTop: 10, display: "none" }}
            />
          )}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text
                style={styles.titulo}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tituloSinCampana}
              </Text>
              <Text style={styles.fechaHora}>
                {formatearFechaHora(fechaHora)}
              </Text>
            </View>
            <Text
              style={[
                styles.descripcion,
                !leida && { fontWeight: "bold", color: "#222" },
                leida && { color: "#666" },
              ]}
              numberOfLines={3}
            >
              {descripcion}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  //Contenedor y fondo de la notificacion
  notificationContainer: {
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#00bfff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 7,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eaf8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  unreadDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#fff",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00BAFF",
    flexShrink: 1,
    marginRight: 8,
  },
  descripcion: {
    fontSize: 14,
    flex: 1,
    marginTop: 2,
    marginRight: 10,
    lineHeight: 19,
  },
  fechaHora: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginLeft: 8,
    minWidth: 48,
  },
  fullDeleteBackground: {
    backgroundColor: "#C70039",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: '90%',
    marginVertical: 5,
    borderRadius: 16,
  },
  trashIconContainer: {
    justifyContent: "space-around",
    height: '100%',
    width: 50,
  },
});

export default ComponenteNotificaciones;
