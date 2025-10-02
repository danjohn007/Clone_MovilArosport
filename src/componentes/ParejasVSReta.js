import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import CustomButton from "./Buttons";
import {
  actualizarRonda,
  verificarMarcadorReta,
  terminarPartidaReta,
  terminarSetRonda,
} from "./Activos/Americana/RetaApiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TieBreakRonda from "../modales/TieBreakRonda";
import { Ionicons, FontAwesome5, SimpleLineIcons } from "@expo/vector-icons";

const ParejasVSReta = ({
  jugador1,
  jugador2,
  jugador3,
  jugador4,
  juegoNombre,
  puntos,
  onPuntosChange,
  resetPuntos,
  rondaIds,
  soyCreador,
}) => {
  console.log("ParejasVSReta - rondaIds recibido:", rondaIds);

  const [currentSet, setCurrentSet] = useState(1);
  const [setScores, setSetScores] = useState({
    set1: [0, 0],
    set2: [0, 0],
    set3: [0, 0],
  });
  // Ahora cada set tiene su propio tiebreak
  const [tiebreakScores, setTiebreakScores] = useState({
    tiebreak1: [0, 0],
    tiebreak2: [0, 0],
    tiebreak3: [0, 0],
  });
  const [showTiebreak, setShowTiebreak] = useState(false);
  const [tiebreakSetNumber, setTiebreakSetNumber] = useState(null); // Para saber a qué set corresponde el tiebreak

  const [totalScoresPareja1, setTotalScoresPareja1] = useState(0);
  const [totalScoresPareja2, setTotalScoresPareja2] = useState(0);
  const [ganadores, setGanadores] = useState(["", ""]);
  const [ganadorVisible, setGanadorVisible] = useState(false);
  const [editable, setEditable] = useState(true);
  const [ganadorJuego, setGanadorJuego] = useState(false);
  const [rondasCerradas, setRondasCerradas] = useState({});
  const [estadoPartida, setEstadoPartida] = useState(1);

  // Variables para el TieBreakRonda
  const [parejaTieBreak, setParejaTieBreak] = useState(null);
  const [puntajesTieBreak, setPuntajesTieBreak] = useState({});
  const [hayTiebreak, setHayTiebreak] = useState(false);

  const [estadoSets, setEstadoSets] = useState({
    set1: 1,
    set2: 1,
    set3: 1,
  });

  // Refs para los 6 inputs de sets
  const setInputRefs = [
    useRef(null), // set1 pareja1
    useRef(null), // set1 pareja2
    useRef(null), // set2 pareja1
    useRef(null), // set2 pareja2
    useRef(null), // set3 pareja1
    useRef(null), // set3 pareja2
  ];

  const calculateTotalScores = useCallback((currentSetScores) => {
    let team1Total = 0;
    let team2Total = 0;

    for (const setName in currentSetScores) {
      const [score1, score2] = currentSetScores[setName] || [0, 0];
      if (typeof score1 !== "number" || typeof score2 !== "number") continue;
      if (score1 > score2) {
        team1Total += 1;
      } else if (score2 > score1) {
        team2Total += 1;
      }
    }

    return { team1Total, team2Total };
  }, []);

  useEffect(() => {
    if (puntos) {
      const validatedScores = {
        set1: puntos.set1 || [0, 0],
        set2: puntos.set2 || [0, 0],
        set3: puntos.set3 || [0, 0],
      };
      setSetScores(validatedScores);
      const { team1Total, team2Total } = calculateTotalScores(validatedScores);
      setTotalScoresPareja1(team1Total);
      setTotalScoresPareja2(team2Total);

      if (team1Total === 1 && team2Total === 0) {
        setGanadores([jugador1, jugador3]);
        setGanadorVisible(true);
        setShowTiebreak(false);
      } else if (team2Total === 1 && team1Total === 0) {
        setGanadores([jugador2, jugador4]);
        setGanadorVisible(true);
        setShowTiebreak(false);
      } else {
        const allSetsPlayed = Object.values(validatedScores).every(
          ([score1, score2]) => score1 > 0 || score2 > 0
        );
        if (allSetsPlayed) {
          if (team1Total > team2Total && team1Total > 1) {
            setGanadores([jugador1, jugador3]);
            setGanadorVisible(true);
            setShowTiebreak(false);
          } else if (
            team2Total > team1Total && team2Total > 1
          ) {
            setGanadores([jugador2, jugador4]);
            setGanadorVisible(true);
            setShowTiebreak(false);
          } else if (team1Total === team2Total) {
            if (
              tiebreakScores.tiebreak1[0] <= 0 && tiebreakScores.tiebreak1[1] <= 0 &&
              tiebreakScores.tiebreak2[0] <= 0 && tiebreakScores.tiebreak2[1] <= 0 &&
              tiebreakScores.tiebreak3[0] <= 0 && tiebreakScores.tiebreak3[1] <= 0
            ) {
              setGanadorVisible(false);
            }
          }
        } else {
          setGanadorVisible(false);
          setShowTiebreak(false);
        }
      }
    }
  }, [puntos, calculateTotalScores]);

  useEffect(() => {
    if (resetPuntos) {
      const resetScores = {
        set1: [0, 0],
        set2: [0, 0],
        set3: [0, 0],
      };
      setSetScores(resetScores);
      setCurrentSet(1);
      setTotalScoresPareja1(0);
      setTotalScoresPareja2(0);
      onPuntosChange({
        ...resetScores,
        isInTiebreak: false,
        tiebreakScore: { pareja1: 0, pareja2: 0 },
      });
      setGanadorVisible(false);
      setGanadores(["", ""]);
      setShowTiebreak(false);
    }
  }, [resetPuntos, onPuntosChange]);

  // Ya no es necesario reiniciar tiebreakScore, porque ahora es tiebreakScores por set

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const [marcador1, marcador2] = await Promise.all([
          verificarMarcadorReta(rondaIds.idRondaJuego),
          verificarMarcadorReta(rondaIds.idRondaJuego2),
        ]);
        //console.log("Marcadores recibidos:", { marcador1, marcador2 });
        setEstadoPartida(marcador1[6]); 
        if (estadoPartida === "1") {
          setEditable(true);
          setHayTiebreak(false);
          setEstadoSets({
            set1: marcador1[7],
            set2: marcador1[8],
            set3: marcador1[9]
          });
        }
        if (marcador1[6] == "2" || marcador1[6] == 2) {
          setEditable(false);
          // Si la partida está terminada y hay marcador de tiebreak, setear hayTiebreak a true
          if (
            tiebreakScores.tiebreak1[0] > 0 ||
            tiebreakScores.tiebreak1[1] > 0 ||
            tiebreakScores.tiebreak2[0] > 0 ||
            tiebreakScores.tiebreak2[1] > 0 ||
            tiebreakScores.tiebreak3[0] > 0 ||
            tiebreakScores.tiebreak3[1] > 0
          ) {
            setHayTiebreak(true);
          }
          if (
            totalScoresPareja1 > totalScoresPareja2 &&
            totalScoresPareja1 > 1
          ) {
            setGanadores([jugador1, jugador3]);
            setGanadorJuego(true);
          } else if (
            totalScoresPareja2 > totalScoresPareja1 &&
            totalScoresPareja2 > 1
          ) {
            setGanadores([jugador2, jugador4]);
            setGanadorJuego(true);
          } else if (totalScoresPareja1 === totalScoresPareja2) {
            // Aquí podrías decidir el ganador por tiebreak de cada set si lo deseas
          }
        }
        if (marcador1 && marcador2) {
          const updatedScores = {
            set1: [parseInt(marcador1[0]) || 0, parseInt(marcador2[0]) || 0],
            set2: [parseInt(marcador1[1]) || 0, parseInt(marcador2[1]) || 0],
            set3: [parseInt(marcador1[2]) || 0, parseInt(marcador2[2]) || 0],
          };
          // Extraer tiebreaks de las posiciones 4,5,6
          const tiebreaks = {
            tiebreak1: [parseInt(marcador1[3]) || 0, parseInt(marcador2[3]) || 0],
            tiebreak2: [parseInt(marcador1[4]) || 0, parseInt(marcador2[4]) || 0],
            tiebreak3: [parseInt(marcador1[5]) || 0, parseInt(marcador2[5]) || 0],
          };
          const scoresChanged =
            setScores.set1[0] !== updatedScores.set1[0] ||
            setScores.set1[1] !== updatedScores.set1[1] ||
            setScores.set2[0] !== updatedScores.set2[0] ||
            setScores.set2[1] !== updatedScores.set2[1] ||
            setScores.set3[0] !== updatedScores.set3[0] ||
            setScores.set3[1] !== updatedScores.set3[1];

          if (scoresChanged) {
            setSetScores(updatedScores);
            onPuntosChange(updatedScores);
            const { team1Total, team2Total } =
              calculateTotalScores(updatedScores);
            setTotalScoresPareja1(team1Total);
            setTotalScoresPareja2(team2Total);
            if (
              team1Total === team2Total &&
              (team1Total > 0 || team2Total > 0)
            ) {
              //setShowTiebreak(true);
            } else {
              setShowTiebreak(false);
            }
          }
          // Actualizar tiebreaks por set
          setTiebreakScores(tiebreaks);
        } else {
          console.warn("No se pudieron obtener los marcadores válidos");
        }
      } catch (error) {
        console.error("Error al verificar marcadores:", error);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [
    rondaIds.idRondaJuego,
    rondaIds.idRondaJuego2,
    onPuntosChange,
    calculateTotalScores,
    setScores,
    tiebreakScores,
  ]);

  // Cargar rondas cerradas al montar
  useEffect(() => {
    const cargarCerradas = async () => {
      try {
        const data = await AsyncStorage.getItem("rondasCerradas");
        if (data) setRondasCerradas(JSON.parse(data));
      } catch (e) {
        console.error("Error cargando rondas cerradas:", e);
      }
    };
    cargarCerradas();
  }, []);

  // Guardar rondas cerradas en AsyncStorage cada vez que cambian
  useEffect(() => {
    AsyncStorage.setItem(
      "rondasCerradas",
      JSON.stringify(rondasCerradas)
    ).catch((e) => {
      console.error("Error guardando rondas cerradas:", e);
    });
  }, [rondasCerradas]);

  const handleSetScoreChange = (setNumber, pareja1Score, pareja2Score) => {
    // Asegurarnos de que tenemos una estructura inicial válida
    const currentScores = {
      set1: setScores.set1 || [0, 0],
      set2: setScores.set2 || [0, 0],
      set3: setScores.set3 || [0, 0],
    };

    const prevScore1 = setScores[`set${setNumber}`][0];
    const prevScore2 = setScores[`set${setNumber}`][1];
    const newSetScores = {
      ...currentScores,
      [`set${setNumber}`]: [pareja1Score, pareja2Score],
    };

    // Solo mostrar el modal si el cambio es de un valor distinto a 6-6 a exactamente 6-6
    if (
      pareja1Score === 6 && pareja2Score === 6 &&
      (prevScore1 !== 6 || prevScore2 !== 6)
    ) {
      setTiebreakSetNumber(setNumber);
      setShowTiebreak(true);
    } else if (
      // Si se sale de 6-6, cerrar el modal y limpiar tiebreakSetNumber
      (prevScore1 === 6 && prevScore2 === 6) &&
      (pareja1Score !== 6 || pareja2Score !== 6)
    ) {
      setShowTiebreak(false);
      setTiebreakSetNumber(null);
    }

    setSetScores(newSetScores);
    onPuntosChange(newSetScores);
    const { team1Total, team2Total } = calculateTotalScores(newSetScores);
    setTotalScoresPareja1(team1Total);
    setTotalScoresPareja2(team2Total);

    const tieBreakArray = [
      [
        tiebreakScores.tiebreak1[0], // pareja1 set1
        tiebreakScores.tiebreak2[0], // pareja1 set2
        tiebreakScores.tiebreak3[0], // pareja1 set3
      ],
      [
        tiebreakScores.tiebreak1[1], // pareja2 set1
        tiebreakScores.tiebreak2[1], // pareja2 set2
        tiebreakScores.tiebreak3[1], // pareja2 set3
      ],
    ];

    actualizarRonda(
      rondaIds.idRondaJuego,
      rondaIds.idRondaJuego2,
      newSetScores,
      tieBreakArray
    )
      .then((response) => {
        console.log("Respuesta de la API:", response);
      })
      .catch((error) => {
        console.error("Error en la actualización de la ronda:", error);
      });
  };

  const handleTiebreakScoreChange = (pareja1Score, pareja2Score) => {
    const newTiebreakScore = [pareja1Score, pareja2Score];
    // Elimina setTiebreakScore, solo actualiza tiebreakScores si lo necesitas
    onPuntosChange({
      ...setScores,
      isInTiebreak: true,
      tiebreakScore: { pareja1: pareja1Score, pareja2: pareja2Score },
    });

    // Verificar si hay ganador (solo para mostrar visualmente)
    if (pareja1Score >= 7 && pareja1Score - pareja2Score >= 2) {
      setGanadores([jugador1, jugador3]);
      setGanadorVisible(true);
    } else if (pareja2Score >= 7 && pareja2Score - pareja1Score >= 2) {
      setGanadores([jugador2, jugador4]);
      setGanadorVisible(true);
    } else {
      setGanadorVisible(false);
    }
  };

  // Nueva función centralizada para finalizar la ronda
  const finalizarRonda = () => {
    setHayTiebreak(false);
    setGanadorVisible(false);
    setGanadorJuego(true);
    setEditable(false);
    setCurrentSet(1); 
    const nuevasCerradas = { ...rondasCerradas, [rondaIds.idRondaJuego]: true };
    setRondasCerradas(nuevasCerradas);
    terminarPartidaReta(rondaIds.idRondaJuego);
    terminarPartidaReta(rondaIds.idRondaJuego2);
  };

  const onConfirmTieBreak = (puntajesValidos) => {
    // Si viene de un set específico (por 6-6), guardar el tiebreak en el set correspondiente
    if (tiebreakSetNumber) {
      const canchaId = rondaIds.idRondaJuego;
      const puntaje = puntajesValidos[canchaId];
      if (puntaje) {
        const pareja1Score = parseInt(puntaje.pareja1) || 0;
        const pareja2Score = parseInt(puntaje.pareja2) || 0;
        // Determinar ganador del tiebreak
        let nuevoSetScores = { ...setScores };
        if (pareja1Score > pareja2Score) {
          // Pareja 1 gana el set: marcador 7-6
          nuevoSetScores[`set${tiebreakSetNumber}`] = [7, 6];
        } else if (pareja2Score > pareja1Score) {
          // Pareja 2 gana el set: marcador 6-7
          nuevoSetScores[`set${tiebreakSetNumber}`] = [6, 7];
        }
        setSetScores(nuevoSetScores);
        setTiebreakScores((prev) => {
          const nuevosTiebreaks = {
            ...prev,
            [`tiebreak${tiebreakSetNumber}`]: [pareja1Score, pareja2Score],
          };
          // Enviar actualización al backend con los nuevos tiebreaks y el nuevo marcador de set
          const tieBreakArray = [
            [
              nuevosTiebreaks.tiebreak1[0],
              nuevosTiebreaks.tiebreak2[0],
              nuevosTiebreaks.tiebreak3[0],
            ],
            [
              nuevosTiebreaks.tiebreak1[1],
              nuevosTiebreaks.tiebreak2[1],
              nuevosTiebreaks.tiebreak3[1],
            ],
          ];
          actualizarRonda(
            rondaIds.idRondaJuego,
            rondaIds.idRondaJuego2,
            nuevoSetScores,
            tieBreakArray
          ).then((response) => {
            console.log("Respuesta de la API (tiebreak registrado):", response);
          }).catch((error) => {
            console.error("Error al actualizar tiebreak en la ronda:", error);
          });
          return nuevosTiebreaks;
        });
        terminarSetRonda(rondaIds.idRondaJuego, currentSet);
        terminarSetRonda(rondaIds.idRondaJuego2, currentSet);
        if (currentSet < 3) {
          setCurrentSet(currentSet + 1);
        }
        if (currentSet === 3) {
          finalizarRonda();
        }
        setShowTiebreak(false);
        setTiebreakSetNumber(null);
        return;
      }
    }
    // Si no, es el tiebreak global (empate en sets)
    const canchaId = rondaIds.idRondaJuego;
    const puntaje = puntajesValidos[canchaId];
    if (puntaje) {
      const pareja1Score = parseInt(puntaje.pareja1) || 0;
      const pareja2Score = parseInt(puntaje.pareja2) || 0;

      actualizarRondaReta(
        rondaIds.idRondaJuego,
        rondaIds.idRondaJuego2,
        setScores,
        [pareja1Score, pareja2Score]
      )
        .then((response) => {
          console.log("Respuesta de la API (tiebreak confirmado):", response);
          // Solo después de guardar exitosamente, actualizar el estado local
          // setTiebreakScore([pareja1Score, pareja2Score]);
          onPuntosChange({
            ...setScores,
            isInTiebreak: true,
            tiebreakScore: { pareja1: pareja1Score, pareja2: pareja2Score },
          });

          // Verificar si hay ganador
          if (pareja1Score >= 7 && pareja1Score - pareja2Score >= 2) {
            setGanadores([jugador1, jugador3]);
            setGanadorVisible(true);
          } else if (pareja2Score >= 7 && pareja2Score - pareja1Score >= 2) {
            setGanadores([jugador2, jugador4]);
            setGanadorVisible(true);
          }
          setShowTiebreak(false);
          finalizarRonda();
        })
        .catch((error) => {
          console.error(
            "Error en la actualización de la ronda (tiebreak):",
            error
          );
          Alert.alert(
            "Error",
            "No se pudo guardar el tiebreak. Inténtalo de nuevo.",
            [{ text: "OK" }]
          );
        });
    } else {
      setShowTiebreak(false);
    }
  };

  useEffect(() => {
    if (showTiebreak) {
      setParejaTieBreak([
        {
          canchaIndex: rondaIds.idRondaJuego,
          nombre_cancha: "Cancha Principal",
          jugadores: [jugador1, jugador3, jugador2, jugador4],
        },
      ]);
      const puntajesActuales = puntajesTieBreak[rondaIds.idRondaJuego];
      if (
        !puntajesActuales ||
        (puntajesActuales.pareja1 === "0" && puntajesActuales.pareja2 === "0")
      ) {
        // Si es tiebreak de un set específico, inicializar con el valor correspondiente
        if (tiebreakSetNumber) {
          setPuntajesTieBreak({
            [rondaIds.idRondaJuego]: {
              pareja1:
                tiebreakScores[`tiebreak${tiebreakSetNumber}`][0]?.toString() === ''
                  ? null
                  : parseInt(tiebreakScores[`tiebreak${tiebreakSetNumber}`][0]),
              pareja2:
                tiebreakScores[`tiebreak${tiebreakSetNumber}`][1]?.toString() === ''
                  ? null
                  : parseInt(tiebreakScores[`tiebreak${tiebreakSetNumber}`][1]),
            },
          });
        } else {
          setPuntajesTieBreak({
            [rondaIds.idRondaJuego]: {
              pareja1: "",
              pareja2: "",
            },
          });
        }
      }
    }
  }, [
    showTiebreak,
    rondaIds.idRondaJuego,
    jugador1,
    jugador3,
    jugador2,
    jugador4,
    tiebreakSetNumber,
    tiebreakScores,
  ]);

  const validarReglas = () => {
    const sets = ["set1", "set2", "set3"];
    const errores = [];

    for (const setKey of sets) {
      const [score1, score2] = setScores[setKey] || [0, 0];
      const totalPuntos = score1 + score2;
      const diferencia = Math.abs(score1 - score2);
      if (score1 > 0 || score2 > 0) {
        if (totalPuntos < 6) {
          errores.push(
            `El ${setKey.toUpperCase()} debe tener al menos 6 puntos en total (actual: ${totalPuntos})`
          );
        }
        if (score1 > 0 && score2 > 0 && score1 === score2 && score1 !== 6) {
          errores.push(
            `El ${setKey.toUpperCase()} no puede terminar en empate (${score1}-${score2}) solo 6-6`
          );
        }
        if (score1 > 7 || score2 > 7) {
          errores.push(
            `En el ${setKey.toUpperCase()}, ningún equipo puede tener más de 7 puntos (${score1}-${score2})`
          );
        }
      }
    }
    // Validar tiebreaks por set
    [1,2,3].forEach((num) => {
      const tb = tiebreakScores[`tiebreak${num}`];
      if (tb && (tb[0] > 0 || tb[1] > 0)) {
        const tiebreakTotal = tb[0] + tb[1];
        const tiebreakDiferencia = Math.abs(tb[0] - tb[1]);
        if (tb[0] >= 7 && tiebreakDiferencia < 2) {
          errores.push(
            `En el TIEBREAK del set ${num}, para ganar con 7 puntos debe haber diferencia de 2 (${tb[0]}-${tb[1]})`
          );
        }
        if (tb[1] >= 7 && tiebreakDiferencia < 2) {
          errores.push(
            `En el TIEBREAK del set ${num}, para ganar con 7 puntos debe haber diferencia de 2 (${tb[0]}-${tb[1]})`
          );
        }
        if (
          tb[0] > 0 &&
          tb[1] > 0 &&
          tb[0] === tb[1]
        ) {
          errores.push(
            `El TIEBREAK del set ${num} no puede terminar en empate (${tb[0]}-${tb[1]})`
          );
        }
      }
    });

    return errores;
  };

  // Función para verificar si hay errores en los sets
  const verificarErroresEnSets = () => {
    const sets = ["set1", "set2", "set3"];
    const erroresEnSets = [];

    for (const setKey of sets) {
      const setNumber = setKey.replace("set", "");
      const [score1, score2] = setScores[setKey] || [0, 0];
      const errores = validarSet(parseInt(setNumber), score1, score2);

      if (errores && errores.length > 0) {
        erroresEnSets.push(`SET ${setNumber}: ${errores.join(", ")}`);
      }
    }

    return erroresEnSets;
  };

  const handleTerminarRonda = () => {
    // Primero verificar errores en los sets individuales
    const erroresEnSets = verificarErroresEnSets();
    if (erroresEnSets.length > 0) {
      Alert.alert(
        "Errores en los sets",
        `Corrige los siguientes errores antes de terminar la ronda:\n\n${erroresEnSets.join("\n")}`,
        [{ text: "OK" }]
      );
      return;
    }

    // Luego validar las reglas generales
    const errores = validarReglas();
    if (errores.length > 0) {
      Alert.alert(
        "Error en las puntuaciones",
        `No se puede terminar la ronda:\n\n${errores.join("\n")}`,
        [{ text: "OK" }]
      );
      return;
    }

    // Validar si el tercer set está en empate 6-6 y no hay tiebreak guardado
    const [score1Set3, score2Set3] = setScores.set3 || [0, 0];
    const tiebreakSet3 = tiebreakScores.tiebreak3 || [0, 0];
    if (score1Set3 === 6 && score2Set3 === 6 && tiebreakSet3[0] === 0 && tiebreakSet3[1] === 0) {
      setTiebreakSetNumber(3);
      setShowTiebreak(true);
      return;
    } else {
      terminarSetRonda(rondaIds.idRondaJuego, 3);
      terminarSetRonda(rondaIds.idRondaJuego2, 3);
    }
    
    finalizarRonda();
  };

  // Función para validar un set específico
  const validarSet = (setNumber, score1, score2) => {
    const totalPuntos = score1 + score2;
    const diferencia = Math.abs(score1 - score2);

    if (score1 === 0 && score2 === 0) return [];
    const errores = [];
    if (score1 < 6 && score2 < 6) {
      errores.push(`Al menos un equipo debe tener 6 puntos`);
    }
    if (score1 < 0 || score2 < 0) {
      errores.push(`No se permiten valores negativos`);
    }
    if (score1 === score2 && score1 !== 6) {
      errores.push(`No puede terminar en empate que no sea 6-6`);
    }
    // Validación refinada para resultados mayores a 6
    const max = Math.max(score1, score2);
    const min = Math.min(score1, score2);
    const msg = `Máximo 6 puntos, solo se puede terminar en 7-6, 6-7, 7-5 o 5-7`;

    // Bloquea cualquier marcador con más de 7 games (8-6, 9-7, etc.)
    if (max > 7) {
      errores.push(msg);
    } else if (max === 7) {
      if (!(min === 5 || min === 6)) {
        errores.push(msg);
      }
    } else if (max === 6 && min !== max) {
      // 6-0 a 6-5 permitidos (6-5 es válido como marcador antes de cerrar en 7-5/7-6)
    }
    return errores;
  };

  const getSetErrorStyle = (setNumber) => {
    const scores = setScores[`set${setNumber}`] || [0, 0];
    const errores = validarSet(parseInt(setNumber), scores[0], scores[1]);
    // Solo resaltar si hay errores en este set
    if (errores && errores.length > 0) {
      return { borderColor: "colors.error", borderWidth: 2 };
    }
    return {};
  };

  // Modificar renderSetScore para usar refs y pasar el foco
  const renderSetScore = (setNumber) => {
    const scores = setScores[`set${setNumber}`] || [0, 0];
    const errores = validarSet(parseInt(setNumber), scores[0], scores[1]);
    // Calcular el índice base para los refs
    const refIndex1 = (setNumber - 1) * 2;
    const refIndex2 = refIndex1 + 1;
    // Determinar si el set está bloqueado
    const bloqueado = estadoSets[`set${setNumber}`] !== "1";
    // Determinar si el set actual tiene tiebreak
    const tieneTiebreak = tiebreakScores[`tiebreak${setNumber}`] && (tiebreakScores[`tiebreak${setNumber}`][0] > 0 || tiebreakScores[`tiebreak${setNumber}`][1] > 0);
    return (
      <View style={styles.containerErrors}>
        <View
          style={[ 
            styles.setRow,
            styles.currentSetRow,
            !tieneTiebreak ? { position: "absolute" } : { position: "relative" },
          ]}
        >
          <TextInput
            ref={setInputRefs[refIndex1]}
            style={[ 
              styles.scoreInput,
              styles.currentScoreInput,
              getSetErrorStyle(setNumber),
            ]}
            keyboardType="number-pad"
            textAlign="center"
            returnKeyType="done"
            value={scores[0] ? String(scores[0]) : ""}
            placeholder="0"
            placeholderTextColor="#fff"
            onChangeText={(text) => {
              if (bloqueado) return;
              const sanitized = text.replace(/[^0-7]/g, "").slice(0, 1);
              const newScore = sanitized === "" ? "" : parseInt(sanitized, 10);
              handleSetScoreChange(setNumber, newScore, scores[1]);
              if (sanitized && setInputRefs[refIndex2]) {
                setInputRefs[refIndex2].current?.focus();
              }
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            maxLength={1}
            editable={editable && !bloqueado}
          />
          <View style={styles.setInfoContainer}>
            <Text style={[styles.setLabel, styles.currentSetLabel]}>-</Text>
          </View>
          <TextInput
            ref={setInputRefs[refIndex2]}
            style={[ 
              styles.scoreInput,
              styles.currentScoreInput,
              getSetErrorStyle(setNumber),
            ]}
            keyboardType="number-pad"
            textAlign="center"
            returnKeyType="done"
            value={scores[1] ? String(scores[1]) : ""}
            placeholder="0"
            placeholderTextColor="#fff"
            onChangeText={(text) => {
              if (bloqueado) return;
              const sanitized = text.replace(/[^0-7]/g, "").slice(0, 1);
              const newScore = sanitized === "" ? "" : parseInt(sanitized, 10);
              handleSetScoreChange(setNumber, scores[0], newScore);
              if (sanitized) {
                const nextRefIndex = refIndex2 + 1;
                if (setInputRefs[nextRefIndex]) {
                  setInputRefs[nextRefIndex].current?.focus();
                }
              }
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            maxLength={1}
            editable={editable && !bloqueado}
          />
        </View>
        {/* Mostrar errores del set solo si existen */}
        {errores && errores.length > 0 && (
          <View
            style={[ 
              styles.errorContainer,
              setNumber === 3 ? { marginTop: 47 } : {},
            ]}
          >
            <Text style={styles.errorText}>
              <Ionicons name="alert-circle-outline" />
            </Text>
            {errores.map((err, idx) => (
              <Text style={styles.errorText} key={idx}>
                {typeof err === "string" ? err : JSON.stringify(err)}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Función para determinar si un equipo es ganador
  const isTeamWinner = (teamNumber) => {
    if (!ganadorVisible && !ganadorJuego) return false;

    if (ganadores[0] === jugador1 && ganadores[1] === jugador3) {
      return teamNumber === 1;
    } else if (ganadores[0] === jugador2 && ganadores[1] === jugador4) {
      return teamNumber === 2;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.boardContainer}>
        <Text style={styles.gameTitle}>{juegoNombre}</Text>

        <View style={styles.playersAndScoresContainer}>
          <View style={styles.teamScoreColumn}>
            {isTeamWinner(1) && (
              <FontAwesome5
                name="crown"
                size={24}
                color="gold"
                style={[styles.trophyIcon, { left: 6 }]}
              />
            )}
            <View style={styles.playerNameContainer}>
              <Text style={styles.playerUpperText}>{jugador2}</Text>
            </View>
            <View style={styles.playerNameContainer}>
              <Text style={styles.playerLowerText}>{jugador4}</Text>
            </View>
          </View>

          <Text style={styles.vsTextCentered}>VS</Text>

          <View style={styles.teamScoreColumn}>
            {isTeamWinner(2) && (
              <FontAwesome5
                name="crown"
                size={24}
                color="gold"
                style={[styles.trophyIcon, { right: 6 }]}
              />
            )}
            <View
              style={[
                styles.playerNameContainer,
                { justifyContent: "flex-end" },
              ]}
            >
              <Text style={styles.playerUpperText}>{jugador1}</Text>
            </View>
            <View
              style={[
                styles.playerNameContainer,
                { justifyContent: "flex-end" },
              ]}
            >
              <Text style={styles.playerLowerText}>{jugador3}</Text>
            </View>
          </View>
        </View>
        <View style={styles.setsContainer}>
          {renderSetScore(currentSet)}
          {/* Mostrar marcador de tiebreak solo si hay tiebreak en el set actual */}
          {tiebreakScores[`tiebreak${currentSet}`] &&
            (tiebreakScores[`tiebreak${currentSet}`][0] > 0 ||
              tiebreakScores[`tiebreak${currentSet}`][1] > 0) && (
              <View style={styles.tiebreakScoreTextContainer}>
                <View style={styles.tiebreakScoreRow}>
                  <Text style={styles.tiebreakScoreValue}>
                    {tiebreakScores[`tiebreak${currentSet}`][0]}
                  </Text>
                  <Text style={styles.tiebreakScoreSeparator}>TieBreak</Text>
                  <Text style={styles.tiebreakScoreValue}>
                    {tiebreakScores[`tiebreak${currentSet}`][1]}
                  </Text>
                </View>
              </View>
            )}
        </View>
      </View>

      {/* Botón para avanzar al siguiente set o terminar partida */}
      <View style={
        (currentSet === 3 && soyCreador && estadoPartida === "1")
          ? [styles.buttonsRow, {justifyContent: "space-between"}]
          : [styles.buttonsRow, { justifyContent: "space-between"}]
      }>
        <Pressable
          onPress={() => {
            if (currentSet > 1) {
              setCurrentSet(currentSet - 1);
            }
          }}
          disabled={currentSet === 1}
          style={[styles.prevButton, currentSet === 1 && { opacity: 0.5 }]}
        >
          <SimpleLineIcons name="arrow-left" size={16} color="#fff" />
        </Pressable>
        {currentSet === 3 && soyCreador && estadoPartida === "1" && (
          <Pressable
            onPress={handleTerminarRonda}
            disabled={
              (() => {
                // Si algún set está 0-0 o tiene errores, deshabilitar
                const sets = ["set1", "set2", "set3"];
                for (const setKey of sets) {
                  const [score1, score2] = setScores[setKey] || [0, 0];
                  if ((score1 === 0 && score2 === 0)) return true;
                  const setNumber = parseInt(setKey.replace("set", ""));
                  const errores = validarSet(setNumber, score1, score2);
                  if (errores && errores.length > 0) return true;
                }
                return false;
              })()
            }
            style={[
              styles.finishButton,
              (() => {
                const sets = ["set1", "set2", "set3"];
                for (const setKey of sets) {
                  const [score1, score2] = setScores[setKey] || [0, 0];
                  if ((score1 === 0 && score2 === 0)) return { opacity: 0.5 };
                  const setNumber = parseInt(setKey.replace("set", ""));
                  const errores = validarSet(setNumber, score1, score2);
                  if (errores && errores.length > 0) return { opacity: 0.5 };
                }
                return {};
              })(),
            ]}
          >
            <Text style={styles.finishButtonText}>Terminar Partida</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            // Validar el set actual antes de avanzar
            const scores = setScores[`set${currentSet}`] || [0, 0];
            const errores = validarSet(currentSet, scores[0], scores[1]);
            if (errores && errores.length > 0) {
              Alert.alert(
                "Errores en el set",
                `Corrige los siguientes errores antes de avanzar al siguiente set:\n\n${errores.join("\n")}`,
                [{ text: "OK" }]
              );
              return;
            }
            // Si hay errores, no permitir avanzar
            if (errores && errores.length > 0) {
              return;
            }
            if (scores[0] === 0 && scores[1] === 0) {
              setCurrentSet(currentSet + 1)
              return;
            }
            if (estadoSets[`set${currentSet}`] == "2") {
              setCurrentSet(currentSet + 1);
              return;
            } else {
              // Si el marcador es 6-6 y NO hay tiebreak registrado, mostrar el tiebreak para ese set y NO avanzar
              const tiebreakActual = tiebreakScores[`tiebreak${currentSet}`] || [0, 0];
              if (
                scores[0] === 6 &&
                scores[1] === 6 &&
                tiebreakActual[0] === 0 &&
                tiebreakActual[1] === 0
              ) {
                setTiebreakSetNumber(currentSet);
                setShowTiebreak(true);
                return;
              }
              // Si ya hay tiebreak registrado o no es 6-6, avanzar de set normalmente
              terminarSetRonda(rondaIds.idRondaJuego, currentSet);
              terminarSetRonda(rondaIds.idRondaJuego2, currentSet);
              setCurrentSet(currentSet + 1);
            }
          }}
          disabled={currentSet === 3 || (validarSet(currentSet, (setScores[`set${currentSet}`]||[0,0])[0], (setScores[`set${currentSet}`]||[0,0])[1]).length > 0)}
          style={[styles.nextButton, currentSet === 3 && { opacity: 0.5 }]}
        >
          <SimpleLineIcons name="arrow-right" size={16} color="#fff" />
        </Pressable>
      </View>

      

      {estadoPartida === "1" && soyCreador && (
        <TieBreakRonda
          visible={showTiebreak}
          onClose={() => {
            setShowTiebreak(false);
            setTiebreakSetNumber(null);
          }}
          onConfirm={onConfirmTieBreak}
          pareja={parejaTieBreak}
          puntajes={
            puntajesTieBreak[rondaIds.idRondaJuego] || {
              pareja1: "",
              pareja2: "",
            }
          }
          setPuntajes={(nuevoPuntaje) =>
            setPuntajesTieBreak((prev) => ({
              ...prev,
              [rondaIds.idRondaJuego]: nuevoPuntaje,
            }))
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "110%",
    maxWidth: 500,
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 0,
    paddingHorizontal: 10,
  },
  boardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "colors.primary",
    elevation: 5,
    position: "relative",
  },
  gameTitle: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
    backgroundColor: "colors.primary",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 40,
    overflow: "hidden",
    textTransform: "uppercase",
    letterSpacing: 1,
    alignSelf: "center",
    position: "absolute",
    top: -20,
    borderWidth: 3,
    borderColor: "#fff",
    width: "65%",
    textAlign: "center",
  },
  playersAndScoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 34,
    padding: 10,
  },
  teamScoreColumn: {
    flex: 1,
  },
  playerNameContainer: {
    flexDirection: "row",
  },
  playerUpperText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 30,
  },
  playerLowerText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 6,
  },
  totalScoreContainer: {
    backgroundColor: "#f0faff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#d0f0ff",
    minWidth: 45,
  },
  totalTeamScore: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "colors.primary",
    fontWeight: "700",
    textAlign: "center",
  },
  vsTextCentered: {
    fontSize: 21,
    color: "#000",
    fontWeight: "500",
    marginHorizontal: 8,
    top: -3,
  },
  setsContainer: {
    marginTop: 8,
    alignContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 1,
    backgroundColor: "colors.primary",
    borderRadius: 16,
    height: 45,
    borderWidth: 3,
    borderColor: "#fff",
    width: "70%",
    gap: 15,
  },
  currentSetRow: {
    backgroundColor: "colors.primary",
  },
  setInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  setLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    fontFamily: "Poppins-Bold",
    marginHorizontal: 8,
  },
  currentSetLabel: {
    color: "#fff",
  },
  currentSetIndicator: {
    color: "colors.primary",
    fontSize: 24,
    marginLeft: 4,
    lineHeight: 20,
  },
  scoreInput: {
    width: 42,
    height: 45,
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#444",
    borderRadius: 8,
    textAlign: "center",
  },
  currentScoreInput: {
    borderColor: "colors.primary",
    color: "white",
  },
  ganadoresText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#e1a900",
    textAlign: "center",
  },
  ganadoresContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaeb",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffd858",
    width: "100%",
  },
  iconWinners: {
    marginRight: "3%",
  },
  tiebreakRow: {
    backgroundColor: "#fff3e0",
    borderColor: "#ff9800",
    borderWidth: 1.5,
    marginTop: 10,
  },
  tiebreakLabel: {
    color: "#ff9800",
  },
  tiebreakInput: {
    backgroundColor: "#fff",
    borderColor: "#ff9800",
    color: "#000",
    borderWidth: 1.5,
  },
  errorContainer: {
    width: "95%",
    alignSelf: "center",
    marginTop: "15%",
  },
  errorText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: "colors.error",
    textAlign: "center",
  },
  containerErrors: {
    width: "110%",
    alignItems: "center",
  },
  trophyIcon: {
    position: "absolute",
    top: -34,
  },
  buttonContainer: {
    alignItems: "center",
  },
  //TIEBREAK estilos
  tiebreakScoreTextContainer: {
    alignItems: "center",
    backgroundColor: "colors.primary",
    borderRadius: 16,
    padding: 8,
    borderWidth: 3,
    borderColor: "#FFF",
    width: "50%",
    alignSelf: "center",
    position: "absolute",
    top: "100%",
  },
  tiebreakScoreTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e1a900",
    marginBottom: 4,
  },
  tiebreakScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tiebreakScoreValue: {
    fontSize: 14,
    color: "#FFF",
    marginHorizontal: 2,
  },
  tiebreakScoreSeparator: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "bold",
    marginHorizontal: 2,
  },
  //Botones de los sets
  buttonsRow: {
    marginTop: "10%",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  prevButton: {
    backgroundColor: "colors.primary",
    padding: 12,
    borderRadius: 16,
    width: "15%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  nextButton: {
    backgroundColor: "colors.primary",
    padding: 12,
    borderRadius: 16,
    width: "15%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  finishButton: {
    backgroundColor: "colors.primary",
    paddingVertical: 10,
    borderRadius: 30,
    width: 205,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  finishButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default ParejasVSReta;
