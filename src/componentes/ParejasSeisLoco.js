import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import CustomButton from "./Buttons";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  actualizarRondaReta,
  verificarMarcador,
  terminarPartidaReta,
} from "./Activos/Americana/RetaApiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TieBreakRonda from "../modales/TieBreakRonda";
import { Ionicons } from "@expo/vector-icons";
import colors from "../styles/colors";

const ParejasSeisLoco = ({
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
  console.log("ParejasSeisLoco - rondaIds recibido:", rondaIds);

  const [currentSet, setCurrentSet] = useState(1);
  const [setScores, setSetScores] = useState({
    set1: [0, 0],
    set2: [0, 0],
    set3: [0, 0],
  });
  const [tiebreakScore, setTiebreakScore] = useState([0, 0]);
  const [showTiebreak, setShowTiebreak] = useState(false);

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

      // Verificar si todos los sets tienen puntuación
      const allSetsPlayed = Object.values(validatedScores).every(
        ([score1, score2]) => score1 > 0 || score2 > 0
      );

      if (allSetsPlayed) {
        if (totalScoresPareja1 > totalScoresPareja2 && totalScoresPareja1 > 1) {
          setGanadores([jugador1, jugador3]);
          setGanadorVisible(true);
          setShowTiebreak(false);
        } else if (
          totalScoresPareja2 > totalScoresPareja1 &&
          totalScoresPareja2 > 1
        ) {
          setGanadores([jugador2, jugador4]);
          setGanadorVisible(true);
          setShowTiebreak(false);
        } else if (totalScoresPareja1 === totalScoresPareja2) {
          if (tiebreakScore[0] <= 0 && tiebreakScore[1] <= 0) {
            setGanadorVisible(false);
          }
        }
      } else {
        setGanadorVisible(false);
        setShowTiebreak(false);
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
      setTiebreakScore([0, 0]);
      setShowTiebreak(false);
    }
  }, [resetPuntos, onPuntosChange]);

  useEffect(() => {
    if (!showTiebreak) {
      // Solo reiniciar tiebreak si no hay puntajes válidos
      if (tiebreakScore[0] === 0 && tiebreakScore[1] === 0) {
        setTiebreakScore([0, 0]);
        onPuntosChange({
          ...setScores,
          isInTiebreak: false,
          tiebreakScore: { pareja1: 0, pareja2: 0 },
        });
      }
    }
  }, [showTiebreak]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const [marcador1, marcador2] = await Promise.all([
          verificarMarcador(rondaIds.idRondaJuego),
          verificarMarcador(rondaIds.idRondaJuego2),
        ]);
        console.log("Marcadores recibidos:", { marcador1, marcador2 });
        setEstadoPartida(marcador1[4]);
        if (estadoPartida === "2" || estadoPartida === "3") {
          setEditable(false);
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
            if (tiebreakScore[0] > tiebreakScore[1] || tiebreakScore[0] == 5) {
              setGanadores([jugador1, jugador3]);
              setGanadorJuego(true);
            } else if (
              tiebreakScore[1] > tiebreakScore[0] ||
              tiebreakScore[1] == 5
            ) {
              setGanadores([jugador2, jugador4]);
              setGanadorJuego(true);
            }
          }
        }
        if (marcador1 && marcador2) {
          const updatedScores = {
            set1: [parseInt(marcador1[0]) || 0, parseInt(marcador2[0]) || 0],
            set2: [parseInt(marcador1[1]) || 0, parseInt(marcador2[1]) || 0],
            set3: [parseInt(marcador1[2]) || 0, parseInt(marcador2[2]) || 0],
          };
          let tiebreak1 =
            marcador1[3] !== undefined ? parseInt(marcador1[3]) : 0;
          let tiebreak2 =
            marcador2[3] !== undefined ? parseInt(marcador2[3]) : 0;
          if (marcador1.length > 4)
            tiebreak1 = parseInt(marcador1[3]) || tiebreak1;
          if (marcador2.length > 4)
            tiebreak2 = parseInt(marcador2[3]) || tiebreak2;
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
          if (
            tiebreakScore[0] !== tiebreak1 ||
            tiebreakScore[1] !== tiebreak2
          ) {
            // Solo actualizar tiebreak si no estamos en modo de edición activa
            // o si los valores de la base de datos son diferentes y válidos
            if (!showTiebreak || tiebreak1 > 0 || tiebreak2 > 0) {
              setTiebreakScore([tiebreak1, tiebreak2]);
            }
          }
        } else {
          console.warn("No se pudieron obtener los marcadores válidos");
        }
      } catch (error) {
        console.error("Error al verificar marcadores:", error);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    rondaIds.idRondaJuego,
    rondaIds.idRondaJuego2,
    onPuntosChange,
    calculateTotalScores,
    setScores,
    tiebreakScore,
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

    const newSetScores = {
      ...currentScores,
      [`set${setNumber}`]: [pareja1Score, pareja2Score],
    };

    setSetScores(newSetScores);
    onPuntosChange(newSetScores);
    const { team1Total, team2Total } = calculateTotalScores(newSetScores);
    setTotalScoresPareja1(team1Total);
    setTotalScoresPareja2(team2Total);

    const tieBreak = newSetScores.tiebreak || [null, null];
    actualizarRondaReta(
      rondaIds.idRondaJuego,
      rondaIds.idRondaJuego2,
      newSetScores,
      tieBreak
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
    setTiebreakScore(newTiebreakScore);
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
    setGanadorVisible(false);
    setGanadorJuego(true);
    setEditable(false);
    const nuevasCerradas = { ...rondasCerradas, [rondaIds.idRondaJuego]: true };
    setRondasCerradas(nuevasCerradas);
    terminarPartidaReta(rondaIds.idRondaJuego);
    terminarPartidaReta(rondaIds.idRondaJuego2);
  };

  const onConfirmTieBreak = (puntajesValidos) => {
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
          setTiebreakScore([pareja1Score, pareja2Score]);
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
        setPuntajesTieBreak({
          [rondaIds.idRondaJuego]: {
            pareja1: tiebreakScore[0].toString(),
            pareja2: tiebreakScore[1].toString(),
          },
        });
      }
    }
  }, [
    showTiebreak,
    rondaIds.idRondaJuego,
    jugador1,
    jugador3,
    jugador2,
    jugador4,
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
    if (showTiebreak && (tiebreakScore[0] > 0 || tiebreakScore[1] > 0)) {
      const tiebreakTotal = tiebreakScore[0] + tiebreakScore[1];
      const tiebreakDiferencia = Math.abs(tiebreakScore[0] - tiebreakScore[1]);
      if (tiebreakScore[0] >= 7 && tiebreakDiferencia < 2) {
        errores.push(
          `En el TIEBREAK, para ganar con 7 puntos debe haber diferencia de 2 (${tiebreakScore[0]}-${tiebreakScore[1]})`
        );
      }

      if (tiebreakScore[1] >= 7 && tiebreakDiferencia < 2) {
        errores.push(
          `En el TIEBREAK, para ganar con 7 puntos debe haber diferencia de 2 (${tiebreakScore[0]}-${tiebreakScore[1]})`
        );
      }
      if (
        tiebreakScore[0] > 0 &&
        tiebreakScore[1] > 0 &&
        tiebreakScore[0] === tiebreakScore[1]
      ) {
        errores.push(
          `El TIEBREAK no puede terminar en empate (${tiebreakScore[0]}-${tiebreakScore[1]})`
        );
      }
    }

    return errores;
  };

  const validarTiebreak = () => {
    if (tiebreakScore[0] === 0 && tiebreakScore[1] === 0) {
      return {
        valido: false,
        mensaje:
          "Debes ingresar los puntajes del tiebreak antes de terminar la ronda.",
      };
    }
    const tiebreakDiferencia = Math.abs(tiebreakScore[0] - tiebreakScore[1]);
    if (
      tiebreakScore[0] > 0 &&
      tiebreakScore[1] > 0 &&
      tiebreakScore[0] === tiebreakScore[1]
    ) {
      return {
        valido: false,
        mensaje: "El tiebreak no puede terminar en empate.",
      };
    }
    if (
      (tiebreakScore[0] >= 7 || tiebreakScore[1] >= 7) &&
      tiebreakDiferencia < 2
    ) {
      return {
        valido: false,
        mensaje:
          "Para ganar el tiebreak con 7 puntos debe haber diferencia de 2.",
      };
    }
    return { valido: true };
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
        `Corrige los siguientes errores antes de terminar la ronda:\n\n${erroresEnSets.join(
          "\n"
        )}`,
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

    // Verificar si necesitamos tiebreak
    const { team1Total, team2Total } = calculateTotalScores(setScores);
    if (team1Total === team2Total && team1Total > 0) {
      if (!showTiebreak) {
        setShowTiebreak(true);
        return;
      } else {
        const validacionTiebreak = validarTiebreak();
        if (!validacionTiebreak.valido) {
          Alert.alert("Error en tiebreak", validacionTiebreak.mensaje, [
            { text: "OK" },
          ]);
          return;
        }
      }
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
    if (score1 > 0 && score2 > 0 && score1 === score2 && score1 !== 6) {
      errores.push(`No puede terminar en empate que no sea 6-6`);
    }
    if (score1 > 6 || score2 > 6) {
      errores.push(`Máximo 6 puntos por equipo`);
    }
    return errores;
  };

  const getSetErrorStyle = (setNumber) => {
    const scores = setScores[`set${setNumber}`] || [0, 0];
    const errores = validarSet(parseInt(setNumber), scores[0], scores[1]);
    // Solo resaltar si hay errores en este set
    if (errores && errores.length > 0) {
      return { borderColor: colors.error, borderWidth: 2 };
    }
    return {};
  };

  const renderSetScore = (setNumber) => {
    const scores = setScores[`set${setNumber}`] || [0, 0];
    const errores = validarSet(parseInt(setNumber), scores[0], scores[1]);
    return (
      <View style={styles.containerErrors}>
        <View style={[styles.setRow, styles.currentSetRow]}>
          <TextInput
            style={[
              styles.scoreInput,
              { left: "10%" },
              styles.currentScoreInput,
              getSetErrorStyle(setNumber),
            ]}
            keyboardType="number-pad"
            textAlign="center"
            returnKeyType="done"
            value={scores[0] ? String(scores[0]) : ""}
            placeholder="0"
            onChangeText={(text) => {
              const sanitized = text.replace(/[^0-6]/g, "").slice(0, 1);
              const newScore = sanitized ? parseInt(sanitized) : 0;
              handleSetScoreChange(setNumber, newScore, scores[1]);
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            maxLength={1}
            editable={editable}
          />
          <View style={styles.setInfoContainer}>
            <Text style={[styles.setLabel, styles.currentSetLabel]}>-</Text>
          </View>
          <TextInput
            style={[
              styles.scoreInput,
              { left: "-10%" },
              styles.currentScoreInput,
              getSetErrorStyle(setNumber),
            ]}
            keyboardType="number-pad"
            textAlign="center"
            returnKeyType="done"
            value={scores[1] ? String(scores[1]) : ""}
            placeholder="0"
            onChangeText={(text) => {
              const sanitized = text.replace(/[^0-6]/g, "").slice(0, 1);
              const newScore = sanitized ? parseInt(sanitized) : 0;
              handleSetScoreChange(setNumber, scores[0], newScore);
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            maxLength={1}
            editable={editable}
          />
        </View>
        {/* Mostrar errores del set solo si existen */}
        {errores && errores.length > 0 && (
          <View style={styles.errorContainer}>
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
        <View>
          <Text style={styles.gameTitle}>CANCHA: {juegoNombre}</Text>
        </View>

        <View style={styles.playersAndScoresContainer}>
          {/* Jugadores izquierda (3 y 4) */}
          <View style={styles.leftTeam}>
            <View style={styles.playerNameContainer}>
              <Text style={styles.playerUpperText}>{jugador3}</Text>
              {isTeamWinner(1) && (
                <FontAwesome5
                  name="crown"
                  size={24}
                  color="gold"
                  style={{ position: "absolute", top: "-50%", left: "3%" }}
                />
              )}
            </View>
            <View style={styles.playerNameContainer}>
              <Text style={styles.playerLowerText}>{jugador4}</Text>
            </View>
          </View>

          {/* VS */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsTextCentered}>vs</Text>
          </View>

          {/* Jugadores derecha (1 y 2) */}
          <View style={styles.rightTeam}>
            <View style={styles.playerNameContainer}>
              <Text style={styles.playerUpperText}>{jugador1}</Text>
              {isTeamWinner(2) && (
                <FontAwesome5
                  name="crown"
                  size={24}
                  color="gold"
                  style={{ position: "absolute", top: "-50%", left: "3%" }}
                />
              )}
            </View>
            <View style={styles.playerNameContainer}>
              <Text style={styles.playerLowerText}>{jugador2}</Text>
            </View>
          </View>
        </View>

        {/* Sets */}
        <View style={styles.setsContainer}>
          {renderSetScore(1)}
          {renderSetScore(2)}
          {renderSetScore(3)}

          {ganadorVisible && estadoPartida === "1" && soyCreador === true && (
            <View style={styles.finishButtonContainer}>
              <CustomButton
                buttonText="Terminar Partida"
                onPress={handleTerminarRonda}
                disabled={verificarErroresEnSets().length > 0}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 186.3,
    width: 308.2,
    marginTop: "1%",
    marginBottom: 0,
  },
  boardContainer: {
    top: "13.9%",
    borderRadius: 16.1,
    borderColor: colors.primary,
    height: "117.3%",
    borderWidth: 3.45,
    width: "100%",
    left: 0,
    borderStyle: "solid",
    backgroundColor: colors.white,
    position: "absolute",
    marginBottom: "3%",
  },
  gameTitle: {
    fontSize: 12.65,
    fontFamily: "Poppins-Bold",
    color: colors.white,
    fontWeight: "700",
    backgroundColor: colors.primaryLight,
    borderRadius: 17.25,
    paddingVertical: 6,
    paddingHorizontal: 40,
    textAlign: "center",
    overflow: "hidden",
    // textTransform: 'uppercase',
    letterSpacing: 1,
    // elevation: 3,
    top: -20,
    alignSelf: "center",
    position: "relative",
    borderWidth: 3,
    borderColor: colors.white,
    height: "42.4%",
    width: "78.5%",
  },
  playersAndScoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamScoreColumn: {
    alignItems: "center",
    flex: 1,
    top: -13,
  },
  playerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playerUpperText: {
    color: colors.textSecondary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  playerLowerText: {
    color: colors.textSecondary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  totalScoreContainer: {
    backgroundColor: colors.lightBlue,
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
    color: colors.primaryLight,
    fontWeight: "700",
    textAlign: "center",
  },
  vsTextCentered: {
    top: -60,
    fontSize: 28.75,
    color: colors.black,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    fontWeight: "600",
    position: "absolute",
  },
  setsContainer: {
    marginTop: 35,
    alignContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 1,
    backgroundColor: "#02b9fa",
    borderRadius: 40,
    height: 40,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: "#fff",
    width: "78.5%",
  },
  currentSetRow: {
    backgroundColor: "#02b9fa",
    top: -50,
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
    color: "#02b9fa",
    fontSize: 24,
    marginLeft: 4,
    lineHeight: 20,
  },
  scoreInput: {
    width: 42,
    height: 45,
    fontSize: 20.7,
    fontFamily: "Poppins-Bold",
    color: "#444",
    borderRadius: 8,
    textAlign: "center",
  },
  currentScoreInput: {
    borderColor: "#02b9fa",
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
    top: -32,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#ff4444",
    textAlign: "center",
  },
  containerErrors: {
    width: "100%",
    alignItems: "center",
  },
  trophyIcon: {
    marginLeft: 5,
  },
  trophyIcon2: {
    marginLeft: 5,
    top: -13,
  },
  buttonContainer: {
    marginTop: 305,
    alignItems: "center",
  },
  playersAndScoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  leftTeam: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: 10,
    marginTop: -60,
  },

  vsContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  rightTeam: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 10,
    marginTop: -60,
  },
  finishButtonContainer: {
    position: "absolute",
    top: "60%",
    left: "25%",
    right: "25%",
    zIndex: 20,
  },
});

export default ParejasSeisLoco;
