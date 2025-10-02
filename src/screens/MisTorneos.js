import React, { useState, useEffect } from "react";
import {
  TextInput,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import Titulo from "../componentes/Titulo";
import Logo from "../componentes/Logo";
import BannerAd from "../componentes/BannerAd";
import APIManager from "../componentes/API/APIManager";
import URL from "../Helper/URL";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview"; // Importar WebView
import { RFValue } from "react-native-responsive-fontsize";

const MisTorneos = () => {
  const BASE_URL = URL.imagen;
  const navigation = useNavigation();
  const [torneosIncritos, setTorneosInscritos] = useState([]);
  const [id_jugador, setIdJugador] = useState("");
  console.log("torneosIncritos", torneosIncritos);
  const [isLoading, setIsLoading] = useState(false);
  //model de bracked
  const [showExtraModal, setShowExtraModal] = useState(false);

  const getTorneos = async () => {
    setIsLoading(true); // Activar el loading antes de la carga
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      const formData = new FormData();
      formData.append("id_usuario", id_usuario);

      console.log("Enviando datos a la API...");
      console.log("FormData:", formData);

      const response = await APIManager({
        url: "eventos/Eventos/mis_torneos",
        method: "POST",
        data: formData,
      });

      console.log("Respuesta completa de la API:", response);

      if (response && response.resultado) {
        const torneos = response.datos || [];
        const torneosInscritos = torneos.filter(
          (torneo) => torneo.registrado === 1
        );

        setTorneosInscritos(torneosInscritos);

        // Obtener el id_jugador si el usuario está inscrito en algún torneo
        if (torneosInscritos.length > 0) {
          const idJugador = torneosInscritos[0].jugador; // Tomamos el primero
          console.log("ID del jugador obtenido:", idJugador);
          setIdJugador(idJugador);
          await AsyncStorage.setItem("id_jugador", idJugador.toString());
        }
      } else {
        alert(response.mensaje || "No se encontraron torneos");
      }
    } catch (error) {
      console.log("Error obteniendo torneos:", error);
      alert("Hubo un problema al obtener los torneos");
    }
    setIsLoading(false); // Desactivar el loading después de la carga
  };

  useFocusEffect(
    React.useCallback(() => {
      getTorneos();
      // obtenerTorneoDetalle();
    }, [])
  );

  const formatFecha = (fecha) => {
    if (fecha) {
      const [year, month, day] = fecha.split("-");
      return `${day}/${month}/${year}`;
    }
    return "Fecha no disponible"; // Si no existe la fecha, devolvemos un texto predeterminado
  };

  const capitalizar = (texto) => {
    return texto
      ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
      : "";
  };

  const formatearFecha = (fecha) => {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  const [idTorneoSeleccionado, setIdTorneoSeleccionado] = useState(null);
  const [visible, setVisible] = useState(false);
  const [torneoDetalles, setTorneoDetalles] = useState({});
  console.log("torneo completo", torneoDetalles);

  const abrirModalDetalle = (torneo) => {
    const torneoDetalles = {
      club: torneo.fracci,
      nombre: torneo.nombre,
      fechaInicio: formatFecha(torneo.torneo_fecha),
      fechaFin: formatFecha(torneo.fecha_fin),
      precio: torneo.precio,
      moneda: torneo.moneda,
      categoria: torneo.categoria,
      subcategoria: torneo.subcategoria,
    };

    setTorneoDetalles(torneoDetalles);
    setVisible(true);
  };

  const closeModal = () => setVisible(false);

  // Convertir las canchas en una cadena separada por comas
  const obtenerCanchas = (canchas) => {
    if (canchas && canchas.length > 0) {
      return canchas.map((cancha) => cancha.can_nombre).join(", ");
    }
    return "No hay canchas disponibles"; // Mensaje predeterminado si no hay canchas
  };

  const renderTorneo = ({ item }) => (
    <View style={styles.torneoContainer}>
      {/* Imagen del torneo */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${BASE_URL}/${item.imagen}` }}
          style={styles.torneoImage}
          resizeMode="cover"
        />
      </View>

      {/* Información del torneo */}
      <View style={styles.torneoInfo}>
        <Text
          style={styles.torneoNombre}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.nombre}
        </Text>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={16} color={colors.primary} />
          <Text style={styles.torneoText}>{capitalizar(item.fracci)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.torneoText}>
            {formatearFecha(item.torneo_fecha)}
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.torneoActions}>
          <TouchableOpacity
            onPress={() => abrirModalDetalle(item)}
            style={styles.detailButton}
            activeOpacity={0.8}
          >
            <Icon name="eye-outline" size={16} color="#fff" />
            <Text style={styles.detailButtonText}>Ver Detalle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (item?.torneo_completo === 1) {
                setIdTorneoSeleccionado(item.id);
                setShowExtraModal(true);
              } else {
                Alert.alert(
                  "Bracket en proceso",
                  "El torneo aún no está completo.",
                  [{ text: "OK" }]
                );
              }
            }}
            style={[
              styles.bracketButton,
              {
                backgroundColor:
                  item?.torneo_completo === 1 ? "colors.primary" : "#808191",
              },
            ]}
            activeOpacity={0.8}
          >
            <Icon name="trophy-outline" size={16} color="#fff" />
            <Text style={styles.bracketButtonText}>Ver Bracket</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="MIS TORNEOS" />
      <View style={{ flex: 1, marginBottom: 50 }}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.loader}
          />
        ) : torneosIncritos && torneosIncritos.length > 0 ? (
          <FlatList
            data={torneosIncritos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTorneo}
            contentContainerStyle={{ paddingBottom: 60 }} // Espacio para el banner
            showsVerticalScrollIndicator={true} // Muestra el scrollbar
          />
        ) : (
          <Text style={styles.noTorneosText}>No tienes torneos inscritos.</Text>
        )}
      </View>

      <Modal visible={showExtraModal} transparent={true} animationType="slide">
        <View style={[styles.modalOverlay, { padding: 0 }]}>
          <View
            style={[
              styles.modalContainer,
              {
                width: "90%",
                maxWidth: 500,
                minWidth: 300,
                height: "80%",
                maxHeight: 600,
                minHeight: 300,
                alignSelf: "center",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>DETALLE DEL BRACKET</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowExtraModal(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando...</Text>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            {idTorneoSeleccionado && (
              <WebView
                source={{
                  uri: `https://arosports.app/arosports/private/web/club/Bracket/?id_torneo=${idTorneoSeleccionado}`,
                }}
                style={{ flex: 1, borderRadius: 12 }}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Encabezado del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>DETALLE DEL TORNEO</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Cuerpo del modal */}
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailItem}>
                <Icon
                  name="trophy-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Nombre</Text>
                  <Text style={styles.detailValue}>
                    {torneoDetalles.nombre}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon
                  name="location-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Club</Text>
                  <Text style={styles.detailValue}>
                    {capitalizar(torneoDetalles.club)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon
                  name="calendar-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Fechas</Text>
                  <Text style={styles.detailValue}>
                    {torneoDetalles.fechaInicio} - {torneoDetalles.fechaFin}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon
                  name="pricetag-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Precio</Text>
                  <Text style={styles.detailValue}>
                    {torneoDetalles.precio} {torneoDetalles.moneda}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Icon
                  name="list-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Categoría</Text>
                  <Text style={styles.detailValue}>
                    {torneoDetalles.categoria} {torneoDetalles.subcategoria}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  torneoContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderColor: "colors.primary",
    borderWidth: 3,
    borderRadius: 16,
    padding: 12,
    width: "95%",
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
    color: "colors.primary",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  torneoText: {
    fontSize: RFValue(12, 667),
    color: "#808191",
    marginLeft: 8,
  },
  torneoPrecio: {
    fontSize: 14,
    color: "#809FB8",
    marginVertical: 5,
  },
  torneoActions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "colors.primary",
    borderWidth: 1,
    borderColor: "colors.primary",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    flex: 1,
  },
  detailButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: RFValue(10, 667),
  },
  bracketButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  bracketButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: RFValue(10, 667),
  },
  actionButton: {
    backgroundColor: "colors.primary",
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    flex: 1, // Asegura que el botón ocupe el mismo espacio disponible
    alignItems: "center", // Alineación horizontal del texto dentro del botón
    justifyContent: "center", // Alineación vertical del texto dentro del botón
    minWidth: 100, // Tamaño mínimo de los botones
  },
  actionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14, // Puedes ajustar el tamaño del texto aquí
  },
  noTorneosText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  loader: {
    marginTop: 20,
  },
  modalContainerD: {
    // backgroundColor: "#fff",
    backgroundColor: "rgba(255, 255, 255, 1)", // Fondo blanco translúcido
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "colors.primary",
    padding: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "colors.primary",
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f9f9f9",
  },
  modalTitle: {
    fontSize: RFValue(14, 667),
    fontWeight: "700",
    color: "colors.primary",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },

  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailIcon: {
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  detailLabel: {
    fontSize: RFValue(10, 667),
    color: "#666",
    marginBottom: 2,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: RFValue(11, 667),
    color: "#808191",
    fontWeight: "400",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  icon: {
    marginLeft: 10,
  },
  refreshIcon: {
    marginLeft: 190,
    backgroundColor: "colors.primary",
    borderRadius: 30,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Asegurarse de que el indicador de carga se muestre por encima del WebView
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 10,
  },
  //modales de detalle
  modalOverlayDetalle: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente para resaltar el modal
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainerDetalle: {
    backgroundColor: "rgba(255, 255, 255, 1)", // Fondo blanco translúcido
    borderRadius: 15,
    padding: 20,
    width: "85%",
    borderWidth: 2,
    borderColor: "colors.primary",
    height: 270, // Puedes ajustar esta altura según sea necesario
    maxHeight: "100%", // Opcional: limita el tamaño al 80% de la pantalla
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Sombra para Android
  },
  closeDetalle: {
    position: "absolute",
    top: 3,
    right: 3,
    zIndex: 10,
  },
  canchasContainer: {
    marginTop: 10,
  },
  canchasText: {
    fontSize: 14,
    color: "#024A86",
  },
  boldText: {
    fontWeight: "bold",
    color: "#024A86",
  },
  closeIconD: {
    position: "absolute",
    top: 3,
    right: 3,
    zIndex: 10,
  },
  torneoFecha: {
    fontSize: 14,
    color: "#809FB8",
    marginVertical: 1,
  },
});

export default MisTorneos;
