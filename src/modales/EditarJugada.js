import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Keyboard,
  Alert,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import APIManager from "../componentes/API/APIManager.jsx";
import Categorias from "../componentes/Categorias";
import URL from "../Helper/URL";
import { agregarJugadorPendientes } from "../componentes/Activos/Americana/RetaApiService";

const { width } = Dimensions.get("window");
const BASE_ICON = require("../../assets/icon_no_profile.png");
const BASE_URL = URL.IMAGENES;

const EditarJugadas = ({ visible, closeModal, id_juego, id_user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [jugadoresConfirmados, setJugadoresConfirmados] = useState([]);
  const [jugadoresPendientes, setJugadoresPendientes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [agregandoJugador, setAgregandoJugador] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [nuevoNombreManual, setNuevoNombreManual] = useState("");
  const [categoriaManual, setCategoriaManual] = useState(null);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Fetch confirmados y pendientes al abrir el modal
  useEffect(() => {
    const fetchConfirmados = async () => {
      try {
        setLoading(true);
        const res = await APIManager({
          url: `solicitudes/SolicitudesConfirmadas/obtener_jugadas_confirmados?id_usuario=${id_user}&id_juego=${id_juego}`,
          method: "GET",
        });
        if (res.estatus && res.datos && res.datos.length > 0) {
          setJugadoresConfirmados(res.datos[0].confirmados || []);
        } else {
          setJugadoresConfirmados([]);
        }
      } catch (error) {
        setJugadoresConfirmados([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchPendientes = async () => {
      try {
        setLoading(true);
        const res = await APIManager({
          url: `solicitudes/SolicitudesConfirmadas/obtener_jugadas_pendientes?id_usuario=${id_user}&id_juego=${id_juego}`,
          method: "GET",
        });
        if (res.estatus && res.datos && res.datos.length > 0) {
          setJugadoresPendientes(res.datos[0].pendientes || []);
        } else {
          setJugadoresPendientes([]);
        }
      } catch (error) {
        setJugadoresPendientes([]);
      } finally {
        setLoading(false);
      }
    };
    if (visible && id_juego) {
      fetchConfirmados();
      fetchPendientes();
    }
  }, [visible, id_juego]);

  useEffect(() => {
    const getCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const res = await APIManager({
          url: "Perfil/get_categorias",
          method: "get",
        });
        const categoriasData = res.map((categoria) => ({
          label: categoria.categoria,
          value: String(categoria.id_categoria),
        }));
        setCategoriasOptions(categoriasData);
      } catch (error) {
        setCategoriasOptions([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    getCategorias();
  }, []);

  // Buscar jugadores
  const handleBuscarJugador = async (termino) => {
    setSearchTerm(termino);
    if (termino.trim() === "") {
      setResultadosBusqueda([]);
      return;
    }
    setBuscando(true);
    try {
      const data = new FormData();
      data.append("nombre", termino);
      const res = await APIManager({
        url: "eventos/Eventos/buscar_jugadores",
        method: "POST",
        data: data,
      });
      // Excluir los que ya están en confirmados o pendientes
      const idsExistentes = [
        ...jugadoresConfirmados.map((j) => j.id_jugador),
        ...jugadoresPendientes.map((j) => j.id_jugador),
      ];
      if (res.status && Array.isArray(res.data)) {
        const resultadosFiltrados = res.data.filter(
          (jugador) => !idsExistentes.includes(jugador.id_jugador)
        );
        setResultadosBusqueda(resultadosFiltrados);
      } else {
        setResultadosBusqueda([]);
      }
    } catch (error) {
      setResultadosBusqueda([]);
    } finally {
      setBuscando(false);
    }
  };

  // Modifica handleSeleccionarJugador para permitir agregar manual
  const handleSeleccionarJugador = async (jugadorParaAgregar) => {
    // Si no hay jugador seleccionado, abrir modal de categoría
    if (!jugadorParaAgregar || Object.keys(jugadorParaAgregar).length === 0) {
      setNuevoNombreManual(searchTerm);
      setCategoriaManual(null);
      setModalCategoriaVisible(true);
      return;
    }
    setAgregandoJugador(true);
    try {
      let jugadorFinal;
      if (jugadorParaAgregar.id_jugador && !jugadorParaAgregar.isManual) {
        const data = new FormData();
        data.append("id_juego", id_juego);
        data.append("id_jugador", jugadorParaAgregar.id_jugador);
        const res = await APIManager({
          url: "Activos/Activos/agregarJugador",
          method: "POST",
          data: data,
        });
        if (!res.status) {
          Alert.alert("Error", res.message || "No se pudo agregar el jugador");
          setAgregandoJugador(false);
          return;
        }
        jugadorFinal = {
          ...jugadorParaAgregar,
          isManual: false,
        };
        Alert.alert("Éxito", res.message || "Jugador agregado correctamente");
        await refreshJugadores();
      } else {
        // Jugador manual
        jugadorFinal = {
          us_nomUsuario: jugadorParaAgregar.us_nomUsuario || nuevoNombreManual,
          us_foto: null,
          isManual: true,
          id_jugador: null,
          categoria: jugadorParaAgregar.categoria || categoriaManual,
        };
        try {
          const res = await agregarJugadorPendientes(id_juego, jugadorFinal);
          if (!res.status) {
            Alert.alert(
              "Error",
              res.message || "No se pudo agregar el jugador manual"
            );
            setAgregandoJugador(false);
            return;
          }
          setJugadoresPendientes((prev) => [...prev, jugadorFinal]);
          Alert.alert(
            "Éxito",
            res.message || "Jugador manual agregado correctamente"
          );
          await refreshJugadores();
        } catch (error) {
          Alert.alert("Error", "No se pudo agregar el jugador manual");
          setAgregandoJugador(false);
          return;
        }
      }
      // Refrescar ambas listas
      setSearchTerm("");
      setResultadosBusqueda([]);
      setModalCategoriaVisible(false);
      setNuevoNombreManual("");
      setCategoriaManual(null);
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al agregar el jugador");
    } finally {
      setAgregandoJugador(false);
    }
  };

  // Refrescar ambas listas
  const refreshJugadores = async () => {
    try {
      setLoading(true);
      const resC = await APIManager({
        url: `solicitudes/SolicitudesConfirmadas/obtener_jugadas_confirmados?id_usuario=${id_user}&id_juego=${id_juego}`,
        method: "GET",
      });
      if (resC.estatus && resC.datos && resC.datos.length > 0) {
        setJugadoresConfirmados(resC.datos[0].confirmados || []);
      } else {
        setJugadoresConfirmados([]);
      }
      const resP = await APIManager({
        url: `solicitudes/SolicitudesConfirmadas/obtener_jugadas_pendientes?id_usuario=${id_user}&id_juego=${id_juego}`,
        method: "GET",
      });
      if (resP.estatus && resP.datos && resP.datos.length > 0) {
        setJugadoresPendientes(resP.datos[0].pendientes || []);
      } else {
        setJugadoresPendientes([]);
      }
    } catch (error) {
      setJugadoresConfirmados([]);
      setJugadoresPendientes([]);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar solo confirmados
  const handleEliminarJugador = async (jugador) => {
    if (!jugador) return;
    const eliminarDeLista = () => {
      setJugadoresConfirmados((prev) =>
        prev.filter((j) => j.id_jugador !== jugador.id_jugador)
      );
    };
    try {
      const data = new FormData();
      data.append("id_juego", id_juego);
      data.append("id_jugador", jugador.id_jugador);
      setLoading(true);
      const res = await APIManager({
        url: "Activos/Activos/cambiarEstadoJugador",
        method: "POST",
        data: data,
      });
      if (res.status) {
        eliminarDeLista();
        setLoading(false);
        await refreshJugadores();
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Ocurrió un error al eliminar el jugador");
    }
  };

  const ITEM_HEIGHT = 48; // Altura aproximada de cada item (para 2.5 items en 120px aprox)

  // Render helpers
  const nombreJugador = (jugador) => {
    const nombre =
      jugador?.us_nombre ||
      jugador?.us_nomUsuario ||
      jugador?.nombre_completo ||
      jugador?.nom_invitado ||
      "Sin nombre";
    const usuario = jugador?.usuario || jugador?.us_nomUsuario || "";
    if (jugador?.nom_invitado) {
      return `${jugador.nom_invitado} (Invitado)`;
    }
    return usuario ? `${nombre} (${usuario})` : nombre;
  };

  const renderPendiente = ({ item }) => (
    <View style={[styles.jugadorContainer2, { marginBottom: 8, opacity: 0.7 }]}>
      <View style={{ width: "100%" }}>
        <Text style={styles.jugadorText} numberOfLines={1} ellipsizeMode="tail">
          {nombreJugador(item)}
        </Text>
      </View>
    </View>
  );

  const renderConfirmado = ({ item }) => (
    <View style={[styles.jugadorContainer, { marginBottom: 8 }]}>
      <View style={{ width: "80%" }}>
        <Text style={styles.jugadorText} numberOfLines={1} ellipsizeMode="tail">
          {nombreJugador(item)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleEliminarJugador(item)}>
        <Icon name="close-circle" size={25} color="#c70039" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.titleModal}>
            <View style={styles.titleSubContainer}>
              <Text style={styles.titleText}>Jugadores</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSearchTerm("");
                closeModal();
              }}
            >
              <Icon name="close" size={25} color="#02B9FA" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            {/* Buscador */}
            <View style={styles.searchContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputBuscar}
                  placeholder="Buscar jugador..."
                  value={searchTerm}
                  onChangeText={handleBuscarJugador}
                />
                {searchTerm.trim() !== "" &&
                  (buscando ? (
                    <ActivityIndicator
                      style={styles.addIcon}
                      size="small"
                      color="#02B9FA"
                    />
                  ) : (
                    <View
                      style={styles.addIcon}
                      onTouchStart={() => {
                        Keyboard.dismiss();
                        setTimeout(() => {
                          setNuevoNombreManual(searchTerm);
                          setModalCategoriaVisible(true);
                        }, 150);
                      }}
                    >
                      <Icon name="add-circle" size={24} color="#02B9FA" />
                    </View>
                  ))}
              </View>
            </View>
            {/* Resultados de búsqueda */}
            <View style={{ marginBottom: 10 }}>
              {searchTerm.trim() !== "" && (
                <View style={styles.resultadosContainer}>
                  {buscando ? (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <ActivityIndicator size="large" color="#02B9FA" />
                      <Text style={{ marginTop: 10 }}>
                        Buscando jugadores...
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={resultadosBusqueda}
                      keyboardShouldPersistTaps="handled" // CAMBIO: de "always" a "handled"
                      keyboardDismissMode="none"
                      keyExtractor={(item) => item.id_jugador?.toString()}
                      renderItem={(
                        { item } // CAMBIO: usar renderItem con destructuring
                      ) => (
                        <TouchableOpacity
                          style={styles.resultadoItem}
                          onPress={() => {
                            Keyboard.dismiss(); // AGREGAR: Dismiss del teclado
                            setTimeout(() => {
                              // AGREGAR: setTimeout para mejor UX
                              handleSeleccionarJugador(item);
                              setSearchTerm("");
                              setResultadosBusqueda([]);
                            }, 150);
                          }}
                        >
                          <Text style={styles.resultadoTexto}>
                            {nombreJugador(item)}
                          </Text>
                        </TouchableOpacity>
                      )}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={
                        <Text style={[styles.subtitulo2, { padding: 15 }]}>
                          No se encontraron resultados.
                        </Text>
                      }
                    />
                  )}
                </View>
              )}
            </View>
            {/* Invitaciones pendientes */}
            <Text style={styles.sectionTitle}>Invitaciones pendientes</Text>
            <View style={{ maxHeight: 120, marginBottom: 10 }}>
              <FlatList
                data={jugadoresPendientes}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(_, index) => `pendiente-${index}`}
                renderItem={renderPendiente}
                ListEmptyComponent={
                  <Text style={styles.subtitulo2}>
                    No hay invitaciones pendientes
                  </Text>
                }
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <Text style={styles.sectionTitle}>Jugadores confirmados</Text>
            <View style={{ maxHeight: 120 }}>
              <FlatList
                data={jugadoresConfirmados}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(_, index) => `confirmado-${index}`}
                renderItem={renderConfirmado}
                ListEmptyComponent={
                  <Text style={styles.subtitulo2}>
                    No hay jugadores confirmados
                  </Text>
                }
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </View>
      {agregandoJugador && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={agregandoJugador}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#00BFFF",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#00BFFF" />
              <Text style={{ marginTop: 12, fontSize: 16 }}>
                Agregando jugador...
              </Text>
            </View>
          </View>
        </Modal>
      )}
      {/* Modal para agregar jugador manual */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCategoriaVisible}
        onRequestClose={() => setModalCategoriaVisible(false)}
      >
        <View style={styles.modalOverlayCustom}>
          <View style={styles.modalContainerCustom}>
            {/* Header */}
            <View style={styles.modalHeaderCustom}>
              <Text style={styles.modalTitleCustom}>AGREGAR JUGADOR</Text>
              <TouchableOpacity
                style={styles.closeButtonCustom}
                onPress={() => {
                  setModalCategoriaVisible(false);
                  setCategoriaManual(null);
                }}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color="#00baff" />
              </TouchableOpacity>
            </View>
            {/* Contenido */}
            <View style={styles.modalContentCustom}>
              <Text style={styles.sectionTitleCustom}>JUGADOR</Text>
              <View style={styles.inputContainerCustom}>
                <Icon name="person-outline" size={18} color="#00baff" />
                <Text style={styles.playerNameCustom}>{nuevoNombreManual}</Text>
              </View>
              <Text style={styles.sectionTitleCustom}>CATEGORÍA</Text>
              <Categorias
                iconName="list"
                placeholder="Seleccionar categoría"
                options={categoriasOptions.map((opt) => opt.label)}
                selectedValue={
                  categoriasOptions.find((opt) => opt.value === categoriaManual)
                    ?.label || null
                }
                onValueChange={(label) => {
                  const found = categoriasOptions.find(
                    (opt) => opt.label === label
                  );
                  setCategoriaManual(found ? found.value : null);
                }}
                disabled={loadingCategorias}
                loadingClubs={loadingCategorias}
                borderColor="#e2e8f0"
                borderWidth={1}
              />
            </View>
            {/* Footer con botones */}
            <View style={styles.buttonFooterCustom}>
              <TouchableOpacity
                style={styles.acceptButtonCustom}
                onPress={async () => {
                  // Validaciones igual que en AgregarJugadores
                  if (!nuevoNombreManual) {
                    Alert.alert(
                      "Atención",
                      "Debes ingresar un nombre para el jugador."
                    );
                    return;
                  }

                  if (!categoriaManual) {
                    Alert.alert(
                      "Atención",
                      "Debes seleccionar una categoría para poder agregar el jugador"
                    );
                    return;
                  }

                  // Proceder con la lógica original
                  await handleSeleccionarJugador({
                    isManual: true,
                    us_nomUsuario: nuevoNombreManual,
                    categoria: categoriaManual,
                    id_jugador: null,
                    us_foto: null,
                  });
                }}
                activeOpacity={0.8}
              >
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonTextCustom}>AGREGAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Copiados/adaptados de AgregarJugadores
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
  },
  titleModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
    textTransform: "uppercase",
  },
  titleSubContainer: {
    justifyContent: "space-around",
    flex: 4,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  inputBuscar: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#1f2937",
  },
  addIcon: {
    padding: 4,
  },
  resultadosContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    maxHeight: 200,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultadoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  resultadoTexto: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  subtitulo: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitulo2: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "left",
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 15,
  },
  jugadorContainer2: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  jugadorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  jugadorText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "400",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#C9C9C9",
    borderRadius: 16,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#00BFFF",
    borderRadius: 16,
    alignItems: "center",
  },
  footerButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  acceptButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  sectionTitle: {
    color: "#00baff",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  // --- NUEVOS ESTILOS PARA EL MODAL DE AGREGAR JUGADOR MANUAL ---
  modalOverlayCustom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainerCustom: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
  },
  modalHeaderCustom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitleCustom: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  closeButtonCustom: {
    padding: 4,
  },
  modalContentCustom: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitleCustom: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00baff",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputContainerCustom: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingVertical: 10,
  },
  playerNameCustom: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  buttonFooterCustom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  acceptButtonCustom: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonTextCustom: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default EditarJugadas;
