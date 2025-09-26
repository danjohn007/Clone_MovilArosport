import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HistorialPartidosReta = ({ ronda, parejas }) => {
  const [Ganadores, setGanadores] = useState([]);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.rondaTitle}>Ronda {ronda}</Text>
  
      {parejas.map((pareja, index) => (
        <View style={styles.roundContainer} key={index}>
          <View style={styles.matchContainer}>
            <View style={styles.matchInfo}>
              {/* Columna de Jugadores 1 */}
              <View
                style={[
                  styles.playersColumn,
                  pareja.totalSets.pareja1 > pareja.totalSets.pareja2 &&
                    styles.winnerContainer,
                ]}
              >
                {pareja.totalSets.pareja1 > pareja.totalSets.pareja2 && (
                  <Icon
                    name="crown"
                    size={20}
                    color="#FFD700"
                    style={styles.crownIcon}
                  />
                )}
                <Text
                  style={[
                    styles.player,
                    pareja.totalSets.pareja1 > pareja.totalSets.pareja2 &&
                      styles.playerWinner,
                  ]}
                >
                  {pareja.jugadores[0].nombre}
                </Text>
                <Text
                  style={[
                    styles.player,
                    pareja.totalSets.pareja1 > pareja.totalSets.pareja2 &&
                      styles.playerWinner,
                  ]}
                >
                  {pareja.jugadores[1].nombre}
                </Text>
              </View>
  
              {/* Columna de Marcadores */}
              <View style={styles.scoresColumn}>
                <View style={styles.setsContainer}>
                  {[1, 2, 3].map((setNum) => (
                    <View key={`set-${setNum}`} style={styles.setContainer}>
                      <Text style={styles.setLabel}>SET {setNum}</Text>
                      <View style={styles.scoreColumn}>
                        <Text
                          style={[
                            styles.setScore,
                            pareja.puntos[`pareja1`][`set${setNum}`] > pareja.puntos[`pareja2`][`set${setNum}`] && 
                            styles.winningScore
                          ]}
                        >
                          {pareja.puntos[`pareja1`][`set${setNum}`]}
                        </Text>
                        <Text style={styles.setSeparator}>-</Text>
                        <Text
                          style={[
                            styles.setScore,
                            pareja.puntos[`pareja2`][`set${setNum}`] > pareja.puntos[`pareja1`][`set${setNum}`] && 
                            styles.winningScore
                          ]}
                        >
                          {pareja.puntos[`pareja2`][`set${setNum}`]}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
  
              {/* Columna de Jugadores 2 */}
              <View
                style={[
                  styles.playersColumn,
                  pareja.totalSets.pareja2 > pareja.totalSets.pareja1 &&
                    styles.winnerContainer,
                ]}
              >
                {pareja.totalSets.pareja2 > pareja.totalSets.pareja1 && (
                  <Icon
                    name="crown"
                    size={20}
                    color="#FFD700"
                    style={styles.crownIcon}
                  />
                )}
                <Text
                  style={[
                    styles.player,
                    pareja.totalSets.pareja2 > pareja.totalSets.pareja1 &&
                      styles.playerWinner,
                  ]}
                >
                  {pareja.jugadores[2].nombre}
                </Text>
                <Text
                  style={[
                    styles.player,
                    pareja.totalSets.pareja2 > pareja.totalSets.pareja1 &&
                      styles.playerWinner,
                  ]}
                >
                  {pareja.jugadores[3].nombre}
                </Text>
              </View>
            </View>
            
            {/* Marcadores inferiores */}
            <View style={styles.bottomMarkersContainer}>
              <View
                style={[
                  styles.globalSetsRow,
                  pareja.tieBreak ? { marginBottom: 6 } : { marginBottom: 0 }
                ]}
              >
                <Text style={styles.totalSetsText}>{pareja.totalSets.pareja1}</Text>
                <View style={styles.setsLabelContainer}>
                  <Text style={styles.setsLabel}>TOTAL</Text>
                  <Text style={styles.setsLabel}>SETS</Text>
                </View>
                <Text style={styles.totalSetsText}>{pareja.totalSets.pareja2}</Text>
              </View>
              {pareja.tieBreak && (
                <View style={styles.tiebreakRow}>
                  <Text style={styles.tiebreakLabel}>TIEBREAK</Text>
                  <View style={styles.scoreRow}>
                    <Text
                      style={[
                        styles.tiebreakScore,
                        pareja.tieBreak.pareja1 > pareja.tieBreak.pareja2 && 
                        styles.winningScore
                      ]}
                    >
                      {pareja.tieBreak.pareja1}
                    </Text>
                    <Text style={styles.setSeparator}>-</Text>
                    <Text
                      style={[
                        styles.tiebreakScore,
                        pareja.tieBreak.pareja2 > pareja.tieBreak.pareja1 && 
                        styles.winningScore
                      ]}
                    >
                      {pareja.tieBreak.pareja2}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    borderRadius: 12,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  roundContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 5,
    padding: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  rondaTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A73E8",
    textAlign: "center",
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  matchContainer: {
    marginBottom: 4,
  },
  matchInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 100,
    paddingVertical: 8,
  },
  playersColumn: {
    flex: 2.5,
    padding: 4,
    borderRadius: 6,
    position: 'relative',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 2,
  },
  winnerContainer: {
    backgroundColor: '#E8F4FD',
    borderWidth: 1.5,
    borderColor: '#BBDEFB',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  crownIcon: {
    position: 'absolute',
    top: -12,
    right: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  player: {
    fontSize: 13,
    color: "#424242",
    marginVertical: 6,
    textAlign: "center",
    fontWeight: '500',
  },
  playerWinner: {
    color: "#0D47A1",
    fontWeight: '700',
  },
  scoresColumn: {
    flex: 4,
    alignItems: "center",
    justifyContent: 'center',
  },
  setsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: '100%',
  },
  setContainer: {
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  setLabel: {
    fontSize: 9,
    color: "#5F6368",
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  scoreColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setScore: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5F6368",
    textAlign: "center",
  },
  tiebreakScore: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5F6368",
    minWidth: 20,
    textAlign: "center",
  },
  winningScore: {
    color: "#1A73E8",
    fontWeight: '800',
  },
  setSeparator: {
    fontSize: 14,
    color: "#BDBDBD",
    marginHorizontal: 4,
    fontWeight: '600',
  },
  bottomMarkersContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#EEEEEE',
  },
  globalSetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  setsLabelContainer: {
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  setsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 0.5,
  },
  totalSetsText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A73E8',
    minWidth: 28,
    textAlign: 'center',
    textShadowColor: 'rgba(26, 115, 232, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tiebreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
    backgroundColor: '#F8F8F8',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tiebreakLabel: {
    fontSize: 11,
    color: "#5F6368",
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default HistorialPartidosReta;
