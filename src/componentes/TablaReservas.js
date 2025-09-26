import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Icon,
  ScrollView,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Titulo from "../componentes/Titulo";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const { width, height } = Dimensions.get("window");

const TablaReservas = ({
  visible,
  closeModal,
  reservas,
  onSelect,
  loading,
  selectedReserva,
}) => {
  const [selected, setSelected] = useState(null);
  console.log("rsreva selelcionada", selectedReserva);

  const [fechaFiltro, setFechaFiltro] = useState(null);
  const [horaFiltro, setHoraFiltro] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHoraModal, setShowHoraModal] = useState(false);
  const [horaBusqueda, setHoraBusqueda] = useState("");

  const [seleccionValida, setSeleccionValida] = useState(null); // para manejar selección real
  const [errorMensaje, setErrorMensaje] = useState({ id: null, mensaje: "" });

  const formatHora = (hora) => {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    return `${h}:${m}`;
  };
  useEffect(() => {
    if (!visible) {
      setErrorMensaje({ id: null, mensaje: "" });
      // setSelected(null); // <-- Elimina o comenta esta línea
      setFechaFiltro(null);
      setHoraFiltro("");
      setHoraBusqueda("");
    }
  }, [visible]);

  useEffect(() => {
    if (!loading) {
      if (selectedReserva) {
        setSelected(selectedReserva);
      } else {
        setSelected(null);
      }
    }
  }, [loading, selectedReserva, reservas]);

  const formatDuracion = (duracion) => {
    if (!duracion) return "";
    const [hrs, mins] = duracion.split(":").map(Number);
    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;
    if (mins) return `${mins}m`;
    return "";
  };

  const clearFilters = () => {
    setFechaFiltro(null);
    setHoraFiltro(null);
    setHoraBusqueda("");
  };

  const reservasFiltradas = reservas.filter((item) => {
    const matchFecha = !fechaFiltro || item.fecha === fechaFiltro;
    const matchHora = !horaFiltro || item.hora_inicio === horaFiltro;
    return matchFecha && matchHora;
  });

  const groupedReservas = reservasFiltradas.reduce((acc, reserva) => {
    const id = reserva.id_fraccionamientoclub;
    if (!acc[id]) {
      acc[id] = {
        nombreClub: reserva.fc_nombre,
        reservas: [],
      };
    }
    acc[id].reservas.push(reserva);
    return acc;
  }, {});

  const handleSelect = (reserva) => {
    if (selected?.id_reserva === reserva.id_reserva) {
      setSelected(null); // deseleccionar si ya está seleccionada
      onSelect(null);
    } else {
      setSelected(reserva);
      onSelect(reserva);
    }
  };
  const esReservaValida = (item) => {
    const now = new Date();

    const [year, month, day] = item.fecha.split("-").map(Number);
    const [horaFinH, horaFinM] = item.hora_fin.split(":").map(Number);

    const fechaReserva = new Date(year, month - 1, day);
    const fechaHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Si la reserva no es hoy, permitirla sin importar el tiempo restante
    const noEsHoy = fechaReserva.getTime() !== fechaHoy.getTime();
    if (noEsHoy) return true;

    // Si es hoy, aplicar la lógica de los 30 minutos
    const fechaFin = new Date(year, month - 1, day, horaFinH, horaFinM);
    const diferenciaMinutos = (fechaFin - now) / (1000 * 60);
    return diferenciaMinutos >= 30;
  };

  const handlePressReserva = (item) => {
    if (selected?.id_reserva === item.id_reserva) {
      setSelected(null);
      setSeleccionValida(null);
      setErrorMensaje({ id: null, mensaje: "" });
      onSelect(null);
    } else {
      setSelected(item);
      if (esReservaValida(item)) {
        setSeleccionValida(item);
        setErrorMensaje({ id: null, mensaje: "" });
        onSelect(item);
      } else {
        setSeleccionValida(null);
        setErrorMensaje({
          id: item.id_reserva,
          mensaje: "Debes seleccionar al menos con 30 minutos de anticipación.",
        });
        onSelect(null);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>RESERVAS</Text>
            <TouchableOpacity
              style={styles.headerCloseButton}
              onPress={() => {
                // setSelected(null);
                setErrorMensaje({ id: null, mensaje: "" });
                // onSelect(null);
                closeModal();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#00baff" />
            </TouchableOpacity>
          </View>

          {/* Línea divisoria */}
          <View style={styles.separator} />

          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.modalContent}>
              {/* Filtros de Fecha y Hora */}
              <View style={styles.filtersContainer}>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.filterButtonText}>
                    {fechaFiltro || "Seleccione una fecha"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowHoraModal(true)}
                >
                  <Text style={styles.filterButtonText}>
                    {horaFiltro === null || horaFiltro === undefined
                      ? "Seleccione una hora"
                      : horaFiltro === ""
                      ? "Todas las horas"
                      : formatHora(horaFiltro)}
                  </Text>
                </TouchableOpacity>
                {(fechaFiltro || horaFiltro) && (
                  <TouchableOpacity
                    style={styles.clearFilterButton}
                    onPress={clearFilters}
                  >
                    <Ionicons name="refresh" size={20} color="#00baff" />
                  </TouchableOpacity>
                )}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    fechaFiltro
                      ? new Date(fechaFiltro.replace(/-/g, "/"))
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      const year = selectedDate.getFullYear();
                      const month = String(
                        selectedDate.getMonth() + 1
                      ).padStart(2, "0");
                      const day = String(selectedDate.getDate()).padStart(
                        2,
                        "0"
                      );
                      setFechaFiltro(`${year}-${month}-${day}`);
                    }
                    // No hacer nada si event.type === "dismissed" (cancelar)
                  }}
                />
              )}

              <Modal
                visible={showHoraModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                  setShowHoraModal(false);
                  setHoraBusqueda("");
                }}
              >
                <TouchableWithoutFeedback
                  onPress={() => {
                    setShowHoraModal(false);
                    setHoraBusqueda("");
                  }}
                >
                  <View style={styles.miniModalOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={styles.miniModalContainer}>
                        <TextInput
                          style={styles.miniModalSearchInput}
                          placeholder="Buscar hora"
                          value={horaBusqueda}
                          onChangeText={setHoraBusqueda}
                          keyboardType="numeric"
                          placeholderTextColor="#999"
                        />

                        <ScrollView showsVerticalScrollIndicator={false}>
                          <TouchableOpacity
                            style={[
                              styles.miniModalOption,
                              horaFiltro === ""
                                ? styles.miniModalOptionSelected
                                : styles.miniModalOptionUnselected,
                            ]}
                            onPress={() => {
                              setHoraFiltro("");
                              setShowHoraModal(false);
                              setHoraBusqueda("");
                            }}
                          >
                            <Text
                              style={[
                                styles.miniModalOptionText,
                                horaFiltro === "" ? { color: "#fff" } : null,
                              ]}
                            >
                              Todas las horas
                            </Text>
                          </TouchableOpacity>
                          {(() => {
                            const horasUnicas = Array.from(
                              new Set(reservas.map((r) => r.hora_inicio))
                            ).sort();
                            const horasFiltradas = horasUnicas.filter(
                              (hora) => {
                                if (!horaBusqueda) return true;
                                const horaNum = parseInt(hora.split(":")[0]);
                                return horaNum
                                  .toString()
                                  .includes(horaBusqueda);
                              }
                            );

                            if (horasFiltradas.length === 0 && horaBusqueda) {
                              return (
                                <View style={styles.miniModalNoResults}>
                                  <Text style={styles.miniModalNoResultsText}>
                                    No se encontraron horas
                                  </Text>
                                </View>
                              );
                            }

                            return horasFiltradas.map((hora) => (
                              <TouchableOpacity
                                key={hora}
                                style={[
                                  styles.miniModalOption,
                                  horaFiltro === hora
                                    ? styles.miniModalOptionSelected
                                    : styles.miniModalOptionUnselected,
                                ]}
                                onPress={() => {
                                  setHoraFiltro(hora);
                                  setShowHoraModal(false);
                                  setHoraBusqueda("");
                                }}
                              >
                                <Text
                                  style={[
                                    styles.miniModalOptionText,
                                    horaFiltro === hora
                                      ? { color: "#fff" }
                                      : null,
                                  ]}
                                >
                                  {formatHora(hora)}
                                </Text>
                              </TouchableOpacity>
                            ));
                          })()}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              <ScrollView
                style={{ maxHeight: 400 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {loading ? (
                  <Text style={styles.loadingText}>Cargando reservas...</Text>
                ) : Object.keys(groupedReservas).length === 0 ? (
                  <Text style={styles.emptyText}>
                    No tienes reservas disponibles
                  </Text>
                ) : (
                  (() => {
                    return Object.values(groupedReservas).map(
                      (grupo, index) => {
                        if (grupo.reservas.length === 0) return null;

                        return (
                          <View key={index} style={styles.clubSection}>
                            <Text style={styles.clubTitle}>
                              {grupo.nombreClub
                                ? `${grupo.nombreClub}`
                                : "Reservas creadas en Crear Jugada"}
                            </Text>

                            <View style={styles.tablaContainer}>
                              <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>
                                  Horario
                                </Text>
                                <Text style={styles.tableHeaderText}>
                                  Fecha
                                </Text>
                                <Text style={styles.tableHeaderText}>
                                  Duración
                                </Text>
                              </View>

                              {grupo.reservas.map((item, i) => {
                                const isSelected =
                                  selected?.id_reserva === item.id_reserva;
                                const horario = `${formatHora(
                                  item.hora_inicio
                                )} - ${formatHora(item.hora_fin)}`;
                                const duracion = formatDuracion(item.duracion);

                                return (
                                  <View key={i}>
                                    <Pressable
                                      onPress={() => handlePressReserva(item)}
                                    >
                                      {({ isPressed }) => (
                                        <View
                                          style={[
                                            styles.reservaRow,
                                            isSelected &&
                                              styles.reservaRowSelected,
                                            isPressed &&
                                              !isSelected &&
                                              styles.reservaRowPressed,
                                          ]}
                                        >
                                          <Text
                                            style={styles.reservaText}
                                            numberOfLines={1}
                                          >
                                            {horario}
                                          </Text>
                                          <Text
                                            style={styles.reservaText}
                                            numberOfLines={1}
                                          >
                                            {item.fecha}
                                          </Text>
                                          <Text
                                            style={styles.duracionText}
                                            numberOfLines={1}
                                          >
                                            {duracion}
                                          </Text>
                                        </View>
                                      )}
                                    </Pressable>
                                    {errorMensaje.id === item.id_reserva && (
                                      <Text style={styles.errorMsg}>
                                        {errorMensaje.mensaje}
                                      </Text>
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        );
                      }
                    );
                  })()
                )}
              </ScrollView>
            </View>
          </KeyboardAwareScrollView>

          <View style={styles.separator} />
          {/* Botones */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.terminateButton,
                { width: "70%", alignSelf: "center" },
              ]}
              onPress={() => {
                // Permite confirmar aunque no haya reserva seleccionada
                if (selected && esReservaValida(selected)) {
                  onSelect(selected);
                } else {
                  onSelect(null); // Si no hay selección, envía null
                }
                setFechaFiltro(null);
                setHoraFiltro("");
                closeModal();
              }}
            >
              <Text style={styles.buttonText}>Confirmar</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  separator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
    marginRight: -28,
  },
  headerCloseButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 12, // Ajustado para que el padding sea solo arriba
  },
  loadingText: {
    textAlign: "center",
    marginTop: 40,
    marginBottom: 35,
    fontSize: 16,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 35,
    color: "#888",
    fontSize: 15,
  },
  clubSection: {
    marginBottom: 18,
    marginTop: 10, // Agrega espacio arriba de cada sección de club
  },
  clubTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#02B9FA",
    marginLeft: 2,
  },
  tablaContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#02B9FA",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#02B9FA",
    paddingVertical: 12,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  reservaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    paddingHorizontal: 10,
  },
  reservaRowSelected: {
    backgroundColor: "#e6f7ff",
  },
  reservaRowPressed: {
    backgroundColor: "#f0faff",
  },
  reservaText: {
    flex: 1,
    color: "#333",
    fontSize: 15,
    textAlign: "center",
  },
  duracionText: {
    flex: 1,
    color: "#333",
    fontSize: 15,
    textAlign: "center",
  },
  errorMsg: {
    color: "#c70039",
    marginTop: 2,
    marginLeft: 8,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  filterButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    marginRight: 8,
  },
  filterButtonText: {
    color: "#838080",
    fontSize: RFValue(9, 667),
  },
  clearFilterButton: {
    padding: 8,
    borderRadius: 8,
  },
  miniModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  miniModalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "70%",
    maxHeight: "50%",
  },
  miniModalSearchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  miniModalNoResults: {
    paddingVertical: 16,
    alignItems: "center",
  },
  miniModalNoResultsText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  miniModalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  miniModalOptionSelected: {
    backgroundColor: "#00BAFF",
    borderRadius: 16,
  },
  miniModalOptionUnselected: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
  },
  miniModalOptionText: {
    textAlign: "center",
    color: "#838080",
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
  },
  separatorFooter: {
    height: 1,
    backgroundColor: "#b0b9c6", // más oscuro que #e2e8f0
    width: "100%",
    alignSelf: "stretch",
    marginTop: 8,
    marginBottom: 0,
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
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontFamily: "Poppins",
    fontSize: 14,
    borderRadius: 16,
  },
});

export default TablaReservas;
