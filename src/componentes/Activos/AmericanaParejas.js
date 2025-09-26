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
  obtenerRivalesPorJuego,
} from "./Americana/RetaApiService";
import { useNavigation } from "@react-navigation/native";
import TimeBreak2 from "../../modales/TimeBreak2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HistorialPuntos2 from "../../modales/HistorialPuntos2";
import { doc, setDoc, onSnapshot , getDoc, updateDoc, getDatabase,
  ref,
  get,
  update,
  push,
  onValue, } from "firebase/firestore";
import { db } from  "../../../src/config/firebaseConfig";

const AmericanaParejas = ({ juego, onTerminarJuego }) => {
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

  const [pendientes, setPendientes] = useState({});
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
  if (!juego?.id_juego) return;

  const idJuego = juego.id_juego;
  const juegoRef = doc(db, "juegos", idJuego.toString());

  const unsubscribe = onSnapshot(juegoRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();

      // Datos desde Firestore
      const partidasData = data.partidas || [];
      const rondaActualJuego = data.rondaActual || 1;
      const rondaIdsPorCancha = data.rondaIds || {};
      const pendientesFirestore = data.pendientes || [];

      // Actualiza estados con datos Firebase
      setHistorialPartidas((prev) => ({
        ...prev,
        [idJuego]: partidasData,
      }));

      setRondaActual((prev) => ({
        ...prev,
        [idJuego]: rondaActualJuego,
      }));

      setRondaIds((prev) => ({
        ...prev,
        [idJuego]: rondaIdsPorCancha,
      }));

      setPendientes((prev) => ({
        ...prev,
        [idJuego]: pendientesFirestore,
      }));

      // Parejas activas actuales en cancha
// Parejas activas actuales en cancha
const parejas = partidasData.flatMap((item) => {
  const jugadores = item.jugadores || [];
  const parejasEnCancha = [];
  for (let i = 0; i < jugadores.length; i += 2) {
    const jugador1 = jugadores[i];
    const jugador2 = jugadores[i + 1];
    if (jugador1 && jugador2) {
      parejasEnCancha.push({
        id_jugador1: jugador1.id || null,
        us_jugador1: jugador1.nombre || "",
        id_jugador2: jugador2.id || null,
        us_jugador2: jugador2.nombre || "",
      });
    }
  }
  return parejasEnCancha;
});

      setJugadoresActivos(parejas);

      // Ahora valida si las parejas pendientes están desactualizadas o vacías y actualiza en Firestore
      // (Si usas API externa para parejas totales)
      try {
        const resJugadores = await verificarJugadoresAmericana(idJuego);
        if (resJugadores?.status && Array.isArray(resJugadores.jugadores)) {
          const todasLasParejas = resJugadores.jugadores;
          const parejasEnJuego = parejas;

          const parejasSonIguales = (p1, p2) =>
            (p1.id_jugador1 === p2.id_jugador1 && p1.id_jugador2 === p2.id_jugador2) ||
            (p1.id_jugador1 === p2.id_jugador2 && p1.id_jugador2 === p2.id_jugador1);

          const parejasPendientes = todasLasParejas.filter(parejaTodas =>
            !parejasEnJuego.some(parejaEnJuego => parejasSonIguales(parejaEnJuego, parejaTodas))
          );

          const pendientesFormateadas = parejasPendientes.map((pareja) => ({
            jugadores: [
              { id: pareja.id_jugador1, nombre: pareja.us_jugador1 },
              { id: pareja.id_jugador2, nombre: pareja.us_jugador2 },
            ],
            puntos: 0,
            resultado: "pendiente",
          }));

          // Actualizar en Firestore si es diferente o está vacío
          const pendientesActualesStr = JSON.stringify(pendientesFirestore);
          const pendientesNuevosStr = JSON.stringify(pendientesFormateadas);
          if (pendientesActualesStr !== pendientesNuevosStr) {
            await setDoc(
              juegoRef,
              { pendientes: pendientesFormateadas, actualizadoEn: new Date().toISOString() },
              { merge: true }
            );
            setPendientes((prev) => ({
              ...prev,
              [idJuego]: pendientesFormateadas,
            }));
          }
        }
      } catch (error) {
        console.error("Error actualizando pendientes:", error);
      }

      renderCanchasJugadores(juego);
      setEsperandoCreador(false);
      setJugadasRegistradas(true);
      setJugadoresGuardados((prev) => ({ ...prev, [idJuego]: true }));
    } else {
      console.log("No existe documento para el juego", idJuego);
      setEsperandoCreador(true);
    }
  });

  return () => unsubscribe();
}, [juego?.id_juego]);

//   const guardarRondaEnStorage = async (idJuego, rondaData, nuevaRonda) => {
//     console.log("datos de la ronda sieguiente", rondaData);
//     try {
//       const historialGuardado = await AsyncStorage.getItem("historialPartidas");
//       const historialParsed = historialGuardado
//         ? JSON.parse(historialGuardado)
//         : {};

//       const nuevoHistorial = {
//         ...historialParsed,
//         [idJuego]: [...(historialParsed[idJuego] || []), rondaData],
//       };

//       await AsyncStorage.setItem(
//         "historialPartidas",
//         JSON.stringify(nuevoHistorial)
//       );
//       await AsyncStorage.setItem(
//         `rondaActual_${idJuego}`,
//         parseInt(nuevaRonda, 10).toString()
//       );
//     } catch (error) {
//       console.error("Error guardando en AsyncStorage:", error);
//     }
//   };


const guardarRondaEnStorage = async (idJuego, rondaData, nuevaRonda) => {
  try {
    const juegoRef = doc(db, "juegos", idJuego.toString());

    // Obtener doc actual para actualizar historial de partidas
    const docSnap = await getDoc(juegoRef);
    let historialPartidas = [];
    if (docSnap.exists()) {
      const data = docSnap.data();
      historialPartidas = data.partidas || [];
    }

    // Agregar la nueva ronda
    const nuevoHistorial = [...historialPartidas, rondaData];

    // Actualizar Firestore con la nueva info
    await setDoc(
      juegoRef,
      {
        partidas: nuevoHistorial,
        rondaActual: nuevaRonda,
        actualizadoEn: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("Ronda guardada correctamente en Firestore");
  } catch (error) {
    console.error("Error guardando ronda en Firestore:", error);
    throw error;
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
  } else {
    console.warn("⚠️ Faltan datos para guardar la ronda");
  }
  };

  const handleVerHistorial = (juego) => {
    setHistorialVisible(true);
  };


// ======= Helpers de normalización / claves =======
const normalizePair = (a, b) => {
  const aStr = String(a ?? "");
  const bStr = String(b ?? "");
  return [aStr, bStr].sort().join("-");
};

const normalizeMatchup = (pair1Key, pair2Key) => {
  // Ordena las dos parejas para que "a-b__c-d" sea igual a "c-d__a-b"
  return [pair1Key, pair2Key].sort().join("__");
};

// Devuelve todas las combinaciones posibles de enfrentamientos entre parejas
const allPossibleMatchups = (pairKeys) => {
  const res = [];
  for (let i = 0; i < pairKeys.length; i++) {
    for (let j = i + 1; j < pairKeys.length; j++) {
      res.push(normalizeMatchup(pairKeys[i], pairKeys[j]));
    }
  }
  return res;
};

// Lee/crea documento base en Firestore para un juego
const getOrInitJuegoDoc = async (idJuego) => {
  const juegoRef = doc(db, "juegos", idJuego.toString());
  const snap = await getDoc(juegoRef);
  if (!snap.exists()) {
    console.log("🆕 No existía doc de juego en Firestore; creando inicial…");
    await setDoc(juegoRef, {
      rondaActual: 1,
      historialEnfrentamientos: [],
      actualizadoEn: new Date().toISOString(),
    });
    return { ref: juegoRef, data: { rondaActual: 1, historialEnfrentamientos: [] } };
  }
  return { ref: juegoRef, data: snap.data() || {} };
};

// Guarda “la ronda” y su metadata en Firestore
const saveRoundToFirestore = async ({
  idJuego,
  ronda,
  partidasData,
  enfrentamientosKeys,
  rondaIdsPorCancha = null,
}) => {
  const { ref, data } = await getOrInitJuegoDoc(idJuego);

  const historialPrevio = Array.isArray(data.historialEnfrentamientos)
    ? data.historialEnfrentamientos
    : [];

  const nuevoHistorial = [...historialPrevio, ...enfrentamientosKeys];

  const payload = {
    rondaActual: ronda,
    partidas: partidasData, // snapshot completo de la ronda
    rondaIds: rondaIdsPorCancha ? rondaIdsPorCancha : (data.rondaIds || null),
    historialEnfrentamientos: nuevoHistorial,
    actualizadoEn: new Date().toISOString(),
  };

  console.log("💾 Guardando ronda en Firestore con payload:", payload);
  await setDoc(ref, payload, { merge: true });

  return nuevoHistorial;
};

// Genera siguiente set de partidos (parejas vs parejas) sin repetir hasta agotar
// parejasRound: array de objetos { pairKey, jugadores: [{id, nombre}, {id, nombre}] }
const generarEmparejamientosSinRepetir = (parejasRound, historial) => {
  const pairKeys = parejasRound.map((p) => p.pairKey);
  const historialSet = new Set(historial);

  // Todas las combinaciones posibles
  const posibles = allPossibleMatchups(pairKeys);

  // Filtramos solo los enfrentamientos aún no jugados
  const candidatos = posibles.filter((mk) => !historialSet.has(mk));

  const disponibles = new Set(pairKeys);
  const nuevosMatches = [];
  const matchesKeys = [];

  for (const mk of candidatos) {
    const [p1, p2] = mk.split("__");
    if (disponibles.has(p1) && disponibles.has(p2)) {
      nuevosMatches.push([p1, p2]);
      matchesKeys.push(mk);
      disponibles.delete(p1);
      disponibles.delete(p2);
    }
  }

  const agotados = nuevosMatches.length === 0;

  return { matches: nuevosMatches, keys: matchesKeys, agotados };
};

// Nuevo: genera emparejamientos siguiendo un orden base predefinido
const generarEmparejamientosDesdeBase = (parejasRound, baseKeys) => {
  const pairKeys = parejasRound.map((p) => p.pairKey);
  const disponibles = new Set(pairKeys);
  const nuevosMatches = [];
  const matchesKeys = [];

  for (const mk of baseKeys) {
    const [p1, p2] = mk.split("__");
    if (disponibles.has(p1) && disponibles.has(p2)) {
      nuevosMatches.push([p1, p2]);
      matchesKeys.push(mk);
      disponibles.delete(p1);
      disponibles.delete(p2);
    }
  }

  return { matches: nuevosMatches, keys: matchesKeys };
};


// A partir de jugadores (en canchas) arma estructura de "parejas de dos" con pairKey
const construirParejasDeCanchas = (canchas) => {
  // canchas: cada elemento es un array de 4 jugadores (2 vs 2)
  // Convertimos cada cancha en 2 parejas normalizadas
  const parejas = [];
  canchas.forEach((pareja4, idxCancha) => {
    if (!Array.isArray(pareja4) || pareja4.length < 4) return;

    const j1 = pareja4[0];
    const j2 = pareja4[1];
    const j3 = pareja4[2];
    const j4 = pareja4[3];

    const id1 = j1?.valor?.id ?? j1?.id ?? null;
    const id2 = j2?.valor?.id ?? j2?.id ?? null;
    const id3 = j3?.valor?.id ?? j3?.id ?? null;
    const id4 = j4?.valor?.id ?? j4?.id ?? null;

    const pairAKey = normalizePair(id1, id2);
    const pairBKey = normalizePair(id3, id4);

    parejas.push({
      pairKey: pairAKey,
      jugadores: [
        { id: id1, nombre: j1?.valor?.us_nomUsuario || j1?.valor?.nom_invitado || j1?.nombre || "" },
        { id: id2, nombre: j2?.valor?.us_nomUsuario || j2?.valor?.nom_invitado || j2?.nombre || "" },
      ],
      canchaOrigen: idxCancha,
    });
    parejas.push({
      pairKey: pairBKey,
      jugadores: [
        { id: id3, nombre: j3?.valor?.us_nomUsuario || j3?.valor?.nom_invitado || j3?.nombre || "" },
        { id: id4, nombre: j4?.valor?.us_nomUsuario || j4?.valor?.nom_invitado || j4?.nombre || "" },
      ],
      canchaOrigen: idxCancha,
    });
  });

  return parejas;
};

// Construye "partidasData" a partir de matches (parejaKey vs parejaKey) y mapa de info pareja
const construirPartidasDesdeMatches = (matches, infoParejas, nombresDeCanchas) => {
  const partidas = [];
  matches.forEach(([pairKeyA, pairKeyB], index) => {
    const nombreCancha = nombresDeCanchas?.[index] || `Cancha ${index + 1}`;
    const infoA = infoParejas.get(pairKeyA);
    const infoB = infoParejas.get(pairKeyB);

    partidas.push({
      nombre_cancha: nombreCancha,
      cancha: nombreCancha,
      jugadores: [
        ...infoA.jugadores.map((j) => ({ id: j.id || null, nombre: j.nombre, cancha: nombreCancha })),
        ...infoB.jugadores.map((j) => ({ id: j.id || null, nombre: j.nombre, cancha: nombreCancha })),
      ],
      puntos: { pareja1: 0, pareja2: 0 }, // Se sobreescribe más adelante con los puntos reales
      tie_break: null,
    });
  });
  return partidas;
};

// ======================== handleGuardarRonda ========================
const handleGuardarRonda = async (idJuego, nombresDeCanchas, marcadorTieBreak = null) => {
  try {
    console.log("🔹 Iniciando handleGuardarRonda...");
    setLoading2(true);

    const puntos = puntosPartida[idJuego] || {};
    const marcadoresTiebreakPorCancha = marcadorTieBreak || {};

    const { canchas } = asignarJugadoresACanchas(
      jugadoresActivos,
      parseInt(juego.num_canchas, 10),
      idJuego
    );

    // Verificar empates 6-6 pendientes de tie-break
    const canchasEmpatadas = canchas
      .map((_, index) => ({ index, puntos: puntos[`pareja${index}`] || { pareja1: 0, pareja2: 0 } }))
      .filter(({ puntos }) => Number(puntos.pareja1) === 6 && Number(puntos.pareja2) === 6);

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
            jugador?.tipo === "jugador" ? jugador.valor.us_nomUsuario : jugador?.valor
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
    const siguienteRondaNumero = ronda + 1;

    // Construir parejas de la ronda actual
    const parejasRound = construirParejasDeCanchas(canchas);
    const mapParejasInfo = new Map(parejasRound.map((p) => [p.pairKey, p]));

    // Extraer enfrentamientos de la ronda actual
    const enfrentamientosKeys = [];
    for (let i = 0; i < canchas.length; i++) {
      const pareja = canchas[i];
      if (pareja.length >= 4) {
        const j1 = pareja[0]?.valor?.id;
        const j2 = pareja[1]?.valor?.id;
        const j3 = pareja[2]?.valor?.id;
        const j4 = pareja[3]?.valor?.id;
        const pairA = normalizePair(j1, j2);
        const pairB = normalizePair(j3, j4);
        enfrentamientosKeys.push(normalizeMatchup(pairA, pairB));
      }
    }

    // 1️⃣ Marcar ronda anterior como completada
    if (rondaIds && rondaIds[idJuego]) {
      const ids = Object.values(rondaIds[idJuego] || {});
      for (const cancha of ids) {
        if (cancha?.idRondaJuego) await guardarRondaCompleta(cancha.idRondaJuego);
        if (cancha?.idRondaJuego2) await guardarRondaCompleta(cancha.idRondaJuego2);
      }
    }

    // 2️⃣ Generar siguiente ronda consultando historial en Firestore
    const { data: juegoDocData } = await getOrInitJuegoDoc(idJuego);

    let { matches, keys: matchesKeys, agotados } = generarEmparejamientosSinRepetir(
      parejasRound,
      juegoDocData.historialEnfrentamientos || [] // ✅ historial existente
    );
if (agotados) {
  console.log("♻️ Todos los enfrentamientos posibles ya se jugaron, reiniciando ciclo...");

  // Si ya tenemos base guardada, la usamos para reiniciar
  let baseMatchesKeys = juegoDocData.emparejamientosBase || [];

  if (!baseMatchesKeys.length) {
    // Si es la primera vez que se juega, guardamos esta base
    baseMatchesKeys = matchesKeys;
    await setDoc(
      doc(db, "juegos", idJuego.toString()),
      { emparejamientosBase: baseMatchesKeys },
      { merge: true }
    );
  }

  // Borramos historial y arrancamos con el orden base
  await setDoc(
    doc(db, "juegos", idJuego.toString()),
    { historialEnfrentamientos: [] },
    { merge: true }
  );

  // Usamos la base para generar el reinicio
  ({ matches, matchesKeys } = generarEmparejamientosDesdeBase(
    parejasRound,
    baseMatchesKeys
  ));
}


    // 3️⃣ Construir partidas de la nueva ronda
    const partidasSiguienteRonda = construirPartidasDesdeMatches(matches, mapParejasInfo, nombresDeCanchas);

    // 4️⃣ Guardar cada partida en DB y recolectar IDs
    const rondaIdsPorCancha = {};
    const matchesKeysGuardados = []; // 🔹 Para almacenar los matches que realmente se guardaron

    for (let i = 0; i < partidasSiguienteRonda.length; i++) {
      const partida = partidasSiguienteRonda[i];
      const partidaParaGuardar = {
        nombre_cancha: partida.nombre_cancha || `Cancha ${i + 1}`,
        cancha: partida.cancha || `Cancha ${i + 1}`,
        jugadores: partida.jugadores.map((jugador) => ({
          id: jugador.id || null,
          nombre: jugador.nombre || "",
        })),
        puntos: { set1: [0, 0], set2: [0, 0], set3: [0, 0] },
      };

      try {
        const response = await guardarRondaReta(idJuego, siguienteRondaNumero, [partidaParaGuardar]);
        if (response && response.idRondaJuego) {
          rondaIdsPorCancha[`cancha${i}`] = {
            idRondaJuego: response.idRondaJuego,
            idRondaJuego2: response.idRondaJuego2,
          };
          matchesKeysGuardados.push(matchesKeys[i]); // Guardar solo los matches que se generaron realmente
        }
      } catch (e) {
        console.error("❌ Error guardando la partida en DB:", partidaParaGuardar.nombre_cancha, e);
      }
    }

    // 5️⃣ Guardar nueva ronda en Firestore reemplazando la anterior
    await setDoc(
      doc(db, "juegos", idJuego.toString()),
      {
        rondaActual: siguienteRondaNumero,
        partidas: partidasSiguienteRonda,
        rondaIds: rondaIdsPorCancha,
        historialEnfrentamientos: [...(juegoDocData.historialEnfrentamientos || []), ...matchesKeysGuardados],
        actualizadoEn: new Date().toISOString(),
      },
      { merge: true }
    );

    setLoading2(false);
    Alert.alert("Éxito", `Ronda ${siguienteRondaNumero} generada y guardada correctamente.`);
  } catch (error) {
    console.error("❌ Error en handleGuardarRonda:", error);
    setLoading2(false);
    Alert.alert("Error", "Ocurrió un error al generar la siguiente ronda.");
  }
};






const handleActualizarPuntos = async (idJuego, parejaIndex, puntos) => {
  console.log("Actualizar puntos:", { idJuego, parejaIndex, puntos });

  try {
    const juegoRef = doc(db, "juegos", idJuego.toString());
    const juegoSnap = await getDoc(juegoRef);
    if (!juegoSnap.exists()) {
      console.error("Documento de juego no existe en Firestore");
      return;
    }
    const juegoData = juegoSnap.data();

    const partidas = Array.isArray(juegoData.partidas) ? [...juegoData.partidas] : [];

    if (parejaIndex < partidas.length) {
      // Actualizamos solo los puntos set1 para la parejaIndex
      // NOTA: pareja1 y pareja2 aquí son los dos marcadores de la pareja,
      //  NO los marcadores de ambas parejas.

      partidas[parejaIndex] = {
        ...partidas[parejaIndex],
        puntos: {
          ...partidas[parejaIndex].puntos,
          set1: [
            Number(puntos.pareja1) || 0, // marcador para jugador 1 en pareja
            Number(puntos.pareja2) || 0, // marcador para jugador 2 en pareja
          ],
          // set2 y set3 quedan igual
          set2: partidas[parejaIndex].puntos?.set2 || [0, 0],
          set3: partidas[parejaIndex].puntos?.set3 || [0, 0],
          tieBreak: puntos.tieBreak || partidas[parejaIndex].puntos?.tieBreak || null,
        },
      };

      await updateDoc(juegoRef, {
        partidas,
        actualizadoEn: new Date().toISOString(),
      });
      console.log(`Puntos actualizados en Firestore para pareja ${parejaIndex}:`, partidas[parejaIndex].puntos);
    } else {
      console.warn(`parejaIndex (${parejaIndex}) fuera de rango en partidas.`);
    }
  } catch (error) {
    console.error("Error actualizando puntos en Firestore:", error);
  }
};

useEffect(() => {
  if (!rondaIds || Object.keys(rondaIds).length === 0) return;

  const unsubscribes = [];

  Object.entries(rondaIds).forEach(([idJuego, canchas]) => {
    const juegoRef = doc(db, "juegos", idJuego.toString());

    // Escuchar en tiempo real cambios en Firestore para este juego
    const unsubscribe = onSnapshot(juegoRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.partidas && Array.isArray(data.partidas)) {
          const nuevosPuntosPorPareja = {};

          // Recorrer cada partida (cada cancha o pareja) para extraer sus puntos del set1
          data.partidas.forEach((partida, idx) => {
            nuevosPuntosPorPareja[`pareja${idx}`] = {
              pareja1: partida.puntos?.set1?.[0] || 0,  // marcador pareja 1
              pareja2: partida.puntos?.set1?.[1] || 0,  // marcador pareja 2
              tieBreak: partida.puntos?.tieBreak || null, // marcador tiebreak si existe
              tieBreakScore: partida.puntos?.tieBreakScore || null, // marcador tiebreak score si existe
            };
          });

          // Actualizar estado para este juego, manteniendo puntos por pareja separados
          setPuntosPartida((prev) => ({
            ...prev,
            [idJuego]: nuevosPuntosPorPareja,
          }));
        }
      }
    });

    unsubscribes.push(unsubscribe);
  });

  // Limpiar las suscripciones al desmontar el componente o cambiar rondaIds
  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}, [rondaIds]);




  const rotarJugadores = async (id_juego, enfrentamientosRondaActual = []) => {
    console.log(
      "🔄 Iniciando rotarJugadores con sistema de enfrentamientos únicos:",
      id_juego
    );
    console.log("📊 Enfrentamientos de la ronda que se acaba de guardar:", enfrentamientosRondaActual);

    const rondaAnterior = parseInt(rondaActual[id_juego], 10) || 0;
    const nuevaRonda = rondaAnterior + 1;
    setRondaActual((prev) => ({ ...prev, [id_juego]: nuevaRonda }));

    try {
      await AsyncStorage.setItem(
        `rondaActual_${id_juego}`,
        nuevaRonda.toString()
      );
    } catch (error) {
      console.error("❌ Error guardando ronda en AsyncStorage:", error);
    }

    // Usar los enfrentamientos pasados como parámetro en lugar de calcularlos aquí
    const enfrentamientosRondaAnterior = enfrentamientosRondaActual;

    const pendientesAnteriores = pendientes[id_juego] || [];
    const parejasPendientesConvertidas = pendientesAnteriores.map((p) => ({
      id_jugador1: p.jugadores[0].id,
      us_jugador1: p.jugadores[0].nombre,
      id_jugador2: p.jugadores[1].id,
      us_jugador2: p.jugadores[1].nombre,
    }));

    let todasLasParejas = [...jugadoresActivos, ...parejasPendientesConvertidas];

    const numCanchas = parseInt(
      juegoSeleccionado?.num_canchas || juego?.num_canchas,
      10
    );
    const parejasPorCancha = 2;

    try {
      const enfrentamientosPorPareja = {};
      
      for (let pareja of todasLasParejas) {
        const parejaId = `${pareja.id_jugador1}-${pareja.id_jugador2}`;
        try {
          const rivales = await obtenerRivalesPorJuego(id_juego, pareja.id_jugador1, pareja.id_jugador2);
          enfrentamientosPorPareja[parejaId] = rivales || [];
          console.log(`� Pareja ${parejaId} ya se enfrentó con:`, rivales);
        } catch (error) {
          console.log(`⚠️ No se encontraron rivales para pareja ${parejaId} (primera ronda):`);
          enfrentamientosPorPareja[parejaId] = [];
        }
      }

      const parejasSelecionadas = await buscarMejoresEnfrentamientos(
        todasLasParejas, 
        enfrentamientosPorPareja, 
        numCanchas,
        enfrentamientosRondaAnterior
      );

      const nuevasRondaIds = {};

      for (let i = 0; i < Math.min(parejasSelecionadas.length, numCanchas); i++) {
        const [pareja1, pareja2] = parejasSelecionadas[i];

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

      const parejasEnJuego = [];
      const parejasUsadas = new Set();

      parejasSelecionadas.forEach(([pareja1, pareja2]) => {
        const id1 = `${pareja1.id_jugador1}-${pareja1.id_jugador2}`;
        const id2 = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
        
        if (!parejasUsadas.has(id1)) {
          parejasEnJuego.push(pareja1);
          parejasUsadas.add(id1);
        }
        if (!parejasUsadas.has(id2)) {
          parejasEnJuego.push(pareja2);
          parejasUsadas.add(id2);
        }
      });

      const nuevasPendientes = todasLasParejas.filter(pareja => {
        const parejaId = `${pareja.id_jugador1}-${pareja.id_jugador2}`;
        return !parejasUsadas.has(parejaId);
      });

      setPendientes((prev) => ({
        ...prev,
        [id_juego]: nuevasPendientes.map((pareja) => ({
          jugadores: [
            { id: pareja.id_jugador1, nombre: pareja.us_jugador1 },
            { id: pareja.id_jugador2, nombre: pareja.us_jugador2 },
          ],
          puntos: 0,
          resultado: "pendiente",
        })),
      }));

      setJugadoresActivos(parejasEnJuego);

      setPuntosPartida((prev) => ({ ...prev, [id_juego]: {} }));

    } catch (error) {
      console.error("❌ Error en rotarJugadores:", error);
      // Fallback a rotación simple en caso de error
      
      if (todasLasParejas.length > 0) {
        const primera = todasLasParejas.shift();
        todasLasParejas.push(primera);
      }

      const totalJugando = numCanchas * parejasPorCancha;
      const nuevasParejasEnJuego = todasLasParejas.slice(0, totalJugando);
      const nuevasPendientes = todasLasParejas.slice(totalJugando);

      setJugadoresActivos(nuevasParejasEnJuego);
      setPendientes((prev) => ({
        ...prev,
        [id_juego]: nuevasPendientes.map((pareja) => ({
          jugadores: [
            { id: pareja.id_jugador1, nombre: pareja.us_jugador1 },
            { id: pareja.id_jugador2, nombre: pareja.us_jugador2 },
          ],
          puntos: 0,
          resultado: "pendiente",
        })),
      }));
      setPuntosPartida((prev) => ({ ...prev, [id_juego]: {} }));
    }
  };

  const generarCombinaciones = (parejas) => {
    const combinaciones = [];
    for (let i = 0; i < parejas.length; i++) {
      for (let j = i + 1; j < parejas.length; j++) {
        combinaciones.push([parejas[i], parejas[j]]);
      }
    }
    return combinaciones;
  };

  const buscarMejoresEnfrentamientos = async (todasLasParejas, enfrentamientosPorPareja, numCanchas, enfrentamientosRondaAnterior = []) => {
    
    console.log("🔍 Iniciando búsqueda de mejores enfrentamientos");
    console.log("📋 Enfrentamientos de la ronda anterior a evitar:", enfrentamientosRondaAnterior);
    
    const parejasSelecionadas = [];
    const parejasUsadas = new Set();
    
    // Función auxiliar para verificar si dos parejas se enfrentaron en la ronda anterior
    const seEnfrentaronRondaAnterior = (pareja1, pareja2) => {
      const pareja1Id = `${pareja1.id_jugador1}-${pareja1.id_jugador2}`;
      const pareja2Id = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
      
      return enfrentamientosRondaAnterior.some(enfrentamiento => 
        (enfrentamiento.pareja1 === pareja1Id && enfrentamiento.pareja2 === pareja2Id) ||
        (enfrentamiento.pareja1 === pareja2Id && enfrentamiento.pareja2 === pareja1Id)
      );
    };
    
    // Función auxiliar para verificar si dos parejas ya se enfrentaron (historial completo)
    const yaSeEnfrentaron = (pareja1, pareja2) => {
      const pareja1Id = `${pareja1.id_jugador1}-${pareja1.id_jugador2}`;
      const pareja2Id = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
      
      const rivalesPareja1 = enfrentamientosPorPareja[pareja1Id] || [];
      const rivalesPareja2 = enfrentamientosPorPareja[pareja2Id] || [];
      
      // Verificar si pareja2 está en los rivales de pareja1
      const seEnfrentaron1 = rivalesPareja1.some(rival => 
        (rival.id_jugador1 === pareja2.id_jugador1 && rival.id_jugador2 === pareja2.id_jugador2) ||
        (rival.id_jugador1 === pareja2.id_jugador2 && rival.id_jugador2 === pareja2.id_jugador1)
      );
      // Verificar si pareja1 está en los rivales de pareja2
      const seEnfrentaron2 = rivalesPareja2.some(rival => 
        (rival.id_jugador1 === pareja1.id_jugador1 && rival.id_jugador2 === pareja1.id_jugador2) ||
        (rival.id_jugador1 === pareja1.id_jugador2 && rival.id_jugador2 === pareja1.id_jugador1)
      );
      
      return seEnfrentaron1 || seEnfrentaron2;
    };

    const calcularEnfrentamientosFaltantes = (pareja) => {
      const parejaId = `${pareja.id_jugador1}-${pareja.id_jugador2}`;
      const rivalesActuales = enfrentamientosPorPareja[parejaId] || [];
      
      // Contar cuántas parejas diferentes han enfrentado
      const parejasEnfrentadas = new Set();
      rivalesActuales.forEach(rival => {
        const rivalId = `${rival.id_jugador1}-${rival.id_jugador2}`;
        parejasEnfrentadas.add(rivalId);
      });
      
      // Total de parejas posibles - parejas ya enfrentadas - ella misma
      const totalPosibles = todasLasParejas.length - 1;
      const faltantes = totalPosibles - parejasEnfrentadas.size;
      return faltantes;
    };

    const parejasOrdenadas = [...todasLasParejas].sort((a, b) => {
      const faltantesA = calcularEnfrentamientosFaltantes(a);
      const faltantesB = calcularEnfrentamientosFaltantes(b);
      return faltantesB - faltantesA; // Mayor número de faltantes primero
    });

    parejasOrdenadas.forEach(pareja => {
      const faltantes = calcularEnfrentamientosFaltantes(pareja);
    });

    for (let i = 0; i < parejasOrdenadas.length && parejasSelecionadas.length < numCanchas; i++) {
      const pareja1 = parejasOrdenadas[i];
      const pareja1Id = `${pareja1.id_jugador1}-${pareja1.id_jugador2}`;
      
      if (parejasUsadas.has(pareja1Id)) continue;
      
      // Buscar la mejor oponente para esta pareja
      let mejorOponente = null;
      let menorEnfrentamientos = Infinity;
      let prioridadMaxima = false; // Para priorizar oponentes que no se enfrentaron en la ronda anterior
      
      for (let j = 0; j < parejasOrdenadas.length; j++) {
        if (i === j) continue;
        
        const pareja2 = parejasOrdenadas[j];
        const pareja2Id = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
        
        if (parejasUsadas.has(pareja2Id)) continue;
        
        // Verificar si se enfrentaron en la ronda anterior
        const seEnfrentaronAnterior = seEnfrentaronRondaAnterior(pareja1, pareja2);
        
        // Solo considerar si no se han enfrentado nunca o si ya no hay otras opciones
        if (!yaSeEnfrentaron(pareja1, pareja2)) {
          const enfrentamientosPareja2 = calcularEnfrentamientosFaltantes(pareja2);
          
          // Si no se enfrentaron en la ronda anterior, es prioridad máxima
          if (!seEnfrentaronAnterior) {
            if (!prioridadMaxima || enfrentamientosPareja2 < menorEnfrentamientos) {
              mejorOponente = pareja2;
              menorEnfrentamientos = enfrentamientosPareja2;
              prioridadMaxima = true;
            }
          } else if (!prioridadMaxima) {
            // Solo considerar oponentes de la ronda anterior si no hay otras opciones
            if (enfrentamientosPareja2 < menorEnfrentamientos) {
              mejorOponente = pareja2;
              menorEnfrentamientos = enfrentamientosPareja2;
            }
          }
        }
      }
      
      // Si encontramos un oponente que no se ha enfrentado, usarlo
      if (mejorOponente) {
        const pareja2Id = `${mejorOponente.id_jugador1}-${mejorOponente.id_jugador2}`;
        const seEnfrentaronAnterior = seEnfrentaronRondaAnterior(pareja1, mejorOponente);
        
        console.log(`✅ Emparejando ${pareja1Id} vs ${pareja2Id} - Ronda anterior: ${seEnfrentaronAnterior ? 'SÍ' : 'NO'}`);
        
        parejasSelecionadas.push([pareja1, mejorOponente]);
        parejasUsadas.add(pareja1Id);
        parejasUsadas.add(pareja2Id);
      } else {
        console.log(`⚠️ No se encontró oponente válido para ${pareja1Id}`);
      }
    }

    if (parejasSelecionadas.length < numCanchas) {
      
      // Verificar si realmente se agotaron todas las combinaciones únicas
      let hayEnfrentamientosNuevos = false;
      for (let i = 0; i < todasLasParejas.length && !hayEnfrentamientosNuevos; i++) {
        for (let j = i + 1; j < todasLasParejas.length && !hayEnfrentamientosNuevos; j++) {
          const pareja1 = todasLasParejas[i];
          const pareja2 = todasLasParejas[j];
          const pareja1Id = `${pareja1.id_jugador1}-${pareja1.id_jugador2}`;
          const pareja2Id = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
          
          if (!parejasUsadas.has(pareja1Id) && !parejasUsadas.has(pareja2Id) && !yaSeEnfrentaron(pareja1, pareja2) && !seEnfrentaronRondaAnterior(pareja1, pareja2)) {
            hayEnfrentamientosNuevos = true;
          }
        }
      }
      
      if (hayEnfrentamientosNuevos) {
        // Intentar una vez más con un algoritmo más exhaustivo
        for (let i = 0; i < todasLasParejas.length && parejasSelecionadas.length < numCanchas; i++) {
          for (let j = i + 1; j < todasLasParejas.length && parejasSelecionadas.length < numCanchas; j++) {
            const pareja1 = todasLasParejas[i];
            const pareja2 = todasLasParejas[j];
            const pareja1Id = `${pareja1.id_jugador1}-${pareja1.id_jugador2}`;
            const pareja2Id = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
            
            if (!parejasUsadas.has(pareja1Id) && !parejasUsadas.has(pareja2Id) && !yaSeEnfrentaron(pareja1, pareja2) && !seEnfrentaronRondaAnterior(pareja1, pareja2)) {
              parejasSelecionadas.push([pareja1, pareja2]);
              parejasUsadas.add(pareja1Id);
              parejasUsadas.add(pareja2Id);
            }
          }
        }
      } else {
        // Ahora sí permitir repeticiones, pero evitando la ronda anterior cuando sea posible
        for (let i = 0; i < parejasOrdenadas.length && parejasSelecionadas.length < numCanchas; i++) {
          const pareja1 = parejasOrdenadas[i];
          const pareja1Id = `${pareja1.id_jugador1}-${pareja1.id_jugador2}`;
          
          if (parejasUsadas.has(pareja1Id)) continue;
          
          // Primero intentar encontrar oponentes que NO sean de la ronda anterior
          let oponenteEncontrado = false;
          for (let j = i + 1; j < parejasOrdenadas.length && !oponenteEncontrado; j++) {
            const pareja2 = parejasOrdenadas[j];
            const pareja2Id = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
            
            if (!parejasUsadas.has(pareja2Id) && !seEnfrentaronRondaAnterior(pareja1, pareja2)) {
              parejasSelecionadas.push([pareja1, pareja2]);
              parejasUsadas.add(pareja1Id);
              parejasUsadas.add(pareja2Id);
              oponenteEncontrado = true;
            }
          }
          
          // Si no se encontró oponente que no sea de la ronda anterior, permitir cualquiera
          if (!oponenteEncontrado) {
            for (let j = i + 1; j < parejasOrdenadas.length && !oponenteEncontrado; j++) {
              const pareja2 = parejasOrdenadas[j];
              const pareja2Id = `${pareja2.id_jugador1}-${pareja2.id_jugador2}`;
              
              if (!parejasUsadas.has(pareja2Id)) {
                parejasSelecionadas.push([pareja1, pareja2]);
                parejasUsadas.add(pareja1Id);
                parejasUsadas.add(pareja2Id);
                oponenteEncontrado = true;
              }
            }
          }
        }
      }
    }

    return parejasSelecionadas;
  };

  const arraysIguales = (a, b) =>
    a.length === b.length && a.every((val, i) => val === b[i]);

  const yaSeEnfrentaron = (p1, p2, historial) => {
    return historial.some(
      (match) =>
        (arraysIguales(match.pareja1, [p1.id_jugador1, p1.id_jugador2]) &&
          arraysIguales(match.pareja2, [p2.id_jugador1, p2.id_jugador2])) ||
        (arraysIguales(match.pareja1, [p2.id_jugador1, p2.id_jugador2]) &&
          arraysIguales(match.pareja2, [p1.id_jugador1, p1.id_jugador2]))
    );
  };

  const obtenerPartidasParaCanchas = (parejas, historial, numCanchas) => {
    const disponibles = [...parejas];
    const partidas = [];
    const usadas = new Set();

    const combinaciones = generarCombinaciones(disponibles);

    for (const [p1, p2] of combinaciones) {
      const id1 = `${p1.id_jugador1}-${p1.id_jugador2}`;
      const id2 = `${p2.id_jugador1}-${p2.id_jugador2}`;

      if (
        !usadas.has(id1) &&
        !usadas.has(id2) &&
        !yaSeEnfrentaron(p1, p2, historial)
      ) {
        partidas.push([p1, p2]);
        usadas.add(id1);
        usadas.add(id2);
      }

      if (partidas.length >= numCanchas) break;
    }

    return partidas;
  };

  const asignarJugadoresACanchas = (parejas, numCanchas, id_juego) => {
    const jugadoresPorCancha = 4; // 2 parejas por cancha
    const parejasPorCancha = jugadoresPorCancha / 2;

    const totalParejas = parejas.length;
    const canchasCompletas = Math.floor(totalParejas / parejasPorCancha);
    const canchasUsadas = Math.min(numCanchas, canchasCompletas);
    const totalParejasEnJuego = canchasUsadas * parejasPorCancha;

    // ⚠️ Ya no importa la ronda ni se ordenan por puntaje
    const parejasOrdenadas = [...parejas];

    const parejasEnJuego = parejasOrdenadas.slice(0, totalParejasEnJuego);
    const parejasPendientes = parejasOrdenadas.slice(totalParejasEnJuego);
    console.log("parejas pendientes", parejasPendientes);

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

  useEffect(() => {
    if (juegoSeleccionado?.id_juego) {
      console.log("🔍 jugadoresActivos en useEffect:", jugadoresActivos);
      renderCanchasJugadores(juegoSeleccionado);
    }
  }, [jugadoresActivos, juegoSeleccionado]);

  const renderCanchasJugadores = (juego) => {
    const numCanchas = parseInt(juego.num_canchas);
    const { canchas, pendientes: pendientesLocales } = asignarJugadoresACanchas(
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
                    tieBreak={puntosPartida[juego.id_juego]?.[`pareja${index}`]?.tieBreak || null}
  tieBreakScore={puntosPartida[juego.id_juego]?.[`pareja${index}`]?.tieBreakScore || null}
            onPuntosChange={(puntos) => {
  console.log("onPuntosChange recibido:", puntos);
  handleActualizarPuntos(juego.id_juego, index, puntos);
}}

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

            {/* Mostrar parejas pendientes debajo del botón Guardar Ronda */}
            {pendientes[juego.id_juego] && pendientes[juego.id_juego].length > 0 && (
              <PendientesEnJugar 
                jugadoresPendientes={
                  pendientes[juego.id_juego].map(pareja => 
                    pareja.jugadores 
                      ? `${pareja.jugadores[0]?.nombre || ''} - ${pareja.jugadores[1]?.nombre || ''}`
                      : pareja
                  )
                }
                siguienteRonda={null} // No necesitamos mostrar siguiente ronda aquí
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

    const hayGuardados = await jugadoresSiGuardados(juegoSeleccionado.id_juego);

    let jugadoresActualizados = [];
    if (hayGuardados) {
      const res = await verificarJugadoresAmericana(juegoSeleccionado.id_juego);
      jugadoresActualizados = res?.jugadores || [];
    }

    if (jugadoresActualizados.length > 0) {
      const rondaActualJuego = parseInt(rondaActual[juegoSeleccionado.id_juego], 10) || 1;

      const { canchas } = asignarJugadoresACanchas(
        jugadoresActualizados,
        parseInt(juegoSeleccionado.num_canchas, 10),
        juegoSeleccionado.id_juego
      );

      const partidasData = canchas.map((jugadoresCancha, index) => {
        const nombreCancha = juegoSeleccionado.nombre_canchas
          ? juegoSeleccionado.nombre_canchas.split(",")[index]?.trim() || `Cancha ${index + 1}`
          : `Cancha ${index + 1}`;
        return {
          nombre_cancha: nombreCancha,
          jugadores: jugadoresCancha.map((jugador) => ({
            id: jugador.valor.id || null,
            nombre: jugador.valor.us_nomUsuario || jugador.valor.nom_invitado || "",
          })),
          puntos: {
            set1: [0, 0],
            set2: [0, 0],
            set3: [0, 0],
          },
        };
      });

      const rondaIdsPorCancha = {};
      const matchesKeys = []; // 🔹 Nuevo: almacenar enfrentamientos de esta ronda

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

          // 🔹 Agregar los enfrentamientos al historial
          const jugadoresPartida = partidasData[i].jugadores.map((j) => j.id).filter(Boolean);
          if (jugadoresPartida.length === 4) {
            const pairA = normalizePair(jugadoresPartida[0], jugadoresPartida[1]);
            const pairB = normalizePair(jugadoresPartida[2], jugadoresPartida[3]);
            matchesKeys.push(normalizeMatchup(pairA, pairB));
          }
        }
      }

      // Guardar en Firestore incluyendo el historial de enfrentamientos
      await setDoc(doc(db, "juegos", juegoSeleccionado.id_juego.toString()), {
        rondaActual: rondaActualJuego,
        rondaIds: rondaIdsPorCancha,
        partidas: partidasData,
        historialEnfrentamientos: matchesKeys, // ✅ aquí guardamos la info para la próxima ronda
        actualizadoEn: new Date().toISOString(),
      });

      // Actualizar estado React (local)
      setRondaIds((prev) => ({
        ...prev,
        [juegoSeleccionado.id_juego]: rondaIdsPorCancha,
      }));

      setRondaActual((prev) => ({
        ...prev,
        [juegoSeleccionado.id_juego]: rondaActualJuego,
      }));
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
  pendientesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  pendientesTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  pendienteItem: {
    fontSize: 14,
    color: "#333",
    paddingVertical: 2,
  },
  pendientesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FFE6E6",
    borderRadius: 10,
  },

  pendientesTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: "#B00020",
  },

  pendienteItem: {
    paddingVertical: 4,
  },

  pendienteText: {
    fontSize: 14,
    color: "#333",
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
});

export default AmericanaParejas;
