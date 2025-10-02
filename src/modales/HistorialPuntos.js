import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import HistorialPartidos from "../componentes/HistorialPartidos";
import { obtenerRondasAmericana } from "../componentes/Activos/Americana/AmericanaApiService.js";
import { useAuth } from "../screens/Auth/AuthContext.js";
import colors from "../styles/colors";

const HistorialPuntos = ({ visible, closeModal, juegoId, onTerminar }) => {
  console.log("id juego de historial", juegoId);
  const [data, setData] = useState([]); // Estado para almacenar las rondas
  console.log("datos de la ronda", data);
  const [loading, setLoading] = useState(false);
  const { id_usuario } = useAuth();
  const [esCreador, setEsCreador] = useState(false);
  console.log("es creador de jeugoi", esCreador);

  useEffect(() => {
    const fetchRondas = async () => {
      if (visible) {
        setLoading(true);
        try {
          const response = await obtenerRondasAmericana(juegoId);

          const { rondas, id_creador } = response;

          const soyCreador = id_creador == id_usuario; // usa == por si uno es string y otro número
          setEsCreador(soyCreador);

          const rondasAgrupadas = {};

          rondas.forEach((r) => {
            const rondaNum = parseInt(r.ronda, 10);

            if (!rondasAgrupadas[rondaNum]) {
              rondasAgrupadas[rondaNum] = [];
            }

            rondasAgrupadas[rondaNum].push({
              id_ronda: r.id,
              nombre_cancha: r.nombre_cancha,
              jugadores: [
                { nombre: r.nombre_jugador1_p1 },
                { nombre: r.nombre_jugador1_p2 },
                { nombre: r.nombre_jugador2_p1 },
                { nombre: r.nombre_jugador2_p2 },
              ],
              puntos: {
                pareja1: parseInt(r.puntos_p1, 10),
                pareja2: parseInt(r.puntos_p2, 10),
              },
              tieBreak:
                r.puntos_tieBreak_p1 !== null && r.puntos_tieBreak_p2 !== null
                  ? {
                      pareja1: parseInt(r.puntos_tieBreak_p1, 10),
                      pareja2: parseInt(r.puntos_tieBreak_p2, 10),
                    }
                  : null,
            });
          });

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
          <Text style={styles.title}>Historial de Rondas</Text>
          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : data.length === 0 ? (
            <Text style={styles.emptyText}>No hay rondas registradas aún</Text>
          ) : (
            <ScrollView style={styles.scrollView}>
              {data.map((rondaData, index) => (
                <HistorialPartidos
                  key={index}
                  ronda={rondaData.ronda}
                  parejas={rondaData.parejas}
                  creador={esCreador}
                  idJuego={juegoId}
                />
              ))}
            </ScrollView>
          )}
          <View style={styles.buttonContainer}>
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
          </View>
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
    fontSize: 16,
  },
});

export default HistorialPuntos;
