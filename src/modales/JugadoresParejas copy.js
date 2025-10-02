import React, { useEffect, useState, useMemo  } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet, FlatList, Alert, TextInput, ActivityIndicator } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/Ionicons';
import Titulo from '../componentes/Titulo.js';
import URL from "../Helper/URL.js";
import APIManager from "../componentes/API/APIManager.jsx";
import  {fetchJugadoresJuego, verificarJugadoresAmericana} from '../componentes/Activos/Americana/AmericanaApiService.js';
import { useAuth } from '../screens/Auth/AuthContext.js';
import { MaterialIcons } from '@expo/vector-icons';
import Categorias from '../componentes/Categorias.js';


  const BASE_ICON = require('../../assets/icon_no_profile.png');
  const BASE_URL = URL.IMAGENES;



const JugadoresParejasr = ({
  idJuego,
  modalVisible,
  setModalVisible,
  jugadasRegistradas,
  onClose,
  onEliminarJugador,
  onJugadoresGuardados,
}) => {
  const [jugadoresRegistradas, setJugadoresRegistradas] = useState(false);
  const [jugadoresParejas, setJugadoresParejas] = useState([]);
  console.log("jugadores pareja", jugadasRegistradas);
  const [jugadoresExtras, setJugadoresExtras] = useState([]);

  const [loadingJugadores, setLoadingJugadores] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [jugadoresLocales, setJugadoresLocales] = useState([]);
  const { id_usuario } = useAuth();
  console.log("id usuarioooo", id_usuario);
  const [loading2, setLoading2] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [nuevoNombreManual, setNuevoNombreManual] = useState("");
  const [categoriaManual, setCategoriaManual] = useState(null);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    const obtenerJugadores = async () => {
      try {
        setLoadingJugadores(true);

        if (jugadasRegistradas) {
          const res = await verificarJugadoresAmericana(idJuego);
          console.log("Jugadores registrados:", res);

          const jugadores = [];

          res.jugadores.forEach((jugada) => {
            if (jugada.id_jugador1) {
              jugadores.push({
                id_jugador: jugada.id_jugador1,
                us_nomUsuario: jugada.us_jugador1,
                us_foto: jugada.us_foto1,
              });
            }
            if (jugada.id_jugador2) {
              jugadores.push({
                id_jugador: jugada.id_jugador2,
                us_nomUsuario: jugada.us_jugador2,
                us_foto: jugada.us_foto2,
              });
            }
          });

          setJugadoresParejas(jugadores);
        } else {
          const res = await fetchJugadoresJuego(idJuego);
          console.log("Jugadores sin registrar:", res);

          if (Array.isArray(res)) {
            setJugadoresParejas(res); // Todos los jugadores en un solo array
          }
        }
      } catch (error) {
        console.log("Error obteniendo jugadores:", error);
      } finally {
        setLoadingJugadores(false);
      }
    };

    if (modalVisible && idJuego) {
      obtenerJugadores();
    }
  }, [modalVisible, idJuego, jugadasRegistradas]);

  useEffect(() => {
    // Obtener categorías para el modal manual
    const getCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const res = await APIManager({
          url: 'Perfil/get_categorias',
          method: 'get',
        });
        // Formato: mostrar nombre, guardar id
        const categoriasData = res.map((categoria) => ({
          label: categoria.categoria,
          value: String(categoria.id_categoria),
        }));
        setCategoriasOptions(categoriasData);
      } catch (error) {
        console.log('Error al obtener las categorías:', error);
        setCategoriasOptions([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    getCategorias();
  }, []);

  const parejasAgrupadas = useMemo(() => {
    const agrupadas = [];
    for (let i = 0; i < jugadoresParejas.length; i += 2) {
      agrupadas.push([
        jugadoresParejas[i] || null,
        jugadoresParejas[i + 1] || null,
      ]);
    }
    return agrupadas;
  }, [jugadoresParejas]);

  const handleDragEnd = ({ data }) => {
    const newData = [...data];
    if (newData.length % 2 !== 0) {
      newData.push(null);
    }
    setJugadoresParejas(newData);
  };

  const renderPareja = ({ item, index }) => {
    const pareja = index + 1;
    const [jugador1, jugador2] = item;

    const imageSource = (jugador) =>
      jugador?.us_foto
        ? { uri: `${BASE_URL}profiles/${jugador.us_foto}` }
        : BASE_ICON;

    const nombreJugador = (jugador) =>
      jugador?.us_nomUsuario || jugador?.usuario || jugador?.nom_invitado || "Sin nombre";

    const renderJugador = (jugador, jugadorIndex) => {
      if (!jugador) return null;

      const jugadorGlobalIndex = index * 2 + jugadorIndex;

      const subirJugador = () => {
        if (jugadorGlobalIndex === 0) return;
        const nuevosJugadores = [...jugadoresParejas];
        [
          nuevosJugadores[jugadorGlobalIndex - 1],
          nuevosJugadores[jugadorGlobalIndex],
        ] = [
          nuevosJugadores[jugadorGlobalIndex],
          nuevosJugadores[jugadorGlobalIndex - 1],
        ];
        setJugadoresParejas(nuevosJugadores);
      };

      const bajarJugador = () => {
        if (jugadorGlobalIndex === jugadoresParejas.length - 1) return;
        const nuevosJugadores = [...jugadoresParejas];
        [
          nuevosJugadores[jugadorGlobalIndex + 1],
          nuevosJugadores[jugadorGlobalIndex],
        ] = [
          nuevosJugadores[jugadorGlobalIndex],
          nuevosJugadores[jugadorGlobalIndex + 1],
        ];
        setJugadoresParejas(nuevosJugadores);
      };

      const puedeSubir = jugadorGlobalIndex > 0;
      const puedeBajar = jugadorGlobalIndex < jugadoresParejas.length - 1;

      return (
        
        <View
          style={[
            styles.jugadorCard,
            jugadorIndex === 0 ? styles.jugador1 : styles.jugador2,
          ]}
        >

          <View style={styles.cardContent}>
            <Image 
              source={imageSource(jugador)} 
              style={styles.avatar} 
              resizeMode="cover"
            />
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName} numberOfLines={1}>
                {nombreJugador(jugador)}
              </Text>
              {jugador?.handicap && (
                <Text style={styles.playerHandicap}>
                  Hándicap: {jugador.handicap}
                </Text>
              )}
            </View>
      
            {!jugadasRegistradas && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={subirJugador}
                  disabled={!puedeSubir}
                  style={styles.actionButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="chevron-up"
                    size={24}
                    color={puedeSubir ? "colors.primary" : "#E0E0E0"}
                  />
                </TouchableOpacity>
      
                <TouchableOpacity
                  onPress={bajarJugador}
                  disabled={!puedeBajar}
                  style={styles.actionButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="chevron-down"
                    size={24}
                    color={puedeBajar ? "colors.primary" : "#E0E0E0"}
                  />
                </TouchableOpacity>

                {String(jugador?.id_usuario) !== String(id_usuario) && (
                  <TouchableOpacity
                    onPress={() => confirmarEliminacion(jugador)}
                    style={styles.deleteButton}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    activeOpacity={0.7}
                  >
                    <Icon name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
      
          <Modal transparent={true} animationType="fade" visible={loading2}>
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingModal}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Eliminando jugador...</Text>
              </View>
            </View>
          </Modal>
        </View>
      );
    };

    return (
      <>
        <View style={styles.bgpareja}>
          <View style={styles.parejaIndicator}>
            <Text style={styles.parejaNumero}>Pareja {pareja}</Text>
          </View>
          {renderJugador(jugador1, 0)}
          {renderJugador(jugador2, 1)}
        </View>
      </>
    );
  };

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

      if (res.status && Array.isArray(res.data)) {
        const jugadoresAgregadosIds = [
          ...jugadoresLocales,
          ...jugadoresParejas,
          ...jugadoresExtras,
        ].map((j) => j.id_jugador);

        const resultadosFiltrados = res.data.filter(
          (jugador) => !jugadoresAgregadosIds.includes(jugador.id_jugador)
        );

        console.log("Jugadores encontrados (filtrados):", resultadosFiltrados);
        setResultadosBusqueda(resultadosFiltrados);
      } else {
        setResultadosBusqueda([]);
      }
    } catch (error) {
      console.log("Error al buscar jugadores:", error);
      setResultadosBusqueda([]);
    } finally {
      setBuscando(false);
    }
  };

  const confirmarGuardado = () => {
    Alert.alert("Confirmación", "¿Seguro que quieres guardar los jugadores?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Guardar",
        onPress: async () => {
          try {
            const jugadores = formatearDatosParaGuardar();
            console.log("jugadores", jugadores);
            const data = {
              id_juego: idJuego,
              tipo_juego: tipoJuego,
              jugadores: {
                parejas: jugadores.parejas,
                jugadoresExtras: jugadores.jugadoresExtras || [],
              },
            };
            console.log("data enviada", data);
            const res = await APIManager({
              url: "Activos/Guardar/guardarJugadoresIn",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              data: JSON.stringify(data),
            });
            console.log("res", res);
            if (res && res.status) {
              Alert.alert("Éxito", "Jugadores guardados correctamente", [
                {
                  text: "OK",
                  onPress: () => {
                    setModalVisible(false);
                    if (typeof onJugadoresGuardados === 'function') onJugadoresGuardados();
                  },
                },
              ]);
            } else {
              throw new Error(res?.message || "Error al guardar jugadores");
            }
          } catch (error) {
            console.error("Error al guardar jugadores:", error);
            Alert.alert(
              "Error",
              "No se pudo guardar los jugadores: " + error.message
            );
          }
        },
      },
    ]);
  };

  const JUEGO_TIPOS = {
    AMERICANA: 1,
    REY: 2,
    RETA: 10,
    SEIS_LOCO: 14,
    AMERICANA_PAREJAS: 15,
  };
  const tipoJuego = JUEGO_TIPOS.AMERICANA; // o el valor que corresponda

  const formatearDatosParaGuardar = () => {
    const parejasFormateadas = [];

    for (let i = 0; i < jugadoresParejas.length; i += 2) {
      const jugador1 = jugadoresParejas[i] || {};
      const jugador2 = jugadoresParejas[i + 1] || {};

      parejasFormateadas.push({
        id_jugador1: jugador1.isManual ? null : (jugador1.id_jugador || null),
        us_jugador1: jugador1.us_nomUsuario || jugador1.nom_invitado || jugador1.usuario || null,
        categoria1: jugador1.isManual ? jugador1.categoria : undefined,
        id_jugador2: jugador2.isManual ? null : (jugador2.id_jugador || null),
        us_jugador2: jugador2.us_nomUsuario || jugador2.nom_invitado || jugador2.usuario || null,
        categoria2: jugador2.isManual ? jugador2.categoria : undefined,
      });
    }

    const extrasFormateados = jugadoresExtras.map((jugador) => ({
      id_jugador1: jugador.isManual ? null : (jugador.id_jugador || null),
      us_jugador1: jugador.us_nomUsuario || jugador.nom_invitado || jugador.usuario || null,
      categoria: jugador.isManual ? jugador.categoria : undefined,
    }));

    return {
      parejas: parejasFormateadas,
      jugadoresExtras: extrasFormateados,
    };
  };

  const handleAgregarJugador = async (jugadorParaAgregar) => {
    console.log("Intentando agregar jugador:", jugadorParaAgregar);

    if (!jugadorParaAgregar || Object.keys(jugadorParaAgregar).length === 0) {
      // Es jugador manual, abrir modal de categoría
      setNuevoNombreManual(searchTerm);
      setModalCategoriaVisible(true);
      return;
    }

    try {
      let jugadorFinal;

      if (jugadorParaAgregar.id_jugador && !jugadorParaAgregar.isManual) {
        const data = new FormData();
        data.append("id_juego", idJuego);
        data.append("id_jugador", jugadorParaAgregar.id_jugador);

        const res = await APIManager({
          url: "Activos/Activos/agregarJugador",
          method: "POST",
          data: data,
        });

        if (!res.status) {
          Alert.alert("Error", "No se pudo agregar el jugador");
          return;
        }

        // Jugador registrado - asegurar que isManual sea false
        jugadorFinal = {
          ...jugadorParaAgregar,
          isManual: false
        };
        Alert.alert(
          "Éxito",
          `Se ha enviado la invitación a ${
            jugadorParaAgregar.usuario || "el jugador"
          }.`
        );
      } else {
        // Jugador manual
        jugadorFinal = {
          us_nomUsuario: searchTerm,
          us_foto: null,
          isManual: true,
          id_jugador: null,
        };
        Alert.alert("Éxito", "Jugador manual agregado correctamente");
      }

      // Agregar a jugadoresLocales
      setJugadoresLocales((prev) => [...prev, jugadorFinal]);

      // 👉 Agrupar automáticamente en pareja
      setJugadoresParejas((prev) => {
        const nuevos = [...prev];

        // Buscar espacio vacío primero (por si se eliminó alguien antes)
        const indexVacio = nuevos.findIndex((j) => j === null);
        if (indexVacio !== -1) {
          nuevos[indexVacio] = jugadorFinal;
        } else {
          nuevos.push(jugadorFinal);
        }

        return nuevos;
      });

      // Notificar callbacks
      if (
        jugadorFinal.isManual &&
        typeof onAgregarJugadorManual === "function"
      ) {
        onAgregarJugadorManual(idJuego, jugadorFinal);
      } else if (typeof onJugadorAgregado === "function") {
        onJugadorAgregado(idJuego, jugadorFinal);
      }

      setSearchTerm("");
      setResultadosBusqueda([]);
    } catch (error) {
      console.log("Error al agregar jugador:", error);
      Alert.alert("Error", "Ocurrió un error al agregar el jugador");
    }
  };

  const renderResultadoBusqueda = ({ item }) => {
    if (!item) return null;
    return (
      <TouchableOpacity
        style={styles.resultadoItem}
        onPress={() => handleAgregarJugador(item)}
      >
        <Text style={styles.resultadoTexto}>
          {item.nombre_completo || ""} ({item.usuario || ""})
        </Text>
        <Icon name="add-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  const handleGuardarJugadores = async () => {
    setJugadoresExtras([]);

    const jugadoresValidos = jugadoresParejas.filter((j) => j !== null);
    const totalJugadores = jugadoresValidos.length;

    // Validación 1: mínimo 4 jugadores
    if (totalJugadores < 4) {
      Alert.alert(
        "Advertencia",
        "Debes agregar al menos 4 jugadores para continuar.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    // Validación 2: detectar parejas incompletas
    const parejasIncompletas = [];
    let parejasCompletas = 0;

    for (let i = 0; i < jugadoresParejas.length; i += 2) {
      const jugador1 = jugadoresParejas[i];
      const jugador2 = jugadoresParejas[i + 1];

      if (jugador1 && jugador2) {
        parejasCompletas += 1;
      } else if (jugador1 || jugador2) {
        parejasIncompletas.push(i / 2 + 1); // Número de pareja
      }
    }

    // Validación 3: mínimo 2 parejas completas
    if (parejasCompletas < 2) {
      Alert.alert(
        "Advertencia",
        "Debes formar al menos 2 parejas completas para continuar."
      );
      return;
    }

    // Si hay parejas incompletas, mostrar alerta
    if (parejasIncompletas.length > 0) {
      const mensaje =
        parejasIncompletas.length === 1
          ? `Falta un jugador en la pareja ${parejasIncompletas[0]}.`
          : `Faltan jugadores en las siguientes parejas: ${parejasIncompletas.join(
              ", "
            )}.`;

      Alert.alert("Advertencia", mensaje);
      return;
    }

    // Todo correcto → guardar
    confirmarGuardado(false);
  };

  const confirmarEliminacion = (jugador) => {
    const nombre = jugador.us_nomUsuario || jugador.usuario || "este jugador";

    Alert.alert(
      "Eliminar jugador",
      `¿Estás seguro de que deseas eliminar a ${nombre}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => handleEliminarJugador(jugador),
          style: "destructive",
        },
      ]
    );
  };

  const handleEliminarJugador = async (jugador) => {
    if (!jugador) {
      console.log("Error: Jugador inválido");
      return;
    }

    const eliminarDeListas = () => {
      setJugadoresLocales((prev) =>
        prev.filter((j) => {
          if (jugador.isManual) {
            return j.us_nomUsuario !== jugador.us_nomUsuario;
          } else {
            return j.id_jugador !== jugador.id_jugador;
          }
        })
      );

      setJugadoresParejas((prev) =>
        prev.filter((j) => {
          if (jugador.isManual) {
            return j.us_nomUsuario !== jugador.us_nomUsuario;
          } else {
            return j.id_jugador !== jugador.id_jugador;
          }
        })
      );
    };

    try {
      if (jugador.isManual) {
        eliminarDeListas();
        // Alert.alert("Éxito", "Jugador manual eliminado correctamente");
      } else {
        const data = new FormData();
        data.append("id_juego", idJuego);
        data.append("id_jugador", jugador.id_jugador);
        setLoading2(true); // Mostrar modal de carga

        const res = await APIManager({
          url: "Activos/Activos/cambiarEstadoJugador",
          method: "POST",
          data: data,
        });

        if (res.status) {
          eliminarDeListas();
          setLoading2(false); // Ocultar modal de carga
          // Alert.alert("Éxito", "Jugador eliminado correctamente");
        } else {
          Alert.alert(
            "Error",
            "No se pudo eliminar el jugador de la base de datos"
          );
        }
      }
    } catch (error) {
      setLoading2(false);
      console.log("Error al eliminar jugador:", error);
      Alert.alert("Error", "Ocurrió un error al eliminar el jugador");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Titulo titulo="Jugadores" />
          <Text style={styles.subtitulo}>
            Este es el orden de la ronda.
          </Text>
          <View style={styles.searchContainer}>
            {!jugadasRegistradas && (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputBuscar}
                  placeholder="Buscar jugador..."
                  value={searchTerm}
                  onChangeText={handleBuscarJugador}
                />

                
                {searchTerm.trim() !== "" &&
                  (buscando ? (
                    <View style={styles.addIcon}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleAgregarJugador({})}>
                      <View style={styles.addIcon}>
                        <Icon name="add-circle" size={24} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>

          {searchTerm.length > 0 && (
            <FlatList
              data={resultadosBusqueda}
              renderItem={renderResultadoBusqueda}
              keyExtractor={(item, index) => `search-${index}`}
              style={styles.resultadosList}
              ListEmptyComponent={
                !buscando && (
                  <Text style={styles.emptyText}>
                    No se encontraron resultados. Presiona "+" para crear un
                    jugador manual.
                  </Text>
                )
              }
            />
          )}

          <View style={{ flex: 2 }}>
            {loadingJugadores ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginTop: 20 }}
              />
            ) : (
              <FlatList
                data={parejasAgrupadas}
                renderItem={renderPareja}
                keyExtractor={(_, index) => `pareja-${index}`}
                contentContainerStyle={{ paddingBottom: 10 }}
              />
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText2}>Cerrar</Text>
            </TouchableOpacity>

            {!jugadasRegistradas && (
              <TouchableOpacity
                style={styles.terminateButton}
                onPress={handleGuardarJugadores}
              >
                <Text style={styles.buttonText}>
                  <MaterialIcons name='save-alt' size={17}></MaterialIcons>
                  {' '}
                  Guardar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {/* MODAL PARA CATEGORÍA DE JUGADOR MANUAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCategoriaVisible}
        onRequestClose={() => setModalCategoriaVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, width: 320, alignItems: 'center', borderWidth: 3, borderColor: "#00BFFF" }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Agregar jugador manual</Text>
            <Text style={{ fontSize: 16, marginBottom: 16 }}>Nombre: <Text style={{ fontWeight: 'bold' }}>{nuevoNombreManual}</Text></Text>
            <Text style={{ fontSize: 15, marginBottom: 8 }}>Selecciona una categoría:</Text>
            <Categorias
              iconName="list"
              placeholder="Seleccionar categoría"
              options={categoriasOptions.map(opt => opt.label)}
              selectedValue={categoriasOptions.find(opt => opt.value === categoriaManual)?.label || null}
              onValueChange={label => {
                // Buscar el id de la categoría por label
                const found = categoriasOptions.find(opt => opt.label === label);
                setCategoriaManual(found ? found.value : null);
              }}
              disabled={loadingCategorias}
              loadingClubs={loadingCategorias}
            />
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#C9C9C9', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 }}
                onPress={() => {
                  setModalCategoriaVisible(false);
                  setCategoriaManual(null);
                }}
              >
                <Text style={{ color: '#737373', fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#00BFFF', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 20 }}
                disabled={!categoriaManual}
                onPress={() => {
                  // Agregar jugador manual con la categoría seleccionada
                  const jugadorFinal = {
                    us_nomUsuario: nuevoNombreManual,
                    us_foto: null,
                    isManual: true,
                    id_jugador: null,
                    categoria: categoriaManual,
                  };
                  setJugadoresLocales((prev) => [...prev, jugadorFinal]);
                  setJugadoresParejas((prev) => {
                    const nuevos = [...prev];
                    const indexVacio = nuevos.findIndex((j) => j === null);
                    if (indexVacio !== -1) {
                      nuevos[indexVacio] = jugadorFinal;
                    } else {
                      nuevos.push(jugadorFinal);
                    }
                    return nuevos;
                  });
                  setSearchTerm("");
                  setResultadosBusqueda([]);
                  setCategoriaManual(null);
                  setModalCategoriaVisible(false);
                  Alert.alert("Éxito", "Jugador manual agregado correctamente");
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Aumenté la opacidad para mejor contraste
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    height: "85%",
    maxHeight: 700,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 3,
    borderColor: "#00BFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    padding: 10,
    color: "#000",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "colors.primary",
    padding: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  infoContainer: {
    backgroundColor: "#f0f8ff",
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  infoText: {
    color: "#0066cc",
    textAlign: "center",
    fontWeight: "500",
  },
  resultadoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  resultadoTexto: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  resultadosList: {
    maxHeight: 150,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#C9C9C9",
    padding: 10,
  },
  listContainer: {
    flexGrow: 1,
  },
  subtitulo: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    marginTop: -10,
  },
  jugadorContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 5,
    padding: 5,
  },
  jugadorContainer2: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingBottom: 5,
  },
  jugador1: {
    borderWidth: 3,
    borderColor: "colors.primary",
  },
  jugador2: {
    borderWidth: 3,
    borderColor: "#FFA500",
  },
  parejaIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  parejaIndicatorJ: {
    marginBottom: 10,
  },
  parejaNumero: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  jugadorNumero: {
    fontSize: 14,
    color: "#666",
  },
  jugadorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    padding: 5,
    marginHorizontal: 2,
  },
  controlButtonDisabled: {
    // opacity: 0.8,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 5,
  },
  jugadorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  nombreJugador: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  botonesContainer: {
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#C9C9C9",
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  buttonText2: {
    color: "#737373",
    fontSize: 16,
  },
  terminateButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#00BFFF",
    borderRadius: 18,
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#f4f4f4",
  },
  inputBuscar: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  addIcon: {
    fontSize: 22,
    color: "colors.primary",
    paddingHorizontal: -5,
  },
  modalContainer2: {
    flex: 1,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: "colors.primary",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent2: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "colors.primary",
    padding: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "colors.primary",
  },
  //estilos cartas jugadores
  jugadorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jugador1: {
    borderLeftWidth: 4,
    borderLeftColor: "colors.primary",
  },
  jugador2: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#F1F1F1",
  },
  playerInfo: {
    flex: 1,
    marginRight: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  playerHandicap: {
    fontSize: 13,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 6,
    marginHorizontal: 2,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 4,
  },
  //estilos modal
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingModal: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "colors.primary",
    fontWeight: "500",
  },
  //estilos parejas
  bgpareja: {
    backgroundColor: "#ececec",
    padding: 10,
    marginBottom: 4,
    borderRadius: 9,
  },
});
export default JugadoresParejasr;
