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
import JugadoresRey from "../../modales/JugadoresRey";
import HistorialPuntos from "../../modales/HistorialPuntos";
import ReyMatch from "./Americana/ReyMatch";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import HistorialPuntos2 from "../../modales/HistorialPuntos2";
import TimeBreak2 from "../../modales/TimeBreak2";

const Rey = ({ juego, actualizarNombresCanchas, onTerminarJuego }) => {
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

  const [nombresDeCanchasPendientes, setNombresDeCanchasPendientes] =
    useState(null);

  const [parejaTieBreak, setParejaTieBreak] = useState(null);
  const [puntajesTieBreak, setPuntajesTieBreak] = useState({
    pareja1: "",
    pareja2: "",
  });

  const [jugadasRegistradas, setJugadasRegistradas] = useState(false);
  const [partidasTerminadas] = useState(false);

  const [puntajeParejas, setPuntajeParejas] = useState({});
  console.log("puntajeParejas ", puntajeParejas);
  const [pendientes, setPendientes] = useState([]);
  console.log("parejas pendientes", pendientes);
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
  const [loading2, setLoading2] = useState(false);
  const numCanchas = parseInt(juego.num_canchas);
  const nombresDeCanchas = Array.isArray(juego.nombre_canchas)
    ? juego.nombre_canchas.map((nombre) => nombre.trim())
    : typeof juego.nombre_canchas === "string"
    ? juego.nombre_canchas.split(",").map((nombre) => nombre.trim())
    : Array.from({ length: numCanchas }, (_, i) => `Cancha ${i + 1}`);

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
        const res = await traerRondas(idJuego);
        console.log("Respuesta traerRondas para idJuego", idJuego, ":", res);

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

          // Aquí log para revisar num_ronda de cada item
          const rondasNumeros = res.map((r) => ({
            id_ronda_reta: r.id_ronda_reta,
            num_ronda: r.num_ronda,
          }));
          console.log(
            "Rondas recibidas (id_ronda_reta y num_ronda):",
            rondasNumeros
          );

          const numRondaMax = Math.max(
            ...res.map((r) => parseInt(r.num_ronda, 10))
          );
          console.log("Número máximo de ronda calculado:", numRondaMax);

          setRondaActual((prev) => ({
            ...prev,
            [idJuego]: numRondaMax,
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
          console.log("rondasIdsporCancha:", rondasIdsporCancha);

          setRondaIds((prev) => {
            const newState = {
              ...prev,
              [idJuego]: rondasIdsporCancha,
            };
            AsyncStorage.setItem(
              `rondaIds_${idJuego}`,
              JSON.stringify(rondasIdsporCancha)
            ).catch((error) =>
              console.error("Error guardando rondaIds en AsyncStorage:", error)
            );
            return newState;
          });

          setJugadasRegistradas(true);
          setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: true }));
          setEsperandoCreador(false);

          // Puntos y tiebreak
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
          console.log("puntos parseados:", puntos);
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

  // Polling para jugadores NO creadores: revisa cambios en rondaIds cada 2s
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

  useEffect(() => {
    const recuperarEstadoJuego = async () => {
      if (juego?.id_juego) {
        try {
          const idJuego = juego.id_juego;

          const historialStr = await AsyncStorage.getItem("historialPartidas");
          const rondaStr = await AsyncStorage.getItem(`rondaActual_${idJuego}`);
          const rondaIdsStr = await AsyncStorage.getItem(`rondaIds_${idJuego}`);

          console.log(`--- recuperarEstadoJuego para idJuego: ${idJuego} ---`);
          console.log("historialStr raw:", historialStr);
          console.log("rondaStr raw:", rondaStr);
          console.log("rondaIdsStr raw:", rondaIdsStr);

          if (historialStr) {
            const historial = JSON.parse(historialStr);
            console.log("historial parsed:", historial);
            if (historial[idJuego]) {
              setHistorialPartidas((prev) => ({
                ...prev,
                [idJuego]: historial[idJuego],
              }));
            }
          }

          if (rondaStr) {
            const rondaParseada = parseInt(rondaStr, 10);
            console.log(
              "rondaActual parseada desde AsyncStorage:",
              rondaParseada
            );
            setRondaActual((prev) => ({
              ...prev,
              [idJuego]: rondaParseada,
            }));
          }

          if (rondaIdsStr) {
            const rondaIdsParsed = JSON.parse(rondaIdsStr);
            console.log("rondaIds parsed:", rondaIdsParsed);
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
  }, [juego]);

  const guardarRondaEnStorage = async (idJuego, rondaData, nuevaRonda) => {
    console.log("Datos de la ronda siguiente para guardar:", rondaData);
    console.log("Número de ronda siguiente para guardar:", nuevaRonda);
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
      console.log("jugadores no guardados", jugadores);

      if (jugadores && Array.isArray(jugadores)) {
        const parejas = [];

        for (let i = 0; i < jugadores.length; i += 2) {
          const jugador1 = jugadores[i];
          const jugador2 = jugadores[i + 1]; // Puede ser undefined

          parejas.push({
            id_jugador1: jugador1?.id_jugador || null,
            us_jugador1:
              jugador1?.us_nomUsuario || jugador1?.nom_invitado || null,
            id_jugador2: jugador2?.id_jugador || null,
            us_jugador2:
              jugador2?.us_nomUsuario || jugador2?.nom_invitado || null,
          });
        }

        setJugadoresActivos(parejas);
        setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: false }));
        setJugadasRegistradas(false);
      }
    } catch (error) {
      console.log("Error al obtener jugadores no guardados:", error);
      Alert.alert("Error", "No se pudieron cargar los jugadores no guardados");
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
      Alert.alert("Error", "No se pudieron cargar los jugadores si guradados ");
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
  const perdedoresPorJuegoRef = useRef({});

  const handleGuardarRonda = async (
    idJuego,
    nombresDeCanchas,
    marcadorTieBreak = null
  ) => {
    console.log("nombre de canchas en gqrdar ronda", nombresDeCanchas);

    try {
      setLoading2(true);
      // 🚦 Validación: No guardar si hay una ronda activa (Estatus == '1')
      const rondas = await traerRondas(idJuego);
      if (
        Array.isArray(rondas) &&
        rondas.some((r) => r.Estatus === 1 || r.Estatus === "1")
      ) {
        setLoading2(false);
        Alert.alert(
          "Ronda activa",
          "No puedes guardar una nueva ronda porque hay una ronda activa pendiente. Finaliza la ronda anterior antes de continuar."
        );
        return;
      }
      const puntos = puntosPartida[idJuego] || {};
      const marcadoresTiebreakPorCancha = marcadorTieBreak || {};

      const canchas = await asignarJugadoresACanchas(
        jugadoresActivos,
        parseInt(juego.num_canchas, 10),
        idJuego,
        setPendientes // si tienes disponible este setter en este contexto
      );

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

      if (canchasEmpatadas.length > 0 && !todasLasCanchasEmpatadasResueltas) {
        setLoading2(false);
        const empates = canchasEmpatadas.map(({ index }) => {
          const pareja = canchas[index];
          const nombreCancha = nombresDeCanchas[index] || `Cancha ${index + 1}`;

          return {
            canchaIndex: index,
            nombre_cancha: nombreCancha,
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

      // Validar diferencia de 2 puntos en marcadores normales (sin tie-break)

      const ronda = parseInt(rondaActual[idJuego], 10) || 0;

      // Preparar datos de partidas
      const partidasData = canchas.map((pareja, index) => {
        const puntosPareja = puntos[`pareja${index}`] || {
          pareja1: 0,
          pareja2: 0,
        };

        // Obtener ids de ronda
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

      // Calcular resultados
      const resultadosOrdenados = partidasData.flatMap((partida, index) => {
        const [pareja1, pareja2] = [
          partida.jugadores.slice(0, 2),
          partida.jugadores.slice(2, 4),
        ];
        const puntos = partida.puntos;

        const parejaObj1 = {
          jugadores: pareja1,
          puntos: puntos.pareja1,
          cancha: index,
        };
        const parejaObj2 = {
          jugadores: pareja2,
          puntos: puntos.pareja2,
          cancha: index,
        };

        if (puntos.pareja1 > puntos.pareja2) {
          parejaObj1.resultado = "ganó";
          parejaObj2.resultado = "perdió";
        } else {
          parejaObj1.resultado = "perdió";
          parejaObj2.resultado = "ganó";
        }

        return [parejaObj1, parejaObj2];
      });

      console.log("🎯 Resultados de parejas por cancha:");
      resultadosOrdenados.forEach((r, i) => {
        const nombres = r.jugadores.map((j) => j.nombre).join(" y ");
        console.log(`Cancha ${r.cancha + 1}: ${nombres} => ${r.resultado}`);
      });

      // 🔄 Generar nueva rotación con soporte a reserva de perdedores
      const nuevosOrdenados = generarRotacion(
        resultadosOrdenados,
        canchas.length,
        pendientes,
        idJuego
      );

      console.log("🔄 Nuevos ordenados generados:", nuevosOrdenados);
      console.log("🔄 Cantidad de nuevos ordenados:", nuevosOrdenados.length);

      // 💾 Actualizar pendientes reales desde la rotación
      const pendientesActualizados =
        perdedoresPorJuegoRef.current[idJuego] || [];
      console.log(
        "📌 Actualizando setPendientes con:",
        pendientesActualizados.length
      );
      setPendientes(pendientesActualizados);

      // 🔄 Actualizar jugadores activos
      console.log("🔄 Llamando a rotarJugadores...");
      await rotarJugadores(idJuego, nuevosOrdenados, nombresDeCanchas);
      console.log("🔄 rotarJugadores completado");

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
              console.log(
                "Error guardando ronda completa para idRondaJuego2:",
                cancha.idRondaJuego2,
                e
              );
            }
          }
        }
      }

      setMarcadorTimeBreak(null);
      setLoading2(false);
      Alert.alert("Éxito", "Ronda guardada correctamente");
    } catch (error) {
      console.log("Error al guardar la ronda:", error);
      Alert.alert("Error", "No se pudo guardar la ronda");
    }
  };

  // const generarRotacion = (
  //   resultadosOrdenados,
  //   numCanchas,
  //   parejasPendientes,
  //   id_juego
  // ) => {
  //   console.log("🔄 Iniciando generarRotacion");
  //   console.log("🔄 Número de canchas:", numCanchas);
  //   console.log(
  //     "📦 Total de parejas pendientes al inicio:",
  //     parejasPendientes.length
  //   );

  //   if (!perdedoresPorJuegoRef.current[id_juego]) {
  //     perdedoresPorJuegoRef.current[id_juego] = [...parejasPendientes];
  //   }

  //   let pendientesQueue = [...perdedoresPorJuegoRef.current[id_juego]];
  //   console.log("🔍 Pendientes actuales en cola:", pendientesQueue.length);

  //   const canchas = Array.from({ length: numCanchas }, () => ({
  //     ganador: null,
  //     perdedor: null,
  //   }));

  //   resultadosOrdenados.forEach((pareja) => {
  //     const index = pareja.cancha;
  //     if (pareja.resultado === "ganó") {
  //       canchas[index].ganador = pareja;
  //     } else {
  //       canchas[index].perdedor = pareja;
  //     }
  //   });

  //   const nuevasCanchas = Array.from({ length: numCanchas }, () => []);

  //   for (let i = 0; i < numCanchas; i++) {
  //     const { ganador, perdedor } = canchas[i];

  //     // Mover ganadores igual que antes
  //     if (ganador && i > 0 && nuevasCanchas[i - 1].length < 2) {
  //       nuevasCanchas[i - 1].push(ganador);
  //     } else if (ganador) {
  //       nuevasCanchas[i].push(ganador);
  //     }

  //     // Última cancha: jugará la primera pareja pendiente de la cola
  //     if (i === numCanchas - 1) {
  //       if (pendientesQueue.length === 0) {
  //         console.warn("No hay parejas pendientes para poner en última cancha");
  //       } else {
  //         // Sacar la primera pareja pendiente para jugar
  //         const parejaPendiente = pendientesQueue.shift();
  //         nuevasCanchas[i].push(parejaPendiente);
  //         console.log(
  //           `⚡ Pareja pendiente en cancha ${i + 1}: ${parejaPendiente.jugadores
  //             .map((j) => j.nombre)
  //             .join(" y ")}`
  //         );
  //       }

  //       // El perdedor de esta cancha va al final de la cola pendiente
  //       if (perdedor) {
  //         pendientesQueue.push(perdedor);
  //         console.log(
  //           `🔄 Perdedor cancha ${
  //             i + 1
  //           } va al final de pendientes: ${perdedor.jugadores
  //             .map((j) => j.nombre)
  //             .join(" y ")}`
  //         );
  //       }
  //     } else {
  //       // Para canchas distintas a la última, el perdedor baja a la siguiente cancha si hay espacio
  //       if (perdedor && nuevasCanchas[i + 1].length < 2) {
  //         nuevasCanchas[i + 1].push(perdedor);
  //       } else if (perdedor) {
  //         nuevasCanchas[i].push(perdedor);
  //       }
  //     }
  //   }

  //   // Actualizar la referencia global con la nueva cola de pendientes
  //   perdedoresPorJuegoRef.current[id_juego] = pendientesQueue;

  //   console.log("📥 Pendientes para próxima ronda:", pendientesQueue.length);
  //   pendientesQueue.forEach((p, idx) => {
  //     const nombres = p.jugadores.map((j) => j.nombre).join(" y ");
  //     console.log(`  🔁 ${idx + 1}. ${nombres}`);
  //   });

  //   // Aplanar las canchas para devolver la lista de parejas que jugarán en la ronda siguiente
  //   const resultado = nuevasCanchas.flat();

  //   console.log("📤 Resultado final de rotación:", resultado.length);
  //   resultado.forEach((p, idx) => {
  //     const nombres = p.jugadores.map((j) => j.nombre).join(" y ");
  //     console.log(
  //       `  🎾 Cancha ${
  //         p.cancha !== undefined ? p.cancha + 1 : "?"
  //       } - ${nombres}`
  //     );
  //   });

  //   return resultado;
  // };


const generarRotacion = (
  resultadosOrdenados,
  numCanchas,
  parejasPendientes,
  id_juego
) => {
  console.log("🔄 Iniciando generarRotacion");
  console.log("🔄 Número de canchas:", numCanchas);
  console.log("📦 Total de parejas pendientes al inicio:", parejasPendientes.length);

  // Inicializa los pendientes si aún no existen
  if (!perdedoresPorJuegoRef.current[id_juego]) {
    perdedoresPorJuegoRef.current[id_juego] = [...parejasPendientes];
  }

  let pendientesQueue = [...perdedoresPorJuegoRef.current[id_juego]];
  console.log("🔍 Pendientes actuales en cola:", pendientesQueue.length);

  // Estructura temporal para almacenar ganadores y perdedores por cancha
  const canchas = Array.from({ length: numCanchas }, () => ({
    ganador: null,
    perdedor: null,
  }));

  // Llenar estructura con datos del resultado anterior
  resultadosOrdenados.forEach((pareja) => {
    const index = pareja.cancha;
    if (pareja.resultado === "ganó") {
      canchas[index].ganador = pareja;
    } else {
      canchas[index].perdedor = pareja;
    }
  });

  // Canchas para la nueva ronda
  const nuevasCanchas = Array.from({ length: numCanchas }, () => []);

  // Asignación por cancha
  for (let i = 0; i < numCanchas; i++) {
    const { ganador, perdedor } = canchas[i];

    // Ganador sube una cancha si hay espacio, si no se queda
    if (ganador && i > 0 && nuevasCanchas[i - 1].length < 2) {
      nuevasCanchas[i - 1].push(ganador);
    } else if (ganador) {
      nuevasCanchas[i].push(ganador);
    }

    // 🔄 Última cancha (maneja lógica especial con pendientes)
    if (i === numCanchas - 1) {
      if (pendientesQueue.length > 0) {
        // Si hay pendientes, el perdedor va a la cola
        if (perdedor) {
          pendientesQueue.push(perdedor);
          console.log(`📥 Perdedor enviado a pendientes: ${perdedor.jugadores.map((j) => j.nombre).join(" y ")}`);
        }

        // Y sacamos una pareja pendiente para jugar
        if (nuevasCanchas[i].length < 2) {
          const parejaPendiente = pendientesQueue.shift();
          nuevasCanchas[i].push(parejaPendiente);
          console.log(`⚡ Pareja pendiente jugó en cancha ${i + 1}: ${parejaPendiente.jugadores.map((j) => j.nombre).join(" y ")}`);
        }
      } else {
        // Si no hay pendientes, el perdedor juega directamente si hay espacio
        if (perdedor && nuevasCanchas[i].length < 2) {
          nuevasCanchas[i].push(perdedor);
          console.log(`🔻 Perdedor jugó en cancha ${i + 1}: ${perdedor.jugadores.map((j) => j.nombre).join(" y ")}`);
        }
      }
    } else {
      // Canchas anteriores a la última
      if (perdedor && nuevasCanchas[i + 1].length < 2) {
        nuevasCanchas[i + 1].push(perdedor);
      } else if (perdedor) {
        nuevasCanchas[i].push(perdedor);
      }
    }
  }

  // Guardamos el nuevo estado de la cola de pendientes
  perdedoresPorJuegoRef.current[id_juego] = pendientesQueue;

  console.log("📥 Pendientes para próxima ronda:", pendientesQueue.length);
  pendientesQueue.forEach((p, idx) => {
    const nombres = p.jugadores.map((j) => j.nombre).join(" y ");
    console.log(`  🔁 ${idx + 1}. ${nombres}`);
  });

  // Aplanamos la estructura para pasar las parejas ordenadas a la siguiente ronda
  const resultado = nuevasCanchas.flat();

  console.log("📤 Resultado final de rotación:", resultado.length);
  resultado.forEach((p, idx) => {
    const nombres = p.jugadores.map((j) => j.nombre).join(" y ");
    console.log(
      `  🎾 Cancha ${
        p.cancha !== undefined ? p.cancha + 1 : "?"
      } - ${nombres}`
    );
  });

  return resultado;
};



  const rotarJugadores = async (
    id_juego,
    nuevosOrdenados = null,
    nombresDeCanchas = []
  ) => {
    console.log("🔄 Iniciando rotarJugadores con id_juego:", id_juego);
    console.log("🔄 nuevosOrdenados recibidos:", nuevosOrdenados);

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
        parseInt(nuevaRonda, 10).toString()
      );
      console.log(`✅ Ronda guardada en AsyncStorage: ${nuevaRonda}`);
    } catch (error) {
      console.error("❌ Error guardando ronda en AsyncStorage:", error);
    }

    if (nuevosOrdenados) {
      console.log("🔄 Procesando nuevosOrdenados...");

      // Convertir nuevosOrdenados a formato de parejas
      const nuevasParejas = nuevosOrdenados
        .filter((p) => p.jugadores && p.jugadores.length >= 2)
        .map((p) => ({
          id_jugador1: p.jugadores[0]?.id,
          us_jugador1: p.jugadores[0]?.nombre,
          id_jugador2: p.jugadores[1]?.id,
          us_jugador2: p.jugadores[1]?.nombre,
        }));

      console.log("🔄 Nuevas parejas convertidas:", nuevasParejas);
      console.log("🔄 Cantidad de nuevas parejas:", nuevasParejas.length);

      // Crear nuevas rondas para la siguiente ronda
      const numCanchas = parseInt(
        juegoSeleccionado?.num_canchas || juego?.num_canchas,
        10
      );
      const parejasPorCancha = 2; // 2 parejas por cancha
      const nuevasRondaIds = {};

      console.log("🔄 Número de canchas:", numCanchas);
      console.log("🔄 Parejas por cancha:", parejasPorCancha);

      for (let i = 0; i < numCanchas; i++) {
        const inicio = i * parejasPorCancha;
        const parejasCancha = nuevasParejas.slice(
          inicio,
          inicio + parejasPorCancha
        );

        console.log(`🔄 Cancha ${i}:`, parejasCancha);
        console.log(`🔄 Parejas en cancha ${i}:`, parejasCancha.length);

        if (parejasCancha.length === 2) {
          console.log(`✅ Creando nueva ronda para cancha ${i}`);
          const nombreCancha = nombresDeCanchas[i] || `Cancha ${i + 1}`;

          // Crear nueva ronda para esta cancha
          const partidaData = {
            nombre_cancha: nombreCancha,
            jugadores: [
              // Primera pareja
              {
                id: parejasCancha[0].id_jugador1,
                nombre: parejasCancha[0].us_jugador1,
              },
              {
                id: parejasCancha[0].id_jugador2,
                nombre: parejasCancha[0].us_jugador2,
              },
              // Segunda pareja
              {
                id: parejasCancha[1].id_jugador1,
                nombre: parejasCancha[1].us_jugador1,
              },
              {
                id: parejasCancha[1].id_jugador2,
                nombre: parejasCancha[1].us_jugador2,
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
            console.log(`🔄 Llamando guardarRondaReta para cancha ${i}...`);
            const response = await guardarRondaReta(id_juego, nuevaRonda, [
              partidaData,
            ]);

            console.log(
              `🔄 Respuesta de guardarRondaReta para cancha ${i}:`,
              response
            );

            if (response && response.idRondaJuego) {
              nuevasRondaIds[`cancha${i}`] = {
                idRondaJuego: response.idRondaJuego,
                idRondaJuego2: response.idRondaJuego2,
              };
              console.log(`✅ Ronda creada exitosamente para cancha ${i}`);
            } else {
              console.log(`❌ No se recibieron IDs de ronda para cancha ${i}`);
            }
          } catch (error) {
            console.error(
              `❌ Error creando nueva ronda para cancha ${i}:`,
              error
            );
          }
        } else {
          console.log(
            `❌ No hay suficientes parejas para cancha ${i} (${parejasCancha.length})`
          );
        }
      }

      console.log("🔄 Nuevas rondas creadas:", nuevasRondaIds);

      // Actualizar rondaIds con las nuevas rondas
      setRondaIds((prev) => {
        const newState = {
          ...prev,
          [id_juego]: nuevasRondaIds,
        };
        console.log("🔄 Actualizando rondaIds:", newState);
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

      console.log("✅ Actualizando parejas activas para la siguiente ronda:");
      console.log(JSON.stringify(nuevasParejas, null, 2));
      setJugadoresActivos(nuevasParejas);
    }

    setPuntosPartida((prev) => ({ ...prev, [id_juego]: {} }));
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
          console.log("Respuesta de la API:", response);
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

  const asignarJugadoresACanchas = async (
    parejas,
    numCanchas,
    id_juego,
    setPendientes
  ) => {
    const jugadoresPorCancha = 4; // 2 parejas por cancha
    const parejasPorCancha = jugadoresPorCancha / 2;

    const totalParejas = parejas.length;
    const canchasCompletas = Math.floor(totalParejas / parejasPorCancha);
    const canchasUsadas = Math.min(numCanchas, canchasCompletas);
    const totalParejasEnJuego = canchasUsadas * parejasPorCancha;

    const ronda = parseInt(rondaActual[id_juego], 10) || 0;

    let parejasOrdenadas = [...parejas];
    if (ronda > 0) {
      parejasOrdenadas.sort((a, b) => {
        const idA = `${a.id_jugador1}-${a.id_jugador2}`;
        const idB = `${b.id_jugador1}-${b.id_jugador2}`;
        const puntosA = puntajeParejas[idA] || 0;
        const puntosB = puntajeParejas[idB] || 0;
        return puntosB - puntosA;
      });
    }

    const parejasEnJuego = parejasOrdenadas.slice(0, totalParejasEnJuego);
    const parejasPendientes = parejasOrdenadas.slice(totalParejasEnJuego);

    const canchas = Array.from({ length: canchasUsadas }, () => []);

    for (let i = 0; i < canchasUsadas; i++) {
      const inicio = i * parejasPorCancha;
      const parejasCancha = parejasEnJuego.slice(
        inicio,
        inicio + parejasPorCancha
      );

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

    const pendientes = parejasPendientes.map((pareja) => {
      const jugadores = [];

      if (pareja.id_jugador1 && pareja.us_jugador1) {
        jugadores.push({ id: pareja.id_jugador1, nombre: pareja.us_jugador1 });
      }

      if (pareja.id_jugador2 && pareja.us_jugador2) {
        jugadores.push({ id: pareja.id_jugador2, nombre: pareja.us_jugador2 });
      }

      return {
        jugadores,
        puntos: 0,
        resultado: "pendiente",
      };
    });

    // Guardar en estado
    setPendientes(pendientes);

    // Guardar en AsyncStorage
    try {
      await AsyncStorage.setItem(
        `pendientes_${id_juego}`,
        JSON.stringify(pendientes)
      );
      console.log("Parejas pendientes guardadas en AsyncStorage");
    } catch (error) {
      console.error("Error guardando pendientes en AsyncStorage", error);
    }

    return canchas;
  };

  useEffect(() => {
    if (juegoSeleccionado?.id_juego) {
      renderCanchasJugadores(juegoSeleccionado);
    }
  }, [jugadoresActivos, juegoSeleccionado]);

  const [canchasAsignadas, setCanchasAsignadas] = useState([]);
  useEffect(() => {
    const asignar = async () => {
      const resultadoCanchas = await asignarJugadoresACanchas(
        jugadoresActivos,
        parseInt(juego.num_canchas),
        juego.id_juego,
        setPendientes // esta ya actualiza el estado
      );
      setCanchasAsignadas(resultadoCanchas); // actualiza el estado de canchas
    };

    asignar();
  }, [jugadoresActivos, juego.id_juego, juego.num_canchas]);

  const renderCanchasJugadores = (juego) => {
    const nombresCanchas = Array.isArray(juego.nombre_canchas)
      ? juego.nombre_canchas
      : typeof juego.nombre_canchas === "string"
      ? juego.nombre_canchas.split(",").map((n) => n.trim())
      : [];

    console.log("nombre de canchas de slip", nombresCanchas);

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
            <ActivityIndicator size="large" color="#02B9FA" />
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
            {canchasAsignadas.map((jugadoresCancha, index) => {
              const nombreCancha =
                nombresCanchas[index] || `Cancha ${index + 1}`;
              const rondaIdsCancha =
                rondaIds[juego.id_juego]?.[`cancha${index}`];

              return (
                <ReyMatch
                  key={`cancha-${index}-${rondaResetKey[juego.id_juego] || 0}-${
                    puntosPartida[juego.id_juego]?.[`pareja${index}`]?.tieBreak ? 'tie' : 'notie'
                  }`}
                  jugadores={jugadoresCancha}
                  juegoNombre={
                    index === 0
                      ? `Rey de la pista: ${nombreCancha}`
                      : `Cancha: ${nombreCancha}`
                  }
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
                  puntosTotales={juego.puntos}
                  soyCreador={soyCreador}
                  rondaIds={rondaIdsCancha}
                  idJuego={juego.id_juego}
                />
              );
            })}
            {pendientes.length > 0 && (
              <PendientesEnJugar
                jugadoresPendientes={pendientes
                  .filter((p) => p.jugadores.length === 2)
                  .map((p) => p.jugadores.map((j) => j.nombre).join(" y "))}
              />
            )}

            {Object.values(perdedoresPorJuegoRef.current).flat().length > 0 && (
              <PendientesEnJugar
                jugadoresPendientes={Object.values(
                  perdedoresPorJuegoRef.current
                )
                  .flat()
                  .map((p) => {
                    const nombres = p.jugadores
                      .map((j) => j.nombre)
                      .join(" y ");
                    return `${nombres}${
                      p.es_reemplazo == 1 ? " (Reemplazo)" : ""
                    }`;
                  })}
              />
            )}
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
                  // Crear arreglo solo con nombres limpios sin prefijos
                  const nombresDeCanchas = canchasAsignadas.map((_, index) => {
                    const nombreBase =
                      nombresCanchas[index] || `Cancha ${index + 1}`;
                    return index === 0
                      ? `Rey de la pista: ${nombreBase}`
                      : `Cancha: ${nombreBase}`;
                  });

                  console.log(
                    "Llamando handleGuardarRonda con:",
                    nombresDeCanchas
                  );
                  // Pasar solo nombres al guardar ronda
                  handleGuardarRonda(juego.id_juego, nombresDeCanchas);
                }}
                style={styles.button}
              />
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

      <JugadoresRey
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
        onJugadoresGuardados={async (ordenCanchas) => {
          if (!juegoSeleccionado?.id_juego) return;

          try {
            setEsperandoCreador(true); // Inicia loading

            setJugadoresGuardados((prevState) => ({
              ...prevState,
              [juegoSeleccionado.id_juego]: true,
            }));

            // Actualizamos solo nombres de canchas
            if (typeof actualizarNombresCanchas === "function") {
              actualizarNombresCanchas(
                juegoSeleccionado.id_juego,
                ordenCanchas.map((c) => c.nombre)
              );
            }

            setJugadasRegistradas(true);

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
              setJugadoresActivos(jugadoresActualizados);

              // Aquí tu lógica para asignar canchas, guardar ronda, actualizar estados, etc.
              const rondaActualJuego =
                parseInt(rondaActual[juegoSeleccionado.id_juego], 10) || 1;

              const canchas = await asignarJugadoresACanchas(
                jugadoresActualizados,
                parseInt(juegoSeleccionado.num_canchas, 10),
                juegoSeleccionado.id_juego,
                setPendientes // si usas este estado en tu componente
              );

              const partidasData = canchas.map((jugadoresCancha, index) => {
                const nombreBase =
                  ordenCanchas && ordenCanchas[index]
                    ? ordenCanchas[index].nombre.trim()
                    : `Cancha ${index + 1}`;

                const nombreCancha =
                  index === 0
                    ? `Rey de la pista: ${nombreBase}`
                    : `Cancha: ${nombreBase}`;

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

              setRondaActual((prev) => ({
                ...prev,
                [juegoSeleccionado.id_juego]: rondaActualJuego,
              }));

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
          } catch (error) {
            console.error("Error en onJugadoresGuardados:", error);
          } finally {
            setEsperandoCreador(false); // Siempre desactiva loading
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
    marginTop: 25,
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
  noJuegosText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: -10,
    opacity: 0.7,
  },
});

export default Rey;