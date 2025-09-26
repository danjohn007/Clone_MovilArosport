import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ParejasVSRey from './ParejasVSRey';

const ReyPistaParejasVS = ({ 
  jugadores,
  canchas,
  onGuardarRonda,
  rondaActual
}) => {
  const [puntosCancha, setPuntosCancha] = useState({});
  const [reyParejaActual, setReyParejaActual] = useState(null);
  
  useEffect(() => {
    setPuntosCancha({});
  }, [rondaActual]);

  const handleActualizarPuntos = (canchaIndex, puntos) => {
    setPuntosCancha(prev => ({
      ...prev,
      [canchaIndex]: puntos
    }));
  };

  const determinarGanador = (puntos) => {
    if (!puntos || !puntos.pareja1 || !puntos.pareja2) return null;
    return parseInt(puntos.pareja1) > parseInt(puntos.pareja2) ? 'pareja1' : 'pareja2';
  };

  const handleGuardarRonda = () => {
    // Verificar que todas las canchas tengan puntuación
    if (Object.keys(puntosCancha).length !== canchas.length) {
      Alert.alert('Error', 'Debes ingresar puntuación para todas las canchas');
      return;
    }

    // Determinar ganador de la primera cancha (Rey de la pista)
    const ganadorCancha1 = determinarGanador(puntosCancha[0]);
    if (ganadorCancha1) {
      const parejasCancha1 = canchas[0];
      const nuevaReyPareja = ganadorCancha1 === 'pareja1' 
        ? [parejasCancha1[2], parejasCancha1[3]] 
        : [parejasCancha1[0], parejasCancha1[1]];
      
      setReyParejaActual(nuevaReyPareja);
    }

    onGuardarRonda({
      canchas: canchas,
      puntuaciones: puntosCancha,
      reyPareja: reyParejaActual
    });

    setPuntosCancha({});
  };

  const renderCancha = (jugadoresCancha, index) => {
    const isReyCancha = index === 0;
    const nombreCancha = `Cancha ${index + 1}`;

    return (
      <View key={`cancha-${index}`} style={styles.canchaContainer}>
        <View style={styles.canchaHeader}>
          {isReyCancha && reyParejaActual && (
            <Text style={styles.reyIndicator}>Rey</Text>
          )}
        </View>
        <ParejasVSRey
          jugador1={jugadoresCancha[0]?.tipo === 'jugador' ? 
            jugadoresCancha[0].valor.us_nomUsuario : 
            jugadoresCancha[0]?.valor}
          jugador2={jugadoresCancha[1]?.tipo === 'jugador' ? 
            jugadoresCancha[1].valor.us_nomUsuario : 
            jugadoresCancha[1]?.valor}
          jugador3={jugadoresCancha[2]?.tipo === 'jugador' ? 
            jugadoresCancha[2].valor.us_nomUsuario : 
            jugadoresCancha[2]?.valor}
          jugador4={jugadoresCancha[3]?.tipo === 'jugador' ? 
            jugadoresCancha[3].valor.us_nomUsuario : 
            jugadoresCancha[3]?.valor}
          juegoNombre={nombreCancha}
          onPuntosChange={(puntos) => handleActualizarPuntos(index, puntos)}
          resetPuntos={false}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Rey de la Pista - Ronda {rondaActual}</Text>
      {canchas.map((jugadoresCancha, index) => renderCancha(jugadoresCancha, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '100%',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#fff',
  },
  canchaContainer: {
    marginBottom: 20,
  },
  canchaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  nombreCancha: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  reyIndicator: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: '#02b9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guardarButton: {
    backgroundColor: '#02b9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  guardarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReyPistaParejasVS;