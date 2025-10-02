import React, { useState, useEffect, useRef } from "react";
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
import HistorialPartidosReta from "../componentes/HistorialPartidosReta.js";
import Titulo from "../componentes/Titulo";
import colors from "../styles/colors";


//historial de parejas anterior para la reta (ahora esta extinto)
const HistorialParejas = ({ visible, closeModal, juegoId, onTerminar }) => {
  console.log("id juego de historial", juegoId);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [esCreador, setEsCreador] = useState(false);

  useEffect(() => {
    const fetchRondas = async () => {
      if (visible) {
        setLoading(true);
        try {
          const respuesta = await obtenerHistorialPuntos(juegoId);
          console.log("rondas de juego", respuesta);

          const rondas = respuesta;

          // Agrupar resultados por número de ronda
          const rondasAgrupadas = {};
          if (Array.isArray(rondas)) {
            rondas.forEach((r) => {
              const rondaNum = r.num_ronda;
              if (!rondasAgrupadas[rondaNum]) {
                rondasAgrupadas[rondaNum] = [];
              }
              rondasAgrupadas[rondaNum].push(r);
            });
          } else {
            console.error(
              "La respuesta de la API no es un array válido:",
              rondas
            );
            // Opcional: manejar el estado de error en la UI
          }

          // Formatear datos para el componente HistorialPartidos
          const dataFormateada = Object.entries(rondasAgrupadas)
            .map(([rondaNum, parejasData]) => {
              const matches = [];
              parejasData.sort(
                (a, b) => parseInt(a.pareja, 10) - parseInt(b.pareja, 10)
              );

              for (let i = 0; i < parejasData.length; i += 2) {
                if (i + 1 >= parejasData.length) {
                  console.warn(
                    `Ronda ${rondaNum} tiene un número impar de parejas.`
                  );
                  continue;
                }

                const pareja1Data = parejasData[i];
                const pareja2Data = parejasData[i + 1];

                const puntosPareja1 =
                  (parseInt(pareja1Data.set1, 10) || 0) +
                  (parseInt(pareja1Data.set2, 10) || 0) +
                  (parseInt(pareja1Data.set3, 10) || 0);

                const puntosPareja2 =
                  (parseInt(pareja2Data.set1, 10) || 0) +
                  (parseInt(pareja2Data.set2, 10) || 0) +
                  (parseInt(pareja2Data.set3, 10) || 0);

                const tieBreakP1 = pareja1Data.tiebreak
                  ? parseInt(pareja1Data.tiebreak, 10)
                  : null;
                const tieBreakP2 = pareja2Data.tiebreak
                  ? parseInt(pareja2Data.tiebreak, 10)
                  : null;

                let p1_sets = 0;
                let p2_sets = 0;

                const p1_s1 = parseInt(pareja1Data.set1, 10) || 0;
                const p2_s1 = parseInt(pareja2Data.set1, 10) || 0;
                if (p1_s1 > p2_s1) p1_sets++;
                else if (p2_s1 > p1_s1) p2_sets++;

                const p1_s2 = parseInt(pareja1Data.set2, 10) || 0;
                const p2_s2 = parseInt(pareja2Data.set2, 10) || 0;
                if (p1_s2 > p2_s2) p1_sets++;
                else if (p2_s2 > p1_s2) p2_sets++;

                const p1_s3 = parseInt(pareja1Data.set3, 10) || 0;
                const p2_s3 = parseInt(pareja2Data.set3, 10) || 0;
                if (p1_s3 > p2_s3) p1_sets++;
                else if (p2_s3 > p1_s3) p2_sets++;

                if (tieBreakP1 !== null && tieBreakP2 !== null) {
                  if (tieBreakP1 > tieBreakP2) p1_sets++;
                  else if (tieBreakP2 > tieBreakP1) p2_sets++;
                }

                const match = {
                  jugadores: [
                    { nombre: pareja1Data.us_jugador1 },
                    { nombre: pareja1Data.us_jugador2 },
                    { nombre: pareja2Data.us_jugador1 },
                    { nombre: pareja2Data.us_jugador2 },
                  ],
                  puntos: {
                    pareja1: {
                      set1: parseInt(pareja1Data.set1, 10) || 0,
                      set2: parseInt(pareja1Data.set2, 10) || 0,
                      set3: parseInt(pareja1Data.set3, 10) || 0,
                    },
                    pareja2: {
                      set1: parseInt(pareja2Data.set1, 10) || 0,
                      set2: parseInt(pareja2Data.set2, 10) || 0,
                      set3: parseInt(pareja2Data.set3, 10) || 0,
                    },
                  },
                  totalSets: {
                    pareja1: p1_sets,
                    pareja2: p2_sets,
                  },
                  tieBreak:
                    tieBreakP1 !== null && tieBreakP2 !== null
                      ? {
                          pareja1: tieBreakP1,
                          pareja2: tieBreakP2,
                        }
                      : null,
                };
                matches.push(match);
              }

              if (matches.length === 0) {
                return null;
              }

              return {
                ronda: parseInt(parejasData[0].num_ronda, 10),
                parejas: matches,
              };
            })
            .filter(Boolean);

          setData(dataFormateada);
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
          <Titulo titulo="HISTORIAL DE RONDAS" />
          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : data.length === 0 ? (
            <Text style={styles.emptyText}>No hay rondas registradas aún</Text>
          ) : (
            <ScrollView style={styles.scrollView}>
              {data.map((rondaData, index) => (
                <HistorialPartidosReta
                  key={index}
                  ronda={rondaData.ronda}
                  parejas={rondaData.parejas}
                />
              ))}
            </ScrollView>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.terminateButton,
                data.length === 0 && styles.disabledButton,
              ]}
              onPress={onTerminar}
            >
              <Text style={styles.buttonText}>Terminar Juego</Text>
            </TouchableOpacity>
          </View>
          {/* <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.terminateButton,
                data.length === 0 && styles.disabledButton,
              ]}
              onPress={onTerminar}
              disabled={data.length === 0}
            >
              <Text style={styles.buttonText}>Terminar Juego</Text>
            </TouchableOpacity>
          </View> */}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  scrollView: {
    maxHeight: "90%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#C9C9C9",
    borderRadius: 18,
    alignItems: "center",
  },
  terminateButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#00BFFF",
    borderRadius: 18,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontFamily: "Poppins",
    fontSize: 14,
  },
  btnCerrar: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  textoCerrar: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default HistorialParejas;
