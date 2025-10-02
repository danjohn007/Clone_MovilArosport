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
import AmericanaMatch from "./Americana/AmericanaMatch";
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
  obtenerParejasPorJuego,
} from "./Americana/RetaApiService";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HistorialPuntos2I from "../../modales/HistorialPuntos2I";
import TimeBreak2 from "../../modales/TimeBreak2";

const Americana = ({ juego, onTerminarJuego }) => {
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

  const [parejaTieBreak, setParejaTieBreak] = useState(null);
  const [puntajesTieBreak, setPuntajesTieBreak] = useState({
    pareja1: "",
    pareja2: "",
  });
  console.log("pareja ", parejaTieBreak);
  const [jugadasRegistradas, setJugadasRegistradas] = useState(false);
  console.log("jugadasRegistradas ", jugadasRegistradas);

  // Referencia para el juego anterior
  const prevJuego = useRef(null);
  const initialFetchDone = useRef(false);
  const [rondaIds, setRondaIds] = useState({});
  const [rondaFinalizada, setRondaFinalizada] = useState(false);
  //validacion de creador
  const [soyCreador, setSoyCreador] = useState(false);
  //ajuste de que este activa alguna ronda
  const [esperandoCreador, setEsperandoCreador] = useState(true);
  const [pendientes, setPendientes] = useState({});
  //hacer visible la tabla de puntos de la americana
  const [tablaPuntosVisible, setTablaPuntosVisible] = useState(false);

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

    const recuperarEstadoJuegoCreado = async () => {
      if (juego?.id_juego) {
        try {
          const idJuego = juego.id_juego;
          const res = await traerRondas(idJuego);
          console.log(res);

          if (Array.isArray(res) && res.length > 0) {
            const historialStr = await AsyncStorage.getItem(
              "historialPartidas"
            );
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

    recuperarEstadoJuegoCreado();
  }, [juego]); // <-- escucha directamente a `juego`

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
      console.log("Tiebreaks con ids y puntos actuales:", tiebreaksConIds);
      tiebreaksConIds.map((tieBreak) => {
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
            console.log("Respuesta de la API:", response);
          })
          .catch((error) => {
            console.error("Error en la actualización de la ronda:", error);
          });
      });
    }

    setTimeBreakVisible(false);
    if (juegoPendienteGuardar && nombresDeCanchasPendientes) {
      handleGuardarRonda(
        juegoPendienteGuardar,
        nombresDeCanchasPendientes,
        marcadorFormateado
      );
      setJuegoPendienteGuardar(null);
      setNombresDeCanchasPendientes(null);
      setPuntajesTieBreak({});
    }
  };

  const handleVerHistorial = (juego) => {
    setHistorialVisible(true);
  };

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
    try {
      setLoading2(true);

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
      const canchas = asignarJugadoresACanchas(
        jugadoresActivos,
        parseInt(juego.num_canchas, 10),
        idJuego
      ).canchas;
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

        /*const error = marcadoresTiebreakPorCancha[`cancha${index}`]
          ? "" // si hay tie-break, no validamos el 6-6
          : validarPuntosEnTiempoReal({
              pareja1: puntosPareja.pareja1,
              pareja2: puntosPareja.pareja2,
            });

        if (error) {
          erroresMarcadores.push(`Cancha ${nombreCancha}: ${error}`);
        }*/
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
        setLoading2(false);

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

      // Aquí ajustamos el puntaje para la ronda si hay marcador tie-break
      // Para la cancha del tie-break solo actualizamos el puntaje con el tie-break +1 para quien ganó (puntaje 7-6 o 6-7)
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

      setPuntosPartida((prev) => ({
        ...prev,
        [idJuego]: {},
      }));

      setRondaResetKey((prev) => ({
        ...prev,
        [idJuego]: Date.now(),
      }));

      // Usar los jugadores activos actuales (las parejas de la ronda que se acaba de completar)
      console.log("Jugadores activos antes de rotar:", jugadoresActivos);
      if (
        jugadoresActivos &&
        Array.isArray(jugadoresActivos) &&
        jugadoresActivos.length > 0
      ) {
        await rotarJugadores(idJuego, jugadoresActivos);
      } else {
        console.log(
          "No hay jugadores activos para rotar, intentando obtener de la API"
        );
        const jugadores = await verificarJugadoresAmericana(idJuego);
        if (jugadores?.jugadores && Array.isArray(jugadores.jugadores)) {
          await rotarJugadores(idJuego, jugadores.jugadores);
        }
      }
      await guardarRondaEnStorage(idJuego, rondaData, ronda + 1);

      // Obtener todos los RondaIds de la ronda actual y llamar a guardarRondaCompleta para cada uno
      if (rondaIds && rondaIds[idJuego]) {
        const ids = Object.values(rondaIds[idJuego]);
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
      await AsyncStorage.setItem(
        `parejasAsignadas_${idJuego}_ronda${ronda}`,
        JSON.stringify(partidasData)
      );

      setMarcadorTimeBreak(null);
      setLoading2(false);

      Alert.alert("Éxito", "Ronda guardada correctamente");
    } catch (error) {
      console.error("Error al guardar la ronda:", error);
      setLoading2(false);
    }
  };

  // Función auxiliar para obtener el historial de parejas de todos los jugadores
  const obtenerHistorialParejasTodos = async (id_juego, jugadoresIndividuales) => {
    const historialParejas = {};
    
    try {
      // Obtener el historial para cada jugador
      for (const jugador of jugadoresIndividuales) {
        try {
          const parejas = await obtenerParejasPorJuego(id_juego, jugador.id_jugador);
          historialParejas[jugador.id_jugador] = parejas.map(pareja => 
            pareja.id_jugador1 === jugador.id_jugador ? pareja.id_jugador2 : pareja.id_jugador1
          );
        } catch (error) {
          console.log(`Error obteniendo parejas para jugador ${jugador.us_nomUsuario}:`, error);
          historialParejas[jugador.id_jugador] = [];
        }
      }
      
      console.log('Historial de parejas obtenido:', historialParejas);
      return historialParejas;
    } catch (error) {
      console.log('Error general obteniendo historial de parejas:', error);
      return {};
    }
  };

  // Función para encontrar la mejor pareja para un jugador basado en su historial
  const encontrarMejorPareja = (jugador, jugadoresDisponibles, historialParejas, parejasRondaAnterior = []) => {
    const parejasPrevias = historialParejas[jugador.id_jugador] || [];
    
    // Crear un mapa de frecuencias de parejas anteriores
    const frecuenciaParejas = {};
    parejasPrevias.forEach(idPareja => {
      frecuenciaParejas[idPareja] = (frecuenciaParejas[idPareja] || 0) + 1;
    });

    // Filtrar jugadores que fueron pareja en la ronda anterior (evitar repetir ronda inmediata anterior)
    let jugadoresValidos = jugadoresDisponibles;
    if (parejasRondaAnterior.length > 0) {
      const parejaRondaAnterior = parejasRondaAnterior.find(pareja => 
        pareja.id_jugador1 === jugador.id_jugador || pareja.id_jugador2 === jugador.id_jugador
      );
      
      if (parejaRondaAnterior) {
        const idParejaAnterior = parejaRondaAnterior.id_jugador1 === jugador.id_jugador 
          ? parejaRondaAnterior.id_jugador2 
          : parejaRondaAnterior.id_jugador1;
        
        jugadoresValidos = jugadoresDisponibles.filter(j => j.id_jugador !== idParejaAnterior);
        console.log(`${jugador.us_nomUsuario} no puede jugar con su pareja de la ronda anterior`);
      }
    }

    // Si después de filtrar no quedan jugadores válidos, usar todos los disponibles
    if (jugadoresValidos.length === 0) {
      console.log(`No hay jugadores válidos para ${jugador.us_nomUsuario}, usando todos los disponibles`);
      jugadoresValidos = jugadoresDisponibles;
    }
    
    // Verificar si ya jugó con todos los jugadores válidos disponibles
    const jugadoresConLosQueNoHaJugado = jugadoresValidos.filter(jugadorDisponible => {
      return !frecuenciaParejas[jugadorDisponible.id_jugador];
    });
    
    // Si ya jugó con todos, seleccionar pareja aleatoria
    if (jugadoresConLosQueNoHaJugado.length === 0) {
      console.log(`${jugador.us_nomUsuario} ya jugó con todos los jugadores disponibles, asignando pareja aleatoria`);
      const indiceAleatorio = Math.floor(Math.random() * jugadoresValidos.length);
      const parejaAleatoria = jugadoresValidos[indiceAleatorio];
      console.log(`Pareja aleatoria para ${jugador.us_nomUsuario}:`, parejaAleatoria?.us_nomUsuario);
      return parejaAleatoria;
    }
    
    // Si no ha jugado con todos, usar el algoritmo de prioridad original
    const jugadoresOrdenados = jugadoresValidos.sort((a, b) => {
      const frecuenciaA = frecuenciaParejas[a.id_jugador] || 0;
      const frecuenciaB = frecuenciaParejas[b.id_jugador] || 0;
      
      if (frecuenciaA !== frecuenciaB) {
        return frecuenciaA - frecuenciaB; // Menor frecuencia primero
      }
      
      // Si tienen la misma frecuencia, aleatorio
      return Math.random() - 0.5;
    });
    
    console.log(`Mejor pareja para ${jugador.us_nomUsuario}:`, jugadoresOrdenados[0]?.us_nomUsuario, 
                `(jugó ${frecuenciaParejas[jugadoresOrdenados[0]?.id_jugador] || 0} veces antes)`);
    return jugadoresOrdenados[0];
  };

  const rotarJugadores = async (id_juego, parejasActuales) => {
    console.log('🔄 INICIANDO ROTACIÓN DE JUGADORES');
    console.log('ID del juego:', id_juego);
    console.log('Parejas actuales recibidas:', parejasActuales);
    
    // 1. Extraer todos los jugadores individuales de las parejas actuales
    let jugadoresIndividuales = [];
    parejasActuales.forEach((pareja) => {
      if (pareja.id_jugador1 && pareja.us_jugador1) {
        jugadoresIndividuales.push({
          id_jugador: pareja.id_jugador1,
          us_nomUsuario: pareja.us_jugador1,
        });
      }
      if (pareja.id_jugador2 && pareja.us_jugador2) {
        jugadoresIndividuales.push({
          id_jugador: pareja.id_jugador2,
          us_nomUsuario: pareja.us_jugador2,
        });
      }
    });

    console.log('🔍 Jugadores para rotar:', jugadoresIndividuales.map(j => j.us_nomUsuario));
    console.log('🔍 Parejas de la ronda anterior:', parejasActuales.map(p => `${p.us_jugador1} - ${p.us_jugador2}`));

    // 2. Obtener el historial de parejas para todos los jugadores
    const historialParejas = await obtenerHistorialParejasTodos(id_juego, jugadoresIndividuales);

    // 3. Función para verificar si una pareja ya existe en la ronda anterior
    const esParejaDuplicada = (jugador1, jugador2, parejasRondaAnterior) => {
      return parejasRondaAnterior.some(pareja => 
        (pareja.id_jugador1 === jugador1.id_jugador && pareja.id_jugador2 === jugador2.id_jugador) ||
        (pareja.id_jugador1 === jugador2.id_jugador && pareja.id_jugador2 === jugador1.id_jugador)
      );
    };

    // 4. Algoritmo inteligente de formación de parejas con verificación de duplicados
    let nuevasParejas = [];
    let jugadorImpar = null; // Declarar fuera del bucle
    let intentosRotacion = 0;
    const maxIntentosRotacion = 20;
    let parejasValidas = false;

    while (!parejasValidas && intentosRotacion < maxIntentosRotacion) {
      nuevasParejas = [];
      const jugadoresDisponibles = [...jugadoresIndividuales];
      jugadorImpar = null; // Resetear en cada intento
      let todasLasParejasValidas = true;

      while (jugadoresDisponibles.length >= 2) {
        // Tomar el primer jugador disponible
        const jugador1 = jugadoresDisponibles.shift();
        
        // Encontrar la mejor pareja para este jugador, evitando la pareja de la ronda anterior
        const mejorPareja = encontrarMejorPareja(jugador1, jugadoresDisponibles, historialParejas, parejasActuales);
        
        if (mejorPareja) {
          // Verificar si esta pareja ya existió en la ronda anterior
          if (esParejaDuplicada(jugador1, mejorPareja, parejasActuales)) {
            //console.log(`⚠️ Pareja duplicada detectada: ${jugador1.us_nomUsuario} - ${mejorPareja.us_nomUsuario}`);
            todasLasParejasValidas = false;
            break; // Salir del while para reintentar
          }

          // Remover la mejor pareja de los disponibles
          const indicePareja = jugadoresDisponibles.findIndex(j => j.id_jugador === mejorPareja.id_jugador);
          if (indicePareja !== -1) {
            jugadoresDisponibles.splice(indicePareja, 1);
          }

          // Crear la nueva pareja
          nuevasParejas.push({
            id_jugador1: jugador1.id_jugador,
            us_jugador1: jugador1.us_nomUsuario,
            id_jugador2: mejorPareja.id_jugador,
            us_jugador2: mejorPareja.us_nomUsuario,
          });

          //console.log(`✅ Pareja formada: ${jugador1.us_nomUsuario} - ${mejorPareja.us_nomUsuario}`);
        }
      }

      // Si queda un jugador impar
      if (jugadoresDisponibles.length === 1) {
        jugadorImpar = jugadoresDisponibles[0];
        //console.log(`Jugador impar: ${jugadorImpar.us_nomUsuario}`);
      }

      // Verificar si todas las parejas son válidas (no duplicadas)
      if (todasLasParejasValidas) {
        parejasValidas = true;
        //console.log('✅ Todas las parejas son válidas (no duplicadas)');
      } else {
        intentosRotacion++;
        //console.log(`🔄 Reintentando formación de parejas (intento ${intentosRotacion}/${maxIntentosRotacion})`);
        
        // Mezclar jugadores para el siguiente intento
        for (let i = jugadoresIndividuales.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [jugadoresIndividuales[i], jugadoresIndividuales[j]] = [jugadoresIndividuales[j], jugadoresIndividuales[i]];
        }
      }
    }

    // Si después de todos los intentos no se pudieron formar parejas válidas, usar las últimas generadas
    if (!parejasValidas) {
      console.log('⚠️ No se pudieron evitar todas las parejas duplicadas, usando última combinación');
    }

    //console.log('Nuevas parejas formadas:', nuevasParejas.map(p => `${p.us_jugador1} - ${p.us_jugador2}`));

    const rondaAnterior = rondaActual[id_juego] || 0;
    const nuevaRonda = rondaAnterior + 1;

    // Determinar la cantidad de canchas
    const numCanchas = parseInt(juego?.num_canchas, 10) || 1;
    const nombresCanchas = (juego?.nombre_canchas || "")
      .split(",")
      .map((nombre) => nombre.trim());

    // Crear partidos para cada cancha
    const partidos = [];
    for (let i = 0; i < numCanchas && i * 2 + 1 < nuevasParejas.length; i++) {
      const pareja1 = nuevasParejas[i * 2];
      const pareja2 = nuevasParejas[i * 2 + 1];

      if (pareja1 && pareja2) {
        partidos.push({
          nombre_cancha: nombresCanchas[i] || `Cancha ${i + 1}`,
          jugadores: [
            // Primera pareja
            {
              id: pareja1.id_jugador1 || null,
              nombre: pareja1.us_jugador1 || "",
            },
            {
              id: pareja1.id_jugador2 || null,
              nombre: pareja1.us_jugador2 || "",
            },
            // Segunda pareja
            {
              id: pareja2.id_jugador1 || null,
              nombre: pareja2.us_jugador1 || "",
            },
            {
              id: pareja2.id_jugador2 || null,
              nombre: pareja2.us_jugador2 || "",
            },
          ],
          puntos: {
            set1: [0, 0],
            set2: [0, 0],
            set3: [0, 0],
          },
        });
      }
    }

    // Guardar ronda para cada partido/cancha individualmente usando guardarRondaReta
    const nuevasRondaIds = {};
    for (let i = 0; i < partidos.length; i++) {
      try {
        const response = await guardarRondaReta(id_juego, nuevaRonda, [
          partidos[i],
        ]);
        if (response && response.idRondaJuego) {
          nuevasRondaIds[`cancha${i}`] = {
            idRondaJuego: response.idRondaJuego,
            idRondaJuego2: response.idRondaJuego2,
          };
        }
      } catch (error) {
        console.error(`❌ Error creando nueva ronda para cancha ${i}:`, error);
      }
    }

    // Actualizar los rondaIds con los nuevos IDs de ronda
    setRondaIds((prev) => {
      const newState = {
        ...prev,
        [id_juego]: nuevasRondaIds,
      };
      // Guardar en AsyncStorage
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

    // Actualizar jugadores pendientes
    setPendientes((prev) => ({
      ...prev,
      [id_juego]: jugadorImpar ? [jugadorImpar] : [],
    }));

    // Actualizar ronda actual
    setRondaActual((prev) => ({ ...prev, [id_juego]: nuevaRonda }));

    // Actualizar jugadores activos con las nuevas parejas
    setJugadoresActivos(nuevasParejas);
    console.log('✅ JUGADORES ACTIVOS ACTUALIZADOS CON NUEVAS PAREJAS:', nuevasParejas.map(p => `${p.us_jugador1} - ${p.us_jugador2}`));

    // Limpiar puntos de la partida anterior
    setPuntosPartida((prev) => ({ ...prev, [id_juego]: {} }));

    // Actualizar la ronda actual en AsyncStorage
    AsyncStorage.setItem(
      `rondaActual_${id_juego}`,
      nuevaRonda.toString()
    ).catch((error) =>
      console.error("❌ Error guardando rondaActual en AsyncStorage:", error)
    );
    
    console.log('🏁 ROTACIÓN DE JUGADORES COMPLETADA - Nueva ronda:', nuevaRonda);
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

    const tieBreakForAPI = puntos?.tieBreak || null;
    const tieBreakScore = puntos?.tieBreakScore || null;

    // Llamar a la API solo si hay IDs de ronda
    if (idRondaJuego && idRondaJuego2) {
      actualizarRondaReta(
        idRondaJuego,
        idRondaJuego2,
        newSetScores,
        tieBreakForAPI
      )
        .then((response) => {
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

  const asignarJugadoresACanchas = (jugadores, numCanchas, id_juego) => {
    // Construimos un arreglo plano de jugadores individuales
    let jugadoresIndividuales = [];

    jugadores.forEach((pareja) => {
      jugadoresIndividuales.push({
        id: pareja.id_jugador1,
        us_nomUsuario: pareja.us_jugador1,
      });
      if (pareja.id_jugador2) {
        jugadoresIndividuales.push({
          id: pareja.id_jugador2,
          us_nomUsuario: pareja.us_jugador2,
        });
      }
    });

    const totalJugadores = jugadoresIndividuales.length;
    const jugadoresPorCancha = 4;

    // Solo usar canchas completas
    const canchasCompletas = Math.floor(totalJugadores / jugadoresPorCancha);
    const canchasUsadas = Math.min(numCanchas, canchasCompletas);
    const totalJugadoresEnCancha = canchasUsadas * jugadoresPorCancha;
    const ronda = rondaActual[id_juego] || 0;

    const jugadoresEnJuego = jugadoresIndividuales.slice(
      0,
      totalJugadoresEnCancha
    );
    const jugadoresPendientes = jugadoresIndividuales.slice(
      totalJugadoresEnCancha
    );

    // Crear arreglo con las canchas que se van a usar
    const canchas = Array.from({ length: canchasUsadas }, () => []);

    // Asignar 4 jugadores por cancha
    for (let i = 0; i < canchasUsadas; i++) {
      const inicio = i * jugadoresPorCancha;
      const jugadoresCancha = jugadoresEnJuego
        .slice(inicio, inicio + jugadoresPorCancha)
        .map((j) => ({
          tipo: "jugador",
          valor: j,
        }));

      canchas[i] = jugadoresCancha;
    }

    // Pendientes en formato esperado
    const pendientes = jugadoresPendientes.map((j) => ({
      tipo: "jugador",
      valor: j,
    }));

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

        {esperandoCreador ? (
          // Estado de carga: aún no se sabe si están listos o no
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
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
          // Todo listo, mostrar canchas y botón
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {canchas.map((jugadoresCancha, index) => {
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

                  // Crear arreglo solo con nombres de canchas usadas
                  const nombresDeCanchas = canchas.map(
                    (_, index) => nombresCanchas[index] || `Cancha ${index + 1}`
                  );

                  // Pasar solo nombres al guardar ronda
                  handleGuardarRonda(juego.id_juego, nombresDeCanchas);
                }}
                style={styles.button}
              />
            )}
          </ScrollView>
        )}

        {/* <HistorialPuntos
          visible={historialVisible}
          closeModal={() => setHistorialVisible(false)}
          juegoId={juego.id_juego}
          onTerminar={onTerminarJuegoHandler}
        /> */}

        <HistorialPuntos2I
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
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Terminando el juego...</Text>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} animationType="fade" visible={loading2}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color={colors.primary} />
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
    backgroundColor: "colors.primary",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
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
  noJuegosText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: -10,
    opacity: 0.7,
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

export default Americana;
