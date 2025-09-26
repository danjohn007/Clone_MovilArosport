import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const ScoreTracker = ({ score, onScoreChange }) => {
  const [localScore, setLocalScore] = useState({
    pareja1: score?.pareja1 || 0,
    pareja2: score?.pareja2 || 0,
    isInTiebreak: false,
    tiebreakScore: { pareja1: 0, pareja2: 0 }
  });

  useEffect(() => {
    // Actualizar el estado local cuando cambie el prop score
    if (score) {
      setLocalScore(prevState => ({
        ...prevState,
        pareja1: score.pareja1 || 0,
        pareja2: score.pareja2 || 0,
      }));
    }
  }, [score]);

  // Verificar si se debe jugar un tiebreak
  useEffect(() => {
    if (localScore.pareja1 === 6 && localScore.pareja2 === 6 && !localScore.isInTiebreak) {
      setLocalScore(prevState => ({
        ...prevState,
        isInTiebreak: true,
        tiebreakScore: { pareja1: 0, pareja2: 0 }
      }));
      Alert.alert("Tie Break", "Se jugará un Tie Break hasta 5 puntos");
    }
  }, [localScore.pareja1, localScore.pareja2, localScore.isInTiebreak]);

  const addPointPair1 = () => {
    if (localScore.isInTiebreak) {
      // Lógica para el tiebreak (primero en llegar a 5)
      const newTiebreakScore = { 
        ...localScore.tiebreakScore,
        pareja1: localScore.tiebreakScore.pareja1 + 1 
      };
      
      // Verificar si ganó el tiebreak
      if (newTiebreakScore.pareja1 >= 5) {
        const newScore = {
          pareja1: 7,
          pareja2: 6,
          isInTiebreak: false,
          tiebreakScore: { pareja1: 0, pareja2: 0 }
        };
        setLocalScore(newScore);
        onScoreChange(newScore);
        Alert.alert("Juego Terminado", "La Pareja 1 ha ganado el Tie Break");
        return;
      }
      
      const newScore = {
        ...localScore,
        tiebreakScore: newTiebreakScore
      };
      
      setLocalScore(newScore);
      onScoreChange(newScore);
      return;
    }
    
    // Lógica normal de puntuación
    const newPaireScore = localScore.pareja1 + 1;
    
    // Reglas de puntuación de la Americana
    if (
      (newPaireScore === 6 && localScore.pareja2 <= 4) || 
      (newPaireScore === 7 && localScore.pareja2 === 5)
    ) {
      // Juego ganado
      const newScore = {
        pareja1: newPaireScore,
        pareja2: localScore.pareja2,
        isInTiebreak: false,
        tiebreakScore: { pareja1: 0, pareja2: 0 }
      };
      setLocalScore(newScore);
      onScoreChange(newScore);
      Alert.alert("Juego Terminado", "La Pareja 1 ha ganado el juego");
      return;
    }
    
    // Actualizar puntuación normal
    const newScore = {
      ...localScore,
      pareja1: newPaireScore
    };
    
    setLocalScore(newScore);
    onScoreChange(newScore);
  };

  const addPointPair2 = () => {
    if (localScore.isInTiebreak) {
      // Lógica para el tiebreak (primero en llegar a 5)
      const newTiebreakScore = { 
        ...localScore.tiebreakScore,
        pareja2: localScore.tiebreakScore.pareja2 + 1 
      };
      
      // Verificar si ganó el tiebreak
      if (newTiebreakScore.pareja2 >= 5) {
        const newScore = {
          pareja1: 6,
          pareja2: 7,
          isInTiebreak: false,
          tiebreakScore: { pareja1: 0, pareja2: 0 }
        };
        setLocalScore(newScore);
        onScoreChange(newScore);
        Alert.alert("Juego Terminado", "La Pareja 2 ha ganado el Tie Break");
        return;
      }
      
      const newScore = {
        ...localScore,
        tiebreakScore: newTiebreakScore
      };
      
      setLocalScore(newScore);
      onScoreChange(newScore);
      return;
    }
    
    // Lógica normal de puntuación
    const newPaireScore = localScore.pareja2 + 1;
    
    // Reglas de puntuación de la Americana
    if (
      (newPaireScore === 6 && localScore.pareja1 <= 4) || 
      (newPaireScore === 7 && localScore.pareja1 === 5)
    ) {
      // Juego ganado
      const newScore = {
        pareja1: localScore.pareja1,
        pareja2: newPaireScore,
        isInTiebreak: false,
        tiebreakScore: { pareja1: 0, pareja2: 0 }
      };
      setLocalScore(newScore);
      onScoreChange(newScore);
      Alert.alert("Juego Terminado", "La Pareja 2 ha ganado el juego");
      return;
    }
    
    // Actualizar puntuación normal
    const newScore = {
      ...localScore,
      pareja2: newPaireScore
    };
    
    setLocalScore(newScore);
    onScoreChange(newScore);
  };

  const resetScore = () => {
    const newScore = {
      pareja1: 0,
      pareja2: 0,
      isInTiebreak: false,
      tiebreakScore: { pareja1: 0, pareja2: 0 }
    };
    setLocalScore(newScore);
    onScoreChange(newScore);
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreDisplay}>
        <Text style={styles.scoreText}>{localScore.pareja1}</Text>
        <Text style={styles.separator}>-</Text>
        <Text style={styles.scoreText}>{localScore.pareja2}</Text>
      </View>
      
      {localScore.isInTiebreak && (
        <View style={styles.tiebreakContainer}>
          <Text style={styles.tiebreakTitle}>Tie Break</Text>
          <View style={styles.tiebreakScoreContainer}>
            <Text style={styles.tiebreakScore}>{localScore.tiebreakScore.pareja1}</Text>
            <Text style={styles.separator}>-</Text>
            <Text style={styles.tiebreakScore}>{localScore.tiebreakScore.pareja2}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.pair1Button]} 
          onPress={addPointPair1}
        >
          <Text style={styles.buttonText}>+1 Pareja 1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetScore}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.pair2Button]} 
          onPress={addPointPair2}
        >
          <Text style={styles.buttonText}>+1 Pareja 2</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  separator: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  tiebreakContainer: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 10,
  },
  tiebreakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8D288E',
  },
  tiebreakScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tiebreakScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  pair1Button: {
    backgroundColor: '#4CAF50',
  },
  pair2Button: {
    backgroundColor: '#2196F3',
  },
  resetButton: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ScoreTracker;