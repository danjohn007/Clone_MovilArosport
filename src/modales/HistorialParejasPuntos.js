import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { obtenerHistorialPuntos } from "../componentes/Activos/Americana/RetaApiService.js";
import Ionicons from "react-native-vector-icons/Ionicons";
import APIManager from "../componentes/API/APIManager.jsx";

const HistorialParejaPuntos = ({
  visible,
  closeModal,
  juegoId,
  onTerminar,
  idUsuarioActual,
}) => {
  console.log("id juego de historial", juegoId);
  const [playerScores, setPlayerScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highestScore, setHighestScore] = useState(0);

  useEffect(() => {
    const fetchRondas = async () => {
      if (visible) {
        setLoading(true);
        try {
          const respuesta = await obtenerHistorialPuntos(juegoId);
          console.log("rondas de juegooooo", respuesta);

          const rondas = respuesta;

          if (Array.isArray(rondas)) {
            const jugadoresPuntos = {};
            const jugadoresIds = {};
            const jugadoresIdJugador = {};
            rondas.forEach((r) => {
              const puntosPareja =
                (parseInt(r.set1, 10) || 0) +
                (parseInt(r.set2, 10) || 0) +
                (parseInt(r.set3, 10) || 0);
              const jugador1 = r.us_jugador1;
              const jugador2 = r.us_jugador2;
              if (!jugadoresPuntos[jugador1]) jugadoresPuntos[jugador1] = 0;
              if (!jugadoresPuntos[jugador2]) jugadoresPuntos[jugador2] = 0;
              jugadoresPuntos[jugador1] += puntosPareja;
              jugadoresPuntos[jugador2] += puntosPareja;
              jugadoresIds[jugador1] = r.id_jugador1;
              jugadoresIds[jugador2] = r.id_jugador2;
              jugadoresIdJugador[jugador1] = r.id_jugador1;
              jugadoresIdJugador[jugador2] = r.id_jugador2;
            });

            // Obtener id_usuario para cada jugador usando tu API
            const jugadoresUsuarios = {};
            await Promise.all(
              Object.values(jugadoresIdJugador).map(async (id_jugador) => {
                if (!jugadoresUsuarios[id_jugador]) {
                  try {
                    const res = await APIManager({
                      url: `ranking/FiltroRanking/get_infoSearch?id_jugador=${id_jugador}`,
                      method: "GET",
                    });
                    jugadoresUsuarios[id_jugador] = res.info_usuario.id_usuario;
                  } catch (e) {
                    jugadoresUsuarios[id_jugador] = null;
                  }
                }
              })
            );

            const jugadoresArray = Object.entries(jugadoresPuntos).map(
              ([nombre, puntos]) => ({
                nombre,
                puntos,
                id: jugadoresIds[nombre],
                id_usuario: jugadoresUsuarios[jugadoresIds[nombre]],
              })
            );
            jugadoresArray.sort((a, b) => b.puntos - a.puntos);
            if (jugadoresArray.length > 0) {
              setHighestScore(jugadoresArray[0].puntos);
            }

            setPlayerScores(jugadoresArray);
          } else {
            setPlayerScores([]);
          }
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Puntuación de jugadores</Text>
            <TouchableOpacity
              style={styles.closeButtonHeader}
              onPress={closeModal}
            >
              <Ionicons name="close" size={24} color="#00baff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : playerScores.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay puntuaciones registradas aún
            </Text>
          ) : (
            <View style={styles.tableContainer}>
              {/* Tabla con estructura cuadriculada */}
              <View style={styles.tableGrid}>
                {/* Encabezados de columna */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.headerCell, styles.playerHeader]}>
                    JUGADOR
                  </Text>
                  <Text style={[styles.headerCell, styles.scoreHeader]}>
                    PUNTOS
                  </Text>
                </View>

                {/* Filas de datos */}
                <ScrollView
                  style={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {(() => {
                    let lastPoints = null;
                    let position = 1;
                    return playerScores.map((jugador, index) => {
                      if (index === 0) {
                        position = 1;
                      } else if (jugador.puntos !== lastPoints) {
                        position += 1;
                      }
                      lastPoints = jugador.puntos;

                      const isTopPlayer = jugador.puntos === highestScore;
                      const isCurrentUser =
                        Number(jugador.id_usuario) === Number(idUsuarioActual);

                      return (
                        <View
                          key={index}
                          style={[
                            styles.tableRow,
                            isCurrentUser && styles.currentUserRow,
                          ]}
                        >
                          <View style={styles.playerCell}>
                            <Text style={styles.positionText}>{position}</Text>
                            <Text style={styles.playerName}>
                              {jugador.nombre}
                            </Text>
                            {isTopPlayer && (
                              <Ionicons
                                name="trophy"
                                size={18}
                                color="#FFD700"
                                style={styles.trophyIcon}
                              />
                            )}
                          </View>
                          <View style={styles.scoreCell}>
                            <Text style={styles.playerScore}>
                              {jugador.puntos}
                            </Text>
                          </View>
                        </View>
                      );
                    });
                  })()}
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0,  0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    maxHeight: "90%",
    borderWidth: 3,
    borderColor: "#00baff",
    padding: 0,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
    textTransform: "uppercase",
    marginLeft: 24,
  },
  closeButtonHeader: {
    padding: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    padding: 20,
  },

  // Contenedor principal de la tabla
  tableContainer: {
    padding: 16,
  },

  // Estructura cuadriculada
  tableGrid: {
    borderWidth: 1,
    borderColor: "#00baff",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },

  // Fila de encabezado
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#00baff",
  },
  headerCell: {
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  playerHeader: {
    flex: 3,
    paddingLeft: 16,
  },
  scoreHeader: {
    flex: 1,
    paddingRight: 16,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
  },

  playerCell: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
  },
  positionText: {
    width: 30,
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    textAlign: "center",
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: "#838080",
    fontWeight: "500",
    marginLeft: 10,
  },
  trophyIcon: {
    marginLeft: 10,
  },
  scoreCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  playerScore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#838080",
    textAlign: "center",
  },
  currentUserRow: {
    backgroundColor: "#e0f2ff",
  },
});

export default HistorialParejaPuntos;
