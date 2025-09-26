import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import Titulo from "../componentes/Titulo";
import Logo from "../componentes/Logo";
import BannerAd from "../componentes/BannerAd";
import MenuItem from "../componentes/MenuItem";
import Inscripcion from "../modales/Inscripcion";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import APIManager from "../componentes/API/APIManager";
import URL from "../Helper/URL";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RFValue } from "react-native-responsive-fontsize";
import ModalUnirmeJugadaaPublica from "../modales/ModalUnirmeJugadaaPublica";
import JugadorModal from "../modales/JugadorModal";

const Eventos = () => {
  const [selectedItem, setSelectedItem] = useState("torneos");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTorneoId, setSelectedTorneoId] = useState(null);
  const [selectedCompleto, setSelectedCompleto] = useState(null);
  const [selectedTorneoNombre, setSelectedTorneoNombre] = useState(null);
  const [selectedTorneoPrecio, setSelectedTorneoPrecio] = useState(null);
  const [selectedFechaI, setSelectedFechaInicio] = useState(null);
  const [selectedFechaF, setSelectedFechaFin] = useState(null);
  const [selectedTorneoMoneda, setSelectedTorneoMoneda] = useState(null);
  const [selectedTorneoFracci, setSelectedTorneoFracci] = useState(null);
  const [selectedTorneoMetPago, setSelectedTorneoMetPago] = useState(null);
  const navigation = useNavigation();
  const [torneosIncritos, setTorneosInscritos] = useState([]);
  const [torneosDisponibles, setTorneosDisponibles] = useState([]);
  const [jugadas, setJugadas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJugada, setSelectedJugada] = useState(null);
  const [sinTorneos, setSinTorneos] = useState(false);
  const [sinJugadas, setSinJugadas] = useState(false);
  const [modalUnirmeVisible, setModalUnirmeVisible] = useState(false);
  const [jugadaSeleccionada, setJugadaSeleccionada] = useState(null);
  const [jugadorModalVisible, setJugadorModalVisible] = useState(false);
  const [selectedJugadorData, setSelectedJugadorData] = useState(null);
  const [jugadorLoading, setJugadorLoading] = useState(false); // Nuevo estado para loading

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    if (item === "torneos") {
      getTorneos();
    }
    if (item === "jugadas") {
      getJugadas();
    }
    setSelectedJugada(null);
  };

  const BASE_URL = URL.imagen;

  const showModal = (
    torneoId,
    torneoNombre,
    torneoPrecio,
    torneoMoneda,
    torneoFracci,
    torneoFechaI,
    torneoFechaF,
    torneoCompleto,
    torneoMetPago
  ) => {
    setSelectedTorneoId(torneoId);
    setSelectedTorneoNombre(torneoNombre);
    setSelectedTorneoPrecio(torneoPrecio);
    setSelectedTorneoMoneda(torneoMoneda);
    setSelectedTorneoFracci(torneoFracci);
    setSelectedFechaInicio(torneoFechaI);
    setSelectedFechaFin(torneoFechaF);
    setSelectedCompleto(torneoCompleto);
    setSelectedTorneoMetPago(torneoMetPago);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTorneoId(null);
    setSelectedTorneoNombre(null);
    setSelectedTorneoPrecio(null);
    setSelectedTorneoMoneda(null);
    setSelectedTorneoFracci(null);
    setSelectedFechaFin(null);
    setSelectedFechaInicio(null);
    setSelectedCompleto(null);
    setSelectedTorneoMetPago(null);
  };

  const getTorneos = async () => {
    setIsLoading(true);
    setSinTorneos(false);
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      const formData = new FormData();
      formData.append("id_usuario", id_usuario);

      const response = await APIManager({
        url: "eventos/Eventos/lista_torneos",
        method: "POST",
        data: formData,
      });

      if (response && response.resultado) {
        const torneos = response.datos || [];
        const torneosDisponibles = torneos.filter(
          (torneo) => torneo.registrado === 0
        );
        setTorneosDisponibles(torneosDisponibles);
        setSinTorneos(torneosDisponibles.length === 0);
      } else {
        setTorneosDisponibles([]);
        setSinTorneos(true);
      }
    } catch (error) {
      console.log("Error obteniendo torneos:", error);
      setTorneosDisponibles([]);
      setSinTorneos(true);
      Alert.alert("Error", "Hubo un problema al obtener los torneos");
    }
    setIsLoading(false);
  };

  const getJugadas = async () => {
    setIsLoading(true);
    setSinJugadas(false);
    try {
      const idUsuario = await AsyncStorage.getItem("id_usuario");
      const response = await APIManager({
        url: `jugadas/Jugadas/lista_jugadas`,
        method: "GET",
      });

      if (response && response.datos) {
        const jugadasFiltradas = response.datos.filter(
          (juego) => juego.id_usuario !== idUsuario
        );
        setJugadas(jugadasFiltradas);
        setSinJugadas(jugadasFiltradas.length === 0);
      } else {
        setJugadas([]);
        setSinJugadas(true);
      }
    } catch (error) {
      console.log("Error obteniendo jugadas:", error);
      setJugadas([]);
      setSinJugadas(true);
      Alert.alert("Error", "Hubo un problema al obtener las jugadas");
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (selectedItem === "torneos") {
        await getTorneos();
      } else if (selectedItem === "jugadas") {
        await getJugadas();
      }
    } catch (error) {
      console.log("Error al refrescar datos:", error);
      Alert.alert("Error", "No se pudieron actualizar los datos");
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getTorneos();
      getJugadas();
    }, [])
  );

  const capitalizar = (texto) => {
    return texto
      ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
      : "";
  };

  const handleJoinJugada = async (id, nombre) => {
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      const formData = new FormData();
      formData.append("id_usuario", id_usuario);
      formData.append("id_juego", id);
      formData.append("nombreJugada", nombre);

      const response = await APIManager({
        url: `jugadas/Jugadas/solictud_jugadapublica`,
        method: "POST",
        data: formData,
      });

      if (response.resultado) {
        Alert.alert(
          "Éxito",
          response.mensaje || "La solicitud se ha enviado correctamente.",
          [
            {
              text: "OK",
              onPress: () => {
                closeModal();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Atención",
          response.mensaje || "Hubo un problema al procesar la solicitud."
        );
      }
    } catch (error) {
      console.log("Error en handleJoinJugada: ", error);
      Alert.alert("Error", "Hubo un problema al procesar la solicitud.");
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str || typeof str !== "string") return "-";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const fetchJugadorInfo = async (idJugador) => {
    try {
      setJugadorLoading(true);
      const res = await APIManager({
        url: `ranking/FiltroRanking/get_infoSearch?id_jugador=${idJugador}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res && res.info_usuario && res.rankings && res.rankings.usuario) {
        const jugadorData = {
          ...res.rankings.usuario,
          genero:
            res.info_usuario.genero === "M"
              ? "Varonil"
              : res.info_usuario.genero === "F"
              ? "Femenil"
              : res.info_usuario.genero || "-",
          categoria: res.info_usuario.nombre_categoria,
          estado: capitalizeFirstLetter(res.info_usuario.estado),
          pais: capitalizeFirstLetter(res.info_usuario.pais),
        };
        setSelectedJugadorData(jugadorData);
      } else {
        console.log(
          "No se encontraron datos del jugador:",
          res?.mensaje || "Sin datos"
        );
        setSelectedJugadorData({});
      }
    } catch (error) {
      console.log("Error al obtener información del jugador:", error);
      setSelectedJugadorData({});
    } finally {
      setJugadorLoading(false);
      setJugadorModalVisible(true);
    }
  };

  const verTorneo = (item) => {
    showModal(
      item.id,
      item.nombre,
      item.precio,
      item.moneda,
      item.fracci,
      item.torneo_fecha,
      item.fecha_fin,
      item.torneo_completo,
      item.metodos_pago
    );
  };

  const formatearFecha = (fecha) => {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  const renderTorneo = ({ item }) => (
    <TouchableOpacity onPress={() => verTorneo(item)} activeOpacity={0.9}>
      <View style={styles.torneoContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${BASE_URL}/${item.imagen}` }}
            style={styles.torneoImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.torneoInfo}>
          <Text
            style={styles.torneoNombre}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.nombre}
          </Text>
          <View style={styles.infoRow}>
            <Icon name="location-outline" size={16} color="#00baff" />
            <Text style={styles.torneoText}>{capitalizar(item.fracci)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={16} color="#00baff" />
            <Text style={styles.torneoText}>
              {formatearFecha(item.torneo_fecha)}
            </Text>
          </View>
        </View>
        <View style={styles.actionButton}>
          <Icon name="arrow-forward-outline" size={20} color="#00baff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatearHora = (horaCompleta) => {
    return horaCompleta ? horaCompleta.substring(0, 5) : "";
  };

  const renderJugadas = ({ item }) => (
    <View style={styles.jugadaContainer}>
      <View style={styles.header}>
        <Text style={styles.jugadaTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.nombre}
        </Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => {
            setJugadaSeleccionada({
              id: item.id,
              nombre: item.nombre,
              categoria: item.categoria,
              modo_juego: item.modo_juego,
              id_fraccionamientoclub: item.id_fraccionamientoclub,
              id_direccion: item.id_direccion,
              nombre_club: item.nombre_club || "",
              calle: item.calle || "",
              num_ext: item.num_ext || "",
              colonia: item.colonia || "",
              cp: item.cp || "",
              latitud: item.latitud || null,
              longitud: item.longitud || null,
            });
            setModalUnirmeVisible(true);
          }}
        >
          <Icon name="information-circle-outline" size={18} color="#fff" />
          <Text style={styles.joinText}>DETALLES</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color="#00baff" />
          <Text style={styles.infoText}>{formatearFecha(item.fecha)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="time-outline" size={16} color="#00baff" />
          <Text style={styles.infoText}>{formatearHora(item.horario)}</Text>
        </View>
        <TouchableOpacity onPress={() => fetchJugadorInfo(item.id_jugador)}>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={16} color="#00baff" />
            <Text style={styles.infoText}>
              Creado por {item.nombre_usuario}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Logo />
      <TouchableOpacity
        style={styles.juegosIcon}
        onPress={() => navigation.navigate("MisTorneos", { torneosIncritos })}
      >
        <Icon name="trophy-outline" size={30} color="white" />
      </TouchableOpacity>
      <Titulo titulo="EVENTOS PÚBLICOS" />
      <View style={styles.menu}>
        <MenuItem
          label="TORNEOS"
          isActive={selectedItem === "torneos"}
          onPress={() => handleSelectItem("torneos")}
        />
        <MenuItem
          label="JUGADAS"
          isActive={selectedItem === "jugadas"}
          onPress={() => handleSelectItem("jugadas")}
        />
      </View>
      <View style={{ flex: 1, marginBottom: 50 }}>
        {selectedItem === "torneos" &&
          (isLoading ? (
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={styles.loader}
            />
          ) : sinTorneos ? (
            <Text style={styles.noResultsText}>No hay torneos disponibles</Text>
          ) : (
            <FlatList
              data={torneosDisponibles}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTorneo}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={["#00baff"]}
                  tintColor="#00baff"
                />
              }
            />
          ))}
        {selectedItem === "jugadas" &&
          !selectedJugada &&
          (isLoading ? (
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={styles.loader}
            />
          ) : sinJugadas ? (
            <Text style={styles.noResultsText}>No hay jugadas disponibles</Text>
          ) : (
            <FlatList
              data={jugadas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderJugadas}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={["#00baff"]}
                  tintColor="#00baff"
                />
              }
            />
          ))}
      </View>
      <Inscripcion
        visible={isModalVisible}
        closeModal={closeModal}
        torneoId={selectedTorneoId}
        torneoFechaI={selectedFechaI}
        torneoFechaF={selectedFechaF}
        torneoCompleto={selectedCompleto}
        torneoNombre={selectedTorneoNombre}
        torneoPrecio={selectedTorneoPrecio}
        torneoMoneda={selectedTorneoMoneda}
        torneoFracci={selectedTorneoFracci}
        torneoMetPago={selectedTorneoMetPago}
      />
      <ModalUnirmeJugadaaPublica
        visible={modalUnirmeVisible}
        closeModal={() => setModalUnirmeVisible(false)}
        data={jugadaSeleccionada}
        ubicacion={{
          nombre_club: jugadaSeleccionada?.nombre_club || "",
          calle: jugadaSeleccionada?.calle || "",
          num_ext: jugadaSeleccionada?.num_ext || "",
          colonia: jugadaSeleccionada?.colonia || "",
          cp: jugadaSeleccionada?.cp || "",
          latitud: jugadaSeleccionada?.latitud || null,
          longitud: jugadaSeleccionada?.longitud || null,
        }}
        onSolicitarUnirme={() => {
          if (jugadaSeleccionada) {
            handleJoinJugada(jugadaSeleccionada.id, jugadaSeleccionada.nombre);
          }
          setModalUnirmeVisible(false);
        }}
      />
      <JugadorModal
        visible={jugadorModalVisible}
        closeModal={() => setJugadorModalVisible(false)}
        data={selectedJugadorData}
        jugadorLoading={jugadorLoading}
        mostrarAcciones={false}
      />
      <View style={styles.containerBaner}>
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
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#2E2E2E",
  },
  image: {
    width: "100%",
    height: 110,
    resizeMode: "stretch",
    marginVertical: 6,
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    alignItems: "center",
  },
  list: {
    paddingBottom: "15%",
  },
  loader: {
    marginTop: 20,
  },
  jugadaContainer: {
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
  jugadaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    flex: 1,
    marginRight: 10,
    marginTop: -15,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  joinButton: {
    flexDirection: "row",
    backgroundColor: "#00baff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  joinText: {
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
  juegosIcon: {
    position: "absolute",
    right: 15,
    marginTop: 65,
  },
  torneoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderColor: "#00baff",
    borderWidth: 3,
    borderRadius: 16,
    width: "95%",
    padding: 12,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#f5f5f5",
  },
  torneoImage: {
    width: "100%",
    height: "100%",
  },
  torneoInfo: {
    flex: 1,
    justifyContent: "center",
  },
  torneoNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00baff",
    marginBottom: 8,
  },
  torneoText: {
    fontSize: RFValue(11, 667),
    color: "#808191",
    marginLeft: 8,
  },
  actionButton: {
    marginLeft: 10,
    padding: 8,
  },
  noResultsText: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#808191",
    marginLeft: 8,
    flex: 1,
  },
  joinButton: {
    backgroundColor: "#00bfff",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: -15,
    flexDirection: "row",
    alignItems: "center",
  },
  joinText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default Eventos;