import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import URL from "../Helper/URL";
import { useFocusEffect } from "@react-navigation/native";
import APIManager from "../componentes/API/APIManager.jsx";
import Icono from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const colors = {
  azulMarino: "colors.primary",
  blanco: "#fff",
};

const ProfileChip = ({ num_ranking, userData }) => {
  const BASE_URL = URL.IMAGENES;
  const [imagen, setImagen] = useState("");
  const [nombre, setNombre] = useState("");
  const [ranging, setRanging] = useState("");
  const [userRanking, setUserRanking] = useState(num_ranking);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numPartidos, setNumPartidos] = useState(0);

  // Obtener el ID del usuario desde AsyncStorage
  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("id_usuario");
      if (id) {
        setUserId(id);
      }
    } catch (err) {
      console.log("Error al obtener ID del usuario:", err);
    }
  };

  // Si no se proporcionó num_ranking, buscar el ranking del usuario
  const fetchUserRanking = async () => {
    if (num_ranking) return;
    try {
      if (!userId) return;
      const response = await APIManager({
        url: `/ranking/FiltroRanking/get_filtroRankings?id_usuario=${userId}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response && Array.isArray(response)) {
        const currentUserRanking = response.find(
          (item) => String(item.id_usuario) === String(userId)
        );
        if (currentUserRanking) {
          setUserRanking(currentUserRanking.num_ranking);
        }
      }
    } catch (err) {
      console.log("Error al obtener ranking del usuario:", err);
    }
  };

  const getDatos = async () => {
    setLoading(true);
    const res = await APIManager({
      url: "Perfil/get_info",
      method: "get",
    });
    setNombre(res.data.nombre);
    setImagen(res.data.us_foto);
    setRanging(res.data.jug_puntos);
    setNumPartidos(res.data.num_partidos || 0);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getDatos();
      getUserId();
    }, [])
  );

  useEffect(() => {
    if (userId && !num_ranking) {
      fetchUserRanking();
    }
  }, [userId, num_ranking]);

  // Si se pasa userData, usarlo directamente
  if (userData) {
    return (
      <View style={styles.profileHeaderContainer}>
        {/* Sección 1: Foto de perfil */}
        <View style={styles.profileImageWrapper}>
          <Image
            style={styles.profileHeaderImage}
            resizeMode="cover"
            source={
              userData.us_foto
                ? { uri: userData.us_foto.startsWith('http') ? userData.us_foto : BASE_URL + 'profiles/' + userData.us_foto }
                : require("../../assets/icon_no_profile.png")
            }
          />
        </View>
        {/* Sección 2: Nombre y stats */}
        <View style={styles.profileInfoCenter}>
          <Text style={styles.profileName} allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail">
            {userData.us_nombre}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icono name="trophy-outline" size={16} color={colors.azulMarino} />
              <Text style={styles.statText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail">
                {userData.jug_puntos} pts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icono name="podium-outline" size={16} color={colors.azulMarino} />
              <Text style={styles.statText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail">
                {userData.num_partidos} partidos
              </Text>
            </View>
          </View>
        </View>
        {/* Sección 3: Círculo de posición */}
        <View style={styles.rankingCircleBig}>
          <Text style={styles.rankingNumberBig} allowFontScaling={false}>
            {userData.ranking ? userData.ranking : "-"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.profileHeaderContainer}>
        {/* Sección 1: Foto de perfil con botón de edición */}
        <View style={styles.profileImageWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.azulMarino} />
          ) : (
            <Image
              style={styles.profileHeaderImage}
              resizeMode="cover"
              source={
                imagen
                  ? { uri: `${BASE_URL}profiles/${imagen}` }
                  : require("../../assets/icon_no_profile.png")
              }
            />
          )} 
        </View>

        {/* Sección 2: Nombre y stats (centro) */}
        <View style={styles.profileInfoCenter}>
          <Text
            style={styles.profileName}
            allowFontScaling={false}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {nombre}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icono
                name="trophy-outline"
                size={16}
                color={colors.azulMarino}
              />
              <Text
                style={styles.statText}
                allowFontScaling={false}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {ranging} pts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icono
                name="podium-outline"
                size={16}
                color={colors.azulMarino}
              />
              <Text
                style={styles.statText}
                allowFontScaling={false}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {numPartidos} partidos
              </Text>
            </View>
          </View>
        </View>

        {/* Sección 3: Círculo de posición (derecha) */}
        <View style={styles.rankingCircleBig}>
          <Text style={styles.rankingNumberBig} allowFontScaling={false}>
            {userRanking ? userRanking : "-"}
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
    minHeight: scale(80),
  },
  profileImageWrapper: {
    width: "20%",
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
  profileInfoCenter: {
    flex: 1,
    marginHorizontal: scale(10),
    minWidth: 100,
  },
  profileName: {
    fontSize: RFValue(14, 667),
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    color: "#808191",
    textAlign: "center",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(15),
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  statText: {
    fontSize: RFValue(11, 667),
    fontFamily: "Poppins-Regular",
    color: "#808191",
    marginLeft: 4,
  },
  rankingCircleBig: {
    width: "10%",
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
    fontSize: RFValue(18, 667),
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
});

export default ProfileChip;
