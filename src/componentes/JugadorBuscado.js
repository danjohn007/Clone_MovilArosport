import React from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import Icono from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from "react-native";
import URL from "../Helper/URL";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const colors = {
  azulMarino: "colors.primary",
  blanco: "#fff",
  grisTexto: "#808191"
};

const JugadorDetalle = ({ datos }) => {
  if (!datos) return null;
  const BASE_URL = URL.IMAGENES;

  return (
    <View style={styles.profileHeaderContainer}>
      {/* Sección 1: Foto de perfil */}
      <View style={styles.profileImageWrapper}>
        {datos.us_foto ? (
          <Image
            style={styles.profileHeaderImage}
            resizeMode="cover"
            source={
              datos.us_foto
              ? { uri: datos.us_foto.startsWith('http') ? datos.us_foto : BASE_URL + 'profiles/' + datos.us_foto }
              : require("../../assets/icon_no_profile.png")
            }
          />
        ) : (
          <View style={[styles.profileHeaderImage, styles.avatarPlaceholder]}>
            <Text style={styles.placeholderText}>Sin foto</Text>
          </View>
        )}
      </View>

      {/* Sección 2: Nombre y stats en 3 filas x 2 columnas */}
      <View style={styles.profileInfoCenter}>
        <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
          {datos.us_nombre}
        </Text>
        
        {/* Fila 1: Puntos y Partidos */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icono name="trophy-outline" size={14} color={colors.azulMarino} />
            <Text style={styles.statText}>{datos.jug_puntos} pts</Text>
          </View>
          <View style={styles.statItem}>
            <Icono name="podium-outline" size={14} color={colors.azulMarino} />
            <Text style={styles.statText}>{datos.num_partidos} partidos</Text>
          </View>
        </View>

        {/* Fila 2: Género y Categoría */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icono name="person-outline" size={14} color={colors.azulMarino} />
            <Text style={styles.statText}>{datos.genero || '-'}</Text>
          </View>
          <View style={styles.statItem}>
            <Icono name="list-outline" size={14} color={colors.azulMarino} />
            <Text style={styles.statText}>{datos.categoria || '-'}</Text>
          </View>
        </View>

        {/* Fila 3: País y Estado */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icono name="flag-outline" size={14} color={colors.azulMarino} />
            <Text style={styles.statText}>{datos.pais || '-'}</Text>
          </View>
          <View style={styles.statItem}>
            <Icono name="location-outline" size={14} color={colors.azulMarino} />
            <Text style={styles.statText}>{datos.estado || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Sección 3: Círculo de posición */}
      <View style={styles.rankingCircleBig}>
        <Text style={styles.rankingNumberBig}>
          {datos.ranking ? datos.ranking : "-"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeaderContainer: {
    backgroundColor: colors.blanco,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.azulMarino,
    padding: scale(10),
    marginBottom: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "95%",
    alignSelf: "center",
    minHeight: scale(100), // Aumentado para 3 filas
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
    minWidth: 120, // Aumentado para 2 columnas
  },
  profileName: {
    fontSize: RFValue(14, 667),
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    color: colors.grisTexto,
    textAlign: "center",
    marginBottom: scale(6),
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
    minWidth: 0, // Permite compresión
    paddingHorizontal: scale(2),
  },
  statText: {
    fontSize: RFValue(10, 667), // Reducido para más espacio
    fontFamily: "Poppins-Regular",
    color: colors.grisTexto,
    marginLeft: scale(2),
    flexShrink: 1, // Permite ajuste de texto
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
});

export default JugadorDetalle;