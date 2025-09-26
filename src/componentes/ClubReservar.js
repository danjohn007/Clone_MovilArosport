import { View, FlatList, StyleSheet, Image, Text, ActivityIndicator, Alert, Linking, ScrollView, Modal } from 'react-native';
import React, { useState, useEffect, useRef} from "react";
import APIManager from './API/APIManager';
import Logo from './Logo';
import Titulo from './Titulo';
import MenuItem from './MenuItem';
import FormReservar from './FormReservar';
import CustomButton from './Buttons';
import { useStripe } from "@stripe/stripe-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MostrarCalendario from './MostrarCalendario';
import Ubicacion from '../modales/Ubicacion';
import UbiMostrar from './UbiMostrar';
import BotonesChicos from '../componentes/BotonesChicos';
import TablaHorariosModal from '../componentes/TablaHorariosModal';
import moment from 'moment';

const RETURN_URL = "prorally-movil://stripe-redirect";

const Club = ({ route }) => {
  const { clubName, id } = route.params || {};
  console.log('clubname', clubName);

  const [selectedItem, setSelectedItem] = useState('noticias');
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [selectedHoraFin, setSelectedHoraFin] = useState("");
  const [selectedHoraInicio, setSelectedHoraInicio] = useState("");
  const [selectedTiempo, setSelectedTiempo] = useState("");
  const [canchas, setCanchas] = useState([]);
  const [idCancha, setIdCancha] = useState(null);
  const [intervalos, setIntervalos] = useState([]); // Estado para intervalos.}
  const [horas, setHoras] = useState([]); // Estado para intervalos.
  const [precio, setPrecio] = useState(0);
  const [moneda, setMoneda] = useState(null);
  const [id_usuario, setUsuario] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  console.log("fecha slelecionada", selectedDate);
  
  const [horariosDisponibles, setHorariosDisponibles] = useState([]); // Nuevo estado para los horarios disponibles.
  console.log("horariosDisponibles", horariosDisponibles);
 
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [loading, setLoading] = useState(true);
   const [loading2, setLoading2] = useState(false);
  const [userEmail, setEmail] = useState("");
  const [idCanchaSeleccionada, setIdCanchaSeleccionada] = useState(null); // O cualquier valor por defecto



    //stripe:
    const [isPaid, setIsPaid] = useState(false);
    const [savedCards, setSavedCards] = useState([]);
    const [paidSubscriptions, setPaidSubscriptions] = useState([]);
    const [saveCard, setSaveCard] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("new");
    const { initPaymentSheet, presentPaymentSheet, handleURLCallback } =
      useStripe();
   const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
    const [adjustedTotal, setAdjustedTotal] = useState(0);
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [stripeCustomer, setStripe] = useState("");

    console.log("stripeid", stripeCustomer);



  const handleDateChange = (nuevaFecha) => {
    setFechaSeleccionada(nuevaFecha);
    console.log('Fecha seleccionada:', nuevaFecha);
  };

  useEffect(() => {
  }, [route?.params]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const fetchCanchas = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Club/Reservas/mostrar_canchas/${id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setCanchas(res);
    } catch (error) {
      console.log('Error al obtener las canchas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCanchas();
    }
  }, [id]);

  const handleSelectCancha = (value) => {
    const selected = canchas.find(cancha => cancha.can_nombre === value);
    if (selected) {
      setSelectedCancha(value);
      setIdCancha(selected.id_canchas);
    }
  };

  useEffect(() => {
    if (idCancha) {
      fetchIntervalos();
    }
  }, [idCancha]);


const fetchIntervalos = async () => {
  try {
    if (!idCancha) {

      console.log('Por favor selecciona una cancha para obtener intervalos');
      return;
    }
    setLoading(true);
    const res = await APIManager({
      url: `Club/Reservas/mostrar_intervalos/${idCancha}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setIntervalos(res);
  } catch (error) {
    console.log('Error al obtener los intervalos:', error);
  } finally {
    setLoading(false);
  }
};


const fetchHorariosYReservas = async () => {
  try {
    const res = await APIManager({
      url: `Club/Reservas/obtenerHorariosConIntervalos/${selectedDate}/${id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { horarios, intervalos, canchas, reservas } = res;

    // Verificamos que los horarios y los intervalos no estén vacíos
    if (
      !horarios || horarios.length === 0 || 
      !intervalos || Object.keys(intervalos).length === 0 ||
      !canchas || canchas.length === 0
    ) {
      console.log("No hay horarios disponibles para este día.");
      setHorariosDisponibles([]); // Mantener la información previa o mostrar un mensaje vacío
      return; // No hacer el cálculo si no hay horarios disponibles
    }

    // Si hay horarios disponibles, calculamos los horarios disponibles
    const horariosDisponibles = calcularHorariosDisponibles({
      intervalos,
      reservas: reservas || [],
      canchas,
    });

    // Si los horarios disponibles no están vacíos, los seteamos
    if (horariosDisponibles && horariosDisponibles.length > 0) {
      setHoras(res); // Para debug
      setHorariosDisponibles(horariosDisponibles);
      console.log("Horarios disponibles calculados:", horariosDisponibles);
    } else {
      console.log("No se pudieron calcular horarios disponibles.");
    }

  } catch (error) {
    console.log('Error al obtener horarios y reservas:', error);
  }
};



useEffect(() => {
  if (selectedDate) {
    // Resetear selección previa
    setSelectedHoraInicio("");
    setSelectedHoraFin("");
    setSelectedCancha("");
    setSelectedTiempo("");
    setPrecio("");
    setMoneda("");
    fetchHorariosYReservas();
  }
}, [selectedDate]);




const calcularHorariosDisponibles = ({ intervalos, reservas, canchas }) => {
  const horariosDisponibles = [];

  Object.entries(intervalos).forEach(([idCancha, tarifas]) => {
    tarifas.forEach(tarifa => {
      const {
        horario_inicio,
        horario_fin,
        intervalo,
        id_canchas,
        precio,
        moneda
      } = tarifa;

      const start = moment(horario_inicio, "HH:mm:ss");
      const end = moment(horario_fin, "HH:mm:ss");
      const duracion = moment.duration(intervalo);

      let horaActual = moment(start);

      while (horaActual.clone().add(duracion).isSameOrBefore(end)) {
        const inicio = horaActual.format("HH:mm:ss");
        const fin = horaActual.clone().add(duracion).format("HH:mm:ss");

        const hayReserva = reservas.some(r => {
          if (r.id_cancha !== id_canchas) return false;

          const inicioReserva = moment(r.hora_inicio, "HH:mm:ss");
          const finReserva = moment(r.hora_fin, "HH:mm:ss");

          return horaActual.isBefore(finReserva) && horaActual.clone().add(duracion).isAfter(inicioReserva);
        });

        if (!hayReserva) {
          horariosDisponibles.push({
            hora_inicio: inicio,
            hora_fin: fin,
            duracion: intervalo,
            cancha: obtenerNombreCancha(id_canchas, canchas),
            id_cancha: id_canchas,
            precio,
            moneda
          });
        }

        horaActual.add(duracion);
      }
    });
  });

  return horariosDisponibles;
};


const obtenerNombreCancha = (id, canchas) => {
  const cancha = canchas.find(c => c.id_canchas === id);
  return cancha ? cancha.can_nombre : '';
};




  const handleOpenUbicacion = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleOpenHorarios = () => {
    setModalVisible2(true);
  };

  const handleCloseHorarios = () => {
    setModalVisible2(false);
  };

  const getDatos = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Perfil/get_info`,
        method: 'GET',
      });
      console.log("Respuesta del servidor:", res);  // Asegúrate de ver el contenido de la respuesta
      if (res && res.data && res.data.stripe_id) {
        setStripe(res.data.stripe_id);  // Establecer el stripe_id solo si es válido
        setUsuario(res.data.id_usuario);
        setEmail(res.data.us_correo);
      } else {
        console.log("stripe_id no disponible.");
      }
    } catch (error) {
      console.log('Error al obtener la información:', error);
    } finally {
      setLoading(false);
    }
  };
 



  useFocusEffect(
    React.useCallback(() => {
      getDatos();
    }, [])
);

  //pagar con stripe:
  const initializePaymentSheet = async (precio, moneda) => {
    try {
      const amountInCents = Math.round(
        Math.max(precio) * 100
      );
      console.log("precio total de la reserva en centavos", amountInCents);
  
      // Verificar si stripeCustomer tiene el valor correcto
      if (!stripeCustomer || stripeCustomer.trim() === "") {
        throw new Error("El stripeCustomer está vacío o no disponible");
      }
  
      console.log("stripeCustomer:", stripeCustomer);
      
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
            currency: moneda,
            customerId: stripeCustomer,  // Asegúrate de pasar el valor correcto
            saveCard: saveCard,
            paymentMethodId: paymentMethod !== "new" ? paymentMethod : undefined,
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
        merchantDisplayName: "ProRally",
        customerId: stripeCustomer,  // Se pasa aquí también
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        returnURL: RETURN_URL,
        allowsDelayedPaymentMethods: true,
      });
  
      if (error) {
        console.log("Error al inicializar la hoja de pago:", error);
      } else {
        console.log("Hoja de pago inicializada correctamente.");
        setPaymentSheetEnabled(true);  // Habilitar la hoja de pago
      }
    } catch (error) {
      console.log("Error al inicializar la hoja de pago:", error.message);
    }
  };
  
  
  const handlePayment = async (precio, moneda) => {
    if (!paymentSheetEnabled) {
      alert("La hoja de pago no está inicializada. Por favor, espera o intenta de nuevo.");
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
          console.log("El método de pago no se guardó, pero el pago fue exitoso.");
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
    

        const formData = new FormData();
        formData.append("paymentIntentId", paymentIntentId);
        formData.append("email", userEmail);
        formData.append("club", clubName);
        formData.append("descripcion", `Reservación de la cancha ${selectedCancha}`);
        formData.append("fecha", selectedDate);
        formData.append("tiempo", selectedTiempo);
        formData.append("hora_inicio", selectedHoraInicio);
        formData.append("hora_fin", selectedHoraFin);


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

  const handlePagar = async (precio , moneda) => {
    console.log("pagar moneda:", moneda);
    console.log("pagar precio:", precio);
    try {

      const formData = new FormData();
      formData.append("precio", precio);
      formData.append("moneda", moneda);
      formData.append("id_usuario", id_usuario);
      formData.append("fecha", selectedDate);
      formData.append("hora_inicio", selectedHoraInicio);
      formData.append("hora_fin", selectedHoraFin);
      formData.append("duracion", selectedTiempo);
      formData.append("id_cancha", idCancha);
      formData.append("id_status", 1);
      formData.append("num_canchas", 1);
      formData.append("id_fraccionamientoclub", 1);
      formData.append("selectedClub", clubName);


    console.log("Enviando datos a la API...");
    console.log("FormData:", formData);


      const response = await APIManager({
        url: "Club/Reservas/registrar_reserva",
        method: "POST",
        data: formData,
      });
   console.log("Respuesta de la API: ", response);
      if (response.resultado) {
        Alert.alert("Éxito", "La reservación se ha sido realizado correctamente.");
        
         
        // Limpiar todos los campos después de la reserva exitosa
        setSelectedCancha("");   // Limpiar la cancha seleccionada
        setSelectedDate("");     // Limpiar la fecha
        setSelectedTiempo("");   // Limpiar el tiempo seleccionado
        setSelectedHoraInicio("");     // Limpiar la hora seleccionada
        setSelectedHoraFin("");     // Limpiar la hora seleccionada
        setPrecio("");
        setMoneda("");
        fetchHorariosYReservas();
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
    console.log("methodo id", paymentMethodId );
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
    return (
      selectedCancha !== "" &&
      selectedDate !== "" &&
      selectedTiempo !== "" &&
      selectedHoraInicio !== "" &&
      selectedHoraFin !== "" &&
      precio > 0 &&
      stripeCustomer !== ""
    );
  };

  const handlePaymentValidation = async () => {
    if (!isFormValid()) {
      Alert.alert("Atención", "Por favor, completa todos los campos antes de continuar.");
      return;
    }
    // Si todos los campos están validados, se procede con el pago
   await handlePayment(precio, moneda);
  };

  useEffect(() => {
    if (precio && moneda) {
      initializePaymentSheet(precio, moneda);
    }
  }, [precio, moneda]);
  
    
  const formatHora = (hora) => {
    const [h, m] = hora.split(':');
    return `${h}:${m}`;
  };
  
  const formatDuracion = (duracion) => {
    const [hrs, mins] = duracion.split(':').map(Number);
    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;
    if (mins) return `${mins}m`;
    return '';
  };

  return (
               <View>
                  {/* Modal de carga */}
                      <Modal transparent={true} animationType="fade" visible={loading2}>
                        <View style={styles.modalContainer2}>
                          <View style={styles.modalContent2}>
                            <ActivityIndicator size="large" color="#02B9FA" />
                            <Text style={styles.loadingText}>
                              Procesando reservación...
                            </Text>
                          </View>
                        </View>
                      </Modal>

                <ScrollView  contentContainerStyle={styles.gridScrollContainer} >
                <UbiMostrar
            iconName="location-outline"
            placeholder="Ubicación"
            onPress={handleOpenUbicacion} 
          />
    
         <MostrarCalendario
           placeholder="Selecciona una fecha"
           selectedValue={selectedDate}
           onValueChange={(value) => {
            // Asegurarse de que 'value' sea una fecha ya en formato YYYY-MM-DD
            setSelectedDate(value);  // Solo pasa la fecha formateada directamente
          }}
         />

<UbiMostrar
            iconName="time-outline"
            placeholder="Seleccionar horario:"
            selectedValue={
              selectedHoraInicio && selectedHoraFin 
                ? `Horario: ${formatHora(selectedHoraInicio)} - ${formatHora(selectedHoraFin)}`
                : "Seleccionar horario:"
            }
            onPress={handleOpenHorarios} 
          />

         <View style={styles.detalleContainer}>
           <Text style={styles.detalleTitulo}>Detalle de la Reserva</Text>
           <Text style={styles.detalleTexto}>Fecha: {selectedDate}</Text>
           <Text style={styles.detalleTexto}>Cancha: {selectedCancha}</Text>
           <Text style={styles.detalleTexto}>Hora: {selectedHoraInicio && selectedHoraFin
    ? `${formatHora(selectedHoraInicio)} - ${formatHora(selectedHoraFin)}`
    : ""}</Text>
           <Text style={styles.detalleTexto}>Tiempo: {formatDuracion(selectedTiempo)}</Text>
           <Text style={styles.detalleTexto}>
  Precio a Pagar: {precio ? `${moneda === 'MXN' ? '$' : ''}${precio} ${moneda}` : ''}
</Text>

         </View>
   <CustomButton
  buttonText={paymentSheetEnabled ? (isFormValid() ? "Pagar" : "Pagar") : "Pagar"}
  onPress={handlePaymentValidation} // Llama a la función de validación antes de procesar el pagooo
  disabled={!paymentSheetEnabled || !isFormValid()}  // Deshabilita el botón si la hoja de pago no está inicializada o el formulario no está completo
/>



     </ScrollView>
     <Ubicacion
      visible={modalVisible}
      closeModal={handleCloseModal}
      id={id}
    />
      <TablaHorariosModal
        visible={modalVisible2}
        closeModal={handleCloseHorarios}
        horarios={horariosDisponibles}
        onSelect={(horario) => {
          setSelectedHoraInicio(horario.hora_inicio);
          setSelectedHoraFin(horario.hora_fin);          
          setSelectedCancha(horario.cancha);
          setIdCancha(horario.id_cancha);
          setSelectedTiempo(horario.duracion);
          setPrecio(horario.precio);         // nuevo
          setMoneda(horario.moneda);         // nuevo
        }}
        
      />

    </View>
  );
};

const styles = StyleSheet.create({
  principalClub: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 10,
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    alignItems: "center",
  },
  detalleContainer: {
    width: '90%',
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#02B9FA',
    padding: 15,
    marginTop: 15,
    alignSelf: 'center',
    marginBottom: -15,
    
  },
  detalleTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#809FB8',
    textAlign: 'center',
  },
  detalleTexto: {
    fontSize: 14,
    color: '#809FB8',
  },
  precioTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#809FB8',
    marginTop: 5,
    textAlign: 'left',
  },
  gridScrollContainer: {
    paddingBottom: 300, // Ajusta este valor si es necesario
  },
  modalContainer2: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: '#00baff',
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent2: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: '#00baff',
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
});

export default Club;