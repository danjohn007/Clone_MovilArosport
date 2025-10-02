import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import ClubCard from "../componentes/ClubCard";
import Logo from "../componentes/Logo";
import CardInicio from "../componentes/CardInicio";
import BannerAd from "../componentes/BannerAd";
import APIManager from "../componentes/API/APIManager";
import URL from "../Helper/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import moment from "moment";
import * as Location from "expo-location"; // Asegúrate de tenerlo instalado
import { obtenerEstadoYPaisDesdeCoordenadas } from "../config/googleGeocoding";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import ProfileChip from "../componentes/ComponetePerfil";

// En el componente donde usas Realtime DB
import {
  getDatabase,
  ref,
  get,
  update,
  push,
  onValue,
} from "firebase/database";
import { app } from "../../src/config/firebaseConfig";
import { useAuth } from "../screens/Auth/AuthContext";
import { RefreshControl } from "react-native";
import colors from "../styles/colors";


const Principal = () => {
  const navigation = useNavigation();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notificationColor, setNotificationColor] = useState("white");
  const [notificationCount, setNotificationCount] = useState(0); // Contador de notificaciones
  const notificationListener = useRef();
  const BASE_URL = URL.imagen;
  const [ubicacionVerificada, setUbicacionVerificada] = useState(false);
  const [estadoUsuario, setEstadoUsuario] = useState("");
  const [rankingUser, setRankingUser] = useState(null);
  const [perfilUser, setPerfilUser] = useState(null);
  const db = getDatabase(app);
  const { id_usuario } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  console.log("esstado de usuario", id_usuario);

  const handleNotificationPress = () => {
    setNotificationColor("colors.primary");
    setTimeout(() => {
      navigation.navigate("Notificaciones");
      setNotificationColor("white");
      markNotificationsAsRead();
    }, 200);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchPerfilYRanking(),
        fetchClubs(),
        verificarYGuardarEstado(),
      ]);
    } catch (error) {
      console.log("Error en handleRefresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      if (!id_usuario) return;

      const notificacionesRef = ref(db, `notificaciones/${id_usuario}`);
      const snapshot = await get(notificacionesRef);

      if (!snapshot.exists()) return;

      const updates = {};
      snapshot.forEach((childSnap) => {
        const key = childSnap.key;
        updates[`${key}/leida`] = true;
      });

      await update(notificacionesRef, updates);
      setNotificationCount(0);
    } catch (error) {
      console.log("Error al marcar las notificaciones como leídas:", error);
    }
  };

  // 2. useEffect para recibir notificaciones y guardarlas
  useEffect(() => {
    if (!id_usuario) return; // Esperar a tener id_usuario

    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        if (!notification?.request?.content) return;

        // Ya no creamos ni guardamos la notificación desde aquí para evitar duplicados

        // Solo puedes hacer acciones secundarias como actualizar contador, mostrar alerta, etc.
        // Por ejemplo:
        // updateNotificationCount();

        console.log("Notificación recibida:", notification);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
    };
  }, [id_usuario]);

  const fetchPerfilYRanking = async () => {
    console.log("Iniciando fetchPerfilYRanking...");

    // 1. Petición a la API de perfil
    const res = await APIManager({
      url: "Perfil/get_info",
      method: "get",
    });
    console.log("Respuesta de Perfil/get_info:", res);

    if (res && res.data) {
      setPerfilUser(res.data); // Guarda el perfil básico

      // 2. Guarda género y categoría en AsyncStorage (opcional, para consistencia)
      await AsyncStorage.setItem("genero_usuario", res.data.sexo || "");
      await AsyncStorage.setItem(
        "categoria_usuario",
        String(res.data.id_categoria || "")
      );
      await AsyncStorage.setItem(
        "id_usuario",
        String(res.data.id_usuario || "")
      );

      // 3. Obtén estado y país desde AsyncStorage
      const estado = await AsyncStorage.getItem("estado_usuario");
      const pais = await AsyncStorage.getItem("pais_usuario");

      // 4. Obtén los datos necesarios para el ranking
      const sexo = res.data.sexo;
      const categoria = res.data.id_categoria;
      const idUsuario = res.data.id_usuario;

      console.log("Datos para ranking:", {
        sexo,
        categoria,
        estado,
        pais,
        idUsuario,
      });

      // 5. Petición a la API de ranking (ahora incluye estado y país)
      const url = `https://arosports.app/arosports/private/movil/ranking/FiltroRanking/get_filtroRankings?genero=${sexo}&categoria=${categoria}&estado=${estado}&pais=${pais}&id_usuario=${idUsuario}`;
      console.log("URL ranking:", url);

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Respuesta ranking:", data);

        setRankingUser(data.usuario || null);
        if (data.usuario) {
          console.log("rankingUser seteado:", data.usuario);
        } else {
          console.log("No se encontró usuario en ranking, data:", data);
        }
      } catch (err) {
        console.log("Error al obtener ranking:", err);
        setRankingUser(null);
      }
    } else {
      console.log("No se obtuvo data de perfil, res:", res);
      setPerfilUser(null);
      setRankingUser(null);
    }
  };

  // Nuevo useEffect para asegurar el orden correcto de carga
  useEffect(() => {
    const cargarTodo = async () => {
      await verificarYGuardarEstado(); // Esto guarda estado y país en AsyncStorage
      await fetchPerfilYRanking(); // Ahora sí puedes pedir el ranking con esos datos
    };
    cargarTodo();
  }, []);

  // 3. useEffect para escuchar las notificaciones en tiempo real y actualizar contador
  useEffect(() => {
    if (!id_usuario) return;

    const notificacionesRef = ref(db, `notificaciones/${id_usuario}`);

    const unsubscribe = onValue(
      notificacionesRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotificationCount(0);
          return;
        }

        let unreadCount = 0;
        snapshot.forEach((childSnap) => {
          const data = childSnap.val();
          if (data && data.leida === false) unreadCount++;
        });
        setNotificationCount(unreadCount);
      },
      (error) => {
        console.log("Error al escuchar notificaciones:", error);
      }
    );

    return () => unsubscribe();
  }, [id_usuario]);

  const verificarYGuardarEstado = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de ubicación denegado");
        setUbicacionVerificada(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Utiliza tu función reutilizable
      const { estado, pais } = await obtenerEstadoYPaisDesdeCoordenadas(
        latitude,
        longitude,
        "usuario"
      ); // Aquí añadimos el tipo 'usuario'

      if (estado && pais) {
        const estadoNormalizado = normalizarTexto(estado);
        const paisNormalizado = normalizarTexto(pais);

        const estadoGuardado = await AsyncStorage.getItem("estado_usuario");
        const paisGuardado = await AsyncStorage.getItem("pais_usuario");

        console.log("Estado guardado:", estadoGuardado);
        console.log("País guardado:", paisGuardado);

        if (
          estadoGuardado === null ||
          normalizarTexto(estadoGuardado) !== estadoNormalizado
        ) {
          await AsyncStorage.setItem("estado_usuario", estado);
          console.log(`📍 Estado actualizado: ${estadoGuardado} → ${estado}`);
        } else {
          console.log("📍 Estado no ha cambiado:", estado);
        }

        if (
          paisGuardado === null ||
          normalizarTexto(paisGuardado) !== paisNormalizado
        ) {
          await AsyncStorage.setItem("pais_usuario", pais);
          console.log(`🌎 País actualizado: ${paisGuardado} → ${pais}`);
        } else {
          console.log("🌎 País no ha cambiado:", pais);
        }
      } else {
        console.log(
          "No se pudo obtener el estado y país desde las coordenadas"
        );
      }
    } catch (error) {
      console.log("Error al obtener la ubicación:", error);
    } finally {
      setUbicacionVerificada(true);
    }
  };

  const fetchClubs = async () => {
    try {
      const estadoUsuario = await AsyncStorage.getItem("estado_usuario");
      const paisUsuario = await AsyncStorage.getItem("pais_usuario");
      console.log("📍 Estado del usuario:", estadoUsuario);
      console.log("🌎 País del usuario:", paisUsuario);

      setEstadoUsuario(estadoUsuario);

      const res = await APIManager({
        url: "Club/Club/mostrar_clubs",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📦 Clubs obtenidos:", res);

      const clubsFiltrados = [];
      for (const club of res) {
        const { estado: estadoClub, pais: paisClub } =
          await obtenerEstadoYPaisDesdeCoordenadas(
            club.latitud,
            club.longitud,
            "club",
            club.id_fraccionamientoclub
          ); // Aquí se pasa 'club' como tipo
        // Normalizamos los estados y países antes de comparar
        if (
          normalizarTexto(estadoClub) === normalizarTexto(estadoUsuario) &&
          normalizarTexto(paisClub) === normalizarTexto(paisUsuario)
        ) {
          console.log(
            `✅ [${club.fc_nombre}] está en el mismo estado y país: ${estadoClub}, ${paisClub}`
          );
          clubsFiltrados.push(club);
        } else {
          console.log(
            `❌ [${club.fc_nombre}] está en ${estadoClub}, ${paisClub}, NO coincide ${estadoUsuario}, ${paisUsuario}`
          );
        }
      }

      console.log("🎯 Clubs filtrados:", clubsFiltrados);
      setClubs(clubsFiltrados);
    } catch (error) {
      console.log("❗ Error al obtener los clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  function quitarAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function normalizarTexto(texto) {
    return quitarAcentos(texto).toLowerCase().trim();
  }

  useEffect(() => {
    verificarYGuardarEstado();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (ubicacionVerificada) {
        fetchClubs();
      }
    }, [ubicacionVerificada])
  );

  useFocusEffect(
    React.useCallback(() => {
      // Ejecuta cada vez que la pantalla obtiene el foco
      fetchPerfilYRanking();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo />
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={handleNotificationPress}
        >
          <Icon
            name="notifications-outline"
            size={30}
            color={notificationColor}
          />
          {notificationCount > 0 && (
            <Text style={styles.notificationCount}>{notificationCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("RankingPrincipal")}
        style={{ marginTop: 135, marginBottom: 30, width: "100%" }}
      >
        <ProfileChip
          userData={
            rankingUser
              ? rankingUser
              : perfilUser
              ? {
                  ...perfilUser,
                  us_nombre:
                    perfilUser.nombre || perfilUser.usuario || "Sin nombre",
                  jug_puntos: perfilUser.jug_puntos || "0",
                  num_partidos: perfilUser.num_partidos || "0",
                  us_foto: perfilUser.us_foto || "",
                  ranking: "-",
                }
              : {
                  us_nombre: "Cargando...",
                  jug_puntos: "-",
                  num_partidos: "-",
                  us_foto: "",
                  ranking: "-",
                  // Puedes agregar más campos si tu componente los necesita
                }
          }
          loading={!rankingUser && !perfilUser} // Si tu ProfileChip soporta esta prop
        />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.gridScrollContainer}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.gridContainer}>
          {/* <CardInicio
            imageSource={require("../../assets/misJuegos.jpg")}
            title="Mis Juegos"
            subtitle="Ver detalles"
            onPress={() => navigation.navigate("MisJuegos")}
          /> */}
          {/* <CardInicio
            imageSource={require("../../assets/Solicitudes.jpg")}
            title="Solicitudes"
            subtitle="Ver detalles"
            onPress={() => navigation.navigate("Solicitudes")}
          /> */}

          <CardInicio
            imageSource={require("../../assets/reservar.jpg")}
            title="Reservar"
            subtitle="Reserva una cancha"
            onPress={() => navigation.navigate("ReservasPrincipal")}
          />
          <CardInicio
            imageSource={require("../../assets/misJuegos.jpg")}
            title="Crear Jugada"
            subtitle="Gestiona tus partidos"
            onPress={() => navigation.navigate("CrearJuegoPrincipal")}
          />
          {/* <CardInicio
            imageSource={require("../../assets/Desarrollos.jpg")}
            title="Desarrollos"
            subtitle="Ver detalles"
            onPress={() => navigation.navigate("AccesoFraccionamiento")}
          /> */}
          {/* <CardInicio
            imageSource={require("../../assets/misligas.jpg")}
            title="Mis ligas"
            subtitle="Ver detalles"
            onPress={() => navigation.navigate("MisLigas")}
          /> */}
          {/* <CardInicio
            imageSource={require("../../assets/tienda.jpg")}
            title="Tienda en línea"
            subtitle="Ver detalles"
            onPress={() => navigation.navigate("Tienda")}
          /> */}
        </View>

        {/* <View style={styles.horizontalScrollWrapper}>
          <Text style={styles.sectionTitle}>Clubs</Text>
          {loading ? (
            <Text style={styles.loadingText}>Cargando clubs...</Text>
          ) : !estadoUsuario ? (
            <Text style={styles.noClubsText}>
              No existen clubs. Permiso de ubicación denegado.
            </Text>
          ) : clubs.length === 0 ? (
            <Text style={styles.noClubsText}>
              No hay clubs en el estado de {estadoUsuario}
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {clubs.map((club, index) => (
                <ClubCard
                  key={index}
                  imageSource={
                    club.imagen_perfil
                      ? { uri: `${BASE_URL}${club.imagen_perfil}` }
                      : require("../../assets/defaultClub.jpeg") // Imagen predeterminada
                  }
                  title={club.fc_nombre.toUpperCase()}
                  onPress={() =>
                    navigation.navigate("Club", {
                      id: club.id_fraccionamientoclub,
                      clubName: club.fc_nombre,
                    })
                  }
                />
              ))}
            </ScrollView>
          )}
        </View> */}
      </ScrollView>
      {/* <TouchableOpacity onPress={() => navigation.navigate('CrearJuego')} style={styles.floatingButton}>
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity> */}
      <View style={{ bottom: -7 }}>{ubicacionVerificada && <BannerAd />}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2E2E2E",
  },
  header: {
    width: "100%",
    position: "absolute",
    top: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  notificationIcon: {
    position: "absolute",
    right: -5,
    marginTop: 15,
  },
  headerButton: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 10,
    width: "95%", // Aseguramos que ocupe el 100% del ancho
    marginBottom: 30,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "colors.primary",
    marginTop: 120,
    overflow: "hidden", // Para asegurarnos de que nada se desborde
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between", // Distribuye el espacio entre los elementos
    alignItems: "center",
    width: "100%", // Para asegurarnos de que ocupa todo el espacio disponible
    paddingHorizontal: 10, // Un poco de margen horizontal para evitar que el contenido toque los bordes
  },
  headerText: {
    color: "black",
    fontSize: 16,
    fontFamily: "Poppins",
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1, // Permite que el texto se ajuste si es necesario
    marginHorizontal: 10, // Espacio entre los íconos y el texto
  },
  iconBeforeText: {
    marginRight: 10, // Espacio entre el ícono y el texto
  },
  arrowIcon: {
    marginLeft: 10, // Espacio entre el ícono y el texto
  },
  gridScrollContainer: {
    paddingBottom: 60,
    width: "100%",
  },
  scrollView: {
    flexGrow: 1,
  },
  horizontalScrollContent: {
    paddingHorizontal: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginVertical: 10,
    width: "100%",
    marginTop: 5,
    marginRight: 10,
  },
  selectedItem: {
    borderColor: "colors.primary",
  },
  button: {
    marginTop: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  horizontalContainer: {
    marginTop: 20,
    width: "200%",
    paddingVertical: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 70,
    right: 20,
    backgroundColor: "colors.primary",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  notificationCount: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    color: "white",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "gray",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  noClubsText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
});

export default Principal;
