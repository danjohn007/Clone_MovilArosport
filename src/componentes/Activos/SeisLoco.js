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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomButton from "../Buttons";
import JugadoresAmericanaP from "../../modales/JugadoresAmericanaP";
import HistorialPuntos from "../../modales/HistorialPuntos";
import AmericanaMatch from "./Americana/AmericanaMatch";
import PendientesEnJugar from "../PendientesEnJugar";
import { useAuth } from "../../screens/Auth/AuthContext";
import {
  fetchJugadoresJuego,
  terminarJuego,
  guardarRondaAmericana,
  verificarJugadoresAmericana,
} from "./Americana/AmericanaApiService";
import {
  guardarRondaReta,
  traerRondas,
  actualizarRondaReta,
  obtenerHistorialPuntos,
  terminarRondaGeneral,
  terminarPartidaReta,
  eliminarRondas,
  mandarRanking,
  guardarRondaCompleta,
} from "./Americana/RetaApiService";
import { useNavigation } from "@react-navigation/native";
import TimeBreak2 from "../../modales/TimeBreak2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HistorialPuntos2 from "../../modales/HistorialPuntos2";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const SeisLoco = ({ juego, onTerminarJuego }) => {
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
  console.log("ronda actual", rondaActual);
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
  console.log("nombresDeCanchasPendientes", nombresDeCanchasPendientes);
  const [parejaTieBreak, setParejaTieBreak] = useState(null);
  const [puntajesTieBreak, setPuntajesTieBreak] = useState({
    pareja1: "",
    pareja2: "",
  });
  console.log("pareja ", parejaTieBreak);
  const [jugadasRegistradas, setJugadasRegistradas] = useState(false);
  console.log("jugadasRegistradas ", jugadasRegistradas);

  const [puntajeParejas, setPuntajeParejas] = useState({});
  console.log("puntajeParejas ", puntajeParejas);

  // Referencia para el juego anterior
  const prevJuego = useRef(null);
  const initialFetchDone = useRef(false);
  const [rondaIds, setRondaIds] = useState({});
  const [rondaFinalizada, setRondaFinalizada] = useState(false);
  //validacion de creador
  const [soyCreador, setSoyCreador] = useState(false);
  //ajuste de que este activa alguna ronda
  const [esperandoCreador, setEsperandoCreador] = useState(true);
  const [modalCargando, setModalCargando] = useState(false);
  const [pendientes, setPendientes] = useState({});
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

  const recuperarEstadoJuegoCreado = async () => {
    if (juego?.id_juego) {
      try {
        const idJuego = juego.id_juego;
        const res = await traerRondas(idJuego);
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
            [idJuego]: parseInt(res[0].num_ronda, 10),
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

          // Extraer parejas como jugadores activos
          const parejas = res.map((item) => ({
            id_jugador1: item.id_jugador1,
            us_jugador1: item.us_jugador1,
            id_jugador2: item.id_jugador2,
            us_jugador2: item.us_jugador2,
          }));
          setJugadoresActivos(parejas);

          // Obtener todos los jugadores del juego y calcular pendientes
          try {
            const todosLosJugadores = await fetchJugadoresJuego(idJuego);
            if (todosLosJugadores && Array.isArray(todosLosJugadores)) {
              // Convertir jugadores individuales a formato de parejas, considerando jugadores manuales
              const jugadoresFormateados = todosLosJugadores.map((j) => ({
                id_jugador1: j.id_jugador,
                us_jugador1: j.us_nomUsuario !== null && j.us_nomUsuario !== undefined && j.us_nomUsuario !== ''
                  ? j.us_nomUsuario
                  : (j.nom_invitado || null),
                id_jugador2: null,
                us_jugador2: null,
              }));

              // Extraer IDs de jugadores que están actualmente jugando
              const jugadoresEnJuegoIds = new Set();
              parejas.forEach(pareja => {
                if (pareja.id_jugador1) jugadoresEnJuegoIds.add(pareja.id_jugador1);
                if (pareja.id_jugador2) jugadoresEnJuegoIds.add(pareja.id_jugador2);
              });

              // Filtrar jugadores que NO están en las canchas activas
              const jugadoresRestantes = jugadoresFormateados.filter(jugador => {
                return !jugadoresEnJuegoIds.has(jugador.id_jugador1);
              });

              // Agrupar jugadores restantes en parejas
              const pendientes = [];
              for (let i = 0; i < jugadoresRestantes.length; i += 2) {
                const jugador1 = jugadoresRestantes[i];
                const jugador2 = jugadoresRestantes[i + 1] || null; // puede no existir si son impares
                pendientes.push({
                  jugadores: [
                    { id: jugador1.id_jugador1, nombre: jugador1.us_jugador1 },
                    jugador2 ? { id: jugador2.id_jugador1, nombre: jugador2.us_jugador1 } : null
                  ].filter(Boolean), // Elimina elementos null
                  puntos: 0,
                  resultado: "pendiente",
                });
              }

              setParejasPendientesGlobales(pendientes);
              setPendientes((prev) => ({ ...prev, [idJuego]: pendientes }));
            }
          } catch (error) {
            console.error("Error obteniendo jugadores para calcular pendientes:", error);
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
                tieBreak = [parseInt(ronda1.tiebreak), parseInt(ronda2.tiebreak)];
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
    recuperarEstadoJuegoCreado();
  }, [juego]); // <-- escucha directamente a `juego`

  // Polling para jugadores NO creadores: revisa cambios en rondaIds cada 5s
  useEffect(() => {
    if (!soyCreador && juego?.id_juego) {
      let interval = setInterval(async () => {
        try {
          const res = await traerRondas(juego.id_juego);
          // Actualizar jugadores activos con los datos actuales de las rondas
          if (Array.isArray(res) && res.length > 0) {
            const jugadoresActuales = res.map(ronda => ({
              id_jugador1: ronda.id_jugador1,
              us_jugador1: ronda.us_jugador1,
              id_jugador2: ronda.id_jugador2,
              us_jugador2: ronda.us_jugador2,
            }));
            setJugadoresActivos(jugadoresActuales);
          } else {
            setJugadoresActivos([]);
          }
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
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [soyCreador, juego?.id_juego, rondaIds]);

  useFocusEffect(
    useCallback(() => {
      if (juego) {
        setJuegoSeleccionado(juego); // Asegura que el useEffect de canchasRender se dispare
        recuperarEstadoJuegoCreado();
      }
    }, [juego])
  );

  const guardarRondaEnStorage = async (idJuego, rondaData, nuevaRonda) => {
    console.log("datos de la ronda sieguiente", rondaData);
    try {
      const historialGuardado = await AsyncStorage.getItem("historialPartidas");
      const historialParsed = historialGuardado
        ? JSON.parse(historialGuardado)
        : {};

      const nuevoHistorial = {
        ...historialParsed,
        [idJuego]: [...(historialParsed[idJuego] || []), rondaData],
      };

      await AsyncStorage.setItem(
        "historialPartidas",
        JSON.stringify(nuevoHistorial)
      );
      await AsyncStorage.setItem(
        `rondaActual_${idJuego}`,
        parseInt(nuevaRonda, 10).toString()
      );
    } catch (error) {
      console.error("Error guardando en AsyncStorage:", error);
    }
  };

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

        const hayGuardados = await jugadoresSiGuardados(juego.id_juego);

        if (!hayGuardados) {
          await jugadoresNoGuardados(juego.id_juego);
        }
        setEsperandoCreador(false);
      }
    };

    fetchJugadores();
  }, [juego]);

  const jugadoresNoGuardados = async (idJuego) => {
    try {
      setLoadingJugadores(true);
      const jugadores = await fetchJugadoresJuego(idJuego);

      if (jugadores && Array.isArray(jugadores)) {
        // Convertir cada jugador individual al formato de pareja
        const jugadoresFormateados = jugadores.map((j) => ({
          id_jugador1: j.id_jugador,
          us_jugador1: j.us_nomUsuario,
          id_jugador2: null,
          us_jugador2: null,
        }));

        setJugadoresActivos(jugadoresFormateados);

        if (jugadores.length > 0) {
          setJugadoresGuardados((prev) => ({
            ...prev,
            [idJuego]: true,
          }));
        }
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
        return true; // ✅ sí hay guardados
      } else {
        setJugadoresActivos([]);
        setJugadasRegistradas(false);
        setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: false }));
        return false; // ❌ no hay guardados
      }
    } catch (error) {
      console.log("Error al obtener jugadores:", error);
      console.log("Error", "No se pudieron cargar los jugadores");
      setJugadoresActivos([]);
      setJugadasRegistradas(false);
      setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: false }));
      return false; // en error también asumimos que no hay guardados
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
            setModalCargando(true); // ✅ Mostrar modal al comenzar
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
                await AsyncStorage.removeItem("historialPartidas");
                await AsyncStorage.removeItem(`rondaActual_${juego.id_juego}`);
                const jugadas = await obtenerHistorialPuntos(juego.id_juego);
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
              setModalCargando(false); // ✅ Asegurar que se oculte el modal en caso de error

              Alert.alert(
                "Atención",
                "Únicamente el creador de este juego puede finalizar la jugada."
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

  // Función utilitaria para obtener los tiebreaks con sus ids y puntos actuales
  function obtenerTiebreaksConIds(puntajes, rondaIds, id_juego, puntosPartida) {
    return Object.entries(puntajes).map(([canchaIndex, marcador]) => {
      const canchaKey = `cancha${canchaIndex}`;
      const rondaInfo = rondaIds[id_juego]?.[canchaKey] || {};
      // Obtener los puntos actuales de la pareja (si existen)
      const puntosPareja = puntosPartida?.[id_juego]?.[
        `pareja${canchaIndex}`
      ] || { pareja1: 0, pareja2: 0 };
      return {
        canchaIndex: Number(canchaIndex),
        idRondaJuego: rondaInfo.idRondaJuego,
        idRondaJuego2: rondaInfo.idRondaJuego2,
        marcador, // marcador de tiebreak
        puntosPareja, // puntos actuales de la pareja
      };
    });
  }

  const onConfirmTieBreak = (puntajes) => {
    console.log("✅ Puntajes de tie-break:", puntajes);

    // Transforma claves numéricas a "cancha0", "cancha1", etc.
    const marcadorFormateado = {};
    Object.keys(puntajes).forEach((key) => {
      marcadorFormateado[`cancha${key}`] = puntajes[key];
    });

    setMarcadorTimeBreak(marcadorFormateado);

    if (juegoPendienteGuardar && rondaIds && puntajes) {
      const tiebreaksConIds = obtenerTiebreaksConIds(
        puntajes,
        rondaIds,
        juegoPendienteGuardar,
        puntosPartida
      );
      console.log("📦 Tiebreaks con ids y puntos actuales:", tiebreaksConIds);

      tiebreaksConIds.forEach((tieBreak) => {
        const idRondaJuego = tieBreak.idRondaJuego;
        const idRondaJuego2 = tieBreak.idRondaJuego2;
        const marTieBreak = [
          tieBreak.marcador.pareja1,
          tieBreak.marcador.pareja2,
        ] || [0, 0];
        const currentScores = {
          set1: [tieBreak.puntosPareja.pareja1, tieBreak.puntosPareja.pareja2],
          set2: [0, 0],
          set3: [0, 0],
        };
        actualizarRondaReta(
          idRondaJuego,
          idRondaJuego2,
          currentScores,
          marTieBreak
        )
          .then((response) => {
            console.log("✅ Respuesta de la API:", response);
          })
          .catch((error) => {
            console.error("❌ Error en la actualización de la ronda:", error);
          });
      });
    }

    setTimeBreakVisible(false);

    if (juegoPendienteGuardar && nombresDeCanchasPendientes) {
      console.log("💾 Llamando a handleGuardarRonda con:", marcadorFormateado);
      handleGuardarRonda(
        juegoPendienteGuardar,
        nombresDeCanchasPendientes,
        marcadorFormateado
      );
      setJuegoPendienteGuardar(null);
      setNombresDeCanchasPendientes(null);
      setPuntajesTieBreak({});
    } else {
      console.warn("⚠️ Faltan datos para guardar la ronda");
    }
  };

  const handleVerHistorial = (juego) => {
    setHistorialVisible(true);
  };

  const handleActualizarPuntos = (idJuego, parejaIndex, puntos) => {
    setPuntosPartida((prev) => ({
      ...prev,
      [idJuego]: {
        ...(prev[idJuego] || {}),
        [`pareja${parejaIndex}`]: puntos,
      },
    }));
    // Obtener los IDs de ronda para esta cancha
    const rondaIdsCancha = rondaIds[idJuego]?.[`cancha${parejaIndex}`] || {};
    const idRondaJuego = rondaIdsCancha.idRondaJuego;
    const idRondaJuego2 = rondaIdsCancha.idRondaJuego2;

    // Construir el objeto de sets para la API (solo un set)
    const newSetScores = {
      set1: [puntos?.pareja1, puntos?.pareja2],
      set2: [0, 0],
      set3: [0, 0],
    };

    // Preparar el tieBreak para la API (formato array) y el tieBreakScore para guardar el marcador específico
    const tieBreakForAPI = puntos?.tieBreak || null;
    const tieBreakScore = puntos?.tieBreakScore || null;

    console.log("actualizarRondaReta params:", {
      idRondaJuego,
      idRondaJuego2,
      newSetScores,
      tieBreak: tieBreakForAPI,
      tieBreakScore: tieBreakScore,
    });

    // Llamar a la API solo si hay IDs de ronda
    if (idRondaJuego && idRondaJuego2) {
      actualizarRondaReta(
        idRondaJuego,
        idRondaJuego2,
        newSetScores,
        tieBreakForAPI
      )
        .then((response) => {
          // console.log("Respuesta de la API:", response);
          // Si hay tieBreakScore, también guardarlo en el estado para referencia
          if (tieBreakScore) {
            setMarcadorTimeBreak((prev) => ({
              ...prev,
              [`cancha${parejaIndex}`]: tieBreakScore,
            }));
          }
        })
        .catch((error) => {
          console.error("Error en la actualización de la ronda:", error);
        });
    }
  };

  const perdedoresPorJuegoRef = useRef({});
  const validarPuntosEnTiempoReal = ({ pareja1, pareja2 }) => {
    const p1 = parseInt(pareja1, 10);
    const p2 = parseInt(pareja2, 10);

    if (pareja1 === "" || pareja2 === "")
      return "Ambos campos deben tener un valor";

    if (isNaN(p1) || isNaN(p2)) return "Solo se permiten números";
    if (p1 < 0 || p2 < 0) return "No se permiten valores negativos";
    if (p1 === 0 && p2 === 0) return "El marcador 0 - 0 no es válido";

    const combinacionesValidas = [
      [6, 0],
      [6, 1],
      [6, 2],
      [6, 3],
      [6, 4],
      [6, 5],
      [6, 7],
      [0, 6],
      [1, 6],
      [2, 6],
      [3, 6],
      [4, 6],
      [5, 6],
      [7, 6],
      [6, 6], // Para empate
    ];

    const esValido = combinacionesValidas.some(
      ([a, b]) => p1 === a && p2 === b
    );

    if (!esValido) {
      return "Solo se permiten marcadores del 6-0 al 6-6";
    }

    return "";
  };
  const handleGuardarRonda = async (
    idJuego,
    nombresDeCanchas,
    marcadorTieBreak = null
  ) => {
    console.log("nombre de canchas recibidas ", nombresDeCanchas);
    try {
      setLoading2(true); // <-- Mostrar modal
      // 🚦 Validación: No guardar si hay una ronda activa (Estatus == '1')
      const rondas = await traerRondas(juego?.id_juego);
      if (
        Array.isArray(rondas) &&
        rondas.some((r) => r.Estatus === 1 || r.Estatus === "1")
      ) {
        setLoading2(false);
        Alert.alert(
          "Ronda activa",
          "No puedes guardar una nueva ronda porque hay una partida activa pendiente. Finaliza la partida anterior antes de continuar."
        );
        return;
      }

      const puntos = puntosPartida[idJuego] || {};

      const marcadoresTiebreakPorCancha = marcadorTieBreak || {};

      // Usar el número correcto de canchas del juego
      const numCanchas = parseInt(juego.num_canchas) || 1;
      const { canchas, pendientes: parejasPendientes } =
        asignarJugadoresACanchas(jugadoresActivos, numCanchas, idJuego);

      const erroresMarcadores = [];

      canchas.forEach((_, index) => {
        const nombreCancha = nombresDeCanchas[index] || `Cancha ${index + 1}`;
        const puntosPareja = puntos[`pareja${index}`];

        if (
          !puntosPareja ||
          puntosPareja.pareja1 === "" ||
          puntosPareja.pareja2 === ""
        ) {
          erroresMarcadores.push(`Cancha ${nombreCancha}: marcador vacío`);
          return;
        }

        const error = marcadoresTiebreakPorCancha[`cancha${index}`]
          ? "" // si hay tie-break, no validamos el 6-6
          : validarPuntosEnTiempoReal({
              pareja1: puntosPareja.pareja1,
              pareja2: puntosPareja.pareja2,
            });

        if (error) {
          erroresMarcadores.push(`Cancha ${nombreCancha}: ${error}`);
        }
      });

      if (erroresMarcadores.length > 0) {
        setLoading2(false);

        Alert.alert("Atención", `${erroresMarcadores.join("\n")}`);
        return;
      }

      const canchasEmpatadas = canchas
        .map((_, index) => ({
          index,
          puntos: puntos[`pareja${index}`] || { pareja1: 0, pareja2: 0 },
        }))
        .filter(({ puntos }) => puntos.pareja1 === 6 && puntos.pareja2 === 6);

      const todasLasCanchasEmpatadasResueltas = canchasEmpatadas.every(
        ({ index }) => marcadoresTiebreakPorCancha[`cancha${index}`]
      );

      if (canchasEmpatadas.length > 0 && !todasLasCanchasEmpatadasResueltas) {
        setLoading2(false); // <-- Ocultar modal si se requiere tiebreak

        const empates = canchasEmpatadas.map(({ index }) => {
          const pareja = canchas[index];
          return {
            canchaIndex: index,
            nombre_cancha: nombresDeCanchas[index],
            jugadores: pareja.map((jugador) =>
              jugador?.tipo === "jugador"
                ? jugador.valor.us_nomUsuario
                : jugador?.valor
            ),
          };
        });

        setParejaTieBreak(empates);
        setPuntajesTieBreak({});
        setNombresDeCanchasPendientes(nombresDeCanchas);
        setJuegoPendienteGuardar(idJuego);
        setTimeBreakVisible(true);
        return;
      }

      const ronda = parseInt(rondaActual[idJuego], 10) || 0;

      const partidasData = canchas.map((pareja, index) => {
        const puntosPareja = puntos[`pareja${index}`] || {
          pareja1: 0,
          pareja2: 0,
        };
        const rondaIdsCancha =
          rondaIds[juego.id_juego]?.[`cancha${index}`] || {};
        const idRondaJuego = rondaIdsCancha.idRondaJuego;
        const idRondaJuego2 = rondaIdsCancha.idRondaJuego2;
        const nombreCancha = nombresDeCanchas[index] || `Cancha ${index + 1}`;

        return {
          nombre_cancha: nombreCancha,
          idRondaJuego,
          idRondaJuego2,
          cancha: nombreCancha,
          jugadores: pareja.map((jugador) => ({
            id: jugador?.tipo === "jugador" ? jugador.valor.id || null : null,
            nombre:
              jugador?.tipo === "jugador"
                ? jugador.valor.us_nomUsuario
                : jugador?.valor,
            cancha: nombreCancha,
          })),
          puntos: puntosPareja,
          tie_break: marcadoresTiebreakPorCancha[`cancha${index}`] || null,
        };
      });

      const rondaData = {
        id_juego: idJuego,
        ronda,
        parejas: partidasData,
      };

      setHistorialPartidas((prev) => ({
        ...prev,
        [idJuego]: [...(prev[idJuego] || []), rondaData],
      }));

      setPuntosPartida((prev) => ({ ...prev, [idJuego]: {} }));
      setRondaResetKey((prev) => ({ ...prev, [idJuego]: Date.now() }));

      const resultadosOrdenados = partidasData.flatMap((partida, index) => {
        const [pareja1, pareja2] = [
          partida.jugadores.slice(0, 2),
          partida.jugadores.slice(2, 4),
        ];
        const { pareja1: p1, pareja2: p2 } = partida.puntos;
        const tieBreak = partida.tie_break;
        const ganaPareja1 =
          p1 > p2 || (p1 === p2 && tieBreak?.pareja1 > tieBreak?.pareja2);

        const parejaObj1 = {
          jugadores: pareja1,
          puntos: p1,
          cancha: index,
          resultado: ganaPareja1 ? "ganó" : "perdió",
        };
        const parejaObj2 = {
          jugadores: pareja2,
          puntos: p2,
          cancha: index,
          resultado: ganaPareja1 ? "perdió" : "ganó",
        };

        console.log(`🏟️ Procesando cancha ${index}:`, {
          pareja1: parejaObj1.jugadores.map((j) => j.nombre),
          pareja2: parejaObj2.jugadores.map((j) => j.nombre),
          puntos: `${p1}-${p2}`,
          ganadora: ganaPareja1 ? "pareja1" : "pareja2",
        });

        return [parejaObj1, parejaObj2];
      });

      const rotacionResult = generarRotacion(
        resultadosOrdenados,
        numCanchas, // Este debería ser el número correcto de canchas
        parejasPendientesGlobales || pendientes[idJuego] || [],
        idJuego
      );

      const nuevasParejasOrdenadas =
        rotacionResult.nuevasParejas || rotacionResult;
      const nuevasPendientesActualizadas =
        rotacionResult.nuevasPendientes || [];

      console.log("🔍 Debug en handleGuardarRonda:", {
        numCanchas,
        totalPartidasData: partidasData.length,
        resultadosOrdenados: resultadosOrdenados.length,
        parejasPendientesGlobales: parejasPendientesGlobales?.length || 0,
        nuevasParejasOrdenadas: nuevasParejasOrdenadas.length,
        nuevasPendientesActualizadas: nuevasPendientesActualizadas.length,
      });

      await rotarJugadores(idJuego, nuevasParejasOrdenadas);
      await guardarRondaEnStorage(idJuego, rondaData, ronda + 1);

      if (rondaIds && rondaIds[idJuego]) {
        const ids = Object.values(rondaIds[idJuego]);
        for (const cancha of ids) {
          if (cancha.idRondaJuego) {
            try {
              await guardarRondaCompleta(cancha.idRondaJuego);
            } catch (e) {
              console.error("Error guardando ronda completa (1):", e);
            }
          }
          if (cancha.idRondaJuego2) {
            try {
              await guardarRondaCompleta(cancha.idRondaJuego2);
            } catch (e) {
              console.error("Error guardando ronda completa (2):", e);
            }
          }
        }
      }

      await AsyncStorage.setItem(
        `parejasAsignadas_${idJuego}_ronda${ronda}`,
        JSON.stringify(partidasData)
      );

      // Actualizar las parejas pendientes después de la rotación
      // Usar las nuevas parejas pendientes calculadas en generarRotacion
      const parejasPendientesActualizadas = nuevasPendientesActualizadas;

      console.log(
        "📋 Parejas pendientes después de guardar ronda:",
        parejasPendientesActualizadas
      );

      // Forzar actualización del estado de parejas pendientes
      setParejasPendientesGlobales([...parejasPendientesActualizadas]);
      setPendientes((prev) => ({
        ...prev,
        [idJuego]: [...parejasPendientesActualizadas],
      }));

      setMarcadorTimeBreak(null);
      setLoading2(false); // <-- Ocultar modal antes de éxito

      Alert.alert("Éxito", "Ronda guardada correctamente");
    } catch (error) {
      console.log("Error al guardar la ronda:", error);
      setLoading2(false); // <-- Ocultar modal antes de éxito
    }
  };

  // Esta función reorganiza las parejas según ganadores, perdedores y pendientes
  const generarRotacion = (
    resultadosOrdenados,
    numCanchas,
    parejasPendientes,
    id_juego
  ) => {
    console.log("🔄 Generando rotación:", {
      resultadosOrdenados,
      numCanchas,
      parejasPendientes,
      id_juego
    });

    const nuevasParejas = [];
    const perdedorasRonda = [];
    const ganadorasRonda = [];

    // Procesar cada cancha para identificar ganadoras y perdedoras
    for (let canchaIndex = 0; canchaIndex < numCanchas; canchaIndex++) {
      const parejasDeCancha = resultadosOrdenados.filter((r) => r.cancha === canchaIndex);
      const ganadora = parejasDeCancha.find((r) => r.resultado === "ganó");
      const perdedora = parejasDeCancha.find((r) => r.resultado === "perdió");

      console.log(`🏟️ Cancha ${canchaIndex}:`, { ganadora: ganadora?.jugadores, perdedora: perdedora?.jugadores });

      // Recopilar las ganadoras para la rotación de canchas
      if (ganadora) {
        ganadorasRonda.push({
          ...ganadora,
          canchaOriginal: canchaIndex
        });
      }

      // Recopilar las perdedoras para la rotación
      if (perdedora) {
        // Resetear la cancha para que se asigne automáticamente
        perdedora.cancha = null;
        perdedorasRonda.push(perdedora);
      }
    }

    // ROTACIÓN DE CANCHAS PARA GANADORAS:
    // Cancha 2 -> Cancha 1, Cancha 1 -> Última cancha, resto sube una posición
    console.log("🔄 Aplicando rotación de canchas para ganadoras...");
    
    ganadorasRonda.forEach((ganadora, index) => {
      let nuevaCancha;
      
      if (ganadora.canchaOriginal === 1 && numCanchas > 1) {
        // Los ganadores de cancha 2 (índice 1) suben a cancha 1 (índice 0)
        nuevaCancha = 0;
        console.log(`🔼 Ganadora de cancha ${ganadora.canchaOriginal + 1} sube a cancha 1`);
      } else if (ganadora.canchaOriginal === 0) {
        // Los ganadores de cancha 1 (índice 0) van a la última cancha
        nuevaCancha = numCanchas - 1;
        console.log(`🔽 Ganadora de cancha 1 baja a cancha ${nuevaCancha + 1}`);
      } else {
        // El resto de ganadoras suben una posición hacia cancha 1
        nuevaCancha = Math.max(0, ganadora.canchaOriginal - 1);
        console.log(`📈 Ganadora de cancha ${ganadora.canchaOriginal + 1} sube a cancha ${nuevaCancha + 1}`);
      }
      
      ganadora.cancha = nuevaCancha;
      nuevasParejas.push(ganadora);
      
      console.log(`✅ Ganadora reubicada: ${ganadora.jugadores.map(j => j.nombre).join(' - ')} → Cancha ${nuevaCancha + 1}`);
    });

    // ROTACIÓN: Las parejas pendientes entran a jugar, las perdedoras pasan a pendientes
    // Crear una copia de las parejas pendientes para procesar
    const parejasPendientesParaJugar = [...parejasPendientes];
    
    console.log("📋 Estado antes de rotación:", {
      ganadoras: nuevasParejas.length,
      perdedoras: perdedorasRonda.length,
      pendientes: parejasPendientesParaJugar.length
    });
    
    // Llenar las canchas con parejas pendientes primero
    for (let canchaIndex = 0; canchaIndex < numCanchas; canchaIndex++) {
      // Contar cuántas parejas ya están asignadas a esta cancha
      const parejasEnCancha = nuevasParejas.filter(p => p.cancha === canchaIndex);
      
      // Cada cancha necesita exactamente 2 parejas
      const parejasNecesarias = 2 - parejasEnCancha.length;
      
      for (let j = 0; j < parejasNecesarias; j++) {
        const siguientePareja = parejasPendientesParaJugar.shift();
        if (siguientePareja) {
          // Convertir pareja pendiente al formato de pareja activa
          const parejaActiva = {
            jugadores: siguientePareja.jugadores,
            puntos: 0,
            cancha: canchaIndex,
            resultado: "pendiente"
          };
          nuevasParejas.push(parejaActiva);
          console.log(`✅ Pareja pendiente asignada a cancha ${canchaIndex}:`, parejaActiva.jugadores);
        }
      }
    }

    // Intercambiar y separar las parejas en cada cancha
    for (let canchaIndex = 0; canchaIndex < numCanchas; canchaIndex++) {
      const parejasDeCancha = nuevasParejas.filter(p => p.cancha === canchaIndex);
      
      if (parejasDeCancha.length === 2) {
        const pareja1 = parejasDeCancha[0];
        const pareja2 = parejasDeCancha[1];
        
        // Verificar que ambas parejas tengan al menos 2 jugadores
        if (pareja1.jugadores.length >= 2 && pareja2.jugadores.length >= 2) {
          console.log(`🔄 Intercambiando segundos jugadores en cancha ${canchaIndex}:`);
          console.log(`   Antes - Pareja 1: [${pareja1.jugadores[0]?.nombre}, ${pareja1.jugadores[1]?.nombre}]`);
          console.log(`   Antes - Pareja 2: [${pareja2.jugadores[0]?.nombre}, ${pareja2.jugadores[1]?.nombre}]`);
          
          // Intercambiar los segundos jugadores
          const segundoJugadorPareja1 = pareja1.jugadores[1];
          const segundoJugadorPareja2 = pareja2.jugadores[1];
          
          pareja1.jugadores[1] = segundoJugadorPareja2;
          pareja2.jugadores[1] = segundoJugadorPareja1;
          
          console.log(`   Después - Pareja 1: [${pareja1.jugadores[0]?.nombre}, ${pareja1.jugadores[1]?.nombre}]`);
          console.log(`   Después - Pareja 2: [${pareja2.jugadores[0]?.nombre}, ${pareja2.jugadores[1]?.nombre}]`);
        }
      }
    }

    // Las perdedoras de esta ronda se convierten en las nuevas pendientes
    // junto con las parejas pendientes que no pudieron entrar
    const nuevasPendientes = [
      ...parejasPendientesParaJugar, // Parejas pendientes que no pudieron entrar
      ...perdedorasRonda.map(perdedora => ({
        jugadores: perdedora.jugadores,
        puntos: 0,
        resultado: "pendiente"
      }))
    ];
    
    // Actualizar las parejas pendientes globales
    setParejasPendientesGlobales(nuevasPendientes);
    setPendientes((prev) => ({ ...prev, [id_juego]: nuevasPendientes }));

    console.log("✅ Rotación completada:", {
      totalParejas: nuevasParejas.length,
      parejasNuevasPendientes: nuevasPendientes.length,
      perdedorasQueVanAPendientes: perdedorasRonda.length,
      pendientesQueEntraronAJugar: parejasPendientes.length - parejasPendientesParaJugar.length,
      rotacionDeCanchas: ganadorasRonda.map(g => `Cancha ${g.canchaOriginal + 1} → Cancha ${g.cancha + 1}`),
      distribucionPorCancha: nuevasParejas.reduce((acc, p) => {
        acc[`cancha${p.cancha}`] = (acc[`cancha${p.cancha}`] || 0) + 1;
        return acc;
      }, {}),
      nuevasPendientesDetalle: nuevasPendientes.map(p => 
        p.jugadores?.map(j => j.nombre).join(' - ') || 'Sin jugadores'
      )
    });

    return { nuevasParejas, nuevasPendientes };
  };

  // Función para rotar parejas usando la función anterior
  const rotarJugadores = async (id_juego, nuevosOrdenados = null) => {
    console.log("🔄 Iniciando rotarJugadores con id_juego:", id_juego);

    const rondaAnterior = parseInt(rondaActual[id_juego], 10) || 0;
    const nuevaRonda = rondaAnterior + 1;
    setRondaActual((prev) => ({ ...prev, [id_juego]: nuevaRonda }));

    try {
      await AsyncStorage.setItem(
        `rondaActual_${id_juego}`,
        nuevaRonda.toString()
      );
      console.log(`✅ Ronda guardada en AsyncStorage: ${nuevaRonda}`);
    } catch (error) {
      console.error("❌ Error guardando ronda en AsyncStorage:", error);
    }

    if (nuevosOrdenados) {
      const numCanchas = parseInt(
        juegoSeleccionado?.num_canchas || juego?.num_canchas,
        10
      );
      const nuevasRondaIds = {};
      const nuevasParejas = [];

      // Procesar cada cancha individualmente
      for (let i = 0; i < numCanchas; i++) {
        // Buscar las parejas asignadas a esta cancha específica
        const parejasDeEstaCancha = nuevosOrdenados.filter(p => p.cancha === i);
        
        if (parejasDeEstaCancha.length === 2) {
          // Convertir a formato de parejas activas
          const pareja1 = {
            id_jugador1: parejasDeEstaCancha[0].jugadores[0]?.id,
            us_jugador1: parejasDeEstaCancha[0].jugadores[0]?.nombre,
            id_jugador2: parejasDeEstaCancha[0].jugadores[1]?.id,
            us_jugador2: parejasDeEstaCancha[0].jugadores[1]?.nombre,
            cancha: i,
          };

          const pareja2 = {
            id_jugador1: parejasDeEstaCancha[1].jugadores[0]?.id,
            us_jugador1: parejasDeEstaCancha[1].jugadores[0]?.nombre,
            id_jugador2: parejasDeEstaCancha[1].jugadores[1]?.id,
            us_jugador2: parejasDeEstaCancha[1].jugadores[1]?.nombre,
            cancha: i,
          };

          nuevasParejas.push(pareja1, pareja2);

          const partidaData = {
            nombre_cancha:
              juegoSeleccionado?.nombre_canchas || juego?.nombre_canchas
                ? (juegoSeleccionado?.nombre_canchas || juego?.nombre_canchas)
                    .split(",")
                    [i]?.trim() || `Cancha ${i + 1}`
                : `Cancha ${i + 1}`,
            jugadores: [
              {
                id: pareja1.id_jugador1,
                nombre: pareja1.us_jugador1,
              },
              {
                id: pareja1.id_jugador2,
                nombre: pareja1.us_jugador2,
              },
              {
                id: pareja2.id_jugador1,
                nombre: pareja2.us_jugador1,
              },
              {
                id: pareja2.id_jugador2,
                nombre: pareja2.us_jugador2,
              },
            ],
            puntos: {
              set1: [0, 0],
              set2: [0, 0],
              set3: [0, 0],
            },
          };

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

      // Actualizar rondaIds y AsyncStorage
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
      setJugadoresActivos(nuevasParejas);
    }

    // Limpiar puntos anteriores
    setPuntosPartida((prev) => ({ ...prev, [id_juego]: {} }));
  };

  const [canchasRender, setCanchasRender] = useState([]);
  const [parejasPendientesGlobales, setParejasPendientesGlobales] = useState(
    []
  ); // <-- Aquí
  console.log("parejas pendi", parejasPendientesGlobales);
  // const [estadosPartidasCanchas, setEstadosPartidasCanchas] = useState({});

  const asignarJugadoresACanchas = (parejas, numCanchas, id_juego) => {
    const parejasPorCancha = 2; // 2 parejas por cancha (4 jugadores)

    // Usar el número de canchas real del juego
    const parejasEnJuego = parejas.slice(0, numCanchas * parejasPorCancha);
    const parejasPendientes = parejas.slice(numCanchas * parejasPorCancha);

    const canchas = [];

    // Crear las canchas según el número especificado
    for (let i = 0; i < numCanchas; i++) {
      const jugadoresCancha = [];
      const inicioPareja = i * parejasPorCancha;
      const parejasCancha = parejasEnJuego.slice(inicioPareja, inicioPareja + parejasPorCancha);

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

      canchas.push(jugadoresCancha);
    }

    const pendientes = parejasPendientes.map((pareja) => ({
      jugadores: [
        { id: pareja.id_jugador1, nombre: pareja.us_jugador1 },
        { id: pareja.id_jugador2, nombre: pareja.us_jugador2 },
      ],
      puntos: 0,
      resultado: "pendiente",
    }));

    return { canchas, pendientes };
  };

  // useEffect(() => {
  //   if (!juegoSeleccionado?.id_juego) return;

  //   const numCanchas = parseInt(juegoSeleccionado.num_canchas);
  //   console.log("numero de cachas de estado", numCanchas);
  //   setEstadosPartidasCanchas((prev) => {
  //     const nuevosEstados = { ...prev };
  //     let huboCambio = false;

  //     for (let i = 0; i < numCanchas; i++) {
  //       if (nuevosEstados[i] === undefined) {
  //         nuevosEstados[i] = 1; // Estado inicial
  //         huboCambio = true;
  //       }
  //     }

  //     return huboCambio ? nuevosEstados : prev;
  //   });
  // }, [juegoSeleccionado]);

  useEffect(() => {
    if (!juegoSeleccionado?.id_juego) return;

    const numCanchas = parseInt(juegoSeleccionado.num_canchas) || 1;
    const { canchas, pendientes } = asignarJugadoresACanchas(
      jugadoresActivos,
      numCanchas,
      juegoSeleccionado.id_juego
    );

    setParejasPendientesGlobales(pendientes);
    if (juegoSeleccionado?.id_juego) {
      setPendientes((prev) => ({ ...prev, [juegoSeleccionado.id_juego]: pendientes }));
    }
    setCanchasRender(canchas);
  }, [jugadoresActivos, juegoSeleccionado]);

  // Efecto para mantener sincronizadas las parejas pendientes en la UI
  useEffect(() => {
    console.log("🔄 Parejas pendientes globales actualizadas:", parejasPendientesGlobales?.length || 0);
  }, [parejasPendientesGlobales]);

  const renderCanchasJugadores = (juego) => {
    const numCanchas = parseInt(juego.num_canchas) || 1;

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

        {esperandoCreador ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : !jugadasRegistradas ? (
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
            {canchasRender.map((jugadoresCancha, index) => {
              const nombreCancha =
                nombresCanchas[index] || `Cancha ${index + 1}`;
              const rondaIdsCancha =
                rondaIds[juego.id_juego]?.[`cancha${index}`];

              return (
                <AmericanaMatch
                  key={`cancha-${index}-${rondaResetKey[juego.id_juego] || 0}`}
                  jugadores={jugadoresCancha}
                  juegoNombre={nombreCancha}
                  puntos={
                    puntosPartida[juego.id_juego]?.[`pareja${index}`] || {
                      pareja1: 0,
                      pareja2: 0,
                    }
                  }
                  onPuntosChange={(puntos) =>
                    handleActualizarPuntos(juego.id_juego, index, puntos)
                  }
                  indiceCancha={index}
                  soyCreador={soyCreador}
                  rondaIds={rondaIdsCancha}
                  modoJuego={juego.id_modojuego}
                  idJuego={juego.id_juego}
                  // onEstadoPartidaChange={(estado) => {
                  //   setEstadosPartidasCanchas((prev) => ({
                  //     ...prev,
                  //     [index]: estado,
                  //   }));
                  // }}
                />
              );
            })}

            {soyCreador && (
              <CustomButton
                buttonText="Guardar Ronda"
                onPress={() => {
                  if (!jugadasRegistradas) {
                    Alert.alert(
                      "Atención",
                      "Primero debes guardar los jugadores antes de iniciar la primer ronda"
                    );
                    return;
                  }

                  // Usar canchasRender y nombresCanchas correctamente
                  const nombresDeCanchas = canchasRender.map(
                    (_, index) => nombresCanchas[index] || `Cancha ${index + 1}`
                  );

                  handleGuardarRonda(juego.id_juego, nombresDeCanchas);
                }}
                style={styles.button}
              />
            )}

            {/* Mostrar parejas pendientes si existen */}
            {parejasPendientesGlobales && parejasPendientesGlobales.length > 0 && (
              <View 
                key={`pendientes-${juego.id_juego}-${rondaActual[juego.id_juego] || 0}-${parejasPendientesGlobales.length}`}
                style={styles.pendientesContainer}
              >
                <Text style={styles.pendientesTitulo}>Parejas en espera:</Text>
                <Text style={styles.pendienteSubTitulo}>Estas parejas entraran en la siguiente ronda:</Text>
                {parejasPendientesGlobales.map((pareja, index) => (
                  <View key={`pareja-pendiente-${index}-${pareja.jugadores[0]?.id || index}`} style={styles.pendienteItem}>
                    <Text style={styles.pendienteText}>
                      {pareja.jugadores[0]?.nombre || 'Jugador'}
                      {pareja.jugadores[1]?.nombre && `  -  ${pareja.jugadores[1].nombre}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        <HistorialPuntos2
          visible={historialVisible}
          closeModal={() => setHistorialVisible(false)}
          juegoId={juego.id_juego}
          onTerminar={onTerminarJuegoHandler}
          tipoJuego={juego.id_modojuego}
        />
      </View>
    );
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
        modalVisible={modalVisible} // Visible o no del modal
        setModalVisible={setModalVisible} // Función para cerrar modal
        idJuego={juegoSeleccionado?.id_juego} // ID del juego actual
        jugadoresManuales={jugadoresManuales[juegoSeleccionado?.id_juego] || []}
        jugadoresGuardados={
          jugadoresGuardados[juegoSeleccionado?.id_juego] || false
        }
        disableSearch={jugadoresGuardados[juegoSeleccionado?.id_juego]}
        disableAddButton={jugadoresGuardados[juegoSeleccionado?.id_juego]}
        disableEdit={jugadoresGuardados[juegoSeleccionado?.id_juego]}
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
                parseInt(rondaActual[juegoSeleccionado.id_juego], 10) || 1;

              const { canchas, pendientes } = asignarJugadoresACanchas(
                jugadoresActualizados,
                parseInt(juegoSeleccionado.num_canchas, 10),
                juegoSeleccionado.id_juego
              );

              // ✅ Guardar las parejas pendientes aquí
              setParejasPendientesGlobales(pendientes);
              setPendientes((prev) => ({ ...prev, [juegoSeleccionado.id_juego]: pendientes }));

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
              console.log(rondaIds);

              // Actualizar el estado rondaActual después de guardar exitosamente
              setRondaActual((prev) => ({
                ...prev,
                [juegoSeleccionado.id_juego]: rondaActualJuego,
              }));

              // Guardar la ronda actual en AsyncStorage
              AsyncStorage.setItem(
                `rondaActual_${juegoSeleccionado.id_juego}`,
                rondaActualJuego.toString()
              ).catch((error) =>
                console.error(
                  "Error guardando rondaActual en AsyncStorage:",
                  error
                )
              );
            }
          }
        }}
        onClose={() => setModalVisible(false)}
        onJugadorAgregado={() => {
          if (juegoSeleccionado?.id_juego) {
            jugadoresSiGuardados(juegoSeleccionado.id_juego);
          }
        }}
        jugadasRegistradas={jugadasRegistradas}
        soyCreador={soyCreador}
        nombresDeCanchas={nombresDeCanchas}
        numeroDeCanchas={numCanchas}
        modoJuego={juegoSeleccionado?.id_modojuego}
      />
      <TimeBreak2
        visible={timeBreakVisible}
        onClose={() => setTimeBreakVisible(false)}
        onConfirm={onConfirmTieBreak}
        pareja={parejaTieBreak}
        puntajes={
          puntajesTieBreak[parejaTieBreak?.id_cancha] || {
            pareja1: "",
            pareja2: "",
          }
        }
        setPuntajes={(nuevoPuntaje) =>
          setPuntajesTieBreak((prev) => ({
            ...prev,
            [parejaTieBreak?.id_cancha]: nuevoPuntaje,
          }))
        }
      />

      <Modal transparent={true} animationType="fade" visible={modalCargando}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#02B9FA" />
            <Text style={styles.loadingText}>Terminando el juego...</Text>
          </View>
        </View>
      </Modal>

      <Modal transparent={true} animationType="fade" visible={loading2}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#02B9FA" />
            <Text style={styles.loadingText}>Guardando ronda...</Text>
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
    marginTop: 5,
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
    padding: 10,
  },
  buttonJugadores: {
    backgroundColor: "#02B9FA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
    marginRight: 5,
    flex: 1,
  },
  buttonHistorial: {
    backgroundColor: "#02B9FA",
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
  noJuegosText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: -10,
    opacity: 0.7,
  },
  // Estilos para el contenedor de pendientes
  pendientesContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#00BAFF",
    width: "90%"
  },
  pendientesTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#00BAFF",
    textAlign: "center",
    textTransform: "uppercase",
  },
  pendienteSubTitulo: {
    fontSize: 12,
    marginBottom: 4,
    color: "#838080",
    textAlign: "center",
    fontStyle: "italic",
  },
  pendienteItem: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: "#00BAFF",
    borderRadius: 8,
    marginBottom: 4,
  },
  pendienteText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
  },
  //estilos de loading
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
    color: "#02B9FA",
    fontWeight: "500",
  },
});

export default SeisLoco;
