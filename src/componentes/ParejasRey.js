import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TextInput, Keyboard } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ParejasRey = ({
  parejas,
  idJuego,
  onActualizarPuntos,
  ronda,
  puntajesTotales,
  onRondaCompleta,
}) => {
  // Estado para las canchas (2 parejas por cancha)
  const [canchas, setCanchas] = useState([]);
  // Puntos a los que se juega (fijo a 8)
  const PUNTOS_OBJETIVO = 8;
  // Estado para los resultados actuales
  const [resultados, setResultados] = useState([]);
  // Estado para mensajes de error
  const [errores, setErrores] = useState([]);

  // Inicializar canchas al cargar el componente o al cambiar las parejas
  useEffect(() => {
    if (parejas && parejas.length >= 4) {
      // Asumimos que parejas viene ordenado por nivel (parejas[0] y parejas[1] tienen el nivel más alto)
      const cancha1 = [parejas[0], parejas[1]];
      const cancha2 = parejas.length >= 4 ? [parejas[2], parejas[3]] : [];
      
      setCanchas([cancha1, cancha2]);
      
      // Inicializar resultados vacíos
      const resultadosIniciales = [];
      resultadosIniciales.push({ puntos1: '', puntos2: '' });
      if (cancha2.length === 2) {
        resultadosIniciales.push({ puntos1: '', puntos2: '' });
      }
      
      setResultados(resultadosIniciales);
      setErrores(Array(resultadosIniciales.length).fill(''));
    }
  }, [parejas]);

  // Resetear puntos cuando cambia la ronda
  useEffect(() => {
    // Inicializar resultados vacíos
    if (canchas.length > 0) {
      const resultadosIniciales = Array(canchas.length).fill().map(() => ({ puntos1: '', puntos2: '' }));
      setResultados(resultadosIniciales);
      setErrores(Array(resultadosIniciales.length).fill(''));
    }
  }, [ronda]);

  // Actualizar puntos desde el componente padre si es necesario
  useEffect(() => {
    if (puntajesTotales && puntajesTotales.length > 0) {
      const nuevosResultados = [...resultados];
      
      puntajesTotales.forEach((puntaje, index) => {
        if (index < nuevosResultados.length) {
          nuevosResultados[index] = {
            puntos1: puntaje.pareja1 !== null && puntaje.pareja1 !== undefined ? String(puntaje.pareja1) : '',
            puntos2: puntaje.pareja2 !== null && puntaje.pareja2 !== undefined ? String(puntaje.pareja2) : ''
          };
        }
      });
      
      setResultados(nuevosResultados);
    }
  }, [puntajesTotales]);

  // Validar que los puntos sumen al PUNTOS_OBJETIVO y estén dentro del rango
  const validarPuntos = (puntos1, puntos2, index) => {
    const nuevosErrores = [...errores];
    
    // Si ambos tienen valores, validamos
    if (puntos1 !== '' && puntos2 !== '') {
      const num1 = parseInt(puntos1);
      const num2 = parseInt(puntos2);
      
      // Verificar que sumen PUNTOS_OBJETIVO
      if (num1 + num2 !== PUNTOS_OBJETIVO) {
        nuevosErrores[index] = `La suma debe ser ${PUNTOS_OBJETIVO} puntos`;
        setErrores(nuevosErrores);
        return false;
      }
      
      // Verificar que estén en el rango válido
      if (num1 < 0 || num2 < 0 || num1 > PUNTOS_OBJETIVO || num2 > PUNTOS_OBJETIVO) {
        nuevosErrores[index] = `Los puntos deben estar entre 0 y ${PUNTOS_OBJETIVO}`;
        setErrores(nuevosErrores);
        return false;
      }
      
      nuevosErrores[index] = '';
      setErrores(nuevosErrores);
      return true;
    }
    
    nuevosErrores[index] = '';
    setErrores(nuevosErrores);
    return true;
  };

  // Manejar cambio de puntos para la pareja 1 de una cancha
  const handlePuntos1Change = (text, canchaIndex) => {
    if (text === '' || (/^\d+$/.test(text) && parseInt(text) <= PUNTOS_OBJETIVO)) {
      const nuevosResultados = [...resultados];
      nuevosResultados[canchaIndex] = {
        ...nuevosResultados[canchaIndex],
        puntos1: text
      };
      
      setResultados(nuevosResultados);
      validarPuntos(text, nuevosResultados[canchaIndex].puntos2, canchaIndex);
      
      // Notificar al componente padre
      const puntosActualizados = nuevosResultados.map(res => ({
        pareja1: res.puntos1 === '' ? null : parseInt(res.puntos1),
        pareja2: res.puntos2 === '' ? null : parseInt(res.puntos2)
      }));
      
      onActualizarPuntos(puntosActualizados);
      
      // Verificar si todos los partidos tienen un ganador definido
      verificarRondaCompleta(nuevosResultados);
    }
  };

  // Manejar cambio de puntos para la pareja 2 de una cancha
  const handlePuntos2Change = (text, canchaIndex) => {
    if (text === '' || (/^\d+$/.test(text) && parseInt(text) <= PUNTOS_OBJETIVO)) {
      const nuevosResultados = [...resultados];
      nuevosResultados[canchaIndex] = {
        ...nuevosResultados[canchaIndex],
        puntos2: text
      };
      
      setResultados(nuevosResultados);
      validarPuntos(nuevosResultados[canchaIndex].puntos1, text, canchaIndex);
      
      // Notificar al componente padre
      const puntosActualizados = nuevosResultados.map(res => ({
        pareja1: res.puntos1 === '' ? null : parseInt(res.puntos1),
        pareja2: res.puntos2 === '' ? null : parseInt(res.puntos2)
      }));
      
      onActualizarPuntos(puntosActualizados);
      
      // Verificar si todos los partidos tienen un ganador definido
      verificarRondaCompleta(nuevosResultados);
    }
  };

  // Verificar si la ronda está completa (todos los partidos tienen un ganador)
  const verificarRondaCompleta = (resultadosActuales) => {
    const todosCompletos = resultadosActuales.every(resultado => {
      if (resultado.puntos1 === '' || resultado.puntos2 === '') return false;
      
      const p1 = parseInt(resultado.puntos1);
      const p2 = parseInt(resultado.puntos2);
      return p1 + p2 === PUNTOS_OBJETIVO && validarPuntos(resultado.puntos1, resultado.puntos2, 0);
    });
    
    if (todosCompletos) {
      // Calcular nuevas posiciones de parejas para la siguiente ronda
      const nuevasPosiciones = calcularNuevasPosiciones(resultadosActuales);
      onRondaCompleta && onRondaCompleta(nuevasPosiciones);
    }
  };

  // Calcular nuevas posiciones basadas en los resultados
  const calcularNuevasPosiciones = (resultadosActuales) => {
    // Copiar las parejas actuales
    const nuevasParejas = [].concat(...canchas);
    const ganadores = [];
    const perdedores = [];
    
    // Determinar ganadores y perdedores
    resultados.forEach((resultado, index) => {
      const p1 = parseInt(resultado.puntos1);
      const p2 = parseInt(resultado.puntos2);
      
      if (p1 > p2) {
        ganadores.push(canchas[index][0]);
        perdedores.push(canchas[index][1]);
      } else {
        ganadores.push(canchas[index][1]);
        perdedores.push(canchas[index][0]);
      }
    });
    
    // Ordenar parejas para la próxima ronda según regla "Rey de la Pista"
    const parejasOrdenadas = [];
    
    // La pareja que gana en la cancha más alta se mantiene a la izquierda
    parejasOrdenadas.push(ganadores[0]);
    
    // La pareja que gana en la cancha más baja sube y juega contra la pareja de arriba
    if (ganadores.length > 1) {
      parejasOrdenadas.push(ganadores[1]);
    }
    
    // La pareja que pierde en la cancha más alta baja a la segunda cancha
    if (perdedores.length > 0) {
      parejasOrdenadas.push(perdedores[0]);
    }
    
    // La pareja que pierde en la cancha más baja queda al final
    if (perdedores.length > 1) {
      parejasOrdenadas.push(perdedores[1]);
    }
    
    return parejasOrdenadas;
  };

  // Verificar si hay un ganador
  const checkWinner = (canchaIndex) => {
    const resultado = resultados[canchaIndex];
    if (!resultado || resultado.puntos1 === '' || resultado.puntos2 === '') return 0;
    
    const p1 = parseInt(resultado.puntos1);
    const p2 = parseInt(resultado.puntos2);
    
    return p1 > p2 ? 1 : (p2 > p1 ? 2 : 0);
  };

  // Formatear nombre de jugador
  const formatJugador = (jugador) => {
    if (!jugador) return "Jugador";
    
    if (jugador.tipo === 'jugador') {
      const nombre = jugador.valor.us_nomUsuario || jugador.valor;
      return nombre.length > 10 ? nombre.substring(0, 10) + "..." : nombre;
    } else {
      return jugador.valor ? jugador.valor : "Jugador";
    }
  };

  // Componente para mostrar corona al ganador
  const CrownIcon = () => (
    <MaterialCommunityIcons name="crown" size={24} color="#1E88E5" />
  );

  // Renderizar cada cancha
  const renderCancha = (cancha, canchaIndex) => {
    if (!cancha || cancha.length < 2) return null;
    
    // Obtener nombres de jugadores
    const pareja1 = cancha[0];
    const pareja2 = cancha[1];
    
    const jugador1 = pareja1 && pareja1[0] ? formatJugador(pareja1[0]) : "Jugador 1";
    const jugador2 = pareja1 && pareja1[1] ? formatJugador(pareja1[1]) : "Jugador 2";
    const jugador3 = pareja2 && pareja2[0] ? formatJugador(pareja2[0]) : "Jugador 3";
    const jugador4 = pareja2 && pareja2[1] ? formatJugador(pareja2[1]) : "Jugador 4";
    
    // Obtener resultado actual
    const resultado = resultados[canchaIndex] || { puntos1: '', puntos2: '' };
    
    // Calcular suma para mostrar
    const suma = (
      (resultado.puntos1 !== '' ? parseInt(resultado.puntos1) : 0) + 
      (resultado.puntos2 !== '' ? parseInt(resultado.puntos2) : 0)
    );
    
    // Determinar ganador
    const ganador = checkWinner(canchaIndex);
    
    return (
      <View style={styles.canchaContainer} key={canchaIndex}>
        <Text style={styles.canchaTitle}>
          {canchaIndex === 0 ? 'Cancha Principal' : `Cancha ${canchaIndex + 1}`}
        </Text>
        
        <View style={styles.scoreContainer}>
          <View style={[
            styles.teamContainer,
            ganador === 1 ? styles.winnerTeam : null,
            canchaIndex === 0 ? styles.kingTeam : null
          ]}>
            {ganador === 1 && (
              <View style={styles.crownContainer}>
                <CrownIcon />
              </View>
            )}
            
            <View style={styles.playersContainer}>
              <Text style={styles.playerName}>{jugador1}</Text>
              <Text style={styles.playerName}>{jugador2}</Text>
            </View>
            <TextInput
              style={[
                styles.scoreInput,
                ganador === 1 ? styles.winnerScoreInput : null
              ]}
              keyboardType="numeric"
              value={resultado.puntos1}
              onChangeText={(text) => handlePuntos1Change(text, canchaIndex)}
              onBlur={() => validarPuntos(resultado.puntos1, resultado.puntos2, canchaIndex)}
              onSubmitEditing={() => Keyboard.dismiss()} 
              maxLength={2}
              placeholder="-"
              placeholderTextColor="#BBDEFB"
            />
          </View>
          
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          
          <View style={[
            styles.teamContainer,
            ganador === 2 ? styles.winnerTeam : null
          ]}>
            {ganador === 2 && (
              <View style={styles.crownContainer}>
                <CrownIcon />
              </View>
            )}
            
            <View style={styles.playersContainer}>
              <Text style={styles.playerName}>{jugador3}</Text>
              <Text style={styles.playerName}>{jugador4}</Text>
            </View>
            <TextInput
              style={[
                styles.scoreInput,
                ganador === 2 ? styles.winnerScoreInput : null
              ]}
              keyboardType="numeric"
              value={resultado.puntos2}
              onChangeText={(text) => handlePuntos2Change(text, canchaIndex)}
              onBlur={() => validarPuntos(resultado.puntos1, resultado.puntos2, canchaIndex)}
              onSubmitEditing={() => Keyboard.dismiss()} 
              maxLength={2}
              placeholder="-"
              placeholderTextColor="#BBDEFB"
            />
          </View>
        </View>
        
        {errores[canchaIndex] ? (
          <Text style={styles.errorText}>{errores[canchaIndex]}</Text>
        ) : (
          <View style={styles.totalScoreContainer}>
            <Text style={styles.infoText}>Puntuación total: {suma}/{PUNTOS_OBJETIVO}</Text>
            {suma === PUNTOS_OBJETIVO && ganador !== 0 && (
              <View style={styles.validScoreIndicator}>
                <Text style={styles.validScoreText}>✓</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.gameTitle}>Rey de la Pista</Text>
      <Text style={styles.gameInstructions}>
        Las parejas suben o bajan de nivel según ganen o pierdan. 
        La pareja del lado izquierdo de la cancha principal es el "Rey".
      </Text>
      
      {canchas.map((cancha, index) => renderCancha(cancha, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
    paddingVertical: 16,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 6,
  },
  gameInstructions: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  canchaContainer: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#0288D1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  canchaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0288D1',
    textAlign: 'center',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  teamContainer: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1F5FE',
    position: 'relative',
  },
  kingTeam: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  winnerTeam: {
    borderColor: '#1565C0',
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
  },
  crownContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    zIndex: 10,
  },
  playersContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 8,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  playerName: {
    color: '#333333',
    fontSize: 14,
    marginVertical: 3,
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreInput: {
    backgroundColor: '#00BFFF',
    color: '#FFFFFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
    shadowColor: '#0288D1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  winnerScoreInput: {
    backgroundColor: '#1565C0',
    shadowColor: '#2E7D32',
  },
  vsContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  vsText: {
    color: '#00BFFF',
    fontWeight: 'bold',
    fontSize: 20,
    textShadowColor: 'rgba(0, 191, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#FFEBEE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  totalScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    color: '#0288D1',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  validScoreIndicator: {
    backgroundColor: '#1565C0',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  validScoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  }
});

export default ParejasRey;