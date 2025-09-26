import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScoreTracker from './ScoreTracker';
import ParejasSeisLoco from "../../ParejasSeisLoco"; // Cambiamos la importación

const SeisLocoMatch = ({ 
  jugadores, 
  juegoNombre, 
  puntos1,
  puntos2,
  puntos3, 
  onPuntosChange,
  indiceCancha,
  rondaIds,
  soyCreador
}) => {
  
  console.log('RetaMatch - rondaIds recibido:', rondaIds);
  console.log('RetaMatch - indiceCancha:', indiceCancha);
  
  const [scoreState, setScoreState] = useState({
    set1: [puntos1?.pareja1, puntos1?.pareja2] || [0,0],
    set2: [puntos2?.pareja1, puntos2?.pareja2] || [0,0],
    set3: [puntos3?.pareja1, puntos3?.pareja2] || [0,0],
    isInTiebreak: false,
    tiebreakScore: { pareja1: 0, pareja2: 0 }
  });

  useEffect(() => {
    if (puntos1 || puntos2 || puntos3) {
      setScoreState({
        set1: [puntos1?.pareja1, puntos1?.pareja2] || [0,0],
        set2: [puntos2?.pareja1, puntos2?.pareja2] || [0,0],
        set3: [puntos3?.pareja1, puntos3?.pareja2] || [0,0],
        isInTiebreak: false,
        tiebreakScore: { pareja1: 0, pareja2: 0 }
      });
    }
  }, [puntos1, puntos2, puntos3]);

  const handleScoreChange = (newScore) => {
    // Notificar al componente padre del cambio
    onPuntosChange({
      set1: { pareja1: newScore.set1[0], pareja2: newScore.set1[1] },
      set2: { pareja1: newScore.set2[0], pareja2: newScore.set2[1] },
      set3: { pareja1: newScore.set3[0], pareja2: newScore.set3[1] }
    });
    
    // Actualizar estado local
    setScoreState({
      set1: newScore.set1,
      set2: newScore.set2,
      set3: newScore.set3,
      isInTiebreak: newScore.isInTiebreak || false,
      tiebreakScore: newScore.tiebreakScore || { pareja1: 0, pareja2: 0 }
    });
  };

  // Obtener nombres de jugadores de forma segura
  const safeNombre = (jugador, fallback) => {
    if (!jugador) return fallback;
    if (typeof jugador === 'string') return jugador;
    if (typeof jugador === 'object') {
      if (jugador.us_nomUsuario) return String(jugador.us_nomUsuario);
      if (jugador.nom_invitado) return String(jugador.nom_invitado);
      if (jugador.nombre) return String(jugador.nombre);
      return fallback; // Nunca devolver el objeto
    }
    return String(jugador);
  };

  const jugador1 = safeNombre(jugadores[0]?.valor, `Jugador ${indiceCancha * 4 + 1}`);
  const jugador2 = safeNombre(jugadores[1]?.valor, `Jugador ${indiceCancha * 4 + 2}`);
  const jugador3 = safeNombre(jugadores[2]?.valor, `Jugador ${indiceCancha * 4 + 3}`);
  const jugador4 = safeNombre(jugadores[3]?.valor, `Jugador ${indiceCancha * 4 + 4}`);

  return (
    <View style={styles.container}>
      
      {/* Utilizamos el componente ParejasVSReta que ya existe en tu aplicación */}
      <ParejasSeisLoco
        jugador1={jugador1}
        jugador2={jugador2}
        jugador3={jugador3}
        jugador4={jugador4}
        juegoNombre={juegoNombre}
        soyCreador={soyCreador}
        puntos={{
          set1: scoreState.set1,
          set2: scoreState.set2,
          set3: scoreState.set3,
          isInTiebreak: scoreState.isInTiebreak,
          tiebreakScore: scoreState.tiebreakScore
        }}
        onPuntosChange={handleScoreChange}
        rondaIds={rondaIds}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  canchaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#8D288E',
  },
  matchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    flex: 1,
    padding: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  playerName: {
    fontSize: 14,
    marginVertical: 2,
    textAlign: 'center',
  },
  tiebreakInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  tiebreakInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tiebreakExplanation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  }
});

export default SeisLocoMatch;
