import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
} from "react-native";
import CustomButton from "../Buttons";
import JugadoresParejas from "../../modales/JugadoresParejas";
import { useAuth } from "../../screens/Auth/AuthContext";
import {
  guardarRondaReta,
  guardarRondaCompleta,
  terminarRondaGeneral,
  traerRondasReta,
  obtenerHistorialPuntosReta,
  mandarRanking,
  eliminarRondas,
} from "./Americana/RetaApiService";
import {
  fetchJugadoresJuego,
  verificarJugadoresAmericana,
  terminarJuego,
} from "./Americana/AmericanaApiService";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RetaMatch from "./Americana/RetaMatch";
import HistorialPuntos2 from "../../modales/HistorialPuntos2";
import JugadoresAmericanaP from "../../modales/JugadoresAmericanaP";

const Reta = ({ juego, onTerminarJuego }) => {
  console.log("juego", juego);
  const navigation = useNavigation();
  const { id_usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [jugadoresActivos, setJugadoresActivos] = useState([]);
  console.log("jugadores activos", jugadoresActivos);
  const [jugadoresManuales, setJugadoresManuales] = useState({});
  const [loadingJugadores, setLoadingJugadores] = useState(false);
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null);
  const [rondaActual, setRondaActual] = useState({});
  const [historialVisible, setHistorialVisible] = useState(false);
  const [historialPartidas, setHistorialPartidas] = useState({});
  const [jugadoresGuardados, setJugadoresGuardados] = useState({});
  const [puntosPartida, setPuntosPartida] = useState({});
  const [rondaResetKey, setRondaResetKey] = useState({});

  const [timeBreakVisible, setTimeBreakVisible] = useState(false);
  const [juegoPendienteGuardar, setJuegoPendienteGuardar] = useState(null);
  const [marcadorTimeBreak, setMarcadorTimeBreak] = React.useState(null);
  console.log("marcador de tie break ", marcadorTimeBreak);
  const [nombresDeCanchasPendientes, setNombresDeCanchasPendientes] =
    useState(null);

  const [parejaTieBreak, setParejaTieBreak] = useState(null);
  console.log("pareja ", parejaTieBreak);
  const [jugadasRegistradas, setJugadasRegistradas] = useState(false);
  console.log("jugadasRegistradas ", jugadasRegistradas);
  const [partidasTerminadas] = useState(false);

  // Referencia para el juego anterior
  const prevJuego = useRef(null);
  const initialFetchDone = useRef(false);
  const [rondaIds, setRondaIds] = useState({});
  const [rondaFinalizada, setRondaFinalizada] = useState(false);
  //validacion de creador
  const [soyCreador, setSoyCreador] = useState(false);
  //ajuste de que este activo alguna ronda
  const [esperandoCreador, setEsperandoCreador] = useState(true);
  const [modalCargando, setModalCargando] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const numCanchas = parseInt(juego.num_canchas);
  const nombresDeCanchas = juego.nombre_canchas
    ? juego.nombre_canchas.split(",").map((nombre, i) => {
        const limpio = nombre.trim();
        return limpio.toLowerCase().startsWith("cancha")
          ? limpio
          : `CANCHA: ${limpio}`;
      })
    : Array.from(
        { length: parseInt(juego.num_canchas) },
        (_, i) => `CANCHA: ${i + 1}`
      );

  useEffect(() => {
    console.log(
      "Comparando id_usuario del juego:",
      juego?.id_usuario,
      "con id_usuario de sesión:",
      id_usuario
    );
    if (juego?.id_usuario && id_usuario) {
      if (String(juego.id_usuario) === String(id_usuario)) {
        setSoyCreador(true);
      } else {
        setSoyCreador(false);
      }
    } else {
      setSoyCreador(false);
    }
  }, [juego, id_usuario]);

  const recuperarEstadoJuegoCreado = async () => {
    if (juego?.id_juego) {
      try {
        const idJuego = juego.id_juego;
        const res = await traerRondasReta(idJuego);
        console.log(res);

        if (Array.isArray(res) && res.length > 0) {
          const historialStr = await AsyncStorage.getItem("historialPartidas");
          const historial = historialStr ? JSON.parse(historialStr) : {};
          historial[idJuego] = res;
          await AsyncStorage.setItem(
            "historialPartidas",
            JSON.stringify(historial)
          );
          setHistorialPartidas((prev) => ({
            ...prev,
            [idJuego]: res,
          }));
          setRondaActual((prev) => ({
            ...prev,
            [idJuego]: res[0].num_ronda,
          }));

          const rondasIdsporCancha = {};
          for (let f = 0; f < res.length; f += 2) {
            const pareja1 = res[f];
            const pareja2 = res[f + 1];

            rondasIdsporCancha[`cancha${f / 2}`] = {
              idRondaJuego: pareja1.id_ronda_reta,
              idRondaJuego2: pareja2.id_ronda_reta,
            };
          }

          setRondaIds((prev) => {
            const newState = {
              ...prev,
              [idJuego]: rondasIdsporCancha,
            };
            AsyncStorage.setItem(
              `rondaIds_${idJuego}`,
              JSON.stringify(rondasIdsporCancha)
            ).catch((error) =>
              console.error(
                "Error guardando los rondaIds en AsyncStorage:",
                error
              )
            );
            return newState;
          });

          // Actualizar jugadores activos según las rondas actuales
          const nuevasParejas = [];
          for (let i = 0; i < res.length; i += 2) {
            const pareja1 = res[i];
            if (pareja1) {
              nuevasParejas.push({
                id_jugador1: pareja1?.id_jugador1,
                us_jugador1: pareja1?.us_jugador1,
                id_jugador2: pareja1?.id_jugador2,
                us_jugador2: pareja1?.us_jugador2,
              });
            }
            const pareja2 = res[i + 1];
            if (pareja2) {
              nuevasParejas.push({
                id_jugador1: pareja2?.id_jugador1,
                us_jugador1: pareja2?.us_jugador1,
                id_jugador2: pareja2?.id_jugador2,
                us_jugador2: pareja2?.us_jugador2,
              });
            }
          }
          setJugadoresActivos(nuevasParejas);

          setJugadasRegistradas(true);
          setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: true }));
          setEsperandoCreador(false);

          // Propagar tiebreak y puntos al restaurar el estado
          const puntos = {};
          for (let i = 0; i < res.length; i += 2) {
            const ronda1 = res[i];
            const ronda2 = res[i + 1];
            if (ronda1 && ronda2) {
              let tieBreak = null;
              let tieBreakScore = null;
              if (
                ronda1.tiebreak != null &&
                ronda2.tiebreak != null &&
                ronda1.tiebreak !== "" &&
                ronda2.tiebreak !== ""
              ) {
                tieBreak = [
                  parseInt(ronda1.tiebreak),
                  parseInt(ronda2.tiebreak),
                ];
                tieBreakScore = {
                  pareja1: parseInt(ronda1.tiebreak),
                  pareja2: parseInt(ronda2.tiebreak),
                };
              }
              puntos[`pareja${i / 2}`] = {
                pareja1: parseInt(ronda1.set1) || 0,
                pareja2: parseInt(ronda2.set1) || 0,
                tieBreak,
                tieBreakScore,
              };
            }
          }
          setPuntosPartida((prev) => ({
            ...prev,
            [idJuego]: puntos,
          }));
        } else {
          if (soyCreador && !jugadasRegistradas) {
            setEsperandoCreador(false);
            recuperarEstadoJuego();
          } else {
            setEsperandoCreador(true);
          }
        }
        renderCanchasJugadores(juego);
      } catch (error) {
        console.error("Error recuperando estado del juego:", error);
      }
    }
  };

  useEffect(() => {
    const recuperarEstadoJuego = async () => {
      if (juego?.id_juego) {
        try {
          const idJuego = juego.id_juego;

          const historialStr = await AsyncStorage.getItem("historialPartidas");
          const rondaStr = await AsyncStorage.getItem(`rondaActual_${idJuego}`);
          const rondaIdsStr = await AsyncStorage.getItem(`rondaIds_${idJuego}`);

          if (historialStr) {
            const historial = JSON.parse(historialStr);
            if (historial[idJuego]) {
              setHistorialPartidas((prev) => ({
                ...prev,
                [idJuego]: historial[idJuego],
              }));
            }
          }

          if (rondaStr) {
            setRondaActual((prev) => ({
              ...prev,
              [idJuego]: parseInt(rondaStr, 10),
            }));
          }

          if (rondaIdsStr) {
            const rondaIdsParsed = JSON.parse(rondaIdsStr);
            setRondaIds((prev) => ({
              ...prev,
              [idJuego]: rondaIdsParsed,
            }));
          }

          renderCanchasJugadores(juego);
        } catch (error) {
          console.error("Error recuperando estado del juego:", error);
        }
      }
    };

    

    recuperarEstadoJuegoCreado();
  }, [juego]); // <-- escucha directamente a `juego`

  // Main useEffect to handle juego prop
  useEffect(() => {
    const fetchJugadores = async () => {
      if (
        juego &&
        juego.id_juego &&
        (!prevJuego.current || prevJuego.current.id_juego !== juego.id_juego)
      ) {
        prevJuego.current = juego;
        initialFetchDone.current = true;

        // Resetear estados al cambiar de juego
        setJugadoresActivos([]);
        setJugadoresGuardados((prev) => ({ ...prev, [juego.id_juego]: false }));
        setJugadasRegistradas(false);

        const hayGuardados = await jugadoresSiGuardados(juego.id_juego);

        if (!hayGuardados) {
          await jugadoresNoGuardados(juego.id_juego);
        }
      }
    };

    fetchJugadores();
  }, [juego]);

  // Polling para usuarios NO creadores: revisa cambios en rondaIds cada 5s
  useEffect(() => {
    if (!soyCreador && juego?.id_juego) {
      const interval = setInterval(async () => {
        try {
          const res = await traerRondasReta(juego.id_juego);
          // Construir nuevos rondaIds para comparar
          const nuevosRondaIds = {};
          for (let f = 0; f < res.length; f += 2) {
            const pareja1 = res[f];
            const pareja2 = res[f + 1];
            nuevosRondaIds[`cancha${f / 2}`] = {
              idRondaJuego: pareja1?.id_ronda_reta,
              idRondaJuego2: pareja2?.id_ronda_reta,
            };
          }
          // Comparar rondaIds actuales con los nuevos
          const rondaIdsActual = rondaIds?.[juego.id_juego] || {};
          const iguales = JSON.stringify(rondaIdsActual) === JSON.stringify(nuevosRondaIds);
          if (!iguales) {
            // Si hay cambios, recupera el estado completo
            await recuperarEstadoJuegoCreado();
          }
        } catch (e) {
          // Silenciar errores de polling
        }
      }, 2000); // cada 2 segundos
      return () => clearInterval(interval);
    }
  }, [soyCreador, juego?.id_juego, rondaIds]);

  const jugadoresNoGuardados = async (idJuego) => {
    try {
      setLoadingJugadores(true);
      const jugadores = await fetchJugadoresJuego(idJuego);
      console.log("jugadores no guardados", jugadores);

      if (jugadores && Array.isArray(jugadores)) {
        const parejas = [];

        for (let i = 0; i < jugadores.length; i += 2) {
          const jugador1 = jugadores[i];
          const jugador2 = jugadores[i + 1]; // Puede ser undefined si es impar

          parejas.push({
            id_jugador1: jugador1?.id_jugador || null,
            us_jugador1: jugador1?.us_nomUsuario || jugador1?.nom_invitado || null,
            id_jugador2: jugador2?.id_jugador || null,
            us_jugador2: jugador2?.us_nomUsuario || jugador2?.nom_invitado || null,
          });
        }

        setJugadoresActivos(parejas);
        setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: false }));
        setJugadasRegistradas(false);
      }
    } catch (error) {
      console.log("Error al obtener jugadores:", error);
      Alert.alert("Error", "No se pudieron cargar los jugadores");
      setJugadoresActivos([]);
      setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: false }));
      setJugadasRegistradas(false);
    } finally {
      setLoadingJugadores(false);
    }
  };

  const jugadoresSiGuardados = async (idJuego) => {
    try {
      setLoadingJugadores(true);

      const res = await verificarJugadoresAmericana(idJuego);

      if (
        res?.status &&
        Array.isArray(res.jugadores) &&
        res.jugadores.length > 0
      ) {
        setJugadoresActivos(res.jugadores);
        setJugadasRegistradas(true);
        setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: true }));
        return true;
      } else {
        setJugadoresActivos([]);
        setJugadasRegistradas(false);
        setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: false }));
        return false;
      }
    } catch (error) {
      console.log("Error al obtener jugadores:", error);
      Alert.alert("Error", "No se pudieron cargar los jugadores");
      setJugadoresActivos([]);
      setJugadasRegistradas(false);
      setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: false }));
      return false;
    } finally {
      setLoadingJugadores(false);
    }
  };

  const onTerminarJuegoHandler = async () => {
    Alert.alert(
      "Terminar juego",
      "¿Estás seguro de que deseas terminar el juego?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Terminar",
          onPress: async () => {
            setModalCargando(true);
            try {
              const resultado = await terminarJuego(juego.id_juego, id_usuario);
              if (resultado.status === true || resultado.status === "true") {
                // Eliminar datos del storage y tambien eliminar las rondas activas que haya
                if (rondaIds && rondaIds[juego.id_juego]) {
                  const canchas = Object.values(rondaIds[juego.id_juego]);
                  for (const cancha of canchas) {
                    if (cancha.idRondaJuego) {
                      await eliminarRondas(cancha.idRondaJuego);
                    }
                    if (cancha.idRondaJuego2) {
                      await eliminarRondas(cancha.idRondaJuego2);
                    }
                  }
                }
                // Eliminar datos del storage
                await AsyncStorage.removeItem("historialPartidas");
                await AsyncStorage.removeItem(`rondaActual_${juego.id_juego}`);
                const jugadas = await obtenerHistorialPuntosReta(juego.id_juego);
                for (let i = 0; i < jugadas.length; i += 2) {
                  const jugada1 = jugadas[i];
                  const jugada2 = jugadas[i + 1];
                  const id1 = jugada1?.id_ronda_reta;
                  const id2 = jugada2?.id_ronda_reta;
                  if (id1 && id2) {
                    await mandarRanking(String(id1), String(id2));
                  } else {
                    console.error(
                      "No se puede mandar ranking, faltan IDs válidos:",
                      { id1, id2, jugada1, jugada2 }
                    );
                  }
                }
                await terminarRondaGeneral(juego.id_juego);
                setModalCargando(false); // ✅ Ocultar modal al terminar

                Alert.alert("Éxito", "Juego terminado correctamente", [
                  {
                    text: "OK",
                    onPress: () => {
                      setHistorialVisible(false);
                      onTerminarJuego();
                    },
                  },
                ]);
              } else {
                setModalCargando(false);
                Alert.alert("Error", resultado.message);
              }
            } catch (error) {
              console.log("Error al terminar el juego:", error);
              Alert.alert(
                "Atención",
                "Ocurrio un error al intentar eliminar el juego"
              );
            }
          },
        },
      ]
    );
  };

  const handleVerJugadores = (juego) => {
    setJuegoSeleccionado(juego);
    setModalVisible(true);
  };

  const handleVerHistorial = (juego) => {
    setHistorialVisible(true);
  };

  const rotarJugadores = async (id_juego, parejasActuales = null) => {
    console.log("🔄 Iniciando rotarJugadores con id_juego:", id_juego);

    const rondaAnterior = parseInt(rondaActual[id_juego], 10) || 0;
    const nuevaRonda = rondaAnterior + 1;

    console.log(
      "🔄 Ronda anterior:",
      rondaAnterior,
      "Nueva ronda:",
      nuevaRonda
    );

    setRondaActual((prev) => ({ ...prev, [id_juego]: nuevaRonda }));

    try {
      await AsyncStorage.setItem(
        `rondaActual_${id_juego}`,
        (nuevaRonda ?? 1).toString()
      );
      console.log(`✅ Ronda guardada en AsyncStorage: ${nuevaRonda}`);
    } catch (error) {
      console.error("❌ Error guardando ronda en AsyncStorage:", error);
    }

    // Obtener historial de puntos de la API para la ronda actual
    let historial = [];
    try {
      historial = await obtenerHistorialPuntosReta(id_juego);
    } catch (e) {
      console.error("Error obteniendo historial de puntos:", e);
      return;
    }
    if (!Array.isArray(historial) || historial.length < 2) {
      console.warn("No hay suficientes datos de historial para rotar");
      return;
    }

    // Agrupar de dos en dos (cada par es una cancha)
    const nuevasParejas = [];
    for (let i = 0; i < historial.length; i += 2) {
      // Intercambiar de lado las parejas dentro de la misma cancha
      const parejaA = historial[i];
      const parejaB = historial[i + 1];
      if (parejaA && parejaB) {
        nuevasParejas.push(parejaB); // Ahora la parejaB pasa al lado A
        nuevasParejas.push(parejaA); // y la parejaA al lado B
      }
    }

    console.log("🔄 Nuevas parejas después de rotación:", nuevasParejas);

    // Obtener información del juego
    const numCanchas = parseInt(juego?.num_canchas, 10) || 1;
    const nombresCanchas = (juego?.nombre_canchas || "")
      .split(",")
      .map((nombre) => nombre.trim());

    // Crear nuevas rondas para cada cancha
    const nuevasRondaIds = {};
    const parejasPorCancha = 2; // 2 parejas por cancha

    for (let i = 0; i < numCanchas; i++) {
      const inicio = i * parejasPorCancha;
      const parejasCancha = nuevasParejas.slice(
        inicio,
        inicio + parejasPorCancha
      );

      if (parejasCancha.length === 2) {
        const partidaData = {
          nombre_cancha: nombresCanchas[i] || `Cancha ${i + 1}`,
          jugadores: [
            {
              id: parejasCancha[0].id_jugador1 || null,
              nombre: parejasCancha[0].us_jugador1 || "",
            },
            {
              id: parejasCancha[0].id_jugador2 || null,
              nombre: parejasCancha[0].us_jugador2 || "",
            },
            {
              id: parejasCancha[1].id_jugador1 || null,
              nombre: parejasCancha[1].us_jugador1 || "",
            },
            {
              id: parejasCancha[1].id_jugador2 || null,
              nombre: parejasCancha[1].us_jugador2 || "",
            },
          ],
          puntos: {
            set1: [0, 0],
            set2: [0, 0],
            set3: [0, 0],
          },
        };

        console.log(`🔄 PartidaData para cancha ${i}:`, partidaData);

        // Guardar nueva ronda y obtener IDs
        try {
          const response = await guardarRondaReta(id_juego, nuevaRonda, [
            partidaData,
          ]);
          if (response && response.idRondaJuego) {
            nuevasRondaIds[`cancha${i}`] = {
              idRondaJuego: response.idRondaJuego,
              idRondaJuego2: response.idRondaJuego2,
            };
          }
        } catch (error) {
          console.error(
            `❌ Error creando nueva ronda para cancha ${i}:`,
            error
          );
        }
      }
    }

    setRondaIds((prev) => {
      const newState = {
        ...prev,
        [id_juego]: nuevasRondaIds,
      };
      AsyncStorage.setItem(
        `rondaIds_${id_juego}`,
        JSON.stringify(nuevasRondaIds)
      ).catch((error) =>
        console.error(
          "❌ Error guardando nuevos rondaIds en AsyncStorage:",
          error
        )
      );
      return newState;
    });

    // Actualizar jugadores activos con las nuevas parejas
    console.log("✅ Actualizando parejas activas para la siguiente ronda:");
    console.log(JSON.stringify(nuevasParejas, null, 2));
    setJugadoresActivos(nuevasParejas);
    setPuntosPartida((prev) => ({ ...prev, [id_juego]: {} }));
    setRondaFinalizada(false);
  };

  const handleActualizarPuntos = (idJuego, parejaIndex, puntos) => {
    setPuntosPartida((prev) => ({
      ...prev,
      [idJuego]: {
        ...(prev[idJuego] || {}),
        [`pareja${parejaIndex}`]: puntos,
      },
    }));
  };

  const asignarJugadoresACanchas = (parejas, numCanchas, id_juego) => {
    const jugadoresPorCancha = 4; // 2 parejas por cancha
    const parejasPorCancha = jugadoresPorCancha / 2; // 2 parejas

    const totalParejas = parejas.length;

    // Calcular canchas completas que se pueden usar
    const canchasCompletas = Math.floor(totalParejas / parejasPorCancha);
    const canchasUsadas = Math.min(numCanchas, canchasCompletas);
    const totalParejasEnJuego = canchasUsadas * parejasPorCancha;

    // Tomar solo las parejas que entran en las canchas usadas (en orden secuencial)
    const parejasEnJuego = parejas.slice(0, totalParejasEnJuego);
    const parejasPendientes = parejas.slice(totalParejasEnJuego);

    // Crear arreglo para las canchas
    const canchas = Array.from({ length: canchasUsadas }, () => []);

    // Asignar parejas a canchas (2 parejas por cancha) en orden secuencial
    for (let i = 0; i < canchasUsadas; i++) {
      const inicio = i * parejasPorCancha;
      const parejasCancha = parejasEnJuego.slice(
        inicio,
        inicio + parejasPorCancha
      );

      // Aplanar las parejas en jugadores individuales para asignar a cancha
      const jugadoresCancha = [];
      parejasCancha.forEach((pareja) => {
        jugadoresCancha.push({
          tipo: "jugador",
          valor: {
            id: pareja.id_jugador1,
            us_nomUsuario: pareja.us_jugador1,
          },
        });
        if (pareja.id_jugador2) {
          jugadoresCancha.push({
            tipo: "jugador",
            valor: {
              id: pareja.id_jugador2,
              us_nomUsuario: pareja.us_jugador2,
            },
          });
        }
      });

      canchas[i] = jugadoresCancha;
    }

    // Parejas pendientes también convertidas a jugadores individuales
    const pendientes = [];
    parejasPendientes.forEach((pareja) => {
      pendientes.push({
        tipo: "jugador",
        valor: {
          id_jugador: pareja.id_jugador1,
          us_nomUsuario: pareja.us_jugador1,
        },
      });
      if (pareja.id_jugador2) {
        pendientes.push({
          tipo: "jugador",
          valor: {
            id_jugador: pareja.id_jugador2,
            us_nomUsuario: pareja.us_jugador2,
          },
        });
      }
    });

    return { canchas, pendientes };
  };

  useEffect(() => {
    if (juegoSeleccionado?.id_juego) {
      renderCanchasJugadores(juegoSeleccionado);
    }
  }, [jugadoresActivos, juegoSeleccionado]);

  const renderCanchasJugadores = (juego) => {
    const numCanchas = parseInt(juego.num_canchas);
    const { canchas, pendientes } = asignarJugadoresACanchas(
      jugadoresActivos,
      numCanchas,
      juego.id_juego
    );

    const nombresCanchas = juego.nombre_canchas
      ? juego.nombre_canchas.split(",").map((nombre) => nombre.trim())
      : [];

    console.log("nombre de canchas", nombresCanchas);
    return (
      <View>
        <View style={styles.rowButtons}>
          <TouchableOpacity
            onPress={() => handleVerJugadores(juego)}
            style={[
              styles.buttonJugadores,
              jugadoresGuardados[juego.id_juego] &&
                styles.buttonJugadoresGuardado,
            ]}
          >
            <Text style={styles.buttonText}>Ver Jugadores</Text>
          </TouchableOpacity>

          {soyCreador && (
            <TouchableOpacity
              onPress={() => handleVerHistorial(juego)}
              style={styles.buttonHistorial}
            >
              <Text style={styles.buttonText}>Ver Historial</Text>
            </TouchableOpacity>
          )}
        </View>

        {(esperandoCreador && !jugadasRegistradas && !soyCreador) ? (
          // Estado de carga: aún no se sabe si están listos o no
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : !jugadasRegistradas ? (
          // No se han guardado los jugadores aún
          <View>
            <Text style={styles.noJuegosText}>
              Debes guardar los jugadores antes de comenzar el juego.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {(Array.isArray(canchas) ? canchas : []).map(
              (jugadoresCancha, index) => {
                const nombreCancha =
                  nombresCanchas[index] || `Cancha ${index + 1}`;
                const rondaIdsCancha =
                  rondaIds[juego.id_juego]?.[`cancha${index}`];

                if (!rondaIdsCancha) {
                  return null;
                }

                return (
                  <RetaMatch
                    key={`cancha-${index}-${rondaResetKey[juego.id_juego] || 0}`}
                    jugadores={jugadoresCancha}
                    juegoNombre={nombreCancha}
                    puntos={
                      puntosPartida[juego.id_juego]?.[`pareja${index}`] || {
                        set1: [0, 0],
                        set2: [0, 0],
                        set3: [0, 0],
                      }
                    }
                    onPuntosChange={(puntos) =>
                      handleActualizarPuntos(juego.id_juego, index, puntos)
                    }
                    indiceCancha={index}
                    rondaIds={rondaIdsCancha}
                    soyCreador={soyCreador}
                  />
                );
              }
            )}
            {/* Botón para guardar la ronda completa */}
            {soyCreador && (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <CustomButton
                  buttonText="Guardar Ronda"
                  onPress={() => {
                    // Crear arreglo solo con nombres de canchas usadas
                    const nombresDeCanchas = canchas.map(
                      (_, index) =>
                        nombresCanchas[index] || `Cancha ${index + 1}`
                    );

                    handleGuardarRondaCompleta(juego, nombresDeCanchas);
                  }}
                  disabled={rondaFinalizada}
                />
              </View>
            )}
            {rondaFinalizada && (
              <Text style={{ color: "white", marginTop: 10 }}>
                La ronda {rondaActual[juego.id_juego] || 1} ya ha finalizado.
              </Text>
            )}

            <View></View>
          </ScrollView>
        )}
        <HistorialPuntos2
          visible={historialVisible}
          closeModal={() => setHistorialVisible(false)}
          juegoId={juego.id_juego}
          onTerminar={onTerminarJuegoHandler}
          tipoJuego={juego?.id_modojuego}
        />
      </View>
    );
  };

  const handleGuardarRondaCompleta = async (juego, nombresDeCanchas) => {
    try {
      // Obtener todos los RondaIds de la ronda actual y llamar a guardarRondaCompleta para cada uno
      setLoading2(true);
      // 🚦 Validación: No guardar si hay una ronda activa (Estatus == '1')
      const rondas = await traerRondasReta(juego?.id_juego);
      if (Array.isArray(rondas) && rondas.some(r => r.Estatus === 1 || r.Estatus === "1")) {
        setLoading2(false);
        Alert.alert(
          "Ronda activa",
          "No puedes guardar una nueva ronda porque hay una ronda activa pendiente. Finaliza la ronda anterior antes de continuar."
        );
        return;
      }

      if (rondaIds && rondaIds[juego.id_juego]) {
        const ids = Object.values(rondaIds[juego.id_juego]);
        for (const cancha of ids) {
          if (cancha.idRondaJuego) {
            try {
              await guardarRondaCompleta(cancha.idRondaJuego);
            } catch (e) {
              console.error(
                "Error guardando ronda completa para idRondaJuego:",
                cancha.idRondaJuego,
                e
              );
            }
          }
          if (cancha.idRondaJuego2) {
            try {
              await guardarRondaCompleta(cancha.idRondaJuego2);
            } catch (e) {
              console.error(
                "Error guardando ronda completa para idRondaJuego2:",
                cancha.idRondaJuego2,
                e
              );
            }
          }
        }
      }

      // Obtener los jugadores actuales antes de limpiarlos
      const jugadoresActuales = [...jugadoresActivos];

      // Rotar automáticamente los jugadores después de guardar la ronda
      if (jugadoresActuales.length > 0) {
        await rotarJugadores(juego.id_juego, jugadoresActuales);
      }

      setLoading2(false);
    } catch (error) {
      console.error("Error al guardar la ronda completa:", error);
      Alert.alert("Error", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8D288E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {juego && <View>{renderCanchasJugadores(juego)}</View>}

      <JugadoresAmericanaP
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        idJuego={juegoSeleccionado?.id_juego}
        jugadoresManuales={jugadoresManuales[juegoSeleccionado?.id_juego] || []}
        jugadoresGuardados={
          jugadoresGuardados[juegoSeleccionado?.id_juego] || false
        }
        disableSearch={jugadoresGuardados[juegoSeleccionado?.id_juego]}
        disableAddButton={jugadoresGuardados[juegoSeleccionado?.id_juego]}
        disableEdit={jugadoresGuardados[juegoSeleccionado?.id_juego]}
        onClose={() => setModalVisible(false)}
        onJugadorAgregado={() => {
          if (juegoSeleccionado?.id_juego) {
            jugadoresSiGuardados(juegoSeleccionado.id_juego);
          }
        }}
        jugadasRegistradas={jugadasRegistradas}
        soyCreador={soyCreador}
        onJugadoresGuardados={async () => {
          if (juegoSeleccionado?.id_juego) {
            setJugadoresGuardados((prevState) => ({
              ...prevState,
              [juegoSeleccionado.id_juego]: true,
            }));
            setJugadasRegistradas(true);
            setEsperandoCreador(false);

            // Espera a que los jugadores guardados estén actualizados
            const hayGuardados = await jugadoresSiGuardados(
              juegoSeleccionado.id_juego
            );

            // Vuelve a obtener los jugadores activos actualizados desde la API
            let jugadoresActualizados = [];
            if (hayGuardados) {
              const res = await verificarJugadoresAmericana(
                juegoSeleccionado.id_juego
              );
              jugadoresActualizados = res?.jugadores || [];
            }

            if (jugadoresActualizados.length > 0) {
              const rondaActualJuego =
                rondaActual[juegoSeleccionado.id_juego] || 1;
              const { canchas } = asignarJugadoresACanchas(
                jugadoresActualizados,
                parseInt(juegoSeleccionado.num_canchas, 10),
                juegoSeleccionado.id_juego
              );
              const partidasData = canchas.map((jugadoresCancha, index) => {
                const nombreCancha = juegoSeleccionado.nombre_canchas
                  ? juegoSeleccionado.nombre_canchas
                      .split(",")
                      [index]?.trim() || `Cancha ${index + 1}`
                  : `Cancha ${index + 1}`;
                return {
                  nombre_cancha: nombreCancha,
                  jugadores: jugadoresCancha.map((jugador) => ({
                    id: jugador.valor.id || null,
                    nombre:
                      jugador.valor.us_nomUsuario ||
                      jugador.valor.nom_invitado ||
                      "",
                  })),
                  puntos: {
                    set1: [0, 0],
                    set2: [0, 0],
                    set3: [0, 0],
                  },
                };
              });
              const rondaIdsPorCancha = {};
              for (let i = 0; i < partidasData.length; i++) {
                const response = await guardarRondaReta(
                  juegoSeleccionado.id_juego,
                  rondaActualJuego,
                  [partidasData[i]]
                );
                if (response && response.idRondaJuego) {
                  rondaIdsPorCancha[`cancha${i}`] = {
                    idRondaJuego: response.idRondaJuego,
                    idRondaJuego2: response.idRondaJuego2,
                  };
                }
              }
              setRondaIds((prev) => {
                const newState = {
                  ...prev,
                  [juegoSeleccionado.id_juego]: rondaIdsPorCancha,
                };
                AsyncStorage.setItem(
                  `rondaIds_${juegoSeleccionado.id_juego}`,
                  JSON.stringify(rondaIdsPorCancha)
                ).catch((error) =>
                  console.error(
                    "Error guardando rondaIds en AsyncStorage:",
                    error
                  )
                );
                return newState;
              });

              // Actualizar el estado rondaActual después de guardar exitosamente
              setRondaActual((prev) => ({
                ...prev,
                [juegoSeleccionado.id_juego]: rondaActualJuego,
              }));

              // Guardar la ronda actual en AsyncStorage
              AsyncStorage.setItem(
                `rondaActual_${juegoSeleccionado.id_juego}`,
                (rondaActualJuego ?? 1).toString()
              ).catch((error) =>
                console.error(
                  "Error guardando rondaActual en AsyncStorage:",
                  error
                )
              );
            }
          }
        }}
        nombresDeCanchas={nombresDeCanchas}
        numeroDeCanchas={numCanchas}
        modoJuego={juegoSeleccionado?.id_modojuego}
      />

      <Modal transparent={true} animationType="fade" visible={loading2}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Guardando ronda...</Text>
          </View>
        </View>
      </Modal>

      <Modal transparent={true} animationType="fade" visible={modalCargando}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Terminando el juego...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2e2e2e",
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: -40,
    paddingBottom: 160,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2e2e2e",
    marginTop: 15,
  },
  //este es el que da error en el estilo
  juegoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  grupoContainer: {
    marginBottom: 15,
  },
  sinCancha: {
    color: "#fff",
    fontSize: 14,
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: "cloumn",
    justifyContent: "center",
    gap: 10,
    marginTop: -10,
  },
  button: {
    minWidth: 20,
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: -5,
    padding: 3,
  },
  buttonJugadores: {
    backgroundColor: "colors.primary",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
    marginRight: 5,
    flex: 1,
  },
  buttonHistorial: {
    backgroundColor: "colors.primary",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
    marginLeft: 5,
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  noJugadoresContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  noJuegosText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
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
});

export default Reta;
