import React, { useEffect, useState, useMemo  } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet, FlatList, Alert, TextInput, ActivityIndicator } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/Ionicons';
import Titulo from '../componentes/Titulo';
import URL from "../Helper/URL";
import APIManager from "../componentes/API/APIManager.jsx";
import  {fetchJugadoresJuego, verificarJugadoresAmericana} from '../componentes/Activos/Americana/AmericanaApiService.js';
import { useAuth } from '../screens/Auth/AuthContext';

  const BASE_ICON = require('../../assets/icon_no_profile.png');
  const BASE_URL = URL.IMAGENES;



const JugadoresModal = ({ idJuego, modalVisible, setModalVisible, jugadasRegistradas, onClose }) => {
  const [jugadoresRegistradas, setJugadoresRegistradas] = useState(false);
  const [jugadoresParejas, setJugadoresParejas] = useState([]);
  console.log("jugadores pareja", jugadasRegistradas);
  const [jugadoresExtras, setJugadoresExtras] = useState([]);

   const [loadingJugadores, setLoadingJugadores] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [jugadoresLocales, setJugadoresLocales] = useState([]);
   const [loading2, setLoading2] = useState(false);

  const { id_usuario } = useAuth();


useEffect(() => {
  const obtenerJugadores = async () => {
    try {
       setLoadingJugadores(true); // Empieza la carga


      if (jugadasRegistradas) {
        // ✅ SI están registradas (estructura americana)
        const res = await verificarJugadoresAmericana(idJuego);
        console.log("Jugadores registrados:", res);

        const jugadoresParejas = [];
        const jugadoresExtras = [];

        res.jugadores.forEach((jugada) => {
          const jugador1 = jugada.id_jugador1
            ? {
                id_jugador: jugada.id_jugador1,
                us_nomUsuario: jugada.us_jugador1,
                us_foto: jugada.us_foto1,
              }
            : null;

          const jugador2 = jugada.id_jugador2
            ? {
                id_jugador: jugada.id_jugador2,
                us_nomUsuario: jugada.us_jugador2,
                us_foto: jugada.us_foto2,
              }
            : null;

          if (jugador1 && jugador2) {
            jugadoresParejas.push(jugador1, jugador2);
          } else {
            if (jugador1) jugadoresExtras.push(jugador1);
            if (jugador2) jugadoresExtras.push(jugador2);
          }
        });

        setJugadoresParejas(jugadoresParejas);
        setJugadoresExtras(jugadoresExtras);
      } else {
        // ✅ SI NO están registradas (jugadores simples)
        const res = await fetchJugadoresJuego(idJuego);
        console.log("Jugadores sin registrar:", res);

        if (Array.isArray(res)) {
          setJugadoresParejas(res.slice(0, 4));
          setJugadoresExtras(res.slice(4));
        }
      }
    } catch (error) {
      console.log("Error obteniendo jugadores:", error);
    } finally {
      setLoadingJugadores(false); // Finaliza la carga
    }
  };


  if (modalVisible && idJuego) {
    obtenerJugadores();
  }
}, [modalVisible,idJuego, jugadasRegistradas]);



const parejasAgrupadas = useMemo(() => {
  const agrupadas = [];
  for (let i = 0; i < jugadoresParejas.length; i += 2) {
    agrupadas.push([jugadoresParejas[i] || null, jugadoresParejas[i + 1] || null]);
  }
  return agrupadas;
}, [jugadoresParejas]);



const renderPareja = ({ item, index }) => {
  const pareja = index + 1;
  const [jugador1, jugador2] = item;

  const imageSource = (jugador) =>
    jugador?.us_foto
      ? { uri: `${BASE_URL}profiles/${jugador.us_foto}` }
      : BASE_ICON;

  const nombreJugador = (jugador) =>
    jugador?.us_nomUsuario || jugador?.usuario || "Sin nombre";

const renderJugador = (jugador, jugadorIndex) => {
  if (!jugador) return null;

  const jugadorGlobalIndex = index * 2 + jugadorIndex;

  const subirJugador = () => {
    if (jugadorGlobalIndex === 0) return; // ya está arriba del todo
    const nuevosJugadores = [...jugadoresParejas];
    [nuevosJugadores[jugadorGlobalIndex - 1], nuevosJugadores[jugadorGlobalIndex]] =
      [nuevosJugadores[jugadorGlobalIndex], nuevosJugadores[jugadorGlobalIndex - 1]];
    setJugadoresParejas(nuevosJugadores);
  };

  const bajarJugador = () => {
    if (jugadorGlobalIndex === jugadoresParejas.length - 1) return; // ya está abajo del todo
    const nuevosJugadores = [...jugadoresParejas];
    [nuevosJugadores[jugadorGlobalIndex + 1], nuevosJugadores[jugadorGlobalIndex]] =
      [nuevosJugadores[jugadorGlobalIndex], nuevosJugadores[jugadorGlobalIndex + 1]];
    setJugadoresParejas(nuevosJugadores);
  };

const pasarAExtra = () => {
  const nuevosJugadores = [...jugadoresParejas];
  nuevosJugadores[jugadorGlobalIndex] = null; // en vez de eliminar, dejar espacio vacío
  setJugadoresParejas(nuevosJugadores);
  setJugadoresExtras([...jugadoresExtras, jugador]);
};





  // Condiciones para deshabilitar botones
  const puedeSubir = jugadorGlobalIndex > 0;
  const puedeBajar = jugadorGlobalIndex < jugadoresParejas.length - 1;

  return (
    <View
      style={[
        styles.jugadorContainer,
        jugadorIndex === 0 ? styles.jugador1 : styles.jugador2,
      ]}
    >
      <View style={styles.jugadorContent}>
        <Image source={imageSource(jugador)} style={styles.avatar} />
        <View style={styles.jugadorInfo}>
          <Text style={styles.nombreJugador}>{nombreJugador(jugador)}</Text>
        </View>

        {!jugadasRegistradas && (
          <View style={styles.controlesContainer}>
            {/* Subir jugador */}
            <TouchableOpacity
              onPress={subirJugador}
              disabled={!puedeSubir}
              style={[styles.controlButton, !puedeSubir && styles.controlButtonDisabled]}
            >
              <Icon name="chevron-up" size={24} color={puedeSubir ? "#02B9FA" : "#ccc"} />
            </TouchableOpacity>

            {/* Bajar jugador */}
            <TouchableOpacity
              onPress={bajarJugador}
              disabled={!puedeBajar}
              style={[styles.controlButton, !puedeBajar && styles.controlButtonDisabled]}
            >
              <Icon name="chevron-down" size={24} color={puedeBajar ? "#02B9FA" : "#ccc"} />
            </TouchableOpacity>

            {/* Eliminar jugador */}
            <TouchableOpacity onPress={pasarAExtra} style={styles.deleteButton}>
              <Icon name="remove" size={24} color="#02B9FA" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};


  return (
    <>
      <View style={styles.parejaIndicator}>
        <Text style={styles.parejaNumero}>Pareja {pareja}</Text>

        {!jugadasRegistradas && (
          <View style={styles.controlesContainer}>
            <TouchableOpacity
              // onPress={moverParejaArriba}
              disabled={index === 0}
              style={[styles.controlButton, index === 0 && styles.controlButtonDisabled]}
            >
              {/* <Icon name="chevron-up" size={20} color={index === 0 ? "#ccc" : "#02B9FA"} /> */}
            </TouchableOpacity>

            <TouchableOpacity
              // onPress={moverParejaAbajo}
              disabled={index === jugadoresParejas.length - 1}
              style={[styles.controlButton, index === jugadoresParejas.length - 1 && styles.controlButtonDisabled]}
            >
              {/* <Icon name="chevron-down" size={20} color={index === jugadoresParejas.length - 1 ? "#ccc" : "#02B9FA"} /> */}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {renderJugador(jugador1, 0)}
      {renderJugador(jugador2, 1)}
    </>
  );
};

const renderExtra = ({ item, index, drag }) => {

  const imageSource = item.us_foto
      ? { uri: `${BASE_URL}profiles/${item.us_foto}` }
      : BASE_ICON;
      
  const nombre = item.us_nomUsuario || "Sin nombre";

  return (
        <View style={styles.jugadorContainer}>
      <View style={styles.jugadorContent}>
        <Image  source={imageSource}  style={styles.avatar} />
        <View style={styles.jugadorInfo}>
          <Text style={styles.nombreJugador}>{nombre}</Text>
        </View>

        {!jugadasRegistradas && (
          <View style={styles.controlesContainer}>
            {/* Subir jugador */}
            <TouchableOpacity
             onPress={() => moverJugadorDeExtrasAParejas(item)}
              style={styles.controlButton}
            >
              <Icon name="chevron-up" size={24} color={"#02B9FA"} />
            </TouchableOpacity>



         {String(item?.id_usuario) !== String(id_usuario) && (
            <TouchableOpacity 
           onPress={() => confirmarEliminacion(item)}
            style={styles.deleteButton}>
              <Icon name="close-circle" size={24} color="red" />
            </TouchableOpacity>
)}
          </View>
        )}
      </View>

       <Modal transparent={true} animationType="fade" visible={loading2}>
                                      <View style={styles.modalContainer2}>
                                        <View style={styles.modalContent2}>
                                          <ActivityIndicator size="large" color="#02B9FA" />
                                          <Text style={styles.loadingText}>
                                           Eliminando jugador...
                                          </Text>
                                        </View>
                                      </View>
                                    </Modal>

    </View>
  );
};

const moverEntreListas = (from, setFrom, to, setTo, jugador) => {
  const jugadoresActivos = to.filter(j => j != null);

  if (setTo === setJugadoresParejas && jugadoresActivos.length >= 4) {
    Alert.alert("Límite alcanzado", "Debes bajar al menos un jugador antes de subir otro.");
    return;
  }

  // Remueve el jugador de 'from' usando filter
  // const updatedFrom = from.filter(j => j?.id_jugador !== jugador?.id_jugador);
  const updatedFrom = from.filter(j => {
  // Para jugadores manuales, compara por nombre
  if (j?.isManual && jugador?.isManual) {
    return j.us_nomUsuario !== jugador.us_nomUsuario;
  }

  // Para jugadores reales, compara por id_jugador
  return j?.id_jugador !== jugador?.id_jugador;
});


  if (setTo === setJugadoresParejas) {
    jugador.fechaSubida = new Date().toLocaleDateString();
  }

  const updatedTo = [...to];
  const nullIndex = updatedTo.findIndex(j => j === null);

  if (nullIndex !== -1) {
    updatedTo[nullIndex] = jugador; // Ocupa espacio vacío
  } else {
    updatedTo.push(jugador); // Añade al final si no hay huecos
  }

  console.log("Jugador a mover:", jugador);
  console.log("UpdatedFrom (after removal):", updatedFrom);
  console.log("UpdatedTo (after add):", updatedTo);

  setFrom(updatedFrom);
  setTo(updatedTo);
};



const confirmarEliminacion = (jugador) => {
  const nombre = jugador.us_nomUsuario || jugador.usuario || 'este jugador';

  Alert.alert(
    "Eliminar jugador",
    `¿Estás seguro de que deseas eliminar a ${nombre}?`,
    [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Eliminar",
        onPress: () => handleEliminarJugador(jugador),
        style: "destructive"
      }
    ]
  );
};

const handleEliminarJugador = async (jugador) => {
  if (!jugador) {
    console.log('Error: Jugador inválido');
    return;
  }

const eliminarDeListas = () => {
  setJugadoresLocales(prev =>
    prev.filter(j => {
      if (!j) return false;
      if (jugador.isManual) {
        return j.us_nomUsuario !== jugador.us_nomUsuario;
      } else {
        return j.id_jugador !== jugador.id_jugador;
      }
    })
  );

  setJugadoresParejas(prev =>
    prev.filter(j => {
      if (!j) return false;
      if (jugador.isManual) {
        return j.us_nomUsuario !== jugador.us_nomUsuario;
      } else {
        return j.id_jugador !== jugador.id_jugador;
      }
    })
  );

  setJugadoresExtras(prev =>
    prev.filter(j => {
      if (!j) return false;
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
      Alert.alert("Éxito", "Jugador manual eliminado correctamente");
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
        Alert.alert("Éxito", "Jugador eliminado correctamente");
      } else {
        Alert.alert("Error", "No se pudo eliminar el jugador de la base de datos");
      }
    }
  } catch (error) {
     setLoading2(false);
    console.log('Error al eliminar jugador:', error);
    Alert.alert("Error", "Ocurrió un error al eliminar el jugador");
  }
};

const moverJugadorDeExtrasAParejas = (jugador) => {
  moverEntreListas(
    jugadoresExtras,
    setJugadoresExtras,
    jugadoresParejas,
    setJugadoresParejas,
    jugador
  );
};



const handleBuscarJugador = async (termino) => {
  setSearchTerm(termino);
  if (termino.trim() === '') {
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
      ].map(j => j.id_jugador);

      const resultadosFiltrados = res.data.filter(
        jugador => !jugadoresAgregadosIds.includes(jugador.id_jugador)
      );

      console.log('Jugadores encontrados (filtrados):', resultadosFiltrados);
      setResultadosBusqueda(resultadosFiltrados);
    } else {
      setResultadosBusqueda([]);
    }
  } catch (error) {
    console.log('Error al buscar jugadores:', error);
    setResultadosBusqueda([]);
  } finally {
    setBuscando(false);
  }
};


const confirmarGuardado = () => {
  Alert.alert(
    "Confirmación",
    "¿Seguro que quieres guardar los jugadores?",
    [
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
            const res = await APIManager({
              url: "Activos/Guardar/guardarJugadoresIn",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              data: JSON.stringify({
                id_juego: idJuego,
                tipo_juego: tipoJuego,
                jugadores,
              }),
            });
console.log("res", res);
            if (res && res.status) {
           Alert.alert("Éxito", "Jugadores guardados correctamente", [
  {
    text: "OK",
    onPress: () => {
      setModalVisible(false); 
       onClose();
    },
  },
]);
            } else {
              throw new Error(res?.message || "Error al guardar jugadores");
            }
          } catch (error) {
            Alert.alert("Error", "No se pudo guardar los jugadores: " + error.message);
          }
        },
      },
    ]
  );
};


  
const JUEGO_TIPOS = {
  AMERICANA: 1,
  REY: 2,
  RETA: 10,
  SEIS_LOCO: 14,
  AMERICANA_PAREJAS: 15
};
const tipoJuego = JUEGO_TIPOS.AMERICANA;  // o el valor que corresponda


const formatearDatosParaGuardar = () => {
  const parejasFormateadas = [];

  for (let i = 0; i < jugadoresParejas.length; i += 2) {
    const jugador1 = jugadoresParejas[i] || {};
    const jugador2 = jugadoresParejas[i + 1] || {};

    parejasFormateadas.push({
      id_jugador1: jugador1.id_jugador || null,
      us_jugador1: jugador1.us_nomUsuario || jugador1.usuario || null,
      id_jugador2: jugador2.id_jugador || null,
      us_jugador2: jugador2.us_nomUsuario || jugador2.usuario || null,
    });
  }

  const extrasFormateados = jugadoresExtras.map(jugador => ({
    id_jugador1: jugador.id_jugador || null,
    us_jugador1: jugador.us_nomUsuario || jugador.usuario || null,
  }));

  return {
    parejas: parejasFormateadas,
    jugadoresExtras: extrasFormateados,
  };
};




  
const handleAgregarJugador = async (jugadorParaAgregar) => {
  console.log('Intentando agregar jugador:', jugadorParaAgregar);

  // Si no hay jugador seleccionado o enviado, salimos
  if (!jugadorParaAgregar) {
    console.log('No hay jugador para agregar');
    return;
  }

  try {
    if (jugadorParaAgregar.id_jugador && !jugadorParaAgregar.isManual) {
      // Jugador existente con id_jugador (no manual)
      const data = new FormData();
      data.append("id_juego", idJuego);
      data.append("id_jugador", jugadorParaAgregar.id_jugador);

      const res = await APIManager({
        url: "Activos/Activos/agregarJugador",
        method: "POST",
        data: data,
      });

      if (res.status) {
        Alert.alert("Éxito", res.message || `Se ha enviado la invitación a ${jugadorParaAgregar.usuario || 'el jugador'}.`);
        setJugadoresLocales(prev => [...prev, jugadorParaAgregar]);
        console.log('Jugador agregado a jugadoresLocales:', jugadorParaAgregar);
        if (typeof onJugadorAgregado === 'function') {
          onJugadorAgregado(idJuego, jugadorParaAgregar);
        }
      } else {
        Alert.alert("Error", res.message || "No se pudo agregar el jugador");
        console.log('Error: la respuesta del API no fue exitosa');
      }
    } else {
      // Jugador manual (sin id_jugador real)
      const nuevoJugador = {
        us_nomUsuario: searchTerm,
        us_foto: null,
        isManual: true,
         id_jugador: null
      };
      setJugadoresLocales(prev => [...prev, nuevoJugador]);
         // Y también a la lista de extras para que aparezca en renderExtra
      setJugadoresExtras(prev => [...prev, nuevoJugador]);

      console.log('Jugador manual agregado:', nuevoJugador);
      if (typeof onAgregarJugadorManual === 'function') {
        onAgregarJugadorManual(idJuego, nuevoJugador);
      }
      Alert.alert("Éxito", "Jugador manual agregado correctamente");
    }

    setSearchTerm('');
    setResultadosBusqueda([]);
  } catch (error) {
    console.log('Error al agregar jugador:', error);
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
            {item.nombre_completo || ''} ({item.usuario || ''})
          </Text>
          <Icon name="add-circle" size={24} color="#02B9FA" />
        </TouchableOpacity>
      );
    };

  
const handleGuardarJugadores = async () => {
  const totalJugadores = jugadoresParejas.filter(j => j !== null).length + jugadoresExtras.length;

  if (totalJugadores < 4) {
    Alert.alert(
      "Advertencia",
      "Debes agregar al menos 4 jugadores para continuar.",
      [{ text: "OK", style: "cancel" }]
    );
    return;
  }

  // Si hay 4 o más jugadores, continuar con el guardado
  confirmarGuardado(false);
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
          <Titulo titulo="JUGADORES" />
          <Text style={styles.subtitulo}>
            Este es el orden en el que será primera ronda
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

 {/* Mostrar loader o botón agregar, según estado */}
     {searchTerm.trim() !== '' &&  (
        buscando ? (
          <View style={styles.addIcon}>
            <ActivityIndicator size="small" color="#02B9FA" />
          </View>
        ) : (
          <TouchableOpacity onPress={() => handleAgregarJugador({})}>
            <View style={styles.addIcon}>
              <Icon name="add-circle" size={24} color="#02B9FA" />
            </View>
          </TouchableOpacity>
        )
      )}
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
          No se encontraron resultados. Presiona "+" para crear un jugador manual.
        </Text>
      )
    }
  />
)}

          
   <View style={{ flex: 2 }}>
     
        {loadingJugadores ? (
  <ActivityIndicator size="large" color="#02B9FA" style={{ marginTop: 20 }} />
) : (
  <FlatList
    data={parejasAgrupadas}
          renderItem={renderPareja}
          keyExtractor={(_, index) => `pareja-${index}`}
          contentContainerStyle={{ paddingBottom: 10 }}
  />
)}

        
      </View>

         {/* Línea divisoria opcional */}
      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 8 }} />


   <View style={{ flex: 1}}>

        <Text style={{ fontSize: 16, marginVertical: 0 }}>
          Jugadores:
        </Text>
{loadingJugadores ? (
  <ActivityIndicator size="small" color="#02B9FA" style={{ marginTop: 10 }} />
) : (
  <FlatList
    data={jugadoresExtras}
    renderItem={renderExtra}
    keyExtractor={(item, index) => `extra-${index}`}
  />
)}



            </View>

         <View style={styles.buttonContainer}>
                              <TouchableOpacity style={styles.closeButton} 
                         onPress={() => setModalVisible(false)}
                              >
                                <Text style={styles.buttonText}>Cerrar</Text>
                              </TouchableOpacity>
        
                      {!jugadasRegistradas && (
            <TouchableOpacity 
              style={styles.terminateButton} 
              onPress={handleGuardarJugadores}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          )}
        
        
        
                            </View>
      </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
  width: '90%',
  height: '85%',
  backgroundColor: 'white',
  borderWidth: 2,
  borderColor: '#00baff',
  borderRadius: 10,
  padding: 10,
  justifyContent: 'flex-start',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    padding: 10,
    color: '#000',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#02B9FA',
    padding: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  infoText: {
    color: '#0066cc',
    textAlign: 'center',
    fontWeight: '500',
  },
  resultadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  resultadoTexto: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  resultadosList: {
    maxHeight: 150,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#C9C9C9',
    padding: 10,
  },
  listContainer: {
    flexGrow: 1,
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -10,
  },
  jugadorContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 5,
    padding: 5,
  },
    jugadorContainer2: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingBottom: 5,
  },
  jugador1: {
    borderWidth: 3,
    borderColor: '#02B9FA',
  },
  jugador2: {
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  parejaIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
   parejaIndicatorJ: {
    marginBottom: 10, // Separación entre el nombre y el número de jugador
  },
  parejaNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  jugadorNumero: {
    fontSize: 14,
    color: '#666',
  },
  jugadorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 5,
    marginHorizontal: 2,
  },
  controlButtonDisabled: {
    opacity: 0.5,
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
    color: '#333',
    fontWeight: '500',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  botonesContainer: {
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10
  },
   buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
    closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#C9C9C9',
    borderRadius: 18,
    alignItems: 'center',
  },
   buttonText: {
     fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
   terminateButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#00BFFF',
    borderRadius: 18,
    alignItems: 'center',
  },
  inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 10,
  marginBottom: 10,
  backgroundColor: '#fff',
},

inputBuscar: {
  flex: 1,
  height: 40,
  fontSize: 16,
},

addIcon: {
  fontSize: 22,
  color: '#02B9FA',
  paddingHorizontal: -5,
},
  modalContainer2: {
    flex: 1,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: '#00baff',
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent2: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: '#00baff',
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#00baff",
  }, 
});
export default JugadoresModal;
