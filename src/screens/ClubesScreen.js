import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Logo from "../componentes/Logo";
import Titulo from "../componentes/Titulo";
import ClubCard from "../componentes/ClubCard";
import BannerAd from "../componentes/BannerAd";
import SearchBarClubes from "../componentes/SearchBarClubes";
import APIManager from "../componentes/API/APIManager";
import URL from "../Helper/URL";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ClubesScreen = () => {
  const navigation = useNavigation();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState(false);
  const [coordenadas, setCoordenadas] = useState(null);
  const [clubSeleccionado, setClubSeleccionado] = useState(null);
  const [clearSearch, setClearSearch] = useState(false);
  const BASE_URL = URL.imagen;

  // Calcula la distancia entre dos puntos en metros usando la fórmula de Haversine
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Obtiene o solicita las coordenadas del usuario
  const verificarYObtenerCoordenadas = async () => {
    try {
      const storedCoords = await AsyncStorage.getItem("coordenadas_usuario");
      if (storedCoords) {
        const parsedCoords = JSON.parse(storedCoords);
        console.log(
          `📍 Coordenadas recuperadas de AsyncStorage: ${parsedCoords.latitude}, ${parsedCoords.longitude}`
        );
        return parsedCoords;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de ubicación denegado");
        setErrorUbicacion(true);
        return null;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log(`📍 Coordenadas nuevas obtenidas: ${latitude}, ${longitude}`);
      const newCoords = { latitude, longitude };
      await AsyncStorage.setItem(
        "coordenadas_usuario",
        JSON.stringify(newCoords)
      );
      return newCoords;
    } catch (error) {
      console.log("Error al obtener o almacenar coordenadas:", error);
      setErrorUbicacion(true);
      return null;
    }
  };

  // Obtiene los clubes desde la API mostrar_clubs
  const fetchClubs = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      let coords = coordenadas;
      if (!coords) {
        coords = await verificarYObtenerCoordenadas();
        if (
          coords &&
          coordenadas &&
          calcularDistancia(
            coordenadas.latitude,
            coordenadas.longitude,
            coords.latitude,
            coords.longitude
          ) < 100
        ) {
          console.log("📍 Usando coordenadas cacheadas en memoria");
          coords = coordenadas;
        } else {
          setCoordenadas(coords);
        }
      }
      let params = "";
      if (coords && !errorUbicacion) {
        params = `?latitud_usuario=${coords.latitude}&longitud_usuario=${coords.longitude}`;
      }
      const res = await APIManager({
        url: `Club/Club/mostrar_clubs${params}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("Clubes recibidos de la API (ubicación):", res);
      setClubs(res || []);
    } catch (error) {
      console.log("❗ Error al obtener los clubes:", error);
      setClubs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Maneja la selección de un club desde SearchBarClubes
  const handleClubSeleccionado = (club) => {
    setClubSeleccionado(club);
    if (club) {
      setClubs([club]);
    } else {
      // Recargar clubes por ubicación cuando se limpia la búsqueda
      fetchClubs();
    }
  };

  // Maneja el refresco de la lista
  const handleRefresh = useCallback(async () => {
    setClearSearch(true);
    setClubSeleccionado(null);
    await fetchClubs(true);
  }, [coordenadas, errorUbicacion]);

  // Carga inicial de clubes
  useEffect(() => {
    fetchClubs();
  }, []);

  // Recarga los clubes al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchClubs();
      setClearSearch(true);
    }, [coordenadas, errorUbicacion])
  );

  // Limpia la búsqueda cuando clearSearch es true
  useEffect(() => {
    if (clearSearch) {
      setClearSearch(false);
    }
  }, [clearSearch]);

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="CLUBES" />
      <SearchBarClubes
        onClubSeleccionado={handleClubSeleccionado}
        clearSearch={clearSearch}
      />
      {loading || refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : errorUbicacion && !clubSeleccionado ? (
        <Text style={styles.noClubsText}>
          No se pudo obtener la ubicación. Mostrando todos los clubes
          disponibles.
        </Text>
      ) : clubs.length === 0 && !clubSeleccionado ? (
        <Text style={styles.noClubsText}>No hay clubes en tu ubicación</Text>
      ) : (
        <View style={styles.listContainer}>
          <ScrollView
            contentContainerStyle={styles.gridScrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["colors.primary"]}
                tintColor="colors.primary"
              />
            }
          >
            <View style={styles.gridContainer}>
              {clubs.map((item, index) => (
                <ClubCard
                  key={`club-${index}`}
                  imageSource={
                    item.imagen_perfil
                      ? { uri: `${BASE_URL}${item.imagen_perfil}` }
                      : require('../../assets/defaultClub.jpeg')
                  }
                  title={item.fc_nombre ? item.fc_nombre.toUpperCase() : 'CLUB SIN NOMBRE'}
                  subtitle='Ver detalles'
                  onPress={() =>
                    navigation.navigate('Club', {
                      id: item.id_fraccionamientoclub,
                      clubName: item.fc_nombre || 'Club sin nombre',
                    })
                  }
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      <View style={styles.bannerContainer}>
        <BannerAd />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2E2E2E",
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 20,
  },
  noClubsText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins",
  },
  listContainer: {
    flex: 1,
    paddingBottom: "20%",
  },
  gridScrollContainer: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
  },
});

export default ClubesScreen;
