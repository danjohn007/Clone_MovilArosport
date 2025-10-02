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
import Ionicons from "react-native-vector-icons/Ionicons";
import { actualizarRondaAmericana } from "../componentes/Activos/Americana/AmericanaApiService.js";
import TimeBreak from "../modales/TimeBreak";

// Añadí estado para controlar la apertura del modal de tie break
const HistorialPartidos = ({ ronda, cancha, parejas, creador }) => {
  console.log("cancha", parejas);

  const [parejasLocal, setParejasLocal] = React.useState([]);
  const [parejaSeleccionada, setParejaSeleccionada] = React.useState(null);
  const [puntajes, setPuntajes] = React.useState({ pareja1: "", pareja2: "" });
  const [modalTieBreakVisible, setModalTieBreakVisible] = React.useState(false);
  const [loadingConfirmar, setLoadingConfirmar] = React.useState(false);

  const handleEditar = (index, pareja) => {
    setParejaSeleccionada(index);
    if (pareja.tieBreak) {
      setPuntajes({
        pareja1: pareja.tieBreak.pareja1.toString(),
        pareja2: pareja.tieBreak.pareja2.toString(),
      });
      setModalTieBreakVisible(true);
    } else {
      // Si no hay tie break, abrir editor inline normal:
      setPuntajes({
        pareja1: pareja.puntos.pareja1.toString(),
        pareja2: pareja.puntos.pareja2.toString(),
      });
      setModalTieBreakVisible(false);
    }
  };

  React.useEffect(() => {
    setParejasLocal(parejas);
  }, [parejas]);

  const handleCancelar = () => {
    setParejaSeleccionada(null);
    setPuntajes({ pareja1: "", pareja2: "" });
    setErrorMarcador(""); // ✅ Limpiar mensajes de error también
  };

  // Función para validar puntajes según las reglas
  const validarPuntajes = (p1, p2) => {
    if (p1 < 0 || p2 < 0) {
      return "No se permiten valores negativos.";
    }

    // Solo se permite si p1 = 6 y p2 entre 0 y 5 → válido
    if (p1 === 6 && p2 >= 0 && p2 <= 5) {
      return ""; // ✅ Válido
    }

    // Empate 6-6 → válido para abrir modal (no guardar aún)
    if (p1 === 6 && p2 === 6) {
      return ""; // ✅ Válido
    }

    return "Solo se permiten puntajes entre 6-0 y 6-5, o empate 6-6.";
  };

  // Maneja confirmación con validación y posible apertura modal tie break
  const [errorMarcador, setErrorMarcador] = useState("");

  const validarEnTiempoReal = (nuevoPuntajes) => {
    const p1 = parseInt(nuevoPuntajes.pareja1, 10);
    const p2 = parseInt(nuevoPuntajes.pareja2, 10);

    if (isNaN(p1) || isNaN(p2)) {
      setErrorMarcador("");
      return;
    }

    const error = validarPuntajes(p1, p2);
    setErrorMarcador(error);
  };

  const handleConfirmar = async () => {
    if (parejaSeleccionada !== null) {
      const p1 = parseInt(puntajes.pareja1, 10);
      const p2 = parseInt(puntajes.pareja2, 10);

      if (isNaN(p1) || isNaN(p2)) {
        setErrorMarcador("Los puntajes deben ser números válidos.");
        return;
      }

      const error = validarPuntajes(p1, p2);
      if (error) {
        setErrorMarcador(error);
        return;
      }

      setErrorMarcador("");

      if (p1 === 6 && p2 === 6) {
        setModalTieBreakVisible(true);
        return;
      }

      const pareja = parejasLocal[parejaSeleccionada];
      const idRonda = pareja.id_ronda;
      if (!idRonda) return;

      setLoadingConfirmar(true);
      const respuesta = await actualizarRondaAmericana({
        id_ronda: idRonda,
        puntos: { pareja1: p1, pareja2: p2 },
        tieBreak: null,
      });
      setLoadingConfirmar(false);

      if (respuesta.status) {
        const nuevasParejas = [...parejasLocal];
        nuevasParejas[parejaSeleccionada] = {
          ...nuevasParejas[parejaSeleccionada],
          puntos: { pareja1: p1, pareja2: p2 },
          tieBreak: null,
        };
        setParejasLocal(nuevasParejas);
        setParejaSeleccionada(null);
        setPuntajes({ pareja1: "", pareja2: "" });
      } else {
        console.log("No se pudo actualizar la ronda");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.rondaTitle}>Ronda {ronda + 1}</Text>
      {parejasLocal.map((pareja, index) => (
        <View key={index} style={styles.parejaContainer}>
          <Text style={styles.parejaTitle}>Cancha: {pareja.nombre_cancha}</Text>
          <View style={styles.jugadoresContainer}>
            <View style={styles.equipo1}>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[0].nombre || "-"}
              </Text>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[2].nombre || "-"}
              </Text>
            </View>

            <View style={styles.equipo2}>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[1].nombre || "-"}
              </Text>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[3].nombre || "-"}
              </Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vs}>VS</Text>
            </View>
          </View>

          <View style={styles.puntosContainer}>
            {pareja.tieBreak ? (
              (() => {
                const { pareja1: tb1, pareja2: tb2 } = pareja.tieBreak;
                const baseScore = 6;
                const ganoPareja1 = tb1 > tb2;

                const finalScore1 = ganoPareja1 ? 7 : 6;
                const finalScore2 = ganoPareja1 ? 6 : 7;

                return (
                  <View style={{ alignItems: "center" }}>
                    <Text style={styles.puntos}>
                      {finalScore1} - {finalScore2}
                    </Text>
                    <Text style={styles.tie}>
                      Tie Break: {tb1} - {tb2}
                    </Text>
                  </View>
                );
              })()
            ) : (
              <Text style={styles.puntos}>
                {pareja.puntos.pareja1} - {pareja.puntos.pareja2}
              </Text>
            )}

            {creador && (
              <TouchableOpacity
                onPress={() => handleEditar(index, pareja)}
                style={styles.editIcon}
              >
                <Ionicons name="create-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {parejaSeleccionada === index && !pareja.tieBreak && (
            <View style={styles.editorContainer}>
              <View style={styles.inputsRow}>
                <TextInput
                  style={styles.marcadorInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={puntajes.pareja1}
                  onChangeText={(text) => {
                    const nuevoPuntajes = { ...puntajes, pareja1: text };
                    setPuntajes(nuevoPuntajes);
                    validarEnTiempoReal(nuevoPuntajes);
                  }}
                />
                <Text style={styles.vs}>-</Text>
                <TextInput
                  style={styles.marcadorInput}
                  keyboardType="numeric"
                  maxLength={2}
                  value={puntajes.pareja2}
                  onChangeText={(text) => {
                    const nuevoPuntajes = { ...puntajes, pareja2: text };
                    setPuntajes(nuevoPuntajes);
                    validarEnTiempoReal(nuevoPuntajes);
                  }}
                />
              </View>

              {errorMarcador !== "" && (
                <Text style={styles.errorText}>{errorMarcador}</Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelar}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmar}
                  disabled={loadingConfirmar}
                >
                  {loadingConfirmar ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ))}
      <TimeBreak
        visible={modalTieBreakVisible}
        pareja={parejasLocal[parejaSeleccionada]}
        puntajes={puntajes}
        setPuntajes={setPuntajes}
        onClose={() => setModalTieBreakVisible(false)}
        onConfirm={async (valorTimeBreak) => {
          try {
            setLoadingConfirmar(true);
            const pareja = parejasLocal[parejaSeleccionada];
            const idRonda = pareja.id_ronda;

            const p1 = parseInt(puntajes.pareja1, 10); // debería ser 6
            const p2 = parseInt(puntajes.pareja2, 10); // debería ser 6
            const tb1 = parseInt(valorTimeBreak.pareja1, 10);
            const tb2 = parseInt(valorTimeBreak.pareja2, 10);

            if (
              !idRonda ||
              isNaN(p1) ||
              isNaN(p2) ||
              isNaN(tb1) ||
              isNaN(tb2)
            ) {
              Alert.alert("Error", "Datos inválidos para guardar el marcador.");
              setLoadingConfirmar(false);
              return;
            }

            // Determinar quién ganó el tie-break
            let ganadorTieBreak = null; // 'pareja1' o 'pareja2'
            if (tb1 > tb2) {
              ganadorTieBreak = "pareja1";
            } else if (tb2 > tb1) {
              ganadorTieBreak = "pareja2";
            } else {
              Alert.alert(
                "Error",
                "El marcador de tie-break no puede ser empate."
              );
              setLoadingConfirmar(false);
              return;
            }

            // Actualizar el marcador principal según ganador tie-break:
            // El ganador obtiene 7 puntos y el otro 6
            const puntosActualizados =
              ganadorTieBreak === "pareja1"
                ? { pareja1: 7, pareja2: 6 }
                : { pareja1: 6, pareja2: 7 };

            // Aquí llamas a la función para actualizar en backend
            const respuesta = await actualizarRondaAmericana({
              id_ronda: idRonda,
              puntos: puntosActualizados,
              tieBreak: {
                pareja1: tb1,
                pareja2: tb2,
              },
            });

            setLoadingConfirmar(false);

            if (respuesta.status) {
              const nuevasParejas = [...parejasLocal];
              nuevasParejas[parejaSeleccionada] = {
                ...nuevasParejas[parejaSeleccionada],
                puntos: puntosActualizados,
                tieBreak: { pareja1: tb1, pareja2: tb2 },
              };
              setParejasLocal(nuevasParejas);
              setParejaSeleccionada(null);
              setPuntajes({ pareja1: "", pareja2: "" });
              setModalTieBreakVisible(false);
            } else {
              Alert.alert("Error", "No se pudo guardar el marcador.");
            }
          } catch (err) {
            console.log("Error al confirmar tie break:", err);
            Alert.alert("Error", "Ocurrió un error al guardar el marcador.");
            setLoadingConfirmar(false);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: "colors.primary",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 0,
    marginBottom: 10,
  },
  rondaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  parejaContainer: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "colors.primary",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    elevation: 2,
  },
  parejaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  jugadoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    position: "relative", // necesario para el posicionamiento absoluto de VS
  },

  equipo1: {
    flex: 1,
    alignItems: "flex-start",
  },

  equipo2: {
    flex: 1,
    alignItems: "flex-end",
  },

  vsContainer: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -15 }], // Ajusta este valor según el ancho de "VS"
    zIndex: 1,
  },

  vs: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },

  nombreJugador: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
  },

  puntosContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 4,
  },
  puntos: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  tie: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "colors.primary",
  },
  editIcon: {
    marginTop: -24,
    alignSelf: "flex-end",
  },
  editorContainer: { marginTop: 10, alignItems: "center" },
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  marcadorInput: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "colors.primary",
    color: "white",
    borderWidth: 2,
    borderColor: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 15,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "center",
    gap: 16,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
    borderRadius: 18,
  },
  confirmButton: {
    backgroundColor: "colors.primary",
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
    borderRadius: 18,
  },

  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: -5,
  },
});

export default HistorialPartidos;
