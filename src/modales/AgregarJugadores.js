import React, { useState, useEffect } from "react";
import { Box, Text } from "native-base";
import {
  ScrollView,
  Keyboard,
  Alert,
  View,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Titulo from "../componentes/Titulo";
import APIManager from "../componentes/API/APIManager.jsx";
import { useAuth } from "../screens/Auth/AuthContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Categorias from "../componentes/Categorias";

const { width, height } = Dimensions.get("window");

//jsjjs
const AgregarJugadores = ({
  visible,
  closeModal,
  onJugadoresSeleccionados,
  esReta = false,
  esOpcional = false,
}) => {
  const { id_usuario } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [jugadores, setJugadores] = useState([]); // Jugadores agregados (manuales o seleccionados)
  const [buscando, setBuscando] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [nuevoNombreManual, setNuevoNombreManual] = useState("");
  const [categoriaManual, setCategoriaManual] = useState(null);
  console.log("categoria selleccionada", categoriaManual);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [agregandoJugador, setAgregandoJugador] = useState(false);

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
        console.log("Error al obtener las categorías:", error);
        setCategoriasOptions([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    getCategorias();
  }, []);

  const handleBuscarJugador = async (termino) => {
    setSearchTerm(termino);
    setBuscando(true);

    try {
      const data = new FormData();
      data.append("nombre", termino); // puede ir vacío
      data.append("id_usuario", id_usuario);

      const res = await APIManager({
        url: "eventos/Eventos/lista_jugadores",
        method: "POST",
        data: data,
      });

      console.log("Respuesta jugadores:", res);

      const resultadosFiltrados = (res?.data || []).filter(
        (jugador) =>
          jugador.id_jugador !== id_usuario && // excluirte a ti mismo
          !jugadores.some((j) => j.id_jugador === jugador.id_jugador) // excluir los ya agregados
      );

      setResultadosBusqueda(resultadosFiltrados);
    } catch (error) {
      console.log("Error al buscar jugadores:", error);
      setResultadosBusqueda([]);
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    if (visible && searchTerm.trim() === "") {
      handleBuscarJugador("");
    }
  }, [visible]);

  const handleSeleccionarJugador = (jugador) => {
    if (!jugadores.find((j) => j.id_jugador === jugador.id_jugador)) {
      const nuevos = [...jugadores, jugador];
      setJugadores(nuevos);
      onJugadoresSeleccionados(nuevos);

      // Quitarlo de la lista de resultados
      setResultadosBusqueda((prev) =>
        prev.filter((j) => j.id_jugador !== jugador.id_jugador)
      );
    }

    setSearchTerm("");
  };

  const handleAgregarManual = () => {
    if (searchTerm.trim() === "") return;

    setNuevoNombreManual(searchTerm.trim()); // Guarda el nombre temporalmente
    setModalCategoriaVisible(true); // Abre modal de categoría
  };

  const confirmarAgregarJugadorManual = async () => {
    if (!nuevoNombreManual) {
      Alert.alert("Atención", "Debes ingresar un nombre para el jugador");
      return;
    }

    if (!categoriaManual) {
      Alert.alert(
        "Atención",
        "Debes seleccionar una categoría para poder agregar el jugador"
      );
      return;
    }
    setAgregandoJugador(true);
    try {
      const data = new FormData();
      data.append("nombre_completo", nuevoNombreManual);
      data.append("categoria", categoriaManual); // si tu API la requiere

      const res = await APIManager({
        url: "CrearJuego/CrearJuego/insertarJugadorManual",
        method: "POST",
        data: data,
      });

      if (res?.status && res?.id_jugador) {
        const nuevoJugador = {
          id_jugador: res.id_jugador,
          nombre_completo: nuevoNombreManual,
          usuario: nuevoNombreManual,
          categoria: categoriaManual,
          isManual: true,
        };

        const nuevos = [...jugadores, nuevoJugador];
        setJugadores(nuevos);
        onJugadoresSeleccionados(nuevos);
        setSearchTerm("");
        await handleBuscarJugador("");
        setResultadosBusqueda((prev) =>
          prev.filter((j) => j.id_jugador !== nuevoJugador.id_jugador)
        );

        Alert.alert(
          "Éxito",
          `Jugador "${nuevoNombreManual}" agregado correctamente.`
        );
      } else {
        Alert.alert("Atención", "No se pudo agregar el jugador manual.");
      }
    } catch (error) {
      console.log("Error al agregar jugador manual:", error);
      Alert.alert("Error", "Ocurrió un error al agregar el jugador manual.");
    } finally {
      setAgregandoJugador(false);
      setNuevoNombreManual("");
      setCategoriaManual(null);
      setModalCategoriaVisible(false);
    }
  };

  // Cambia la función para eliminar por id_jugador
  const handleEliminarJugador = (id_jugador) => {
    const jugador = jugadores.find((j) => j.id_jugador === id_jugador);

    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de eliminar a "${jugador.nombre_completo}" de los jugadores agregados?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const nuevos = jugadores.filter((j) => j.id_jugador !== id_jugador);
            setJugadores(nuevos);
            onJugadoresSeleccionados(nuevos);

            if (searchTerm.trim() === "") {
              setResultadosBusqueda((prev) => [...prev, jugador]);
            }
          },
        },
      ]
    );
  };

  const handleConfirmar = () => {
    // Para RETA: máximo 3 jugadores
    if (esReta && jugadores.length > 3) {
      Alert.alert(
        "Atención",
        "Para el tipo RETA solo puedes agregar máximo 3 jugadores."
      );
      return;
    }

    // Si NO es opcional: mínimo 3 jugadores
    if (!esOpcional && jugadores.length < 3) {
      Alert.alert(
        "Atención",
        "Debes agregar al menos 3 jugadores antes de continuar."
      );
      return;
    }

    closeModal();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalBackground}>
        <View
          keyboardShouldPersistTaps="handled"
          style={styles.modalContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleModal}>
            <View style={styles.titleSubContainer}>
              <Text style={styles.titleText}>Jugadores Invitados</Text>
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
            {/* 🔍 Búsqueda */}
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
                    <TouchableOpacity
                      //  onPress={handleAgregarManual}l
                      onPress={() => {
                        Keyboard.dismiss();
                        handleAgregarManual();
                      }}
                    >
                      <View style={styles.addIcon}>
                        <Icon name="add-circle" size={24} color="#02B9FA" />
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            {/* Jugadores encontrados - lista con scroll propio */}
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
                      keyboardShouldPersistTaps="handled"
                      keyExtractor={(item) => item.id_jugador?.toString()}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.resultadoItem}
                          onPress={() => {
                            Keyboard.dismiss();
                            handleSeleccionarJugador(item);
                          }}
                        >
                          <Text style={styles.resultadoTexto}>
                            {item.nombre_completo} ({item.usuario})
                          </Text>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <Text style={[styles.subtitulo2, { padding: 15 }]}>
                          No se encontraron resultados. Presiona "+" para
                          agregar manualmente.
                        </Text>
                      }
                    />
                  )}
                </View>
              )}
            </View>

            {/* Jugadores agregados - lista con scroll propio */}
            <View style={{ height: 200 }}>
              <FlatList
                data={[...jugadores].reverse()}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(_, index) => `jugador-${index}`}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={[styles.jugadorContainer, { marginBottom: 8 }]}>
                    <View style={{ width: "80%" }}>
                      <Text
                        style={styles.jugadorText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.nombre_completo} ({item.usuario})
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEliminarJugador(item.id_jugador)}
                    >
                      <Icon name="close-circle" size={25} color="#c70039" />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.subtitulo2}>
                    No hay jugadores agregados
                  </Text>
                }
                nestedScrollEnabled={true} // importante para scroll anidado
              />
            </View>
          </View>

          {/* Footer fijo para los botones */}
          <View style={styles.footerButtonContainer}>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                { marginLeft: 0, marginRight: 0, flex: 1 },
              ]}
              onPress={handleConfirmar}
              activeOpacity={0.8}
            >
              <Icon name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}> CONFIRMAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Modal para agregar jugador manual - ACTUALIZADO desde EditarJugada */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCategoriaVisible}
        onRequestClose={() => setModalCategoriaVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.titleModal}>
              <View style={styles.titleSubContainer}>
                <Text style={styles.titleText}>Agregar Jugador</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalCategoriaVisible(false);
                  setCategoriaManual(null);
                }}
              >
                <Icon name="close" size={25} color="#02B9FA" />
              </TouchableOpacity>
            </View>

            {/* Contenido */}
            <View style={styles.detailsContainer}>
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
                onPress={confirmarAgregarJugadorManual}
                activeOpacity={0.8}
              >
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonTextCustom}>AGREGAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {agregandoJugador && (
        <Modal
          transparent={true}
          animationType="slide"
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
    </Modal>
  );
};


const styles = StyleSheet.create({
  // Estilo base del modal (copiado de InvitacionesModal)
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

  // Encabezado (copiado de InvitacionesModal)
  titleModal: {
    backgroundColor: "#f9f9f9",
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 22,
    marginBottom: 5,
    borderBottomWidth: 1.1,
    borderBottomColor: "#EEE",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 18,
    color: "#02B9FA",
    textTransform: "uppercase",
    textAlign: "center",
    fontWeight: "700",
  },
  titleSubContainer: {
    justifyContent: "space-around",
    flex: 4,
  },

  // Contenido (copiado de InvitacionesModal)
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Buscador (manteniendo funcionalidad original pero con estilos mejorados)
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
    marginHorizontal: -16,
    marginTop: 10,
  },
  footerButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
    marginHorizontal: 0,
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
  rejectButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c70039",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#6b7280",
    borderRadius: 8,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    color: "#374151",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addButton: {
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
    width: "100%",
    justifyContent: "space-between",
  },
});

export default AgregarJugadores;
