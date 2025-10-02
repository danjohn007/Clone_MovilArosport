import React from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from "../styles/colors";

const HistorialTresSets = ({ visible, closeModal, data, onTerminar }) => {

  const formatName = (name) => {
    if (!name) return '';
    return name.length > 10 ? name.substring(0, 10) + '...' : name;
  };

  const determinarGanador = (puntos) => {
    if (!puntos) return null;
    
    const pareja1 = parseInt(puntos.pareja1) || 0;
    const pareja2 = parseInt(puntos.pareja2) || 0;
    
    if (pareja1 > pareja2) {
      return 'pareja1';
    } else if (pareja2 > pareja1) {
      return 'pareja2';
    }
    return null;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Historial de Rondas</Text>
          
          {data.length === 0 ? (
            <Text style={styles.emptyText}>No hay rondas registradas aún</Text>
          ) : (
            <ScrollView style={styles.scrollView}>
              {data.map((rondaData, rondaIndex) => (
                <View key={rondaIndex} style={styles.rondaContainer}>
                  <View style={styles.rondaHeader}>
                    <Text style={styles.rondaHeaderText}>Reta {rondaData.ronda + 1}</Text>
                  </View>
                  
                  {rondaData.parejas && rondaData.parejas.map((pareja, parejaIndex) => {
                    const jugadores = pareja.jugadores || [];
                    const jugador1 = jugadores[0] || {};
                    const jugador2 = jugadores[1] || {};
                    const jugador3 = jugadores[2] || {};
                    const jugador4 = jugadores[3] || {};
                    
                    let puntosSets = pareja.puntosSets || {};
                    
                    if (!puntosSets.set1 || !puntosSets.set2 || !puntosSets.set3) {
                      const puntosLegacy = pareja.puntos || { pareja1: "0", pareja2: "0" };
                      
                      puntosSets = {
                        set1: puntosSets.set1 || { 
                          pareja1: puntosLegacy.pareja1 || "0", 
                          pareja2: puntosLegacy.pareja2 || "0" 
                        },
                        set2: puntosSets.set2 || { pareja1: "0", pareja2: "0" },
                        set3: puntosSets.set3 || { pareja1: "0", pareja2: "0" }
                      };
                    }
                    
                    const ganadorSet1 = determinarGanador(puntosSets.set1);
                    const ganadorSet2 = determinarGanador(puntosSets.set2);
                    const ganadorSet3 = determinarGanador(puntosSets.set3);
                    
                    const setsPareja1 = [ganadorSet1, ganadorSet2, ganadorSet3].filter(g => g === 'pareja1').length;
                    const setsPareja2 = [ganadorSet1, ganadorSet2, ganadorSet3].filter(g => g === 'pareja2').length;
                    
                    const ganadorPartido = setsPareja1 > setsPareja2 ? 'pareja1' : (setsPareja2 > setsPareja1 ? 'pareja2' : null);

                    return (
                      <View key={parejaIndex} style={styles.parejaContainer}>
                        <LinearGradient
                          colors={['#f8f9fa', '#e9ecef']}
                          style={styles.gradient}
                        >
                       
                          <View style={styles.jugadoresContainer}>
                            {/* Equipo 1 */}
                            <View style={[
                              styles.equipoContainer, 
                              ganadorPartido === 'pareja1' && styles.equipoGanador
                            ]}>
                              {ganadorPartido === 'pareja1' && (
                                <MaterialCommunityIcons name="crown" size={16} color="#0086c3" style={styles.crownIcon} />
                              )}
                              <Text style={styles.jugadorText}>{formatName(jugador1.nombre)}</Text>
                              <Text style={styles.jugadorText}>{formatName(jugador2.nombre)}</Text>
                            </View>
                            
                            <View style={styles.puntosContainer}>
                              <View style={styles.setsHeader}>
                                <Text style={styles.setLabel}>Set 1</Text>
                                <Text style={styles.setLabel}>Set 2</Text>
                                <Text style={styles.setLabel}>Set 3</Text>
                              </View>
                              
                              <View style={styles.puntosRow}>
                                <Text style={[
                                  styles.puntosText,
                                  ganadorSet1 === 'pareja1' && styles.puntosGanador
                                ]}>
                                  {puntosSets.set1?.pareja1 || "0"}
                                </Text>
                                <Text style={[
                                  styles.puntosText,
                                  ganadorSet2 === 'pareja1' && styles.puntosGanador
                                ]}>
                                  {puntosSets.set2?.pareja1 || "0"}
                                </Text>
                                <Text style={[
                                  styles.puntosText,
                                  ganadorSet3 === 'pareja1' && styles.puntosGanador
                                ]}>
                                  {puntosSets.set3?.pareja1 || "0"}
                                </Text>
                              </View>
                              
                              <View style={styles.puntosRow}>
                                <Text style={styles.setPunto}>-</Text>
                                <Text style={styles.setPunto}>-</Text>
                                <Text style={styles.setPunto}>-</Text>
                              </View>
                              
                              <View style={styles.puntosRow}>
                                <Text style={[
                                  styles.puntosText,
                                  ganadorSet1 === 'pareja2' && styles.puntosGanador
                                ]}>
                                  {puntosSets.set1?.pareja2 || "0"}
                                </Text>
                                <Text style={[
                                  styles.puntosText,
                                  ganadorSet2 === 'pareja2' && styles.puntosGanador
                                ]}>
                                  {puntosSets.set2?.pareja2 || "0"}
                                </Text>
                                <Text style={[
                                  styles.puntosText,
                                  ganadorSet3 === 'pareja2' && styles.puntosGanador
                                ]}>
                                  {puntosSets.set3?.pareja2 || "0"}
                                </Text>
                              </View>
                            </View>
                            
                            <View style={[
                              styles.equipoContainer, 
                              ganadorPartido === 'pareja2' && styles.equipoGanador
                            ]}>
                              {ganadorPartido === 'pareja2' && (
                                <MaterialCommunityIcons name="crown" size={16} color="#0086c3" style={styles.crownIcon} />
                              )}
                              <Text style={styles.jugadorText}>{formatName(jugador3.nombre)}</Text>
                              <Text style={styles.jugadorText}>{formatName(jugador4.nombre)}</Text>
                            </View>
                          </View>
                          
                          <View style={styles.resumenContainer}>
                            <View style={styles.setsCountContainer}>
                              <Text style={[
                                styles.resumenText, 
                                ganadorPartido === 'pareja1' && styles.resumenGanador
                              ]}>
                                {setsPareja1}
                              </Text>
                              <Text style={styles.resumenLabel}>Sets</Text>
                              <Text style={[
                                styles.resumenText, 
                                ganadorPartido === 'pareja2' && styles.resumenGanador
                              ]}>
                                {setsPareja2}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.terminateButton, data.length === 0 && styles.disabledButton]} 
              onPress={onTerminar}
              disabled={data.length === 0}
            >
              <Text style={styles.buttonText}>Terminar Juego</Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.primary,
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
    maxHeight: '70%',
  },
  rondaContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rondaHeader: {
    backgroundColor: '#00BFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',  // Centrar el texto "Reta X"
  },
  rondaHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',  // Asegurar que el texto está centrado
  },
  parejaContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gradient: {
    padding: 12,
  },
  matchHeader: {
    marginBottom: 8,
  },
  matchTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  jugadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipoContainer: {
    flex: 1,
    padding: 4,
    borderRadius: 4,
    position: 'relative',
    alignItems: 'center',  // Centrar los nombres de jugadores
  },
  equipoGanador: {
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
  },
  crownIcon: {
    position: 'absolute',
    top: -8,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    color: '#0086c3',  // Color azul más intenso para la corona
  },
  jugadorText: {
    fontSize: 12,
    marginBottom: 2,
    color: '#555',
    textAlign: 'center',  // Centrar el texto de los jugadores
  },
  puntosContainer: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 4,
  },
  setLabel: {
    fontSize: 10,
    color: '#888',
    flex: 1,
    textAlign: 'center',
  },
  puntosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  puntosText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  puntosGanador: {
    color: '#0086c3',  // Color azul más intenso para la puntuación ganadora
  },
  setPunto: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  resumenContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 24,
    textAlign: 'center',
  },
  resumenGanador: {
    color: '#0086c3',  // Color azul más intenso para el resumen del ganador
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
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
  terminateButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#00BFFF',
    borderRadius: 30,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
});

export default HistorialTresSets;