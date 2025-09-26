import React, { useState, useEffect, useRef } from "react";
import { useEvent } from "expo";
import {
  View,
  Text,
  Alert,
  Animated,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import MenuItem from "../componentes/MenuItem";
import VideoAd from "../modales/VideoAd";
import FormularioJugada from "../screens/formularioJugada";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import APIManager from "../componentes/API/APIManager.jsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../componentes/Logo";
import Titulo from "../componentes/Titulo";
import { VideoView, useVideoPlayer } from "expo-video";
import BannerAd from "../componentes/BannerAd";
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";

const CrearJuego = () => {
  const [subscription, setSubscription] = useState(null);
  console.log("susucxr", subscription);

  const [playedGames, setPlayedGames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeCustomer, setIdStripe] = useState("");
  const navigation = useNavigation();

  const lastTimeRef = useRef(0);
  const playerRef = useRef(null);
  const [videoEnded, setVideoEnded] = useState(false); // Estado para saber si el video terminó
  const videoSource = require("../../assets/video.mp4");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("publica");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Función para obtener los datos del perfil del usuario
  const getDatos = React.useCallback(async () => {
    try {
      const res = await APIManager({ url: "Perfil/get_info", method: "GET" });
      setIdStripe(res.data.stripe_id || "");
    } catch (error) {
      console.log("Error al obtener datos del perfil:", error);
    }
  }, []);

  // Función para obtener la suscripción del usuario
  const fetchUserSubscription = React.useCallback(async (stripeId) => {
    if (!stripeId) return null;
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/checkSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: stripeId }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Error al verificar suscripción.");

      return {
        exists: data.hasSubscription,
        status: data.status,
        subscriptionID: data.subscriptionId,
        productId: data.productId,
        currentPeriodEnd: data.currentPeriodEnd,
      };
    } catch (err) {
      console.log("Error al verificar suscripciones:", err.message);
      Alert.alert("Alerta", "Hubo un error al verificar tu suscripción.");
      return null;
    }
  }, []);

  // Función para obtener las jugadas del usuario
  const fetchPlayedGames = React.useCallback(async () => {
    try {
      const idUsuario = await AsyncStorage.getItem("id_usuario");
      if (!idUsuario)
        throw new Error(
          "No se encontró el ID del usuario en el almacenamiento."
        );

      const response = await APIManager({
        url: `CrearJuego/CrearJuego/obtenerJugadasUsuario?id_usuario=${idUsuario}`,
        method: "GET",
      });

      if (!response || typeof response.numberOfPlayedGames !== "number") {
        throw new Error("No se pudo obtener el número de jugadas.");
      }

      return response.numberOfPlayedGames;
    } catch (error) {
      console.log("Error al obtener jugadas:", error.message);
      Alert.alert("Error", "No se pudo obtener la cantidad de jugadas.");
      return null;
    }
  }, []);

  // useFocusEffect para que las consultas se realicen cuando se enfoque la pantalla
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        await getDatos(); // Obtener el stripeCustomer primero
      };
      fetchData();
    }, [getDatos])
  );

  // useFocusEffect para cargar la suscripción y las jugadas cada vez que el stripeCustomer cambia
  useFocusEffect(
    React.useCallback(() => {
      const loadSubscriptionAndGames = async () => {
        if (stripeCustomer) {
          const subscriptionData = await fetchUserSubscription(stripeCustomer);
          const playedGamesData = await fetchPlayedGames();

          setSubscription(subscriptionData);
          setPlayedGames(playedGamesData);
          setShowSubscriptionModal(playedGamesData >= 5 && !subscriptionData?.exists); // Mostrar modal si se alcanza el límite y no hay suscripción
          setLoading(false);
        }
      };

      if (stripeCustomer) {
        loadSubscriptionAndGames();
      }
    }, [stripeCustomer, getDatos, fetchUserSubscription, fetchPlayedGames])
  );

  // Función para navegar cerrando la modal primero
  const navigateWithModalHandling = (screenName, params = {}) => {
    if (showSubscriptionModal) {
      setShowSubscriptionModal(false);
      const delay = 100;
      setTimeout(() => {
        navigation.navigate("Menu", { screen: screenName, params });
      }, delay);
    } else {
      navigation.navigate("Menu", { screen: screenName, params });
    }
  };

  // Efecto para limpiar la modal al desmontar el componente
  useEffect(() => {
    return () => {
      setShowSubscriptionModal(false);
    };
  }, []);

  // Componente de la modal de suscripción
  const SubscriptionModal = () => (
    <Modal
      visible={showSubscriptionModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainerSub}>
          <View style={styles.modalHeaderSub}>
            <Text style={styles.modalTitleSub}>LÍMITE DE JUGADAS ALCANZADO</Text>
          </View>
          <View style={styles.modalContentSub}>
            <Text style={styles.modalTextSub}>
              ¡Has alcanzado el límite de jugadas! Suscríbete para continuar
              creando jugadas y disfruta de más contenido exclusivo.
            </Text>
          </View>
          <View style={styles.footerSub}>
            <TouchableOpacity
              style={styles.acceptButtonSub}
              onPress={() =>
                navigateWithModalHandling("Suscripciones", { stripeCustomer })
              }
              activeOpacity={0.8}
            >
              <Icon name="card-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonTextSub}>SUSCRIBIRME AHORA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButtonSub}
              onPress={() => {
                setShowSubscriptionModal(false);
                setTimeout(() => {
                  navigation.goBack();
                }, 300);
              }}
              activeOpacity={0.8}
            >
              <Icon name="arrow-back" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonTextSub}>REGRESAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Logo />
        <Titulo titulo="CREAR JUGADA" />
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={styles.containerLoa}
        />
        {/* <Text style={styles.loadingText}>Loading...</Text> */}
      </View>
    );
  }

  if (subscription?.exists) {
    return (
      <View style={styles.container}>
        <Logo />
        <Titulo titulo="CREAR JUGADA" />
        {/* Menú tipo tabs con MenuItem */}
        <View style={styles.menuTabsContainer}>
          <MenuItem
            label="PUBLICA"
            isActive={selectedMenu === "publica"}
            onPress={() => setSelectedMenu("publica")}
          />
          <MenuItem
            label="PRIVADA"
            isActive={selectedMenu === "privada"}
            onPress={() => setSelectedMenu("privada")}
          />
        </View>
        <FormularioJugada
          numberOfPlayedGames={playedGames}
          subscription={subscription}
          tipoJugada={selectedMenu}
        />
        <View style={styles.containerBaner}>
          <BannerAd />
        </View>
      </View>
    );
  }

 if (playedGames >= 5) {
    return (
      <View style={styles.container}>
        <Logo />
        <Titulo titulo="CREAR JUGADA" />
        <SubscriptionModal />
        <View style={styles.containerBaner}>
          <BannerAd />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="CREAR JUGADA" />
      {/* Menú tipo tabs con MenuItem */}
      <View style={styles.menuTabsContainer}>
        <MenuItem
          label="PUBLICA"
          isActive={selectedMenu === "publica"}
          onPress={() => setSelectedMenu("publica")}
        />
        <MenuItem
          label="PRIVADA"
          isActive={selectedMenu === "privada"}
          onPress={() => setSelectedMenu("privada")}
        />
      </View>
      <FormularioJugada
        numberOfPlayedGames={playedGames}
        subscription={subscription}
        tipoJugada={selectedMenu}
      />
      <View style={styles.containerBaner}>
        <BannerAd />
      </View>
    </View>
  );
};

const styles = {
  menuTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 16,
  },
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
  },
  loadingText: {
    color: "#ffffff", // Color del texto
    fontSize: 18, // Tamaño de fuente
    marginTop: 10, // Espacio entre el indicador y el texto
    textAlign: "center", // Alineación del texto al centro
  },
  containerLoa: {
    justifyContent: "center", // Alineación vertical al centro
    alignItems: "center",
    marginTop: 60,
  },
  subscriptionContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#00baff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#00baff",
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainerSub: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderSub: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    alignItems: "center",
  },
  modalTitleSub: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    textTransform: "uppercase",
  },
  modalContentSub: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTextSub: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
  footerSub: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
    width: "100%",
  },
  acceptButtonSub: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    marginTop: 8,
    marginBottom: 12,
  },
  rejectButtonSub: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c70039",
    padding: 14,
    borderRadius: 8,
    width: "100%",
  },
  buttonTextSub: {
    color: "#fff",
    fontSize: RFValue(10, 667),
    fontWeight: "600",
  },
};

export default CrearJuego;
