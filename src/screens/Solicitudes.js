import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Text,
  RefreshControl,
} from "react-native";
import Titulo from "../componentes/Titulo";
import Logo from "../componentes/Logo";
import CardSolicitudes from "../componentes/CardSolicitudes";
import CardSolicitudesAR from "../componentes/CardSolicitudesAR";
import InvitacionJugada from "../componentes/InivitacionJugada";
import CardJugadaConfirmada from "../componentes/CardJugadaConfirmada";
import MenuItem from "../componentes/MenuItem";
import APIManager from "../componentes/API/APIManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InvitacionesModal from "../modales/InivtacionesModal";
import JugadorModal from "../modales/JugadorModal";
import BannerAd from "../componentes/BannerAd";

const Solicitudes = () => {
  const [selectedItem, setSelectedItem] = useState("recibidas");
  const [invitacionesData, setInvitacionesData] = useState([]);
  const [juegosCombinados, setJuegosCombinados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [idJugador, setIdJugador] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [jugadorModalVisible, setJugadorModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState({});
  const [selectedJugadorData, setSelectedJugadorData] = useState({});
  const [selectedJuegoId, setSelectedJuegoId] = useState(null);
  const [jugadorLoading, setJugadorLoading] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const getCurrentData = () => {
    switch (selectedItem) {
      case "recibidas":
        return invitacionesData;
      case "enviadas":
        return juegosCombinados;
      default:
        return [];
    }
  };

  const getUserIdFromJWT = async () => {
    try {
      const userId = await AsyncStorage.getItem("id_usuario");
      if (userId) {
        setUserId(userId);
        console.log("ID de usuario en solicitudes:", userId);
      } else {
        console.log("No se encontró el ID de usuario en el almacenamiento.");
      }
    } catch (error) {
      console.log("Error al obtener el ID del usuario:", error);
    }
  };

  const fetchJugador = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Invitaciones/Invitaciones/mostrar_jugador/${userId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res && res.length > 0) {
        setIdJugador(res[0].id_jugador);
      }
    } catch (error) {
      console.log("Error al obtener el jugador:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitaciones = async (idJugador) => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Invitaciones/Invitaciones/mostrar_invitaciones/${idJugador}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Respuesta de API en fetchInvitaciones:", res);
      setInvitacionesData(res || []);
    } catch (error) {
      console.log("Error al obtener las invitaciones:", error);
      setInvitacionesData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJuegosCombinados = async (userId) => {
    setLoading(true);
    try {
      const [resConfirmados, resPendientes, resSolicitudes] = await Promise.all(
        [
          APIManager({
            url: `solicitudes/SolicitudesConfirmadas/obtener_jugadas_confirmados?id_usuario=${userId}`,
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          APIManager({
            url: `solicitudes/SolicitudesConfirmadas/obtener_jugadas_pendientes?id_usuario=${userId}`,
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          APIManager({
            url: `solicitudes/SolicitudesConfirmadas/obtener_solicitudes_pendientes?id_usuario=${userId}`,
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]
      );

      const juegosConfirmados =
        resConfirmados &&
        resConfirmados.estatus &&
        Array.isArray(resConfirmados.datos)
          ? resConfirmados.datos
          : [];
      const juegosPendientes =
        resPendientes &&
        resPendientes.estatus &&
        Array.isArray(resPendientes.datos)
          ? resPendientes.datos
          : [];
      const solicitudesPendientes =
        resSolicitudes &&
        resSolicitudes.estatus &&
        Array.isArray(resSolicitudes.datos)
          ? resSolicitudes.datos
          : [];

      const juegosMap = new Map();
      juegosConfirmados.forEach((juego) => {
        juegosMap.set(juego.id_juego, {
          ...juego,
          confirmados: juego.confirmados || [],
          pendientes: [],
          solicitudes: [],
        });
      });
      juegosPendientes.forEach((juego) => {
        if (juegosMap.has(juego.id_juego)) {
          juegosMap.get(juego.id_juego).pendientes = juego.pendientes || [];
        } else {
          juegosMap.set(juego.id_juego, {
            ...juego,
            confirmados: [],
            pendientes: juego.pendientes || [],
            solicitudes: [],
          });
        }
      });
      solicitudesPendientes.forEach((juego) => {
        if (juegosMap.has(juego.id_juego)) {
          juegosMap.get(juego.id_juego).solicitudes = juego.solicitudes || [];
        } else {
          juegosMap.set(juego.id_juego, {
            ...juego,
            confirmados: [],
            pendientes: [],
            solicitudes: juego.solicitudes || [],
          });
        }
      });

      const sortedJuegos = Array.from(juegosMap.values()).sort(
        (a, b) => new Date(a.jue_fecha) - new Date(b.jue_fecha)
      );
      setJuegosCombinados(sortedJuegos);
    } catch (error) {
      console.log("Error al obtener juegos combinados:", error);
      setJuegosCombinados([]);
    } finally {
      setLoading(false);
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
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handlePress = (item) => {
    setSelectedData({
      id_juego: item.id_juego,
      idfraccionamientoclub: item.id_fraccionamientoclub,
      id_direccion: item.id_direccion,
      categoria: item.categoria,
      id_categoria: item.id_categoria,
      modalidad_nombre: item.modalidad_nombre,
      nombre: item.jue_nombre,
      nombre_club: item.nombre_club || "",
      calle: item.calle || "",
      num_ext: item.num_ext || "",
      colonia: item.colonia || "",
      cp: item.cp || "",
      latitud: item.latitud || null,
      longitud: item.longitud || null,
    });
    setModalVisible(true);
  };

  const handleViewInfo = (idJugador, idJuego, listType) => {
    setSelectedJuegoId(idJuego);
    setShowFooter(listType === "solicitudes" && selectedItem === "enviadas");
    fetchJugadorInfo(idJugador);
    setJugadorModalVisible(true);
  };

  const handleAceptar = async (id_juego, id_jugador) => {
    if (!id_juego || !id_jugador) {
      console.log("No se ha recibido un juego o jugador válido.", {
        id_juego,
        id_jugador,
      });
      return;
    }

    console.log("Aceptando solicitud con:", { id_juego, id_jugador });

    try {
      const response = await APIManager({
        url: `solicitudes/SolicitudesConfirmadas/aceptar_rechazar/${id_juego}/${id_jugador}/aceptar`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Respuesta de la API al aceptar:", response);
      if (response.estatus) {
        if (selectedItem === "recibidas") {
          fetchInvitaciones(idJugador);
        } else {
          fetchJuegosCombinados(userId);
        }
        setJugadorModalVisible(false);
      } else {
        Alert.alert(
          "Error",
          response.mensaje || "Ocurrió un problema al aceptar la solicitud."
        );
      }
    } catch (error) {
      console.log("Error al aceptar la solicitud:", error);
      Alert.alert("Alerta", "No se pudo aceptar la solicitud.");
    }
  };

  const handleRechazar = async (id_juego, id_jugador) => {
    if (!id_juego || !id_jugador) {
      console.log("No se ha recibido un juego o jugador válido.", {
        id_juego,
        id_jugador,
      });
      return;
    }

    console.log("Rechazando solicitud con:", { id_juego, id_jugador });

    try {
      const response = await APIManager({
        url: `solicitudes/SolicitudesConfirmadas/aceptar_rechazar/${id_juego}/${id_jugador}/rechazar`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Respuesta de la API al rechazar:", response);
      if (response.estatus) {
        if (selectedItem === "recibidas") {
          fetchInvitaciones(idJugador);
        } else {
          fetchJuegosCombinados(userId);
        }
        setJugadorModalVisible(false);
      } else {
        Alert.alert(
          "Error",
          response.mensaje || "No se pudo rechazar la solicitud."
        );
      }
    } catch (error) {
      console.log("Error al rechazar la solicitud:", error);
      Alert.alert("Alerta", "No se pudo rechazar la solicitud.");
    }
  };

  const handlePressConfirmado = (jugada) => {
    setSelectedData({
      nombre: jugada.jue_nombre,
      categoria: jugada.categoria,
      id_categoria: jugada.id_categoria,
      modalidad_nombre: jugada.modalidad_nombre,
      idfraccionamientoclub: jugada.id_fraccionamientoclub,
      id_direccion: jugada.id_direccion,
      id_juego: jugada.id_juego,
      nombre_club: jugada.nombre_club || "",
      calle: jugada.calle || "",
      num_ext: jugada.num_ext || "",
      colonia: jugada.colonia || "",
      cp: jugada.cp || "",
      latitud: jugada.latitud || null,
      longitud: jugada.longitud || null,
    });
    setModalVisible(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (selectedItem === "recibidas" && idJugador) {
        await fetchInvitaciones(idJugador);
      } else if (selectedItem === "enviadas") {
        await fetchJuegosCombinados(userId);
      }
    } catch (error) {
      console.log("Error al refrescar datos:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedData && selectedData.id_juego) {
      console.log("selectedData actualizado:", selectedData);
    }
  }, [selectedData]);

  useEffect(() => {
    getUserIdFromJWT();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchJugador();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && selectedItem === "recibidas" && idJugador) {
      fetchInvitaciones(idJugador);
    } else if (userId && selectedItem === "enviadas") {
      fetchJuegosCombinados(userId);
    }
  }, [selectedItem, userId, idJugador]);

  const renderJuegoConfirmado = ({ item }) => {
    return (
      <CardJugadaConfirmada
        juego={item.jue_nombre}
        fecha={item.jue_fecha}
        hora={item.jue_hora}
        confirmados={item.confirmados || []}
        pendientes={item.pendientes || []}
        solicitudes={item.solicitudes || []}
        id_juego={item.id_juego}
        onViewInfo={handleViewInfo}
        onPress={() => handlePressConfirmado(item)}
      />
    );
  };

  const renderItem = ({ item }) => {
    console.log("Item en Solicitudes:", item);
    if (selectedItem === "recibidas") {
      return (
        <InvitacionJugada
          juego={item.jue_nombre}
          fecha={item.jue_fecha}
          hora={item.jue_hora}
          invitado={item.nombre || "N/A"}
          USinvitado={item.usuario_nombre || "N/A"}
          id_jugador={item.id_jugador}
          id_juego={item.id_juego}
          onViewInfo={handleViewInfo}
          onPress={() => handlePress(item)}
        />
      );
    }

    if (selectedItem === "enviadas") {
      return renderJuegoConfirmado({ item });
    }

    return null;
  };

  const currentData = getCurrentData();

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="SOLICITUDES" />
      <View style={styles.menu}>
        <MenuItem
          label="RECIBIDAS"
          isActive={selectedItem === "recibidas"}
          onPress={() => handleSelectItem("recibidas")}
        />
        <MenuItem
          label="ENVIADAS"
          isActive={selectedItem === "enviadas"}
          onPress={() => handleSelectItem("enviadas")}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              `${item.id_juego || "undefined"}-${index}`
            }
            contentContainerStyle={
              selectedItem === "recibidas" ? styles.invitacionesList : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#00baff"]}
                tintColor="#00baff"
              />
            }
            ListEmptyComponent={
              selectedItem === "recibidas" ? (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 16,
                  }}
                >
                  No tienes invitaciones pendientes
                </Text>
              ) : selectedItem === "enviadas" ? (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 16,
                  }}
                >
                  No tienes jugadas ni solicitudes
                </Text>
              ) : (
                <Text
                  style={{ color: "white", textAlign: "center", marginTop: 20 }}
                >
                  No hay datos disponibles
                </Text>
              )
            }
          />
        </View>
      )}

      <InvitacionesModal
        visible={modalVisible}
        closeModal={() => setModalVisible(false)}
        data={selectedData}
        mostrarFooter={selectedItem === "recibidas"}
        onAceptar={(id_juego) => handleAceptar(id_juego, idJugador)}
        onRechazar={() => handleRechazar(selectedData.id_juego, idJugador)}
      />

      <JugadorModal
        visible={jugadorModalVisible}
        closeModal={() => setJugadorModalVisible(false)}
        data={selectedJugadorData}
        idJuego={selectedJuegoId}
        onAceptar={handleAceptar}
        onRechazar={handleRechazar}
        jugadorLoading={jugadorLoading}
        mostrarAcciones={showFooter}
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
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
    paddingBottom: "20%",
  },
});
export default Solicitudes;
