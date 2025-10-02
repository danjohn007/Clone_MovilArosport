import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import  {obtenerRondasAmericana} from '../componentes/Activos/Americana/AmericanaApiService.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from "../styles/colors";

const HistorialAmericanaPuntos = ({ visible, closeModal, juegoId, onTerminar }) => {
  console.log("id juego de historial", juegoId);
  const [playerScores, setPlayerScores] = useState([]); // Estado para almacenar puntuaciones de jugadores
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  const [highestScore, setHighestScore] = useState(0); // Para almacenar la puntuación más alta

  useEffect(() => {
    const fetchRondas = async () => {
      if (visible) {
        setLoading(true);
        try {
          const respuesta = await obtenerRondasAmericana(juegoId);
          console.log("rondas de juegooooo", respuesta);

          const rondas = respuesta.rondas;
          
          // Objeto para acumular los puntos de cada jugador
          const jugadoresPuntos = {};
          
          // Procesar todas las rondas y acumular puntos por jugador
          rondas.forEach((r) => {
            // Jugadores de la pareja 1
            const jugador1P1 = r.nombre_jugador1_p1;
            const jugador1P2 = r.nombre_jugador1_p2;
            
            // Jugadores de la pareja 2
            const jugador2P1 = r.nombre_jugador2_p1;
            const jugador2P2 = r.nombre_jugador2_p2;
            
            // Puntos de cada pareja
            const puntosP1 = parseInt(r.puntos_p1, 10) || 0;
            const puntosP2 = parseInt(r.puntos_p2, 10) || 0;
            
            // Acumular puntos para jugadores de la pareja 1
            if (!jugadoresPuntos[jugador1P1]) jugadoresPuntos[jugador1P1] = 0;
            if (!jugadoresPuntos[jugador1P2]) jugadoresPuntos[jugador1P2] = 0;
            jugadoresPuntos[jugador1P1] += puntosP1;
            jugadoresPuntos[jugador1P2] += puntosP1;
            
            // Acumular puntos para jugadores de la pareja 2
            if (!jugadoresPuntos[jugador2P1]) jugadoresPuntos[jugador2P1] = 0;
            if (!jugadoresPuntos[jugador2P2]) jugadoresPuntos[jugador2P2] = 0;
            jugadoresPuntos[jugador2P1] += puntosP2;
            jugadoresPuntos[jugador2P2] += puntosP2;
          });
          
          // Convertir el objeto a un array para ordenarlo
          const jugadoresArray = Object.entries(jugadoresPuntos).map(([nombre, puntos]) => ({
            nombre,
            puntos
          }));
          
          // Ordenar jugadores por puntos (mayor a menor)
          jugadoresArray.sort((a, b) => b.puntos - a.puntos);
          
          // Guardar la puntuación más alta (si hay jugadores)
          if (jugadoresArray.length > 0) {
            setHighestScore(jugadoresArray[0].puntos);
          }
          
          setPlayerScores(jugadoresArray);
        } catch (error) {
          console.log("Error al obtener las rondas:", error);
        }
        setLoading(false);
      }
    };

    fetchRondas();
  }, [visible, juegoId]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Puntuación de Jugadores</Text>
          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : playerScores.length === 0 ? (
            <Text style={styles.emptyText}>No hay puntuaciones registradas aún</Text>
          ) : (
            <ScrollView style={styles.scrollView}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerText}>Jugador</Text>
                <Text style={styles.headerText}>Puntos Totales</Text>
              </View>
              {playerScores.map((jugador, index) => {
                // Comprobar si este jugador tiene la puntuación más alta
                const isTopPlayer = jugador.puntos === highestScore;
                
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.playerRow, 
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                      isTopPlayer ? styles.topPlayer : null
                    ]}
                  >
                    <Text 
                      style={[
                        styles.playerName, 
                        isTopPlayer ? styles.topPlayerText : null
                      ]}
                    >
                      {isTopPlayer && <Ionicons name="trophy" size={18} color="#FFD700" />} {jugador.nombre}
                    </Text>
                    <Text 
                      style={[
                        styles.playerScore,
                        isTopPlayer ? styles.topPlayerText : null
                      ]}
                    >
                      {jugador.puntos}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
       
            <TouchableOpacity style={styles.btnCerrar} onPress={closeModal}>
              <Text style={styles.textoCerrar}>Cerrar</Text>
            </TouchableOpacity>
       
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  scrollView: {
    maxHeight: '90%',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderRadius: 8,
  },
  evenRow: {
    backgroundColor: '#f8f8f8',
  },
  oddRow: {
    backgroundColor: '#efefef',
  },
  topPlayer: {
    backgroundColor: 'rgba(0, 186, 255, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  playerName: {
    fontSize: 15,
    color: '#333',
    flex: 3,
  },
  playerScore: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  topPlayerText: {
    fontWeight: 'bold',
    color: '#0086ba',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#C9C9C9',
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
       btnCerrar: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
    },
    textoCerrar: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 14
    },
});

export default HistorialAmericanaPuntos;