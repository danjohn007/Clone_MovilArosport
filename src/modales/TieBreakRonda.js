import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import Titulo from "../componentes/Titulo";
import { Ionicons } from "@expo/vector-icons";

const TieBreakRonda = ({
  visible,
  onClose,
  onConfirm,
  pareja,
  puntajes = {},
  setPuntajes,
}) => {
  const [errores, setErrores] = useState({});

  //   useEffect(() => {
  //   if (!visible) {
  //     setErrores('');
  //     setPuntajes({ pareja1: '', pareja2: '' });
  //   }
  // }, [visible]);

  // ✅ Valida en tiempo real cada que cambian los inputs
  const validarPuntaje = (canchaIndex, pareja1, pareja2) => {
    if (pareja1 === "" || pareja2 === "")
      return "Ambos campos son obligatorios";

    const p1 = parseInt(pareja1);
    const p2 = parseInt(pareja2);

    if (isNaN(p1) || isNaN(p2)) return "Ambos valores deben ser números";
    if (p1 < 0 || p2 < 0) return "Los puntos deben ser positivos";
    if (p1 === p2) return "El marcador no puede ser empate";

    const diff = Math.abs(p1 - p2);

    if ((p1 > 7 && p2 < 6) || (p2 > 7 && p1 < 6)) {
      return "No se puede ganar más de 7 puntos si el otro no tiene al menos 6.";
    }
    if ((p1 > 7 && p2 < p1 && diff > 2) || (p2 > 7 && p1 < p2 && diff > 2)) {
      return "No se puede ganar más de 7 puntos si la diferencia es mayor a 2.";
    }
    // ✅ Nuevo criterio: al menos uno debe ser >= 7 y diferencia mínima de 2
    if ((p1 < 7 && p2 < 7) || diff < 2) {
      return "Uno de los equipos debe tener al menos 7 puntos y diferencia mínima de 2.";
    }

    return "";
  };

  const inputRefs = useRef({});

  const handleChange = (canchaIndex, parejaField, value) => {
    // ✅ Solo números y máximo 2 dígitos
    const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 2);

    const updated = { ...puntajes };
    updated[canchaIndex] = {
      ...(updated[canchaIndex] || {}),
      [parejaField]: cleanValue,
    };
    setPuntajes(updated);

    // ✅ Validación en tiempo real
    const err = validarPuntaje(
      canchaIndex,
      updated[canchaIndex].pareja1,
      updated[canchaIndex].pareja2
    );
    setErrores((prev) => ({
      ...prev,
      [canchaIndex]: err,
    }));

    // ✅ Enfocar siguiente input si es el primer campo y tiene **al menos 1 dígito**
    if (cleanValue.length >= 1 && parejaField === "pareja1") {
      inputRefs.current[`${canchaIndex}_pareja2`]?.focus();
    }
  };

  const handleConfirm = () => {
    const nuevosErrores = {};
    const puntajesValidos = {};

    pareja.forEach((p) => {
      const canchaIndex = p.canchaIndex;
      const puntaje = puntajes[canchaIndex] || {};
      const p1 = puntaje.pareja1;
      const p2 = puntaje.pareja2;

      const error = validarPuntaje(canchaIndex, p1, p2);
      if (error) {
        nuevosErrores[canchaIndex] = error;
        return;
      }

      puntajesValidos[canchaIndex] = {
        pareja1: parseInt(p1),
        pareja2: parseInt(p2),
      };
    });

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      Alert.alert(
        "Atención",
        "Por favor valida todos los marcadores. Ninguno debe estar vacío ni ser empate 0-0."
      );
      return;
    }

    onConfirm(puntajesValidos);
    onClose();
  };

  // Desactivar el botón si hay algún error o algún campo vacío
  const hayErrores = Object.values(errores).some((e) => e && e.length > 0);
  const hayCamposVacios = Array.isArray(pareja) && pareja.some((p) => {
    const canchaIndex = p.canchaIndex;
    return !puntajes[canchaIndex]?.pareja1 || !puntajes[canchaIndex]?.pareja2;
  });
  const botonDesactivado = hayErrores || hayCamposVacios;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.titleModal}>
            <View style={styles.titleSubContainer}>
              <Text style={styles.titleText}>Tie-Break</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={25} color="#02B9FA" />
            </TouchableOpacity>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Ingresa el marcador del Tie-Break:</Text>
            <ScrollView
              style={styles.scrollView}
              keyboardShouldPersistTaps="handled"
            >
              {Array.isArray(pareja) &&
                pareja.map((p, index) => (
                  <View key={index} style={styles.parejaContainer}>
                    <Text style={styles.cancha}>{p.nombre_cancha}</Text>

                    <View style={styles.jugadoresContainer}>
                      <View style={styles.equipo1}>
                        <Text style={styles.nombreJugador}>
                          {p.jugadores[2] || "-"}
                        </Text>
                        <Text style={styles.nombreJugador}>
                          {p.jugadores[3] || "-"}
                        </Text>
                      </View>

                      <View style={styles.equipo2}>
                        <Text style={styles.nombreJugador}>
                          {p.jugadores[0] || "-"}
                        </Text>
                        <Text style={styles.nombreJugador}>
                          {p.jugadores[1] || "-"}
                        </Text>
                      </View>

                      <View style={styles.vsContainer}>
                        <Text style={styles.vs}>VS</Text>
                      </View>
                    </View>

                    <View style={styles.inputsRow}>
                      <TextInput
                        ref={(ref) =>
                          (inputRefs.current[`${p.canchaIndex}_pareja1`] = ref)
                        }
                        style={styles.marcadorInput}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#00BAFF"
                        value={puntajes[p.canchaIndex]?.pareja1 || ""}
                        onChangeText={(text) =>
                          handleChange(p.canchaIndex, "pareja1", text)
                        }
                        maxLength={2}
                      />
                      <Text style={styles.vs}>-</Text>
                      <TextInput
                        ref={(ref) =>
                          (inputRefs.current[`${p.canchaIndex}_pareja2`] = ref)
                        }
                        style={styles.marcadorInput}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#00BAFF"
                        value={puntajes[p.canchaIndex]?.pareja2 || ""}
                        onChangeText={(text) =>
                          handleChange(p.canchaIndex, "pareja2", text)
                        }
                        maxLength={2}
                      />
                    </View>

                    {errores[p.canchaIndex] && (
                      <View style={styles.errorContainer}>
                        <Ionicons
                          name="alert-circle-outline"
                          size={16}
                          color="#C70039"
                          style={{ marginRight: 5 }}
                        />
                        <Text style={styles.errorText}>
                          {errores[p.canchaIndex]}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
            </ScrollView>
          </View>
          {/* Footer con botones */}
          <View style={styles.buttonFooterCustom}>
            <TouchableOpacity
              style={[styles.acceptButtonCustom, botonDesactivado && { opacity: 0.5 }]}
              onPress={botonDesactivado ? undefined : handleConfirm}
              activeOpacity={botonDesactivado ? 1 : 0.8}
              disabled={botonDesactivado}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.buttonTextCustom}>Confirmar</Text>
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
    borderColor: "#00baff",
    borderRadius: 16,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#C9C9C9",
    borderRadius: 18,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#00BFFF",
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#00BFFF", // Borde azul para que combine con tus botones
    borderRadius: 12, // Bordes más redondeados
    paddingVertical: 10, // Espaciado vertical
    paddingHorizontal: 15, // Espaciado horizontal
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F8F8F8", // Fondo claro para destacar el campo
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Sombra para Android
  },
  errorText: {
    color: "#C70039",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16, 
  },
  parejaContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 2,
    elevation: 2,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#00BFFF",
  },
  jugadoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
    position: "relative", // necesario para el posicionamiento absoluto de VS
  },
  equipo1: {
    flex: 1,
    alignItems: "flex-start",
    gap: 10,
  },

  equipo2: {
    flex: 1,
    alignItems: "flex-end",
    gap: 10,
  },

  vsContainer: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -15 }], // Ajusta este valor según el ancho de "VS"
    zIndex: 1,
  },
  cancha: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#00BAFF",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  vs: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
    gap: 8,
    justifyContent: "center",
  },
  marcadorInput: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFF",
    color: "#00BAFF",
    borderWidth: 1,
    borderColor: "#02B9FA",
    fontSize: 20,
    textAlign: "center",
    marginHorizontal: 15,
  },
  scrollView: {
    //maxHeight: "90%",
  },
  //header del modal
  titleModal: {
    backgroundColor: "#f9f9f9",
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 22,
    marginBottom: 5,
    borderBottomWidth: 1.1,
    borderBottomColor: "#EEE",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 18,
    color: "#02B9FA",
    textTransform: "uppercase",
    textAlign: "center",
    fontWeight: "bold",
  },
  titleSubContainer: {
    justifyContent: "space-around",
    flex: 4,
  },
  //contenedor de detalles del modal
  detailsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  label: {
    color: "#838080",
    fontSize: 13,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 8,
  },
  //footer con los botones
  buttonFooterCustom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  acceptButtonCustom: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonTextCustom: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    textTransform: "uppercase",
  },
});

export default TieBreakRonda;
