import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Text,
  Modal,
  Animated,
  RefreshControl, // <-- Agregado para Pull-to-refresh
  TouchableOpacity, // <-- Agregado para TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Para acceder al JWT
import APIManager from "../componentes/API/APIManager";
import Logo from "../componentes/Logo";
import Titulo from "../componentes/Titulo";
import ProfileChip from "../componentes/ComponetePerfil";
import ComponenteRanking from "../componentes/ComponenteRanking";
import SearchBar from "../componentes/SearchBar";
import JugadorDetalle from "../componentes/JugadorBuscado";
import FilterBar from "../componentes/FilterBar";
import UbicationFilter from "../componentes/UbicationFilter";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const Ranking = () => {
  const navigation = useNavigation();
  const [rankings, setRankings] = useState([]);
  const [filteredRankings, setFilteredRankings] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userState, setUserState] = useState("");
  const [userCountry, setUserCountry] = useState("");
  const [directions, setDirections] = useState([]);
  const [locationFilteredRankings, setLocationFilteredRankings] = useState([]);
  const [hasSearchResults, setHasSearchResults] = useState(true);
  const [hasFilteredResults, setHasFilteredResults] = useState(true); // Nuevo estado para manejar resultados filtrados
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la carga
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Estado específico para carga de más elementos
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false); // Inicializado en false hasta verificar
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false); // Estado para controlar la modal
  const [userRanking, setUserRanking] = useState(null); // Estado para almacenar el ranking del usuario actual
  console.log("ranking del usuario", userRanking);
  const [stripeCustomer, setStripe] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [rankingUser, setRankingUser] = useState(null);
  const [ubicationType, setUbicationType] = useState("Estatal"); // 'Global', 'Nacional', 'Estatal'
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [userGender, setUserGender] = useState(null);
  const [userCategory, setUserCategory] = useState(null);
  const [showUserNotInRanking, setShowUserNotInRanking] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [clearSearch, setClearSearch] = useState(false);

  // Refs para evitar llamadas duplicadas
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const getDatos = async () => {
    try {
      const res = await APIManager({
        url: "Perfil/get_info",
        method: "get",
      });

      console.log("datos del perfil", res);

      const stripeId = res.data.stripe_id;
      setStripe(stripeId);
      return stripeId; // ✅ Devolver stripeId para usarlo en el paso siguiente
    } catch (error) {
      console.log("Error al obtener datos del perfil:", error);
      return null;
    }
  };

  const verificarSuscripcion = async (userId) => {
    setIsLoading(true);

    try {
      const stripeId = await getDatos();

      if (stripeId) {
        const subscription = await fetchUserSubscription(stripeId);
        console.log("suscripcn", subscription);

        if (subscription && subscription.exists) {
          setHasActiveSubscription(true);
          setShowSubscriptionModal(false); // No mostrar modal si tiene suscripción
          await fetchDirecciones();
        } else {
          setHasActiveSubscription(false);
          setShowSubscriptionModal(true); // Mostrar modal si no tiene suscripción
          console.log(
            "Sin suscripción activa",
            "No tienes una suscripción activa."
          );
        }

        setIsLoading(false); // Solo se desactiva aquí si todo fue bien
      } else {
        setHasActiveSubscription(false);
        setShowSubscriptionModal(true); // Mostrar modal si no se pudo obtener el stripe ID
        console.log("Error", "No se pudo obtener el ID de Stripe.");
        setIsLoading(false); // También aquí, porque no es error de red
      }
    } catch (error) {
      console.log("Error en verificarSuscripcion:", error);

      // Detectar error de red
      const isNetworkError =
        error.message?.includes("Network request failed") || !error.response;

      if (!isNetworkError) {
        setHasActiveSubscription(false);
        setShowSubscriptionModal(true); // Mostrar modal en caso de error
        setIsLoading(false); // Solo detener loading si NO es un error de red
        console.log(
          "Error",
          "Ocurrió un error inesperado al verificar tu suscripción."
        );
      }
    }
  };

  // Efecto SOLO para resetear filtros y limpiar búsqueda
  useFocusEffect(
    React.useCallback(() => {
      setShowSubscriptionModal(false);
      setSelectedGender(userGender);
      setSelectedCategory(userCategory);
      setUbicationType("Estatal");
      setSelectedCountry(userCountry || "");
      setSelectedState(userState || "");
      setJugadorSeleccionado(null);
      setClearSearch(true); // Limpiar barra de búsqueda
      return () => {
        setJugadorSeleccionado(null);
        setClearSearch(true); // Limpiar barra de búsqueda al salir
      };
    }, [userGender, userCategory, userCountry, userState])
  );

  // Efecto SOLO para verificar suscripción cuando userId cambia y la pantalla está en foco
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        verificarSuscripcion(userId);
      }
    }, [userId])
  );

  // Mantener el useFocusEffect para getUserInfo
  useFocusEffect(
    React.useCallback(() => {
      getUserInfo();
    }, [])
  );

  const fetchUserSubscription = async (stripeId) => {
    if (!stripeId) return null;

    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/checkSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: stripeId }), // Se pasa el stripeId
        }
      );

      const data = await response.json();

      // Verificar si la respuesta fue exitosa
      if (!response.ok)
        throw new Error(data.error || "Error al verificar suscripción.");

      // Devuelve la información de la suscripción
      return {
        exists: data.hasSubscription, // Verifica si la suscripción existe
        status: data.status, // Estado de la suscripción
        subscriptionID: data.subscriptionId, // ID de la suscripción
        productId: data.productId, // ID del producto
        currentPeriodEnd: data.currentPeriodEnd, // Fecha de fin del período actual
      };
    } catch (err) {
      console.log("Error al verificar suscripciones:", err.message);
      return null; // Retorna null en caso de error
    }
  };

  const getUserInfo = async () => {
    try {
      const id = await AsyncStorage.getItem("id_usuario");
      const estado = await AsyncStorage.getItem("estado_usuario");
      const pais = await AsyncStorage.getItem("pais_usuario");
      const genero = await AsyncStorage.getItem("genero_usuario");
      const categoria = await AsyncStorage.getItem("categoria_usuario");

      console.log("[DEBUG] getUserInfo - Datos obtenidos:", {
        id,
        estado,
        pais,
        genero,
        categoria,
      });

      if (id) {
        setUserId(id);
        setUserState(estado || "");
        setUserCountry(pais || "");
        setSelectedGender(genero); // 'M' o 'F'
        setSelectedCategory(categoria ? Number(categoria) : null); // 1-6
        setUserGender(genero); // Guarda el original
        setUserCategory(categoria ? Number(categoria) : null); // Guarda el original
        setSelectedCountry(pais || ""); // Inicializar país seleccionado
        setSelectedState(estado || ""); // Inicializar estado seleccionado
      }
    } catch (err) {
      console.log("Error al obtener datos del usuario:", err);
    }
  };

  function quitarAcentos(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const fetchDirecciones = async () => {
    try {
      const response = await APIManager({
        url: "/ranking/FiltroRanking/get_direcciones2",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (Array.isArray(response)) {
        const valid = response.filter(
          (d) =>
            d.latitud && d.longitud && !isNaN(d.latitud) && !isNaN(d.longitud)
        );
        setDirections(valid);
      }
    } catch (err) {
      console.log("Error al obtener direcciones:", err);
    }
  };

  const handleFilter = useCallback(
    (gender, category) => {
      console.log(
        "[DEBUG] handleFilter - Nuevo género:",
        gender,
        "Nueva categoría:",
        category
      );

      // Validar que los valores no sean nulos
      if (gender === null || category === null) {
        console.log(
          "[DEBUG] handleFilter - Valores nulos detectados, cancelando filtro"
        );
        return;
      }

      setSelectedGender(gender); // 'M' o 'F'
      setSelectedCategory(category); // 1-6
      setPage(1);
      setHasMore(true);
      setRankings([]); // Limpia la lista antes de recargar

      // Si los filtros seleccionados no son los del usuario, muestra el popup
      if (
        userGender !== null &&
        userCategory !== null &&
        (gender !== userGender || category !== userCategory)
      ) {
        setShowUserNotInRanking(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setShowUserNotInRanking(false));
        }, 3000);
      }
    },
    [userGender, userCategory, fadeAnim]
  );

  const handleUbicationFilter = useCallback((type, country, state) => {
    console.log(
      "[DEBUG] handleUbicationFilter - Tipo:",
      type,
      "País:",
      country,
      "Estado:",
      state
    );

    // Validar que el tipo no sea nulo
    if (!type) {
      console.log(
        "[DEBUG] handleUbicationFilter - Tipo nulo detectado, cancelando filtro"
      );
      return;
    }

    setUbicationType(type); // 'Global', 'Nacional', 'Estatal'
    setSelectedCountry(country || "");
    setSelectedState(state || "");
    setPage(1);
    setHasMore(true);
    setRankings([]);

    // Llamar a fetchRankingPaginated después de actualizar los estados
    setTimeout(() => {
      fetchRankingPaginated(true, type, country, state);
    }, 100);
  }, []);

  const renderItem = ({ item }) => (
    <ComponenteRanking
      numRanking={item.num_ranking}
      position={item.num_ranking}
      nombre={`${item.us_nombre} ${item.us_apellidop}`}
      puntos={item.jug_puntos}
    />
  );

  // Modal de Suscripción
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
            <Text style={styles.modalTitleSub}>RANKING EXCLUSIVO PARA SUSCRIPTORES</Text>
          </View>
          <View style={styles.modalContentSub}>
            <Text style={styles.modalTextSub}>
              Suscríbete para conocer tu posición, seguir tu progreso y competir con los mejores.
            </Text>
          </View>
          {/* Footer con botones de acción, igual que en InivtacionesModal */}
          <View style={styles.footerSub}>
            <TouchableOpacity
              style={styles.acceptButtonSub}
              onPress={() => {
                navigateWithModalHandling("Suscripciones", { stripeCustomer });
              }}
              activeOpacity={0.8}
            >
              <Icon name="card-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonTextSub}>VER SUSCRIPCIONES</Text>
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

  // Añadir un efecto de limpieza para el modal
  useEffect(() => {
    return () => {
      // Cleanup function when component unmounts
      setShowSubscriptionModal(false);
      // Cancelar cualquier petición pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Navega a otra pantalla cerrando primero el modal si está abierto
   * @param {string} screenName - Nombre de la pantalla a la que navegar
   * @param {object} params - Parámetros opcionales para la navegación
   */
  const navigateWithModalHandling = (screenName, params = {}) => {
    if (showSubscriptionModal) {
      // Si el modal está abierto, lo cerramos primero
      setShowSubscriptionModal(false);

      // En iOS necesitamos un tiempo para que se cierre la modal antes de navegar
      const delay = 100;

      setTimeout(() => {
        navigation.navigate("Menu", { screen: screenName, params });
      }, delay);
    } else {
      // Si el modal no está abierto, navegamos directamente
      navigation.navigate("Menu", { screen: screenName, params });
    }
  };

  // Función para saber si los filtros actuales son los del usuario
  const isUserFilters =
    selectedGender === userGender && selectedCategory === userCategory;

  // Nueva función optimizada para obtener la lista paginada
  const fetchRankingPaginated = useCallback(
    async (
      reset = false,
      type = ubicationType,
      country = selectedCountry,
      state = selectedState
    ) => {
      // Validar que los parámetros requeridos no sean nulos
      if (!selectedGender || selectedCategory === null) {
        console.log(
          "[DEBUG] fetchRankingPaginated - Parámetros requeridos nulos:",
          { selectedGender, selectedCategory }
        );
        return;
      }

      // Evitar llamadas duplicadas
      if (isLoadingRef.current) {
        console.log(
          "[DEBUG] fetchRankingPaginated - Llamada cancelada, ya hay una en progreso"
        );
        return;
      }

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

      try {
        isLoadingRef.current = true;

        if (reset) {
          setIsLoading(true);
          setRankings([]); // Solo limpiar en reset
        } else {
          setIsLoadingMore(true);
        }

        const genero = selectedGender;
        const categoria = selectedCategory;
        let id_usuario = userId || (await AsyncStorage.getItem("id_usuario"));

        let url = `https://arosports.app/arosports/private/movil/ranking/FiltroRanking/get_filtroRankings?genero=${genero}&categoria=${categoria}`;

        if (type === "Nacional") {
          url += `&pais=${quitarAcentos(country).toLowerCase().trim()}`;
          url += `&global=false`;
        } else if (type === "Estatal") {
          url += `&pais=${quitarAcentos(country).toLowerCase().trim()}`;
          url += `&estado=${quitarAcentos(state).toLowerCase().trim()}`;
          url += `&global=false`;
        } else if (type === "Global") {
          url += `&global=true`;
        }

        // Solo agrega id_usuario si los filtros son los del usuario
        if (isUserFilters) {
          url += `&id_usuario=${id_usuario}`;
        }

        const currentPage = reset ? 1 : page;
        url += `&page=${currentPage}&per_page=${perPage}`;

        console.log("[DEBUG] fetchRankingPaginated - URL:", url);
        console.log("[DEBUG] fetchRankingPaginated - Parámetros:", {
          genero,
          categoria,
          type,
          country,
          state,
          currentPage,
        });

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[DEBUG] fetchRankingPaginated - Data recibida:", data);

        if (data && data.lista) {
          if (reset) {
            setRankings(data.lista);
            setPage(2);
            setHasMore(data.lista.length === perPage);
          } else {
            // Agregar nuevos elementos a la lista existente
            setRankings((prev) => {
              // Evitar duplicados por ID
              const existingIds = new Set(prev.map((item) => item.id_usuario));
              const newItems = data.lista.filter(
                (item) => !existingIds.has(item.id_usuario)
              );
              return [...prev, ...newItems];
            });
            setPage(currentPage + 1);
            setHasMore(data.lista.length === perPage);
          }
          setRankingUser(data.usuario || null);
        } else {
          if (reset) setRankings([]);
          setHasMore(false);
          setRankingUser(null);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("[DEBUG] fetchRankingPaginated - Petición cancelada");
          return;
        }
        console.log("Error al obtener rankings paginados:", err);
        setRankingUser(null);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        abortControllerRef.current = null;
      }
    },
    [
      selectedGender,
      selectedCategory,
      ubicationType,
      selectedCountry,
      selectedState,
      userId,
      page,
      perPage,
      isUserFilters,
    ]
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoadingRef.current && hasMore && !isLoadingMore) {
      console.log(
        "[DEBUG] handleLoadMore - Cargando más elementos, página:",
        page
      );
      fetchRankingPaginated(false);
    }
  }, [hasMore, page, fetchRankingPaginated]);

  const handleRefresh = useCallback(() => {
    console.log("[DEBUG] handleRefresh - Refrescando lista");
    setClearSearch(true);
    setJugadorSeleccionado(null);
    setIsRefreshing(true);
    setHasMore(true);
    setPage(1);
    fetchRankingPaginated(true);
  }, [fetchRankingPaginated]);

  // Llama a la función al montar el componente o cuando cambian los filtros
  useEffect(() => {
    if (userId && selectedGender && selectedCategory !== null) {
      console.log("[DEBUG] useEffect - Cargando ranking inicial");
      console.log("[DEBUG] useEffect - Parámetros:", {
        userId,
        selectedGender,
        selectedCategory,
        ubicationType,
        selectedCountry,
        selectedState,
      });
      fetchRankingPaginated(true);
    }
  }, [
    selectedGender,
    selectedCategory,
    ubicationType,
    selectedCountry,
    selectedState,
    userId,
  ]);

  // Efecto para devolver clearSearch a false después de limpiar
  useEffect(() => {
    if (clearSearch) {
      setClearSearch(false);
    }
  }, [clearSearch]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Logo />
        <Titulo titulo="RANKING" />
        <SearchBar onJugadorSeleccionado={setJugadorSeleccionado} clearSearch={clearSearch} />

        <View style={styles.center}>
          {isUserFilters && rankingUser && (
            <ProfileChip userData={rankingUser} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#02B9FA"]} // color Android
              tintColor="#02B9FA" // color iOS
            />
          }
        >
          <FilterBar
            onFilter={handleFilter}
            setFilteredRankings={setLocationFilteredRankings}
            initialGender={selectedGender}
            initialCategory={selectedCategory}
            disabled={isLoading}
          />

          <UbicationFilter
            onSelect={handleUbicationFilter}
            initialCountry={selectedCountry}
            initialState={selectedState}
            disabled={isLoading}
          />

          {jugadorSeleccionado ? (
            <JugadorDetalle datos={jugadorSeleccionado} />
          ) : (
            <>
              {/* Si está cargando inicialmente, mostrar el texto "Cargando..." */}
              {showUserNotInRanking || (isLoading && rankings.length === 0) ? (
                <View style={styles.center}>
                  <Text style={{ color: "white", marginTop: 20, fontSize: 16 }}>
                    Cargando...
                  </Text>
                </View>
              ) : // Verificamos si la suscripción está activa
              hasActiveSubscription ? (
                hasFilteredResults ? (
                  <>
                    {rankings.length === 0 ? (
                      <View style={styles.center}>
                        <Text
                          style={{
                            color: "white",
                            marginTop: 20,
                            fontSize: 16,
                          }}
                        >
                          No hay jugadores en este ranking.
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        data={rankings}
                        renderItem={({ item }) => (
                          <ProfileChip userData={item} />
                        )}
                        keyExtractor={(item) => item.id_usuario}
                        contentContainerStyle={{ paddingBottom: 0 }}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        ListFooterComponent={
                          isLoadingMore && hasMore ? (
                            <View style={styles.loadingMoreContainer}>
                              <Text style={styles.loadingMoreText}>
                                Cargando más...
                              </Text>
                            </View>
                          ) : null
                        }
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        initialNumToRender={15}
                        getItemLayout={(data, index) => ({
                          length: 80, // Altura estimada de cada item
                          offset: 80 * index,
                          index,
                        })}
                        scrollEnabled={false}
                      />
                    )}
                  </>
                ) : (
                  <View style={styles.center}>
                    <Text
                      style={{ color: "white", marginTop: 20, fontSize: 16 }}
                    >
                      No hay resultados para esta categoría o género.
                    </Text>
                  </View>
                )
              ) : (
                <SubscriptionModal />
              )}
            </>
          )}

          {/* Popup temporal si el usuario no pertenece al ranking */}
          {showUserNotInRanking && (
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 40,
                zIndex: 100,
                alignItems: "center",
                justifyContent: "center",
                opacity: fadeAnim,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "#00baff",
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 8,
                  minWidth: 250,
                  maxWidth: "80%",
                }}
              >
                <Text
                  style={{ color: "#555", fontSize: 15, textAlign: "center" }}
                >
                  No perteneces a este ranking. Tu perfil no se mostrará aquí.
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  center: {
    alignItems: "center",
    marginBottom: 10,
  },
  centerT: {
    alignItems: "center",
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    color: "white",
    //  fontWeight: 'bold',
    marginBottom: 10,
  },
  subscribeButton: {
    backgroundColor: "#02B9FA",
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  // Estilos para la modal de suscripción
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo oscuro semi-transparente
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#ffffff", // Fondo blanco para la modal
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#00baff",
    padding: 25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#02B9FA",
    elevation: 5, // Solo para Android
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333", // Color de texto oscuro para fondo blanco
    textAlign: "center",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#555", // Color de texto oscuro para fondo blanco
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButtonsContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  subscribeButtonModal: {
    backgroundColor: "#02B9FA",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#02B9FA",
    width: "90%",
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  returnButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#02B9FA",
    width: "90%",
    marginTop: 10,
  },
  returnButtonText: {
    color: "#02B9FA",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingMoreContainer: {
    paddingVertical: 15,
    alignItems: "center",
  },
  loadingMoreText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  // Estilos para la nueva modal de suscripción (igual que Inscripcion/InvitacionesModal)
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
  buttonContainerSub: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 10,
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
    width: "100%"
  },
  buttonTextSub: {
    color: "#fff",
    fontSize: RFValue(10, 667),
    fontWeight: "600",
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
});

export default Ranking;