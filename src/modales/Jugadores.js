import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomButton from '../componentes/Buttons';
import Titulo from '../componentes/Titulo';
import URL from "../Helper/URL";
import APIManager from "../componentes/API/APIManager.jsx";
import  {verificarJugadoresAmericana} from '../componentes/Activos/Americana/AmericanaApiService.js';
import colors from "../styles/colors";

const JUEGO_TIPOS = {
  AMERICANA: 1,
  REY: 2,
  RETA: 10,
  SEIS_LOCO: 14,
  AMERICANA_PAREJAS: 15
};

const MAX_JUGADORES = {
  [JUEGO_TIPOS.AMERICANA]: 8,
  [JUEGO_TIPOS.REY]: 4,
  [JUEGO_TIPOS.RETA]: 4,
  [JUEGO_TIPOS.SEIS_LOCO]: 6,
  [JUEGO_TIPOS.AMERICANA_PAREJAS]: 8
};

const JugadoresModal = ({ 
  visible, 
  onClose, 
  jugadores = [], 
  loading, 
  idJuego,
  tipoJuego = JUEGO_TIPOS.RETA, // Default to RETA
  onJugadorAgregado,
  onAgregarJugadorManual,
  onEliminarJugador,
  onGuardarJugadores,
  jugadoresManuales = [],
}) => {
  const [loadingJugadores, setLoadingJugadores] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [jugadoresLocales, setJugadoresLocales] = useState([]);
  const BASE_ICON = require('../../assets/icon_no_profile.png');
  const BASE_URL = URL.IMAGENES;
  const [guardado, setGuardado] = useState(false);
  const [jugadasRegistradas, setJugadasRegistradas] = useState(false);
console.log("juagdas res", jugadasRegistradas);

  const maxJugadores = MAX_JUGADORES[tipoJuego] || 4;
  
  useEffect(() => {
    setJugadoresLocales([...jugadores, ...jugadoresManuales]);
  }, [jugadores, jugadoresManuales]);

  const moverArriba = (index) => {
    if (index <= 0) return;
    const nuevosJugadores = [...jugadoresLocales];
    [nuevosJugadores[index], nuevosJugadores[index - 1]] = 
    [nuevosJugadores[index - 1], nuevosJugadores[index]];
    setJugadoresLocales(nuevosJugadores);
  };

  const moverAbajo = (index) => {
    if (index >= jugadoresLocales.length - 1) return;
    const nuevosJugadores = [...jugadoresLocales];
    [nuevosJugadores[index], nuevosJugadores[index + 1]] = 
    [nuevosJugadores[index + 1], nuevosJugadores[index]];
    setJugadoresLocales(nuevosJugadores);
  };
 

useEffect(() => {
  const verificarJugadas = async () => {
    try {
      const res = await verificarJugadoresAmericana(idJuego);
      
      if (res && Array.isArray(res.jugadores) && res.jugadores.length > 0) {
        setJugadasRegistradas(true); // ya hay jugadas registradas
      } else {
        setJugadasRegistradas(false); // aún no hay jugadas
      }
    } catch (error) {
      console.log("Error verificando jugadas:", error);
    }
  };

  verificarJugadas();
}, [idJuego]);



  const renderJugadorItem = ({ item, index }) => {
    switch (tipoJuego) {
      case JUEGO_TIPOS.RETA:
        return renderJugadorReta({ item, index });
      case JUEGO_TIPOS.AMERICANA:
      case JUEGO_TIPOS.AMERICANA_PAREJAS:
        return renderPareja({ item, index });
      default:
        return renderJugadorReta({ item, index });
    }
  };

  const renderJugadorReta = ({ item, index }) => {
    // Calcular la pareja basándose en los índices pares/impares
    const pareja = Math.floor(index / 2) + 1;
    const esJugador1 = index % 2 === 0;
    const imageSource = item.isManual || !item.us_foto
      ? BASE_ICON
      : { uri: `${BASE_URL}profiles/${item.us_foto}` };
    const nombre = item.us_nomUsuario || item.usuario || 'Sin nombre';

    return (
      <View style={[
        styles.jugadorContainer,
        esJugador1 ? styles.jugador1 : styles.jugador2
      ]}>
        <View style={styles.parejaIndicator}>
          <Text style={styles.parejaNumero}>Pareja {pareja}</Text>
          <Text style={styles.jugadorNumero}>Jugador {esJugador1 ? 1 : 2}</Text>
        </View>
        
 <View style={styles.jugadorContent}>
  <Image source={imageSource} style={styles.avatar} />
  <View style={styles.jugadorInfo}>
    <Text style={styles.nombreJugador}>{nombre}</Text>
  </View>

  {!jugadasRegistradas && (
    <View style={styles.controlesContainer}>
      <TextInput 
        placeholder="Buscar jugador..."
        value={searchTerm}
        onChangeText={handleBuscarJugador}
      />

      <TouchableOpacity 
        onPress={() => moverArriba(index)}
        style={[styles.controlButton, index === 0 && styles.controlButtonDisabled]}
        disabled={index === 0}
      >
        <Icon name="chevron-up" size={24} color={index === 0 ? "#ccc" : colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => moverAbajo(index)}
        style={[styles.controlButton, index === jugadoresLocales.length - 1 && styles.controlButtonDisabled]}
        disabled={index === jugadoresLocales.length - 1}
      >
        <Icon name="chevron-down" size={24} color={index === jugadoresLocales.length - 1 ? "#ccc" : colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => confirmarEliminacion(item)}
        style={styles.deleteButton}
      >
        <Icon name="close-circle" size={24} color="red" />
      </TouchableOpacity>
    </View>
  )}
</View>


      </View>
    );
  };

const renderPareja = ({ item, index }) => {
  const pareja = Math.floor(index / 2) + 1;  // Número de la pareja
  const esJugador1 = index % 2 === 0;  // Primer jugador de la pareja
  const imageSource = item.isManual || !item.us_foto
    ? BASE_ICON
    : { uri: `${BASE_URL}profiles/${item.us_foto}` };
  const nombre = item.us_nomUsuario || item.usuario || 'Sin nombre';

  return (
    <>
      {/* Mostrar el texto "Pareja X" solo al inicio de cada pareja */}
      {esJugador1 && (
        <View style={styles.parejaIndicator}>
          <Text style={styles.parejaNumero}>Pareja {pareja}</Text>
        </View>
      )}

      {/* Contenedor de los jugadores */}
      <View style={[styles.jugadorContainer, esJugador1 ? styles.jugador1 : styles.jugador2]}>
        <View style={styles.jugadorContent}>
          <Image source={imageSource} style={styles.avatar} />
          <View style={styles.jugadorInfo}>
            <Text style={styles.nombreJugador}>{nombre}</Text>
          </View>

            {/* <View style={styles.parejaIndicatorJ}>
          <Text style={styles.jugadorNumero}>Jugador {esJugador1 ? 1 : 2}</Text>
        </View> */}
          
          {/* Mostrar los controles solo si las jugadas no han sido registradas */}
          {!jugadasRegistradas && (
            <View style={styles.controlesContainer}>
              <TouchableOpacity 
                onPress={() => moverArriba(index)}
                style={[styles.controlButton, index === 0 && styles.controlButtonDisabled]}
                disabled={index === 0}
              >
                <Icon name="chevron-up" size={24} color={index === 0 ? "#ccc" : colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => moverAbajo(index)}
                style={[styles.controlButton, index === jugadoresLocales.length - 1 && styles.controlButtonDisabled]}
                disabled={index === jugadoresLocales.length - 1}
              >
                <Icon name="chevron-down" size={24} color={index === jugadoresLocales.length - 1 ? "#ccc" : colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => confirmarEliminacion(item)}
                style={styles.deleteButton}
              >
                <Icon name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
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
        const jugadoresIds = jugadoresLocales.map(j => j.id_jugador);
        const resultadosFiltrados = res.data.filter(
          jugador => !jugadoresIds.includes(jugador.id_jugador)
        );
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

  const confirmarGuardado = (autocompletar) => {
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
              let jugadoresAGuardar = [...jugadoresLocales];
              
              // Si es necesario autocompletar con jugadores placeholder
              if (autocompletar && tipoJuego === JUEGO_TIPOS.RETA) {
                // Completar hasta tener 4 jugadores
                for (let i = jugadoresAGuardar.length; i < 4; i++) {
                  const jugadorPlaceholder = {
                    isManual: true,
                    id_jugador: null,
                    us_nomUsuario: `Jugador${i+1}`,
                    usuario: `Jugador${i+1}`
                  };
                  jugadoresAGuardar.push(jugadorPlaceholder);
                }
              }
              
              const datosFormateados = formatearDatosParaGuardar(jugadoresAGuardar, tipoJuego);
  
              // Utilizamos una única API endpoint para todos los tipos de juego
              try {
                const res = await APIManager({
                  url: "Activos/Guardar/guardarJugadores",
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  data: JSON.stringify({
                    id_juego: idJuego,
                    tipo_juego: tipoJuego, // Enviamos el tipo de juegoo
                    jugadores: datosFormateados,
                  }),
                });
  
                console.log("Datos enviados a la API:", JSON.stringify({
                  id_juego: idJuego,
                  tipo_juego: tipoJuego,
                  jugadores: datosFormateados,
                }, null, 2));
                console.log("Respuesta del servidor:", res);
  
                if (res && res.status) {
                  setJugadasRegistradas(true);
                  setGuardado(true);
                  Alert.alert("Éxito", "Jugadores guardados correctamente", [
                    {
                      text: "OK",
                      onPress: () => onClose(),
                    }
                  ]);
                } else {
                  throw new Error(res?.message || "Error al guardar jugadores");
                }
              } catch (apiError) {
                console.log("Error en la llamada API:", apiError);
                Alert.alert("Error", "No se pudo guardar los jugadores. Problema de comunicación con el servidor.");
              }
            } catch (error) {
              console.log("Error al guardar jugadores:", error);
              Alert.alert("Error", "No se pudo guardar los jugadores: " + error.message);
            }
          },
        },
      ]
    );
  };
  
  // También necesitamos actualizar la función formatearDatosParaGuardar para manejar todos los tipos de juego
  const formatearDatosParaGuardar = (jugadores, tipo) => {
    console.log("Jugadores recibidos:", jugadores);
    console.log("Tipo de juego:", tipo);
  
    switch (tipo) {
      case JUEGO_TIPOS.RETA:
        // Para el tipo RETA, siempre necesitamos 2 parejas
        const jugadoresFormateados = [];
        
        // Primera pareja (primera y segunda posición)
        const pareja1 = {
          id_jugador1: jugadores[0]?.isManual ? null : String(jugadores[0]?.id_jugador),
          us_jugador1: jugadores[0]?.us_nomUsuario || jugadores[0]?.usuario,
          id_jugador2: jugadores[1]?.isManual ? null : String(jugadores[1]?.id_jugador),
          us_jugador2: jugadores[1]?.us_nomUsuario || jugadores[1]?.usuario,
          set1: null,
          set2: null,
          set3: null
        };
        jugadoresFormateados.push(pareja1);
        
        // Segunda pareja (tercera y cuarta posición)
        const pareja2 = {
          id_jugador1: jugadores[2]?.isManual ? null : String(jugadores[2]?.id_jugador),
          us_jugador1: jugadores[2]?.us_nomUsuario || jugadores[2]?.usuario || "Jugador3",
          id_jugador2: jugadores[3]?.isManual ? null : String(jugadores[3]?.id_jugador),
          us_jugador2: jugadores[3]?.us_nomUsuario || jugadores[3]?.usuario || "Jugador4",
        
          set1: null,
          set2: null,
          set3: null
        };
        jugadoresFormateados.push(pareja2);
        
        console.log("Jugadores formateados:", jugadoresFormateados);
        return jugadoresFormateados;
  
      case JUEGO_TIPOS.AMERICANA:
      case JUEGO_TIPOS.AMERICANA_PAREJAS:
        // Formateo para juegos de tipo Americana
        const parejas = [];
        for (let i = 0; i < jugadores.length; i += 2) {
          if (i + 1 < jugadores.length) {
            const pareja = {
              id_jugador1: jugadores[i]?.isManual ? null : String(jugadores[i]?.id_jugador),
              us_jugador1: jugadores[i]?.us_nomUsuario || jugadores[i]?.usuario,
              id_jugador2: jugadores[i+1]?.isManual ? null : String(jugadores[i+1]?.id_jugador),
              us_jugador2: jugadores[i+1]?.us_nomUsuario || jugadores[i+1]?.usuario,
              puntos: 0
            };
            parejas.push(pareja);
          } else {
            // Si hay un jugador sin pareja
            const pareja = {
              id_jugador1: jugadores[i]?.isManual ? null : String(jugadores[i]?.id_jugador),
              us_jugador1: jugadores[i]?.us_nomUsuario || jugadores[i]?.usuario,
              id_jugador2: null,
              us_jugador2: null,
              puntos: 0
            };
            parejas.push(pareja);
          }
        }
        return parejas;
  
      case JUEGO_TIPOS.REY:
      case JUEGO_TIPOS.SEIS_LOCO:
        // Formateo para Rey y Seis Loco (jugadores individuales)
        return jugadores.map(jugador => ({
          id_jugador: jugador?.isManual ? null : String(jugador?.id_jugador),
          usuario: jugador?.us_nomUsuario || jugador?.usuario,
          puntos: 0
        }));
  
      default:
        console.log("Tipo de juego no reconocido, retornando jugadores sin cambios:", jugadores);
        return jugadores;
    }
  };
  
  const handleGuardarJugadores = async () => {
    if (jugadoresLocales.length > maxJugadores) {
      Alert.alert("Error", `Este tipo de juego permite un máximo de ${maxJugadores} jugadores.`);
      return;
    }
    
    // Verificar mínimo de jugadores para RETA (obligatoriamente 4)
    if (tipoJuego === JUEGO_TIPOS.RETA && jugadoresLocales.length < 4) {
      Alert.alert(
        "Advertencia",
        "Para el tipo de juego RETA se requieren 4 jugadores. ¿Deseas continuar y rellenar automáticamente los jugadores faltantes?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Continuar",
            onPress: () => confirmarGuardado(true),
          },
        ]
      );
    } else {
      confirmarGuardado(false);
    }
  };
  

  
  const handleAgregarJugador = async (jugador) => {
    if (jugadoresLocales.length >= maxJugadores) {
      Alert.alert("Límite alcanzado", `Este tipo de juego permite un máximo de ${maxJugadores} jugadores.`);
      return;
    }

    if (!jugador) return;
  
    try {
      if (jugador.id_jugador) {
        const data = new FormData();
        data.append("id_juego", idJuego);
        data.append("id_jugador", jugador.id_jugador);
  
        const res = await APIManager({
          url: "Activos/Activos/agregarJugador",
          method: "POST",
          data: data,
        });
  
        if (res.status) {
          Alert.alert("Éxito", res.message || `Se ha enviado la invitación a ${jugador.usuario || 'el jugador'}.`);
          setJugadoresLocales(prev => [...prev, jugador]);
          if (typeof onJugadorAgregado === 'function') {
            onJugadorAgregado(idJuego, jugador);
          }
        } else {
          Alert.alert("Error", res.message || "No se pudo agregar el jugador");
        }
      } else {
        const nuevoJugador = {
          us_nomUsuario: searchTerm,
          us_foto: null,
          isManual: true,
          id_jugador: Date.now() 
        };
        setJugadoresLocales(prev => [...prev, nuevoJugador]);
        if (typeof onAgregarJugadorManual === 'function') {
          onAgregarJugadorManual(idJuego, nuevoJugador);
          Alert.alert("Éxito", "Jugador manual agregado correctamente");
        }
      }
      setSearchTerm('');
      setResultadosBusqueda([]);
    } catch (error) {
      console.log('Error al agregar jugador:', error);
      Alert.alert("Error", "Ocurrió un error al agregar el jugador");
    }
  };

  const handleEliminarJugador = async (jugador) => {
    if (!jugador) {
      console.log('Error: Jugador inválido');
      return;
    }
  
    try {
      if (jugador.isManual) {
        setJugadoresLocales(prev => prev.filter(j => j.id_jugador !== jugador.id_jugador));
        if (typeof onEliminarJugador === 'function') {
          onEliminarJugador(idJuego, jugador);
          Alert.alert("Éxito", "Jugador eliminado correctamente");
        }
      } else {
        const data = new FormData();
        data.append("id_juego", idJuego);
        data.append("id_jugador", jugador.id_jugador);
  
        const res = await APIManager({
          url: "Activos/Activos/cambiarEstadoJugador",
          method: "POST",
          data: data,
        });
  
        if (res.status) {
          setJugadoresLocales(prev => prev.filter(j => j.id_jugador !== jugador.id_jugador));
          if (typeof onEliminarJugador === 'function') {
            onEliminarJugador(idJuego, jugador);
            Alert.alert("Éxito", "Jugador eliminado correctamente");
          }
        } else {
          Alert.alert("Error", "No se pudo eliminar el jugador de la base de datos");
        }
      }
    } catch (error) {
      console.log('Error al eliminar jugador:', error);
      Alert.alert("Error", "Ocurrió un error al eliminar el jugador");
    }
  };

  const confirmarEliminacion = (jugador) => {
    Alert.alert(
      "Eliminar jugador",
      `¿Estás seguro de que deseas eliminar a ${jugador.us_nomUsuario || jugador.usuario || 'este jugador'}?`,
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
        <Icon name="add-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Titulo titulo="JUGADORES" />
          <Text style={styles.subtitulo}>
            Este es el orden en el que será primera ronda
          </Text>
          
          <View style={styles.searchContainer}>
       {!jugadasRegistradas && (
  <>
    <TextInput
    style={styles.inputBuscar}
      placeholder="Buscar jugador..."
      value={searchTerm}
      onChangeText={handleBuscarJugador}
    />
    {/* Botón de agregar manual o resultados de búsqueda */}
  </>
)}

            {buscando ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              searchTerm.trim() !== '' && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAgregarJugador({})}
                >
                  <Text style={styles.addButtonText}>Agregar</Text>
                </TouchableOpacity>
              )
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
                    No se encontraron resultados. Presiona "Agregar" para crear un jugador manual.
                  </Text>
                )
              }
            />
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <FlatList
              data={jugadoresLocales}
              renderItem={renderJugadorItem}
              keyExtractor={(item, index) => `player-${index}`}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay jugadores en la partida</Text>
              }
            />
          )}
            {jugadasRegistradas && (
  <Text style={{ textAlign: 'center', color: 'gray', marginVertical: 10 }}>
    Los jugadores ya han sido registrados. Solo puedes ver las parejas formadas.
  </Text>
)}

             <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
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
    backgroundColor: colors.primary,
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  jugadorContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  jugador1: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  jugador2: {
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  parejaIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
    inputBuscar: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
});

export default JugadoresModal;