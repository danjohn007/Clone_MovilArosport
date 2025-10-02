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
import { actualizarRondaAmericana } from "./Activos/Americana/AmericanaApiService.js";
import TimeBreak from "../modales/TimeBreak.js";
import { actualizarRondaReta } from "./Activos/Americana/RetaApiService.js";

// Añadí estado para controlar la apertura del modal de tie break
const HistorialPartidos2I = ({
  ronda,
  cancha,
  parejas,
  idJuego,
  tipoJuego,
  esHistorial,
}) => {
  console.log("cancha", parejas);

  const [parejasLocal, setParejasLocal] = React.useState([]);
  const [parejaSeleccionada, setParejaSeleccionada] = React.useState(null);
  const [puntajes, setPuntajes] = React.useState({
    set1: [0, 0],
    set2: [0, 0],
    set3: [0, 0],
  });
  const [modalTieBreakVisible, setModalTieBreakVisible] = React.useState(false);
  const [marcadorTiebreak, setMarcadorTiebreak] = useState({});
  const [loadingConfirmar, setLoadingConfirmar] = React.useState(false);
  const [errorMarcador, setErrorMarcador] = useState("");
  const [enEdicion, setEnEdicion] = useState(false);
  const [totalScoresPareja1, setTotalScoresPareja1] = useState(0);
  const [totalScoresPareja2, setTotalScoresPareja2] = useState(0);
  const [tiebreak, setTiebreak] = useState({ pareja1: "", pareja2: "" });

  const handleEditar = (index, pareja) => {
    setParejaSeleccionada(index);
    setEnEdicion(true);
    // Solo inicializa los sets que existen en puntos
    const puntos = pareja.puntos || {};
    const nuevosPuntajes = {};
    Object.keys(puntos).forEach((setKey) => {
      nuevosPuntajes[setKey] = puntos[setKey]
        ? [String(puntos[setKey][0]), String(puntos[setKey][1])]
        : ["", ""];
    });
    setPuntajes(nuevosPuntajes);
    setTiebreak(pareja.tieBreak || { pareja1: "", pareja2: "" });
    setModalTieBreakVisible(false);
  };

  React.useEffect(() => {
    setParejasLocal(parejas);
  }, [parejas]);

  const handleCancelar = () => {
    setParejaSeleccionada(null);
    setEnEdicion(false);
    setPuntajes({ set1: [0, 0], set2: [0, 0], set3: [0, 0] });
    setErrorMarcador("");
  };

  const validarSet = (p1, p2) => {
    if (p1 === "" && p2 === "") return ""; // Permitir sets vacíos
    if (isNaN(p1) || isNaN(p2))
      return "Los puntajes deben ser números válidos.";
    p1 = parseInt(p1, 10);
    p2 = parseInt(p2, 10);
    if (p1 < 0 || p2 < 0) return "No se permiten valores negativos.";
    if (p1 === 6 && p2 >= 0 && p2 <= 5) return "";
    if (p2 === 6 && p1 >= 0 && p1 <= 5) return "";
    if (p1 === 6 && p2 === 6) return "";
    return "Solo se permiten puntajes entre 6-0 y 6-5, o empate 6-6.";
  };

  const validarSetAmericana = (p1, p2) => {
    if (p1 === "" && p2 === "") return ""; // Permitir sets vacíos
    if (isNaN(p1) || isNaN(p2))
      return "Los puntajes deben ser números válidos.";
    p1 = parseInt(p1, 10);
    p2 = parseInt(p2, 10);
    if (p1 < 0 || p2 < 0) return "No se permiten valores negativos.";
    if (p1 === 8 && p2 >= 0 && p2 <= 7) return "";
    if (p2 === 8 && p1 >= 0 && p1 <= 7) return "";
    if (p1 === 6 && p2 === 6) return "";
    if (p1 > 8 || p2 > 8)
      return "Solo se permiten puntajes entre 8 y 0 o empate de 6-6";
    return "";
  };

  // Función para saber si mostrar el input de tiebreak
  const shouldShowTiebreakInput = () => {
    if (parejaSeleccionada === null) return false;
    const pareja = parejasLocal[parejaSeleccionada];
    if (!pareja) return false;
    const setKeys = Object.keys(puntajes);
    // Si solo hay un set
    if (setKeys.length === 1) {
      const [p1, p2] = puntajes[setKeys[0]] || ["", ""];
      if ((p1 === "6" && p2 === "6") || tiebreak.pareja1 || tiebreak.pareja2)
        return true;
      return false;
    }
    // Si hay más de un set, contar sets ganados
    let setsGanados1 = 0,
      setsGanados2 = 0,
      hayEmpate66 = false;
    setKeys.forEach((key) => {
      const [p1, p2] = puntajes[key] || ["", ""];
      if (p1 !== "" && p2 !== "") {
        if (parseInt(p1) > parseInt(p2)) setsGanados1++;
        else if (parseInt(p2) > parseInt(p1)) setsGanados2++;
        if (p1 === "6" && p2 === "6") hayEmpate66 = true;
      }
    });
    // Empate en sets ganados y hay 6-6 o ya hay tiebreak
    if (
      setsGanados1 === setsGanados2 &&
      (hayEmpate66 || tiebreak.pareja1 || tiebreak.pareja2)
    )
      return true;
    return false;
  };

  const handleConfirmar = async () => {
    if (parejaSeleccionada !== null) {
      const pareja = parejasLocal[parejaSeleccionada];
      const sets = {};
      const puntajesNumericos = {};
      const setKeys = Object.keys(pareja.puntos);
      // --- Ajuste para tiebreak en un solo set ---
      let tiebreakToSend = [null, null];
      let tiebreakObj = null;
      if (shouldShowTiebreakInput()) {
        if (!tiebreak.pareja1 || !tiebreak.pareja2) {
          setErrorMarcador("Debes ingresar el marcador del tiebreak.");
          return;
        }
        if (tiebreak.pareja1 === tiebreak.pareja2) {
          setErrorMarcador("El tiebreak no puede ser empate.");
          return;
        }
        if (tipoJuego === 10 && tiebreak.pareja1 - tiebreak.pareja2 != 2) {
          setErrorMarcador(
            "En el tiebreak debe haber minimo una diferencia de 2 puntos."
          );
          return;
        }
        if (tipoJuego === 10 && tiebreak.pareja1 < 7 && tiebreak.pareja2 < 7) {
          setErrorMarcador(
            "En el tiebreak al menos se debe llegar un equipo a los 7 puntos."
          );
          return;
        }
        if (
          ((tipoJuego <= 2 || tipoJuego >= 14) && tiebreak.pareja1 > 5) ||
          tiebreak.pareja2 > 5
        ) {
          setErrorMarcador("Solo se puede tener maximo 5 puntos");
          return;
        }
        tiebreakToSend = [
          parseInt(tiebreak.pareja1, 10),
          parseInt(tiebreak.pareja2, 10),
        ];
        tiebreakObj = { pareja1: tiebreak.pareja1, pareja2: tiebreak.pareja2 };
      }
      setKeys.forEach((key) => {
        let [p1, p2] = puntajes[key];
        let n1 = p1 === "" ? 0 : parseInt(p1, 10);
        let n2 = p2 === "" ? 0 : parseInt(p2, 10);
        // Ajuste para tiebreak: solo si set1 tiene datos y los demás sets son 0,0 o no existen
        if (
          key === "set1" &&
          shouldShowTiebreakInput() &&
          tiebreakToSend[0] !== null &&
          tiebreakToSend[1] !== null &&
          (!puntajes["set2"] ||
            (puntajes["set2"][0] == 0 && puntajes["set2"][1] == 0)) &&
          (!puntajes["set3"] ||
            (puntajes["set3"][0] == 0 && puntajes["set3"][1] == 0))
        ) {
          if (tiebreakToSend[0] > tiebreakToSend[1]) {
            n1 = 7;
            n2 = 6;
          } else {
            n1 = 6;
            n2 = 7;
          }
        }
        if (p1 !== "" && p2 !== "") {
          sets[key] = [n1, n2];
        } else {
          sets[key] = null;
        }
        puntajesNumericos[key] = [n1, n2];
      });
      // Validar solo los sets que existen
      console.log(puntajesNumericos);
      let error = "";
      setKeys.forEach((setKey) => {
        if (pareja.puntos[setKey] !== null) {
          const [p1, p2] = puntajes[setKey];
          let setError = "";

          if (tipoJuego <= 2) {
            setError = validarSetAmericana(p1, p2);
          } else {
            setError = validarSet(p1, p2);
          }

          if (setError && !error) {
            error = `Set ${setKey.slice(-1)}: ${setError}`;
          }
        }
      });
      if (error) {
        setErrorMarcador(error);
        return;
      }
      setErrorMarcador("");
      const idRonda = pareja.id_ronda;
      const idRonda2 = pareja?.id_ronda2;
      if (!idRonda) return;
      // Si ya no corresponde tiebreak, limpia el estado visual
      if (!shouldShowTiebreakInput()) {
        setTiebreak({ pareja1: "", pareja2: "" });
      }
      setLoadingConfirmar(true);
      const respuesta = await actualizarRondaReta(
        idRonda,
        idRonda2,
        puntajesNumericos,
        shouldShowTiebreakInput() ? tiebreakToSend : [null, null]
      );
      setLoadingConfirmar(false);
      if (respuesta.status) {
        const nuevasParejas = [...parejasLocal];
        // Solo guarda los sets que no son 0-0 ni null
        const setsFiltrados = {};
        Object.keys(sets).forEach((key) => {
          if (sets[key] && (sets[key][0] !== 0 || sets[key][1] !== 0)) {
            setsFiltrados[key] = sets[key];
          }
        });
        nuevasParejas[parejaSeleccionada] = {
          ...nuevasParejas[parejaSeleccionada],
          puntos: setsFiltrados,
          tieBreak: shouldShowTiebreakInput() ? tiebreakObj : null,
        };
        setParejasLocal(nuevasParejas);
        setParejaSeleccionada(null);
        setEnEdicion(false);
        setPuntajes({ set1: [0, 0], set2: [0, 0], set3: [0, 0] });
        setTiebreak({ pareja1: "", pareja2: "" });
      } else {
        console.log("No se pudo actualizar la ronda");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.rondaTitle}>Ronda {ronda}</Text>
      {parejasLocal.map((pareja, index) => (
        <View key={index} style={styles.parejaContainer}>
          <Text style={styles.parejaTitle}>
            {pareja.nombre_cancha && pareja.nombre_cancha.trim() !== ""
              ? `${pareja.nombre_cancha.trim()}`
              : `Cancha ${index + 1}`}
          </Text>
          {!esHistorial && (
            <TouchableOpacity
              onPress={() => handleEditar(index, pareja)}
              style={styles.editIcon}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={styles.jugadoresContainer}>
            <View style={styles.equipo1}>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[0].nombre || "-"}
              </Text>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[1].nombre || "-"}
              </Text>
            </View>

            <View style={styles.equipo2}>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[2].nombre || "-"}
              </Text>
              <Text style={styles.nombreJugador}>
                {pareja.jugadores[3].nombre || "-"}
              </Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vs}>VS</Text>
            </View>
          </View>

          {!(enEdicion && parejaSeleccionada === index) && (
            <>
              {tipoJuego == 10 && (
                <View style={styles.puntosContainer}>
                  {['set1', 'set2', 'set3'].map((set, idx) => {
                    const puntos = pareja.puntos[set];
                    if (!puntos || (puntos[0] === 0 && puntos[1] === 0)) return null;
                    // Buscar tiebreak correspondiente en el nuevo formato
                    let tb = null;
                    if (pareja.tieBreak && pareja.tieBreak[`tiebreak${idx+1}`]) {
                      const [tb1, tb2] = pareja.tieBreak[`tiebreak${idx+1}`];
                      tb = { pareja1: tb1, pareja2: tb2 };
                    }
                    // Contar cuántos tiebreaks existen antes de este set
                    let tiebreaksPrevios = 0;
                    for (let i = 1; i < idx + 1; i++) {
                      if (pareja.tieBreak && pareja.tieBreak[`tiebreak${i}`]) {
                        tiebreaksPrevios++;
                      }
                    }
                    let tbMargin = "34%";
                    if (tiebreaksPrevios === 1) tbMargin = "40%";
                    if (tiebreaksPrevios === 2) tbMargin = "45%";
                    return (
                      <View key={set} style={ (idx === 2) ? {position: 'absolute', width: '100%', marginTop: tbMargin} : {} }>
                        <Text
                          key={set}
                          style={[styles.puntos, tb ? { marginTop: 2, marginBottom: -2 } : { marginTop: idx === 0 ? 6 : 8 }]}
                        >
                          {puntos[0]} - {puntos[1]}
                        </Text>
                        {tb && (
                          <Text style={[styles.tieReta]}>
                            {tb.pareja1}  TieBreak  {tb.pareja2}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {tipoJuego != 10 && (() => {
                // Solo mostrar set1 si existe y no es 0-0
                const puntosSet1 = pareja.puntos['set1'];
                if (!puntosSet1 || (puntosSet1[0] === 0 && puntosSet1[1] === 0)) return null;
                // Si hay tiebreak, marcador azul, si no, naranja
                const hayTiebreak = Array.isArray(pareja.tieBreak)
                  ? pareja.tieBreak.length > 0 && pareja.tieBreak[0] && pareja.tieBreak[0].pareja1 !== undefined && pareja.tieBreak[0].pareja2 !== undefined
                  : pareja.tieBreak && pareja.tieBreak.pareja1 !== undefined && pareja.tieBreak.pareja2 !== undefined;
                return (
                  <View style={styles.puntosContainer}>
                    <Text style={[styles.puntos, !hayTiebreak && styles.puntosNaranja]}>
                      {puntosSet1[0]} - {puntosSet1[1]}
                    </Text>
                  </View>
                );
              })()}

              {Array.isArray(pareja.tieBreak) && pareja.tieBreak.length > 0 && tipoJuego != 10 && (
                (() => {
                  // Mostrar tiebreak1 si existe en el nuevo formato
                  if (pareja.tieBreak && pareja.tieBreak.tiebreak1) {
                    const [tb1, tb2] = pareja.tieBreak.tiebreak1;
                    return (
                      <Text style={styles.tie} key={0}>
                        Tie Break {tb1} - {tb2}
                      </Text>
                    );
                  }
                  return null;
                })())}
            </>
          )}

          {parejaSeleccionada === index && (
            <View style={styles.editorContainer}>
              {Object.keys(pareja.puntos)
                .filter((setKey) => pareja.puntos[setKey] !== null)
                .map((setKey, i) => (
                  <View key={setKey} style={styles.inputsRow}>
                    <TextInput
                      style={styles.marcadorInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={puntajes[setKey] ? puntajes[setKey][0] : ""}
                      onChangeText={(text) => {
                        const nuevo = {
                          ...puntajes,
                          [setKey]: [
                            text,
                            puntajes[setKey] ? puntajes[setKey][1] : "",
                          ],
                        };
                        // Si solo hay un set y ya no es 6-6, limpiar tiebreak
                        if (Object.keys(nuevo).length === 1) {
                          const [p1, p2] = nuevo[setKey];
                          if (!(p1 === "6" && p2 === "6")) {
                            setTiebreak({ pareja1: "", pareja2: "" });
                          }
                        }
                        setPuntajes(nuevo);
                      }}
                      placeholder="0"
                      placeholderTextColor="#fff"
                    />
                    <Text style={styles.vs}>-</Text>
                    <TextInput
                      style={styles.marcadorInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={puntajes[setKey] ? puntajes[setKey][1] : ""}
                      onChangeText={(text) => {
                        const nuevo = {
                          ...puntajes,
                          [setKey]: [
                            puntajes[setKey] ? puntajes[setKey][0] : "",
                            text,
                          ],
                        };
                        // Si solo hay un set y ya no es 6-6, limpiar tiebreak
                        if (Object.keys(nuevo).length === 1) {
                          const [p1, p2] = nuevo[setKey];
                          if (!(p1 === "6" && p2 === "6")) {
                            setTiebreak({ pareja1: "", pareja2: "" });
                          }
                        }
                        setPuntajes(nuevo);
                      }}
                      placeholder="0"
                      placeholderTextColor="#fff"
                    />
                  </View>
                ))}
              {/* Inputs de tiebreak solo si corresponde */}
              {shouldShowTiebreakInput() && (
                <View style={styles.inputsRow}>
                  <TextInput
                    style={styles.marcadorInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={tiebreak.pareja1}
                    onChangeText={(text) =>
                      setTiebreak({ ...tiebreak, pareja1: text })
                    }
                    placeholder="0"
                    placeholderTextColor="#fff"
                  />
                  <Text style={styles.vs}>-</Text>
                  <TextInput
                    style={styles.marcadorInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={tiebreak.pareja2}
                    onChangeText={(text) =>
                      setTiebreak({ ...tiebreak, pareja2: text })
                    }
                    placeholder="0"
                    placeholderTextColor="#fff"
                  />
                </View>
              )}
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
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 0,
    marginBottom: 15,
    paddingTop: 15,
    paddingBottom: 35,
  },
  rondaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    backgroundColor: "colors.primary",
    padding: 8,
    borderRadius: 16,
    width: "90%",
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  parejaContainer: {
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "colors.primary",
    borderRadius: 16,
    padding: 10,
    marginBottom: 18,
    elevation: 2,
    position: "relative",
    paddingTop: 35,
    marginTop: 35,
    paddingBottom: 30,
    overflow: "visible",
  },
  parejaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    backgroundColor: "colors.primary",
    width: "70%",
    alignSelf: "center",
    textAlign: "center",
    padding: 6,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#fff",
    top: -18,
    position: "absolute",
  },
  jugadoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    position: "relative",
    paddingHorizontal: 8,
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
    left: "57%",
    transform: [{ translateX: -15 }],
    zIndex: 1,
  },
  vs: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  nombreJugador: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
    marginBottom: 8,
  },
  puntosContainer: {
    //position: "relative",
  },
  puntos: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFF",
    backgroundColor: "colors.primary",
    width: "70%",
    alignSelf: "center",
    padding: 6,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#FFF",
    letterSpacing: 6,
    marginTop: 6,
  },
  puntosNaranja: {
    position: "absolute",
  },
  tie: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFF",
    backgroundColor: "colors.primary",
    padding: 6,
    borderRadius: 16,
    width: "68%",
    borderWidth: 3,
    borderColor: "#fff",
    alignSelf: "center",
    position: "absolute",
    bottom: -15,
    zIndex: 1,
  },
  //estilos de tibreak para la reta
  tieReta: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFF",
    backgroundColor: "colors.primary",
    padding: 2,
    borderRadius: 8,
    width: "38%",
    borderWidth: 1,
    borderColor: "#fff",
    alignSelf: "center",
  },

  editIcon: {
    marginTop: -24,
    alignSelf: "flex-end",
    marginBottom: 3,
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

export default HistorialPartidos2I;