import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAuth } from "../screens/Auth/AuthContext.js";
import { obtenerHistorialPuntos, obtenerHistorialPuntosReta } from "../componentes/Activos/Americana/RetaApiService.js";
import HistorialPartidos2I from "../componentes/HistorialPartidos2I.js";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import colors from "../styles/colors";

const HistorialPuntos2I = ({
  visible,
  closeModal,
  juegoId,
  onTerminar,
  tipoJuego,
  esHistorial,
}) => {
  console.log("id juego de historial", juegoId);
  const [data, setData] = useState([]); // Estado para almacenar las rondas
  console.log("datos de la ronda", data);
  const [loading, setLoading] = useState(false);
  const { id_usuario } = useAuth();
  const [esCreador, setEsCreador] = useState(false);
  console.log("es creador de jeugoi", esCreador);
  //console.log("modo de juego", tipoJuego);

  useEffect(() => {
    const fetchRondas = async () => {
      if (visible) {
        setLoading(true);
        try {
          let response;
          if (tipoJuego == 10) {
            response = await obtenerHistorialPuntosReta(juegoId);
          } else {
            response = await obtenerHistorialPuntos(juegoId);
          }

          const rondasAgrupadas = {};
          for (let i = 0; i < response.length; i += 2) {
            const pareja1 = response[i];
            const pareja2 = response[i + 1];
            const rondaNum = parseInt(pareja1.num_ronda, 10);

            if (!rondasAgrupadas[rondaNum]) {
              rondasAgrupadas[rondaNum] = [];
            }

            let nombreCancha =
              pareja1.nombre_cancha && pareja1.nombre_cancha.trim() !== ""
                ? pareja1.nombre_cancha
                : `Cancha ${rondasAgrupadas[rondaNum].length + 1}`;

            // Asignar tiebreaks como tiebreak1, tiebreak2, tiebreak3 solo si no son ambos 0-0 (pero sí si hay un 0 y otro valor)
            const tieBreak = {};
            if (
              pareja1.tiebreak !== undefined && pareja1.tiebreak !== null &&
              pareja2.tiebreak !== undefined && pareja2.tiebreak !== null &&
              !(String(pareja1.tiebreak) === "0" && String(pareja2.tiebreak) === "0") &&
              !(String(pareja1.tiebreak).trim() === "" && String(pareja2.tiebreak).trim() === "")
            ) {
              tieBreak.tiebreak1 = [pareja1.tiebreak, pareja2.tiebreak];
            }
            if (
              pareja1.tiebreak2 !== undefined && pareja1.tiebreak2 !== null &&
              pareja2.tiebreak2 !== undefined && pareja2.tiebreak2 !== null &&
              !(String(pareja1.tiebreak2) === "0" && String(pareja2.tiebreak2) === "0") &&
              !(String(pareja1.tiebreak2).trim() === "" && String(pareja2.tiebreak2).trim() === "")
            ) {
              tieBreak.tiebreak2 = [pareja1.tiebreak2, pareja2.tiebreak2];
            }
            if (
              pareja1.tiebreak3 !== undefined && pareja1.tiebreak3 !== null &&
              pareja2.tiebreak3 !== undefined && pareja2.tiebreak3 !== null &&
              !(String(pareja1.tiebreak3) === "0" && String(pareja2.tiebreak3) === "0") &&
              !(String(pareja1.tiebreak3).trim() === "" && String(pareja2.tiebreak3).trim() === "")
            ) {
              tieBreak.tiebreak3 = [pareja1.tiebreak3, pareja2.tiebreak3];
            }

            rondasAgrupadas[rondaNum].push({
              id_ronda: pareja1.id_ronda_reta,
              id_ronda2: pareja2.id_ronda_reta,
              nombre_cancha: nombreCancha,
              jugadores: [
                { nombre: pareja1.us_jugador1 },
                { nombre: pareja1.us_jugador2 },
                { nombre: pareja2.us_jugador1 },
                { nombre: pareja2.us_jugador2 },
              ],
              puntos: {
                set1:
                  pareja1.set1 !== null ? [pareja1.set1, pareja2.set1] : null,
                set2:
                  pareja1.set2 !== null ? [pareja1.set2, pareja2.set2] : null,
                set3:
                  pareja1.set3 !== null ? [pareja1.set3, pareja2.set3] : null,
              },
              tieBreak: Object.keys(tieBreak).length > 0 ? tieBreak : null,
            });
          }

          // Convertir el objeto a array con formato esperado
          const dataFormateada = Object.entries(rondasAgrupadas).map(
            ([ronda, parejas]) => ({
              ronda: parseInt(ronda, 10),
              parejas,
            })
          );
          console.log("datos formados", dataFormateada);

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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>HISTORIAL DE RONDAS</Text>
            <TouchableOpacity
              style={styles.closeButtonHeader}
              onPress={closeModal}
            >
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Contenido sin cambios (sin ActivityIndicator) */}
          {loading ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : data.length === 0 ? (
            <Text style={styles.emptyText}>No hay rondas registradas aún</Text>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false} // Barra lateral eliminada
            >
              {data.map((rondaData, index) => (
                <HistorialPartidos2I
                  key={index}
                  ronda={rondaData.ronda}
                  parejas={rondaData.parejas}
                  idJuego={juegoId}
                  tipoJuego={tipoJuego}
                  esHistorial={esHistorial}
                />
              ))}
            </ScrollView>
          )}

          {!esHistorial && <View style={styles.footerSeparator} />}
          {/* Botones sin el botón de cerrar */}

          {!esHistorial && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.terminateButton,
                  data.length === 0 && styles.disabledButton,
                  {
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
                onPress={onTerminar}
                disabled={data.length === 0}
              >
                <AntDesign
                  name="poweroff"
                  size={16}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>Terminar Juego</Text>
              </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    flex: 1,
    textTransform: "uppercase",
  },
  closeButtonHeader: {
    padding: 4,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  scrollView: {
    maxHeight: "90%",
    padding: 16, // Añadido padding para el contenido
  },
  footerSeparator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
  },
  terminateButton: {
    paddingVertical: 12,
    backgroundColor: "#00BFFF",
    borderRadius: 16,
    alignItems: "center",
    minWidth: 150,
    width: "90%",
    alignSelf: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 14,
  },
});

export default HistorialPuntos2I;
