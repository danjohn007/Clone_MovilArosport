import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
  Alert,
  ActivityIndicator,
  Animated,
  Pressable,
  Keyboard,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MostrarDatos from "../componentes/MostrarDatos";
import CustomButton from "../componentes/Buttons";
import Titulo from "../componentes/Titulo";
import APIManager from "../componentes/API/APIManager";
import CategoriasTorneo from "../componentes/CategoriasTorneo";
import { useStripe } from "@stripe/stripe-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../styles/colors";

const RETURN_URL = "prorally-movil://stripe-redirect";

//modal
const Inscripcion = ({
  visible,
  closeModal,
  torneoId,
  torneoNombre,
  torneoFracci,
  torneoPrecio,
  torneoMoneda,
  torneoParejas,
  torneoMetPago,
  torneoFechaI,
  torneoFechaF,
  torneoCompleto,
}) => {
  console.log("torneoCompleto", torneoCompleto);
  console.log("torneoMoneda", torneoMoneda);

  const [loading, setLoading] = useState(true);

  const [desplegado, setDesplegado] = useState(false);
  const animacion = new Animated.Value(desplegado ? 1 : 0);
  const navigation = useNavigation();

  const toggleDetalle = () => {
    setDesplegado(!desplegado);
    Animated.timing(animacion, {
      toValue: desplegado ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  //catgeorias

  const [selectedMetodoPago, setSelectedMetodoPago] = useState("");
  const [selectedMetodoId, setSelectedMetodoId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [jugadores, setJugadores] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  console.log("jugadores buscador", resultadosBusqueda);
  const [nombreJugador1, setNombreJugador1] = useState("");
  const [nombreJugador2, setNombreJugador2] = useState("");
  const [idJugador2, setIdJugador2] = useState(null);
  const [id_usuario, setUsuario] = useState("");
  const [userEmail, setEmail] = useState("");

  //stripe:
  const [savedCards, setSavedCards] = useState([]);
  const [saveCard, setSaveCard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("new");
  const [loading2, setLoading2] = useState(false);

  const { initPaymentSheet, presentPaymentSheet, handleURLCallback } =
    useStripe();
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [stripeCustomer, setStripe] = useState("");

  useEffect(() => {
    if (!visible) {
      // Limpiar los campos del formulario
      setSelectedCategoria("");
      setSelectedMetodoPago("");
      setSearchTerm("");
      setNombreJugador2("");
      setIdJugador2(null); // Si tienes este estado también debes limpiarlo

      // Limpiar los errores
      setErrors({
        jugador2: "",
        categoria: "",
        metodoPago: "",
      });

      // Limpiar la información de parejas
      setParejas(null);
    }
  }, [visible]);

  const getDatos = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Perfil/get_info`,
        method: "GET",
      });
      console.log("datos de perfil", res);

      // Usamos valores por defecto para cada campo
      const stripeId = res?.data?.stripe_id || "No disponible";
      const usuarioId = res?.data?.id_usuario || "No disponible";
      const nombreJugador = res?.data?.nombre || "Nombre no disponible";
      const email = res?.data?.us_correo || "Correo no disponible";

      setStripe(stripeId);
      setUsuario(usuarioId);
      setNombreJugador1(nombreJugador);
      setEmail(email);
    } catch (error) {
      console.log("Error al obtener la información:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const setupPaymentSheet = async () => {
      console.log("📌 Valores actuales:", {
        stripeCustomer,
        torneoPrecio,
        torneoMoneda,
      });

      if (stripeCustomer && torneoPrecio > 0 && torneoMoneda) {
        try {
          await initializePaymentSheet(torneoPrecio, torneoMoneda);
        } catch (error) {
          console.log(
            "❌ Error al inicializar la hoja de pago:",
            error.message
          );
        }
      } else {
        console.log("⚠️ Datos insuficientes para inicializar la hoja de pago");
      }
    };

    setupPaymentSheet();
  }, [stripeCustomer, torneoPrecio, torneoMoneda]);

  useEffect(() => {
    getDatos();
  }, []);

  const handleMetodoPagoChange = (metodo) => {
    setSelectedMetodoPago(metodo.nombre);
    setSelectedMetodoId(metodo.id);
  };

  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null);
  const [parejas, setParejas] = useState(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("id_torneo", torneoId); // Asegúrate de que 'torneoId' es el correcto
      const response = await APIManager({
        url: "eventos/Eventos/mostrar_categoriasT",
        method: "POST",
        data: data,
      });

      console.log("categorias obtenidas", response); // Verifica el contenido de la respuesta

      setCategorias(response); // Establecer el estado con las categorías obtenidas
    } catch (error) {
      console.log("Error al obtener las categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias(); // Llamada para obtener categorías cada vez que cambie el torneo
  }, [torneoId]); // Asegúrate de que este valor sea dinámico y se actualice correctamente

  // Al seleccionar una categoría
  const handleCategoriaChange = (categoriaSeleccionada, subcategoria) => {
    setSelectedCategoria(categoriaSeleccionada.categoria); // Nombre de la categoría seleccionada
    setSelectedCategoriaId(categoriaSeleccionada.id_nivelJuego); // ID de la categoría seleccionada

    // Asignamos las parejas para cada tipo
    setParejas({
      hombres: categoriaSeleccionada.parejas_hombres,
      mujeres: categoriaSeleccionada.parejas_mujeres,
      mixtas: categoriaSeleccionada.parejas_mixtas,
    });

    // Guardamos la subcategoría seleccionada
    setSelectedSubcategoria(subcategoria); // Subcategoría seleccionada: 1, 2, o 3
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "";
    const [año, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${año}`;
  };

  const handleBuscarJugador = async (termino) => {
    setSearchTerm(termino);
    if (termino.trim() === "") {
      setResultadosBusqueda([]);
      return;
    }
    try {
      const data = new FormData();
      data.append("nombre", termino);
      data.append("id_usuario", id_usuario);
      const res = await APIManager({
        url: `eventos/Eventos/buscar_jugadores`,
        method: "POST",
        data: data,
      });

      if (res.status && Array.isArray(res.data) && res.data.length > 0) {
        // Filtrar al usuario activo de los resultados
        const resultadosFiltrados = res.data.filter(
          (jugador) => jugador.id_jugador !== id_usuario
        );
        setResultadosBusqueda(resultadosFiltrados);
      } else {
        setResultadosBusqueda([]);
      }
    } catch (error) {
      console.log("Error al buscar jugadores:", error);
      setResultadosBusqueda([]);
    }
  };
  const handleSeleccionarJugador = (jugador) => {
    setNombreJugador2(jugador.nombre_completo);
    setIdJugador2(jugador.id_jugador);
    setResultadosBusqueda([]);
    setSearchTerm("");
    Keyboard.dismiss();
  };

  //pagar con stripe:

  const initializePaymentSheet = async (torneoPrecio, torneoMoneda) => {
    try {
      const amountInCents = Math.round(Math.max(torneoPrecio) * 100);

      // Verificar si stripeCustomer tiene el valor correcto
      if (!stripeCustomer || stripeCustomer.trim() === "") {
        throw new Error("El stripeCustomer está vacío o no disponible");
      }

      // Paso 1: Cargar tarjetas guardadas antes de continuar al pago
      await fetchSavedCards(); // Cargar tarjetas guardadas

      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/createPaymentIntent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInCents,
            currency: torneoMoneda,
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

      const { clientSecret, paymentIntentId } = data;
      setPaymentIntentId(paymentIntentId);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "ProRally",
        customerId: stripeCustomer, // Se pasa aquí también
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        returnURL: RETURN_URL,
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        console.log("Error al inicializar la hoja de pago:", error);
      } else {
        setPaymentSheetEnabled(true); // Habilitar la hoja de pago
      }
    } catch (error) {
      console.log("Error al inicializar la hoja de pago:", error.message);
    }
  };

  const handlePayment = async (torneoPrecio) => {
    console.log("precio a pagar", torneoPrecio);

    if (!paymentSheetEnabled) {
      console.log(
        "La hoja de pago no está inicializada. Por favor, espera o intenta de nuevo."
      );
      return;
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      console.log(
        "La hoja de pago no está inicializada. Por favor, espera o intenta de nuevo."
      );
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
      await handleCorreo(torneoPrecio);
    } catch (error) {
      console.log("Error al manejar el pago:", error.message);
    }
  };

  const addPaymentMethod = async (paymentMethodId) => {
    try {
      setLoading2(true); // Mostrar modal de carga
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fallo al agregar el método de pago");
      }
      setLoading2(false); // Ocultar modal de carga
      return true;
    } catch (error) {
      setLoading2(false); // Mostrar modal de carga
      return false;
    }
  };

  //functiones sep
  const handleCorreo = async (torneoPrecio) => {
    setLoading2(true);
    try {
      if (!paymentIntentId || !userEmail) {
        throw new Error("Faltan datos necesarios para enviar el correo.");
      }

      const formData = new FormData();
      formData.append("paymentIntentId", paymentIntentId);
      formData.append("email", userEmail);
      formData.append("descripcion", `Inscripción al torneo: ${torneoNombre}`);
      formData.append("jugador1", nombreJugador1);
      formData.append("jugador2", idJugador2 ? nombreJugador2 : searchTerm);
      formData.append("categoria", selectedCategoria);

      console.log("formualrio de torneo", formData);

      const response = await APIManager({
        url: `PaymentController/handle_payment_success`,
        method: "POST",
        data: formData,
      });

      if (response.resultado === true) {
        await handlePagar(torneoPrecio);
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

  const handlePagar = async () => {
    try {
      setLoading2(true); // Mostrar modal de carga
      const formData = new FormData();
      formData.append("id_usuario", id_usuario);
      formData.append("id_torneo", torneoId);
      formData.append("torneoNombre", torneoNombre);
      formData.append("id_categoria", selectedCategoriaId);
      formData.append("id_metodopago", selectedMetodoId);
      formData.append("subcategoria", selectedSubcategoria);

      // Si el jugador 2 no fue seleccionado de la lista, usa lo que se escribió en el campo
      const nombreFinalJugador2 = nombreJugador2 || searchTerm;

      // Si se ha seleccionado un jugador, enviar el ID; si no, enviar el nombre
      if (idJugador2) {
        formData.append("id_pareja", idJugador2); // Enviar el ID del jugador 2 si está seleccionado
      } else {
        formData.append("nom_invitado", nombreFinalJugador2); // Enviar el nombre escrito si no hay jugador seleccionado
      }
      console.log("Datoe enviados de torneo: ", formData);

      const response = await APIManager({
        url: `eventos/Eventos/registrar_torneo`,
        method: "POST",
        data: formData,
      });
      setLoading2(false); // Ocultar modal de carga
      if (response.resultado) {
        Alert.alert(
          "Registro exitoso",
          "La inscripción se ha sido realizado correctamente.",
          [
            {
              text: "OK",
              onPress: () => {
                closeModal();
                navigation.navigate("MisTorneos");
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Alerta",
          response.mensaje || "Hubo un problema al procesar la solicitud."
        );
      }
    } catch (error) {
      setLoading2(false); // Ocultar modal de carga
      console.log("Error en handlePagar: ", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedCards();
    }, [])
  );

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
  const jugador2Valido =
    nombreJugador2.trim() !== "" || searchTerm.trim() !== "";

  return (
    nombreJugador1.trim() !== "" &&
    jugador2Valido &&
    selectedCategoria.trim() !== "" &&
    stripeCustomer.trim() !== ""
  );
};


  // Esta función valida los campos antes de proceder con el pago
  const handlePaymentValidation = async () => {
    const newErrors = {
      jugador2: "",
      categoria: "",
      metodoPago: "",
    };

    let valid = true;

    if (nombreJugador2 === "" && searchTerm === "") {
      newErrors.jugador2 = "Ingresar nombre *";
      valid = false;
    }

    if (selectedCategoria === "") {
      newErrors.categoria = "Seleccionar categoría *";
      valid = false;
    }

    if (selectedMetodoPago === "") {
      newErrors.metodoPago = "Seleccionar pago *";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors); // Actualiza los errores en el estado
      return;
    }

    // 🔹 Validación de precio y moneda con alerta
    if (torneoPrecio == null || torneoPrecio <= 0) {
      alert("⚠️ El precio del torneo no es válido.");
      return;
    }

    if (!torneoMoneda) {
      alert("⚠️ La moneda no es válida.");
      return;
    }

    console.log("selectedMetodoId:", selectedMetodoId);
    console.log("Comparando con 1:", Number(selectedMetodoId) === 1);

    // Si pasa todas las validaciones
    if (Number(selectedMetodoId) === 1) {
      console.log("Llamando a handlePayment");
      await handlePayment(torneoPrecio);
    } else {
      console.log("Llamando a handlePagar");
      await handlePagar(torneoPrecio);
    }
  };

  const [errors, setErrors] = useState({
    jugador2: "",
    categoria: "",
    metodoPago: "",
  });

const opcionesDisponibles = categorias
  ?.map((categoria) => {
    const opciones = [];

    // Hombres: solo si aún hay cupo
    if (
      parseInt(categoria.parejas_hombres) > 0 &&
      parseInt(categoria.parejas_hombres_contadas) < parseInt(categoria.parejas_hombres)
    ) {
      opciones.push(
        `${categoria.categoria} Hombre: ${categoria.parejas_hombres_contadas}/${categoria.parejas_hombres}`
      );
    }

    // Mujeres: solo si aún hay cupo
    if (
      parseInt(categoria.parejas_mujeres) > 0 &&
      parseInt(categoria.parejas_mujeres_contadas) < parseInt(categoria.parejas_mujeres)
    ) {
      opciones.push(
        `${categoria.categoria} Mujer: ${categoria.parejas_mujeres_contadas}/${categoria.parejas_mujeres}`
      );
    }

    // Mixto: solo si aún hay cupo
    if (
      parseInt(categoria.parejas_mixtas) > 0 &&
      parseInt(categoria.parejas_mixtas_contadas) < parseInt(categoria.parejas_mixtas)
    ) {
      opciones.push(
        `${categoria.categoria} Mixto: ${categoria.parejas_mixtas_contadas}/${categoria.parejas_mixtas}`
      );
    }

    return opciones;
  })
  .flat(); // Aplanamos la lista

console.log("opcionesDisponibles", opcionesDisponibles);

const hayEspaciosDisponibles = opcionesDisponibles.length > 0;

  const formatearFecha = (fecha) => {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <>
      {/* Modal principal */}
      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Encabezado del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>INSCRIPCIÓN AL TORNEO</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Contenido principal con scroll */}
            <ScrollView
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {torneoCompleto == 1 && (
                <View style={styles.limitContainer}>
                  <Icon name="warning-outline" size={20} color="#c51d34" />
                  <Text style={styles.limitText}>
                    Este torneo alcanzó el límite de parejas. Ya no puedes
                    inscribirte.
                  </Text>
                </View>
              )}

              {/* Sección de jugadores */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>JUGADORES</Text>

                <View style={styles.playerCard}>
                  <Icon name="person-outline" size={18} color={colors.primary} />
                  <Text style={styles.playerLabel}>Jugador 1:</Text>
                  <Text style={styles.playerName}>{nombreJugador1}</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Icon name="person-add-outline" size={18} color={colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Buscar jugador 2..."
                    value={idJugador2 ? nombreJugador2 : searchTerm}
                    onChangeText={(text) => {
                      handleBuscarJugador(text);
                      setSearchTerm(text);
                      setIdJugador2(null);
                      setNombreJugador2("");
                      if (text.trim() !== "") {
                        setErrors((prev) => ({ ...prev, jugador2: "" }));
                      }
                    }}
                  />
                </View>

                {errors.jugador2 && (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={14} color="#c51d34" />
                    <Text style={styles.errorText}>{errors.jugador2}</Text>
                  </View>
                )}

                {searchTerm.length > 0 && resultadosBusqueda.length > 0 && (
                  <View style={styles.dropdownContainer}>
                    <FlatList
                      nestedScrollEnabled={true}
                      data={resultadosBusqueda}
                      keyExtractor={(item, index) => index.toString()}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => handleSeleccionarJugador(item)}
                          activeOpacity={0.7}
                          delayPressIn={0}
                        >
                          <Text style={styles.dropdownText}>
                            {item.nombre_completo} ({item.usuario})
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>

              {/* Sección de categoría */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>CATEGORÍA</Text>
                <View style={styles.pickerContainer}>
                  <CategoriasTorneo
                    iconName="trophy-outline"
                    placeholder="Selecciona una categoría"
                    options={opcionesDisponibles}
                    selectedValue={selectedCategoria}
                    onValueChange={(selectedValue) => {
                      const parts = selectedValue.split(" ");
                      const categoriaSeleccionada = parts[0];
                      const parejaSeleccionada = parts[1];

                      let subcategoriaValue = 0;
                      if (parejaSeleccionada === "Hombre:")
                        subcategoriaValue = 1;
                      else if (parejaSeleccionada === "Mujer:")
                        subcategoriaValue = 2;
                      else if (parejaSeleccionada === "Mixto:")
                        subcategoriaValue = 3;

                      const selected = categorias?.find(
                        (categoria) =>
                          categoriaSeleccionada === categoria.categoria
                      );

                      if (selected) {
                        handleCategoriaChange(selected, subcategoriaValue);
                        setSelectedCategoriaId(selected.id_nivelJuego);
                        setSelectedSubcategoria(subcategoriaValue);
                      }

                      setSelectedCategoria(selectedValue);
                      // Elimina el mensaje de error en tiempo real si el usuario selecciona una categoría
                      if (selectedValue !== "") {
                        setErrors((prev) => ({ ...prev, categoria: "" }));
                      }
                    }}
                  />
                  {errors.categoria && (
                    <View style={styles.errorContainer}>
                      <Icon name="alert-circle" size={14} color="#c51d34" />
                      <Text style={styles.errorText}>{errors.categoria}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Sección de pago */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>MÉTODO DE PAGO</Text>
                <View style={styles.pickerContainer}>
                  <CategoriasTorneo
                    iconName="card-outline"
                    placeholder="Selecciona método de pago"
                    options={(torneoMetPago || []).map(
                      (metodo) => metodo.nombre
                    )}
                    selectedValue={selectedMetodoPago}
                    onValueChange={(selectedValue) => {
                      const selected = torneoMetPago?.find(
                        (metodo) => metodo.nombre === selectedValue
                      );
                      if (selected) handleMetodoPagoChange(selected);
                      // Elimina el error cuando el usuario selecciona un método de pago
                      if (selectedValue !== "") {
                        setErrors((prev) => ({ ...prev, metodoPago: "" }));
                      }
                    }}
                  />
                  {errors.metodoPago && (
                    <View style={styles.errorContainer}>
                      <Icon name="alert-circle" size={14} color="#c51d34" />
                      <Text style={styles.errorText}>{errors.metodoPago}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Resumen de inscripción */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>RESUMEN DE INSCRIPCIÓN</Text>

                <View style={styles.detailRow}>
                  <Icon name="trophy-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailLabel}>Torneo:</Text>
                  <Text style={styles.detailValue}>{torneoNombre}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailLabel}>Fechas:</Text>
                  <Text style={styles.detailValue}>
                    {formatoFecha(torneoFechaI)} - {formatoFecha(torneoFechaF)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="location-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailLabel}>Club:</Text>
                  <Text style={styles.detailValue}>{torneoFracci}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="people-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailLabel}>Pareja:</Text>
                  <Text style={styles.detailValue}>
                    {nombreJugador1} y{" "}
                    {idJugador2 ? nombreJugador2 : searchTerm || "Por definir"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="pricetag-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailLabel}>Categoría:</Text>
                  <Text style={styles.detailValue}>
                    {selectedCategoria || "Por seleccionar"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="card-outline" size={16} color={colors.primary} />
                  <Text style={styles.detailLabel}>Método:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMetodoPago || "Por seleccionar"}
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>TOTAL A PAGAR:</Text>
                  <Text style={styles.priceValue}>
                    {torneoPrecio} {torneoMoneda}
                  </Text>
                </View>
              </View>

              {/* Botón de acción */}
              {torneoCompleto == 0 && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    (!paymentSheetEnabled || !isFormValid()) &&
                      styles.disabledButton,
                  ]}
                  onPress={handlePaymentValidation}
                  disabled={!paymentSheetEnabled || !isFormValid()}
                  activeOpacity={0.8}
                >
                  {loading2 ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Icon name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        {!paymentSheetEnabled
                          ? "Cargando..."
                          : "CONFIRMAR INSCRIPCIÓN"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Modal de carga */}
        {loading2 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Procesando inscripción...</Text>
          </View>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Estilo base del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    borderColor: colors.primary,
  },

  // Encabezado
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },

  // Contenido
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Secciones
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  // Jugadores
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginLeft: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "400",
    color: "#334155",
    marginLeft: 4,
  },

  // Inputs
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    marginLeft: 8,
    paddingVertical: 6,
  },

  // Dropdown
  dropdownContainer: {
    maxHeight: 150,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 4,
    elevation: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownText: {
    fontSize: 14,
    color: "#334155",
  },

  // Resumen
  summaryContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
    marginLeft: 8,
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "400",
    color: "#334155",
    flex: 1,
  },

  // Precio
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },

  // Botón
  actionButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Errores
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  errorText: {
    color: "#c51d34",
    fontSize: 12,
    marginLeft: 4,
  },

  // Límite
  limitContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 16,
  },
  limitText: {
    color: "#c51d34",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Inscripcion;
