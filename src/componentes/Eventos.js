import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
  Alert,
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
import colors from "../styles/colors";

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
  console.log("torneos disponles", torneosDisponibles);
  console.log("torneosIncritos en eventos", torneosIncritos);
  const [jugadas, setJugadas] = useState([]);
  console.log("jugaadas", jugadas);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJugada, setSelectedJugada] = useState(null);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    if (item === "torneos") {
      getTorneos(); // Recargar los torneos cuando se selecciona "TORNEOS"
    }
    if (item === "jugadas") {
      getJugadas(); // Recargar los torneos cuando se selecciona "TORNEOS"
    }

    setSelectedJugada(null); // Reinicia la selección de la jugada
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
    // getTorneos();
  };

  const getTorneos = async () => {
    setIsLoading(true);
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      const formData = new FormData();
      formData.append("id_usuario", id_usuario);

      console.log("Enviando datos a la API...");
      console.log("FormData:", formData);

      const response = await APIManager({
        url: "eventos/Eventos/lista_torneos",
        method: "POST",
        data: formData,
      });

      console.log("Respuesta completa de la API:", response);

      if (response && response.resultado) {
        const torneos = response.datos || [];

        // Separar torneos en disponibles e inscritos
        const torneosDisponibles = torneos.filter(
          (torneo) => torneo.registrado === 0
        );

        // Guardar en los estados
        setTorneosDisponibles(torneosDisponibles);
      } else {
        alert(response.mensaje || "No se encontraron torneos");
      }
    } catch (error) {
      console.log("Error obteniendo torneos:", error);
      alert("Hubo un problema al obtener los torneos");
    }
    setIsLoading(false);
  };

  const getJugadas = async () => {
    setIsLoading(true);
    // Obtener el id_usuario desde AsyncStorage
    const idUsuario = await AsyncStorage.getItem("id_usuario");
    const response = await APIManager({
      url: `jugadas/Jugadas/lista_jugadas`,
      method: "GET",
    });

    console.log("jugadas", response);
    if (response !== null) {
      // Filtrar jugadas excluyendo las del usuario actual
      const jugadasFiltradas = response.datos.filter(
        (juego) => juego.id_usuario !== idUsuario
      );

      setJugadas(jugadasFiltradas);
    } else {
      alert("Revisa tu conexión a internet");
    }
    setIsLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      getTorneos();
      getJugadas();
    }, [])
  );

  const handleJoinJugada = async (id, nombre) => {
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      const formData = new FormData();
      formData.append("id_usuario", id_usuario);
      formData.append("id_juego", id);
      formData.append("nombreJugada", nombre);

      console.log("Enviando datos a la API...");
      console.log("FormData:", formData);

      const response = await APIManager({
        url: `jugadas/Jugadas/solictud_jugadapublica`,
        method: "POST",
        data: formData,
      });

      console.log("Respuesta de la API: ", response);

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
        // Mostrar el mensaje del backend en caso de error o validación
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

  const verTorneo = (item) => {
    // Directamente abre el modal sin verificar la inscripción
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
    <TouchableOpacity onPress={() => verTorneo(item)}>
      <View style={styles.torneoContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${BASE_URL}/${item.imagen}` }}
            style={styles.torneoImage}
          />
        </View>
        <View style={styles.torneoInfo}>
          <Text style={styles.torneoNombre}>{item.nombre}</Text>
          <Text style={styles.torneoPrecio}>
            Club:{" "}
            {item.fracci.charAt(0).toUpperCase() +
              item.fracci.slice(1).toLowerCase()}
          </Text>
          <Text style={styles.torneoFecha}>
            Fecha: {formatearFecha(item.torneo_fecha)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // const renderJugadas = ({ item }) => (
  //   <View style={styles.jugadaContainer}>
  //     <Text style={styles.jugadaTitle}>{item.nombre}</Text>

  //     <View style={styles.row}>
  //       <Text style={styles.leftText}>Fecha: {formatearFecha(item.fecha)}</Text>
  //       <Text style={styles.rightText}>Hora: {item.horario}</Text>
  //     </View>

  //     <View style={styles.row}>
  //       <Text style={styles.leftText}>Categoría: {item.categoria}</Text>
  //       <Text style={styles.rightText}>Duración: {item.duracion}</Text>
  //     </View>

  //     <TouchableOpacity
  //       style={styles.joinButton}
  //       onPress={() => handleJoinJugada(item.id, item.nombre)}
  //     >
  //       <Icon name="person-add-outline" size={20} color="#fff" />
  //       <Text style={styles.joinText}>UNIRME AL JUEGO</Text>
  //     </TouchableOpacity>
  //   </View>
  // );

  const formatearHora = (horaCompleta) => {
    return horaCompleta ? horaCompleta.substring(0, 5) : "";
  };

  const formatearDuracion = (duracionCompleta) => {
    if (!duracionCompleta) return "";
    const horas = parseInt(duracionCompleta.substring(0, 2), 10);
    return `(${horas}h)`;
  };

  const renderJugadas = ({ item }) => (
    <View style={styles.jugadaContainer}>
      <Text style={styles.jugadaTitle}>{item.nombre}</Text>
      <Text style={styles.infoText}>Club: {item.nombre_club}</Text>
      <Text style={styles.infoText}>Fecha: {formatearFecha(item.fecha)}</Text>
      <Text style={styles.infoText}>
        Horario: {formatearHora(item.horario)} Duración:{" "}
        {formatearDuracion(item.duracion)}
      </Text>
      <Text style={styles.infoText}>Categoría: {item.categoria} </Text>

      <View style={styles.footerRow}>
        {/* <Text style={styles.infoText1}>Duración: {formatearDuracion(item.duracion)}</Text> */}
        <Text style={styles.infoText1}>Creador: {item.nombre_usuario}</Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinJugada(item.id, item.nombre)}
        >
          <Icon name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.joinText}>UNIRME</Text>
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
        <Icon name="trophy" size={30} color="white" />
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

      {selectedItem === "torneos" &&
        (isLoading ? (
          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={torneosDisponibles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTorneo}
            contentContainerStyle={styles.list}
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
        ) : (
          <FlatList
            data={jugadas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderJugadas}
            contentContainerStyle={styles.list}
          />
        ))}

      <View style={styles.bannerContainer}>
        <BannerAd
          imageSrc={require("../../assets/volaris.png")}
          link="https://example.com"
        />
      </View>

      {/* Modal de inscripción */}
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
  },
  imageContainer: {
    margin: 10,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
    width: "100%",
    borderColor: colors.primary,
    borderWidth: 3,
    alignSelf: "center",
    marginBottom: 16,
    padding: 7,
    borderRadius: 8,
  },
  jugadaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 0,
    color: "#00bfff",
    textAlign: "center",
  },
  jugadaDetail: {
    fontSize: 14,
    color: "#809FB8",
    marginTop: 0,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  joinText: {
    color: "#00bfff",
    marginLeft: 5,
    fontWeight: "bold",
  },
  juegosIcon: {
    position: "absolute",
    right: 15,
    marginTop: 65,
  },

  torneoContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderColor: colors.primary,
    borderWidth: 3,
    borderRadius: 8,
    padding: 7,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  torneoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  torneoInfo: {
    flex: 1,
    justifyContent: "center",
  },
  torneoNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00bfff",
  },
  torneoPrecio: {
    fontSize: 14,
    color: "#809FB8",
    marginVertical: 5,
  },
  torneoFecha: {
    fontSize: 14,
    color: "#809FB8",
    marginVertical: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  leftText: {
    fontSize: 14,
    color: "#809FB8",
  },
  rightText: {
    fontSize: 14,
    color: "#809FB8",
  },
  joinButton: {
    marginTop: 12,
    backgroundColor: "#00bfff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  joinText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#809FB8",
    marginBottom: 2,
  },
  infoText1: {
    fontSize: 14,
    color: "#809FB8",
    marginTop: 5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -5,
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
