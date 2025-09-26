import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import ScoreTracker from "./ScoreTracker";
import ParejasVSRey from "../../ParejasVSRey"; // Importamos el componente existente

const ReyMatch = ({
  jugadores,
  juegoNombre,
  puntos,
  onPuntosChange,
  indiceCancha,
  soyCreador,
  rondaIds,
  puntosTotales,
  idJuego,
}) => {
  const [scoreState, setScoreState] = useState({
    pareja1: puntos?.pareja1 || 0,
    pareja2: puntos?.pareja2 || 0,
    isInTiebreak: false,
    tiebreakScore: { pareja1: 0, pareja2: 0 },
    idRondaJuego: rondaIds?.idRondaJuego || 0,
    idRondaJuego2: rondaIds?.idRondaJuego2 || 0,
  });
  console.log("punto tptales", puntosTotales);
  useEffect(() => {
    // Cuando los puntos cambian desde el padre, reinicia completamente el estado
    if (puntos) {
      setScoreState({
        pareja1: puntos.pareja1 || 0,
        pareja2: puntos.pareja2 || 0,
        isInTiebreak: false,
        tiebreakScore: { pareja1: 0, pareja2: 0 },
        idRondaJuego: rondaIds?.idRondaJuego || 0,
        idRondaJuego2: rondaIds?.idRondaJuego2 || 0,
      });
    }
  }, [puntos]);

  const handleScoreChange = (newScore) => {
    // Notificar al componente padre del cambio
    onPuntosChange(newScore);
    // Actualizar estado local
    setScoreState(newScore);
  };

  // Obtener nombres de jugadores
  const jugador1 =
    jugadores[0]?.tipo === "jugador"
      ? jugadores[0].valor.us_nomUsuario
      : jugadores[0]?.valor || `Jugador ${indiceCancha * 4 + 1}`;

  const jugador2 =
    jugadores[2]?.tipo === "jugador"
      ? jugadores[1].valor.us_nomUsuario
      : jugadores[1]?.valor || `Jugador ${indiceCancha * 4 + 2}`;

  const jugador3 =
    jugadores[1]?.tipo === "jugador"
      ? jugadores[2].valor.us_nomUsuario
      : jugadores[2]?.valor || `Jugador ${indiceCancha * 4 + 3}`;

  const jugador4 =
    jugadores[3]?.tipo === "jugador"
      ? jugadores[3].valor.us_nomUsuario
      : jugadores[3]?.valor || `Jugador ${indiceCancha * 4 + 4}`;

  return (
    <View style={styles.container}>
      {/* <Text style={styles.canchaNombre}>{juegoNombre}</Text> */}

      {/* Utilizamos el componente ParejasVs que ya existe en tu aplicación */}
      <ParejasVSRey
        jugador1={jugador1}
        index={indiceCancha}
        jugador2={jugador2}
        jugador3={jugador3}
        jugador4={jugador4}
        juegoNombre={juegoNombre}
        puntosTotales={puntosTotales}
        puntos={puntos || { pareja1: 0, pareja2: 0 }}
        tiebreak={
          puntos && puntos.tieBreak && puntos.tieBreakScore
            ? { tieBreak: puntos.tieBreak, tieBreakScore: puntos.tieBreakScore }
            : null
        }
        onPuntosChange={(nuevoPuntos) => {
          onPuntosChange(nuevoPuntos);
        }}
        soyCreador={soyCreador}
        rondaIds={rondaIds}
        idJuego={idJuego}
      />

      {/* Panel de información de tiebreak */}
      {scoreState.isInTiebreak && (
        <View style={styles.tiebreakInfoContainer}>
          <Text style={styles.tiebreakInfoText}>
            Tie Break: {scoreState.tiebreakScore.pareja1} -{" "}
            {scoreState.tiebreakScore.pareja2}
          </Text>
          <Text style={styles.tiebreakExplanation}>
            Gana el primero en llegar a 5 puntos
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 1.5,
    // elevation: 2,
  },
  canchaNombre: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#8D288E",
  },
  matchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamContainer: {
    flex: 1,
    padding: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  playerName: {
    fontSize: 14,
    marginVertical: 2,
    textAlign: "center",
  },
});

export default ReyMatch;