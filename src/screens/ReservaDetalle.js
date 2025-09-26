import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Logo from "../componentes/Logo";
import Titulo from "../componentes/Titulo";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Pressable,
  Button,
} from "native-base";
import APIManager from "../componentes/API/APIManager";
import { useStripe } from "@stripe/stripe-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BannerAd from "../componentes/BannerAd";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

const RETURN_URL = "prorally-movil://stripe-redirect";

const ReservaDetalle = ({ route, navigation }) => {
  const { club, selectedDate } = route.params;

  console.log("detalle del club", club);
  const [seleccionado, setSeleccionado] = useState(null);

  const [id, setId] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubs, setClubsFiltrados] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [selectedHora, setSelectedHora] = useState("");
  const [selectedTiempo, setSelectedTiempo] = useState("");
  const [canchas, setCanchas] = useState([]);
  const [idCancha, setIdCancha] = useState(null);
  const [intervalos, setIntervalos] = useState([]);
  const [horas, setHoras] = useState([]);
  console.log("horas", horas);
  const [precio, setPrecio] = useState(0);
  const [id_usuario, setUsuario] = useState(0);
  console.log("fecha em el calendario", selectedDate);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  console.log("horarios de club ", horariosDisponibles);

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [savedCards, setSavedCards] = useState([]);
  const [saveCard, setSaveCard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("new");
  const { initPaymentSheet, presentPaymentSheet, handleURLCallback } =
    useStripe();
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [adjustedTotal, setAdjustedTotal] = useState(0);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [stripeCustomer, setStripe] = useState("");
  const [loading2, setLoading2] = useState(false);
  const [moneda, setMoneda] = useState(null);
  const [userEmail, setEmail] = useState("");
  const [isPaymentSheetReady, setIsPaymentSheetReady] = useState(false);
  const [modalHorarioVisible, setModalHorarioVisible] = useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const getDatos = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Perfil/get_info`,
        method: "GET",
      });
      console.log("Respuesta del servidor:", res); // Asegúrate de ver el contenido de la respuesta
      if (res && res.data && res.data.stripe_id) {
        setStripe(res.data.stripe_id); // Establecer el stripe_id solo si es válido
        setUsuario(res.data.id_usuario);
        setEmail(res.data.us_correo);
      } else {
        console.log("stripe_id no disponible.");
      }
    } catch (error) {
      console.log("Error al obtener la información:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stripeCustomer) {
      console.log("stripeCustomer disponible:", stripeCustomer);
      // Llamar a la función de pago solo si stripeCustomer está disponible
      initializePaymentSheet(precio);
    }
  }, [stripeCustomer]); // Se ejecuta cuando stripeCustomer cambia

  useFocusEffect(
    React.useCallback(() => {
      getDatos();
    }, [])
  );

  //pagar con stripe:
  const initializePaymentSheet = async (precio, moneda) => {
    try {
      const amountInCents = Math.round(Math.max(precio) * 100);
      console.log("precio total de la reserva en centavos", amountInCents);

      // Verificar si stripeCustomer tiene el valor correcto
      if (!stripeCustomer || stripeCustomer.trim() === "") {
        throw new Error("El stripeCustomer está vacío o no disponible");
      }

      console.log("stripeCustomer:", stripeCustomer);

      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/createPaymentIntent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInCents,
            currency: moneda,
            customerId: stripeCustomer, // Asegúrate de pasar el valor correcto
            saveCard: saveCard,
            paymentMethodId:
              paymentMethod !== "new" ? paymentMethod : undefined,
            return_url: RETURN_URL,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || "Fallo al crear el PaymentIntent");
      }

      const { clientSecret, paymentIntentId, adjustedAmount } = data;
      setPaymentIntentId(paymentIntentId);
      setAdjustedTotal(adjustedAmount / 100);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Arosports",
        customerId: stripeCustomer, // Se pasa aquí también
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        returnURL: RETURN_URL,
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        console.log("Error al inicializar la hoja de pago:", error);
      } else {
        console.log("Hoja de pago inicializada correctamente.");
        setPaymentSheetEnabled(true); // Habilitar la hoja de pago
      }
    } catch (error) {
      console.log("Error al inicializar la hoja de pago:", error.message);
    }
  };

  const handlePayment = async (precio, moneda) => {
    console.log("moneda desde payment", moneda);
    console.log("precio desde payment", precio);
    if (!paymentSheetEnabled) {
      alert(
        "La hoja de pago no está inicializada. Por favor, espera o intenta de nuevo."
      );
      return;
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      console.log("Pago Cancelado", "El pago no fue completado.");
      return;
    }

    // Si el pago fue exitoso, continuar sin depender de paymentMethodId
    try {
      // Obtener detalles del PaymentIntent para verificar el estado del pago
      const confirmedPaymentIntent = await fetch(
        `https://us-central1-arosports-3bcf3.cloudfunctions.net/getPaymentIntentDetails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        }
      );

      const confirmedData = await confirmedPaymentIntent.json();

      if (!confirmedPaymentIntent.ok) {
        throw new Error("No se pudo obtener el estado del pago.");
      }

      // Si no hay paymentMethodId, continuar con el registro sin guardarlo
      const newPaymentMethodId = confirmedData.paymentMethodId || null;
      if (newPaymentMethodId) {
        const methodSaved = await addPaymentMethod(newPaymentMethodId);
        if (!methodSaved) {
          console.log(
            "El método de pago no se guardó, pero el pago fue exitoso."
          );
        }
      }

      // Continuar con el registro del torneo
      await handleCorreo(precio, moneda);
    } catch (error) {
      console.log("Error al manejar el pago:", error.message);
    }
  };

  const handleCorreo = async (precio, moneda) => {
    console.log("Fcoreo precio:", precio);
    console.log("Fcoreo moneda:", moneda);
    try {
      if (!paymentIntentId || !userEmail) {
        throw new Error("Faltan datos necesarios para enviar el correo.");
      }
      const [horaInicio, horaFin] = selectedHora.split(" - ");

      const formData = new FormData();
      formData.append("paymentIntentId", paymentIntentId);
      formData.append("email", userEmail);
      formData.append("club", club.club.fc_nombre);
      formData.append(
        "descripcion",
        `Reservación de la cancha ${seleccionado?.cancha}`
      );
      formData.append("fecha", selectedDate);
      formData.append("tiempo", seleccionado?.duracion);
      formData.append("hora_inicio", seleccionado?.hora_inicio);
      formData.append("hora_fin", seleccionado?.hora_fin);

      console.log("FormData de correo:", formData);
      setLoading2(true); // Mostrar modal de carga

      const response = await APIManager({
        url: `PaymentController/handle_payment_reserva`,
        method: "POST",
        data: formData,
      });

      if (response.resultado === true) {
        await handlePagar(precio, moneda);
        setLoading2(false); // Ocultar modal de carga
      } else {
        Alert.alert("Error", "Hubo un problema al procesar el correo.");
      }
    } catch (error) {
      setLoading2(false);
      throw new Error(
        "Hubo un problema al enviar el correo. Intenta más tarde."
      );
    }
  };

  const handlePagar = async (precio, moneda) => {
    try {
      const formattedDate = selectedDate; // Ya está en el formato correcto

      const formData = new FormData();
      formData.append("precio", precio);
      formData.append("moneda", moneda);
      formData.append("id_usuario", id_usuario);
      formData.append("fecha", formattedDate);
      formData.append("hora_inicio", seleccionado?.hora_inicio);
      formData.append("hora_fin", seleccionado?.hora_fin);
      formData.append("id_cancha", seleccionado?.id_cancha);
      formData.append("id_status", 1);
      formData.append("num_canchas", 1);
      formData.append("duracion", seleccionado?.duracion);
      formData.append(
        "id_fraccionamientoclub",
        club.club.id_fraccionamientoclub
      ); // ID del club
      formData.append("selectedClub", club.club.fc_nombre); // Nombre del club

      console.log("Enviando datos a la API...");
      console.log("FormData:", formData);

      const response = await APIManager({
        url: "Club/Reservas/registrar_reserva",
        method: "POST",
        data: formData,
      });
      console.log("Respuesta de la API: ", response);
      if (response.resultado) {
        Alert.alert(
          "Éxito",
          "La reservación se ha sido realizado correctamente.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navegar a la pantalla anterior
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          response.mensaje || "Hubo un problema al procesar la solicitud."
        );
      }
    } catch (error) {
      console.log("Error en handlePagar: ", error);
      Alert.alert("Error", "Hubo un problema al procesar la solicitud.");
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchSavedCards();
    }, [])
  );

  const addPaymentMethod = async (paymentMethodId) => {
    console.log("methodo id", paymentMethodId);
    setLoading2(true); // Mostrar modal de carga
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/addPaymentMethod",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: stripeCustomer,
            paymentMethodId,
          }),
        }
      );

      console.log("response de agregar tarjeta", response);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fallo al agregar el método de pago");
      }

      console.log("Método de pago agregado correctamente.");
      setLoading2(false); // Ocultar modal de carga
      return true;
    } catch (error) {
      console.log("Error al agregar el método de pago", error);
      setLoading2(false); // Mostrar modal de carga
      return false;
    }
  };

  const fetchSavedCards = async () => {
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/listPaymentMethods",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: stripeCustomer }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSavedCards(data.paymentMethods || []);
      } else {
        console.log(
          "Error al obtener las tarjetas:",
          data.error || "Error al obtener las tarjetas"
        );
      }
    } catch (error) {
      console.log("Error al obtener las tarjetas:", error);
    }
  };

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (url && url.includes("stripe-redirect")) {
        await handleURLCallback(url);
      }
    };

    Linking.addEventListener("url", ({ url }) => handleDeepLink(url));

    return () => {
      Linking.removeAllListeners("url");
    };
  }, [handleURLCallback]);

  // Función para verificar si todos los campos están llenos
  const isFormValid = () => {
    console.log("Validando formulario con los siguientes valores:");
    console.log("Cancha:", seleccionado?.cancha);
    console.log("Fecha:", selectedDate);
    console.log("Duración:", seleccionado?.duracion);
    console.log("Hora inicio:", seleccionado?.hora_inicio);
    console.log("Hora fin:", seleccionado?.hora_fin);
    console.log("Precio:", seleccionado?.precio);
    console.log("stripeCustomer:", stripeCustomer);
    console.log("¿Hoja de pago lista?", isPaymentSheetReady);

    return (
      seleccionado &&
      seleccionado.cancha &&
      selectedDate &&
      seleccionado.duracion &&
      seleccionado.hora_inicio &&
      seleccionado.hora_fin &&
      seleccionado.precio &&
      stripeCustomer !== "" &&
      isPaymentSheetReady // solo habilita si la hoja está lista
    );
  };

  const handlePaymentValidation = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Alerta",
        "Por favor, completa todos los campos antes de continuar."
      );
      return;
    }
    // Si todos los campos están validados, se procede con el pago
    await handlePayment(precio, moneda);
  };

  useEffect(() => {
    if (seleccionado?.precio && seleccionado?.moneda) {
      console.log(
        "Nuevo horario seleccionado. Reiniciando hoja de pago con:",
        seleccionado.precio,
        seleccionado.moneda
      );

      // Desactiva temporalmente el botón hasta que se recargue bien
      setIsPaymentSheetReady(false);

      setPrecio(seleccionado.precio);
      setMoneda(seleccionado.moneda);

      initializePaymentSheet(seleccionado.precio, seleccionado.moneda)
        .then(() => {
          console.log("✅ Hoja de pago inicializada con éxito");
          setIsPaymentSheetReady(true);
        })
        .catch((error) => {
          console.log("❌ Error al inicializar la hoja de pago:", error);
          setIsPaymentSheetReady(false);
        });
    }
  }, [seleccionado]);

  const formatHora = (hora) => {
    const [h, m] = hora.split(":");
    return `${h}:${m}`;
  };

  const formatDuracion = (duracion) => {
    const [hrs, mins] = duracion.split(":").map(Number);
    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;
    if (mins) return `${mins}m`;
    return "";
  };

  // Convierte 'HH:mm:ss' a Date usando selectedDate como base
  const horaStringADateConFecha = (horaStr) => {
    const [h, m, s] = horaStr.split(":").map(Number);
    const baseDate = new Date(`${selectedDate}T00:00:00`);
    baseDate.setHours(h, m, s || 0, 0);
    return baseDate;
  };

  const horaStringAFechaCompleta = (horaStr, fechaStr) => {
    const [h, m] = horaStr.split(":").map(Number);
    const [year, month, day] = fechaStr.split("-").map(Number);
    return new Date(year, month - 1, day, h, m, 0);
  };

  const esHoy = (fechaStr) => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    return fechaStr === `${yyyy}-${mm}-${dd}`;
  };

  // Limite mínimo para hoy = ahora + 30 mins
  const ahora = new Date();
  const limiteMinimo = new Date(ahora.getTime() + 60 * 60 * 1000); // 🕒 +30 mins

  const mostrarTodo = !esHoy(selectedDate); // Si no es hoy, mostramos todo

  const horariosFiltrados = club.horarios.filter((item) => {
    if (mostrarTodo) return true;

    const horaInicio = horaStringAFechaCompleta(item.hora_inicio, selectedDate);
    return horaInicio >= limiteMinimo;
  });

  return (
    <View style={styles.principal}>
      {/* Modal de carga */}
      <Modal transparent={true} animationType="fade" visible={loading2}>
        <View style={styles.modalContainer2}>
          <View style={styles.modalContent2}>
            <ActivityIndicator size="large" color="#02B9FA" />
            <Text style={styles.loadingText}>Procesando reservación...</Text>
          </View>
        </View>
      </Modal>

      <Logo />
      <Titulo titulo={club.club.fc_nombre} />
      {/* <Text fontSize="md" mb={4} color="gray.200">📅 Fecha: {selectedDate}</Text> */}

      <View style={{ padding: 20 }}>
        {/* Input de horario */}
        <TouchableOpacity
          style={styles.inputHorario}
          onPress={() => setModalHorarioVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color="#00baff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.inputHorarioText}>
            {horarioSeleccionado
              ? `Cancha ${horarioSeleccionado.cancha} de ${formatHora(
                  horarioSeleccionado.hora_inicio
                )} - ${formatHora(horarioSeleccionado.hora_fin)}`
              : "Selecciona un horario"}
          </Text>
        </TouchableOpacity>

        {/* Resumen de reserva */}
        <View style={styles.summaryContainerPH}>
          <View style={styles.summaryHeaderPH}>
            <Text style={styles.summaryTitlePH}>RESUMEN DE RESERVA</Text>
          </View>
          <View style={styles.summaryContentPH}>
            <View style={styles.detailRowPH}>
              <Ionicons name="calendar-outline" size={16} color="#00baff" />
              <Text style={styles.detailLabelPH}>Fecha:</Text>
              <Text style={styles.detailValuePH}>{selectedDate}</Text>
            </View>
            <View style={styles.detailRowPH}>
              <Ionicons name="tennisball-outline" size={16} color="#00baff" />
              <Text style={styles.detailLabelPH}>Cancha:</Text>
              <Text style={styles.detailValuePH}>
                {horarioSeleccionado?.cancha || "---"}
              </Text>
            </View>
            <View style={styles.detailRowPH}>
              <Ionicons name="time-outline" size={16} color="#00baff" />
              <Text style={styles.detailLabelPH}>Horario:</Text>
              <Text style={styles.detailValuePH}>
                {horarioSeleccionado
                  ? `${formatHora(
                      horarioSeleccionado.hora_inicio
                    )} - ${formatHora(horarioSeleccionado.hora_fin)}`
                  : "---"}
              </Text>
            </View>
            <View style={styles.detailRowPH}>
              <Ionicons name="timer-outline" size={16} color="#00baff" />
              <Text style={styles.detailLabelPH}>Duración:</Text>
              <Text style={styles.detailValuePH}>
                {horarioSeleccionado
                  ? formatDuracion(horarioSeleccionado.duracion)
                  : "---"}
              </Text>
            </View>
            <View style={styles.detailRowPH}>
              <Ionicons name="pricetag-outline" size={16} color="#00baff" />
              <Text style={styles.detailLabelPH}>Precio:</Text>
              <Text style={styles.detailValuePH}>
                {horarioSeleccionado
                  ? `$${horarioSeleccionado.precio} ${
                      horarioSeleccionado.moneda || ""
                    }`
                  : "---"}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de acción */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            (!isFormValid() || !isPaymentSheetReady) && styles.disabledButton,
          ]}
          onPress={() => {
            if (!horarioSeleccionado) {
              Alert.alert(
                "Atención",
                "❗Debes seleccionar un horario antes de continuar."
              );
              return;
            }
            handlePaymentValidation();
          }}
          disabled={!isFormValid() || !isPaymentSheetReady}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>
            {isPaymentSheetReady ? "Pagar" : "Cargando..."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de selección de horario */}
      <Modal
        visible={modalHorarioVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalHorarioVisible(false)}
      >
        <View style={stylesHPP.modalOverlay}>
          <View style={stylesHPP.modalContainer}>
            <View style={stylesHPP.modalHeader}>
              <Text style={stylesHPP.modalTitle}>Horarios disponibles</Text>
              <TouchableOpacity
                style={stylesHPP.closeButtonHeader}
                onPress={() => setModalHorarioVisible(false)}
              >
                <Ionicons name="close" size={24} color="#00baff" />
              </TouchableOpacity>
            </View>
            <View style={stylesHPP.tableContainer}>
              <View style={stylesHPP.tableGrid}>
                <View style={stylesHPP.tableHeaderRow}>
                  <Text style={[stylesHPP.headerCell, { flex: 1 }]}>
                    Inicio
                  </Text>
                  <Text style={[stylesHPP.headerCell, { flex: 1 }]}>Fin</Text>
                  <Text style={[stylesHPP.headerCell, { flex: 1.2 }]}>
                    Duración
                  </Text>
                  <Text style={[stylesHPP.headerCell, { flex: 1 }]}>
                    Cancha
                  </Text>
                </View>
                <ScrollView
                  style={stylesHPP.scrollContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {horariosFiltrados.length === 0 ? (
                    <Text style={stylesHPP.emptyText}>
                      No se encontraron horarios.
                    </Text>
                  ) : (
                    horariosFiltrados.map((item, index) => {
                      const isSelected =
                        horarioSeleccionado?.hora_inicio === item.hora_inicio &&
                        horarioSeleccionado?.hora_fin === item.hora_fin &&
                        horarioSeleccionado?.cancha === item.cancha;
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setHorarioSeleccionado(item);
                            setModalHorarioVisible(false);
                            setSeleccionado(item);
                          }}
                          style={[
                            stylesHPP.tableRow,
                            isSelected && { backgroundColor: "#e0f2ff" },
                          ]}
                        >
                          <View
                            style={[
                              {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <Text style={[stylesHPP.playerName]}>
                              {formatHora(item.hora_inicio)}
                            </Text>
                          </View>
                          <View
                            style={[
                              {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <Text style={[stylesHPP.playerName]}>
                              {formatHora(item.hora_fin)}
                            </Text>
                          </View>
                          <View
                            style={[
                              {
                                flex: 1.2,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <Text style={[stylesHPP.playerName]}>
                              {formatDuracion(item.duracion)}
                            </Text>
                          </View>
                          <View
                            style={[
                              {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <Text style={[stylesHPP.playerName]}>
                              {item.cancha}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.containerBaner}>
        <BannerAd />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 16,
  },
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
  },
  modalContainer2: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent2: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#00baff",
  },
  inputHorario: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 55,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#00baff",
  },
  inputHorarioText: {
    color: "#838080",
    fontSize: 14,
    flex: 1,
  },
  modalOverlayPH: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHorarioContainerPH: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeaderPH: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#00baff",
  },
  modalTitlePH: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00baff",
  },
  tableContainerPH: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tableHeaderRowPH: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#00baff",
  },
  tableHeaderCellPH: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00baff",
    flex: 1,
    textAlign: "center",
  },
  tableRowPH: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#475569",
    backgroundColor: "transparent",
  },
  selectedRowPH: {
    backgroundColor: "#00baff",
    borderRadius: 5,
  },
  tableCellPH: {
    fontSize: 14,
    color: "#838080",
    flex: 1,
    textAlign: "center",
  },
  summaryContainerPH: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    borderWidth: 3,
    borderColor: "#00baff",
  },
  summaryHeaderPH: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryTitlePH: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00baff",
  },
  summaryContentPH: {
    paddingHorizontal: 5,
  },
  detailRowPH: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabelPH: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginLeft: 8,
    width: 80,
  },
  detailValuePH: {
    fontSize: 14,
    color: "#838080",
    marginLeft: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00baff",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 15,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#475569",
    opacity: 0.7,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalHorarioContainerPH2: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "95%",
    maxWidth: 420,
    borderWidth: 3,
    borderColor: "#00BAFF",
    overflow: "hidden",
  },
  modalHeaderPH2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1.1,
    borderBottomColor: "#EEE",
    backgroundColor: "#fff",
  },
  modalTitlePH2: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#00BAFF",
    textTransform: "uppercase",
    flex: 1,
  },
  tableContainerPH2: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  tableHeaderRowPH2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.1,
    borderBottomColor: "#EEE",
  },
  tableHeaderCellPH2: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00BAFF",
    flex: 1,
    textAlign: "center",
  },
  tableRowPH2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  selectedRowPH2: {
    backgroundColor: "#00BAFF",
  },
  tableCellPH2: {
    fontSize: 14,
    color: "#838080",
    flex: 1,
    textAlign: "center",
    fontWeight: "500",
  },
  selectedCellPH2: {
    color: "#fff",
    fontWeight: "bold",
  },
});

const stylesHPP = StyleSheet.create({
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
  tableContainer: {
    padding: 16,
  },
  tableGrid: {
    borderWidth: 1,
    borderColor: "#00baff",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#00baff",
  },
  headerCell: {
    paddingVertical: RFValue(14, 667),
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
  },
  cellContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12, // más espacio entre columnas
  },
  playerName: {
    fontSize: RFValue(12, 667),
    color: "#838080",
    fontWeight: "500",
    marginVertical: 20,
  },
  scrollContainer: {
    maxHeight: 300,
  },
});

export default ReservaDetalle;