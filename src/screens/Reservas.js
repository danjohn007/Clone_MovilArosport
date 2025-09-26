import {
  View,
  Image,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import APIManager from "../componentes/API/APIManager";
import Logo from "../componentes/Logo";
import Titulo from "../componentes/Titulo";
import FormReservar from "../componentes/FormReservar";
import CustomButton from "../componentes/Buttons";
import VerCalendario from "../componentes/VerCalendario";
import Ubicacion from "../modales/Ubicacion";
import UbiMostrar from "../componentes/UbiMostrar";
import { useStripe } from "@stripe/stripe-react-native";
import { TimeSelector } from "../componentes/MostrarDatosHoras";
import moment from "moment";
import ClubList from "./ClubList";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import BannerAd from "../componentes/BannerAd";
import ModalPaises from "../modales/ModalPaises3";
import { obtenerEstadoYPaisDesdeCoordenadas } from "../config/googleGeocoding";
import Ionicons from "react-native-vector-icons/Ionicons";

const RETURN_URL = "prorally-movil://stripe-redirect";

const Reservas = () => {
  const [id, setId] = useState(null);
  const [clubs, setClubsFiltrados] = useState([]);
  console.log("clubs ", clubs);
  const [horas, setHoras] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [mensajeNoDisponible, setMensajeNoDisponible] = useState("");
  const [estado, setEstado] = useState("");
  console.log("estado recibido ", estado);
  const [pais, setPais] = useState("");
  console.log("pais recibido ", pais);

  const [modalVisible2, setModalVisible2] = useState(false);

  const handleOpenModal2 = () => setModalVisible2(true);
  const handleCloseModal2 = () => setModalVisible2(false);

  const handleSeleccion = (paisSeleccionado, estadoSeleccionado) => {
    setPais(paisSeleccionado);
    setEstado(estadoSeleccionado);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Obtener datos de estado y país desde AsyncStorage
  useEffect(() => {
    const fetchUserLocation = async () => {
      const estadoUsuario = await AsyncStorage.getItem("estado_usuario");
      const paisUsuario = await AsyncStorage.getItem("pais_usuario");
      setEstado(estadoUsuario || "");
      setPais(paisUsuario || "");
    };

    fetchUserLocation();
  }, []);

  function quitarAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function normalizarTexto(texto) {
    return quitarAcentos(texto).toLowerCase().trim();
  }

  // useEffect(() => {
  //   if (selectedDate && estado && pais) {
  //     obtenerClubsDisponibles();
  //   }
  // }, [estado, pais, selectedDate, horas]);

  useFocusEffect(
    useCallback(() => {
      const estadoValido = estado && estado.trim() !== "";
      const paisValido = pais && pais.trim() !== "";
      const fechaValida = selectedDate && selectedDate.trim() !== "";

      if (!estadoValido || !paisValido) {
        setMensajeNoDisponible("Favor de seleccionar un Estado / País: ");
        setClubsFiltrados([]); // Limpiar si había clubs cargados
        setLoadingClubs(false); // Asegúrate de detener la carga
        return;
      }

      if (fechaValida) {
        obtenerClubsDisponibles();
      }
    }, [estado, pais, selectedDate, horas])
  );

const obtenerClubsDisponibles = async () => {
  try {
    setLoadingClubs(true);
    const clubsRes = await APIManager({
      url: `Club/Reservas/obtenerClubsConHorariosYIntervalos/${selectedDate}/`,
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const clubsDisponibles = [];
    const horaSeleccionada = horas
      ? moment(horas, "HH:mm").format("HH:mm:ss")
      : null;

    const fechaSeleccionada = moment(selectedDate, "YYYY-MM-DD").format("dddd").toLowerCase();
    const esHoy = moment().isSame(moment(selectedDate, "YYYY-MM-DD"), "day");
    const horaActual = moment(); // Hora actual del sistema
    const horaConAnticipacion = horaActual.clone().add(1, "hour"); // Se requiere 1 hora de anticipación

    for (const item of clubsRes) {
      const { club, intervalos, reservas, canchas } = item;

        const geo = await obtenerEstadoYPaisDesdeCoordenadas(
          Number(club.latitud),
          Number(club.longitud),
          "club",
          club.id_fraccionamientoclub
        );

        const estadoClub = geo.estado || "";
        const paisClub = geo.pais || "";

      if (
        estado &&
        pais &&
        (normalizarTexto(estadoClub) !== normalizarTexto(estado) ||
          normalizarTexto(paisClub) !== normalizarTexto(pais))
      ) {
        continue;
      }

      const horariosDisponibles = calcularHorariosDisponibles({
        intervalos,
        reservas: reservas || [],
        canchas,
      });

        const horariosFiltrados = horariosDisponibles.filter((horario) => {
          if (horaSeleccionada && horario.hora_inicio !== horaSeleccionada) {
            return false;
          }

          if (esHoy) {
            // Convertir hora_inicio a momento
            const horaInicioMoment = moment(horario.hora_inicio, "HH:mm:ss");
            const horaReserva = moment()
              .startOf("day")
              .add(horaInicioMoment.hours(), "hours")
              .add(horaInicioMoment.minutes(), "minutes");

            // Solo incluir si la hora de inicio es posterior a (hora actual + 1 hora)
            return horaReserva.isAfter(horaConAnticipacion);
          }

          return true; // Si no es hoy, aceptar cualquier horario
        });

      if (horariosFiltrados.length > 0) {
        clubsDisponibles.push({ club, horarios: horariosFiltrados });
      }
    }

    setClubsFiltrados(clubsDisponibles);
    setMensajeNoDisponible(
      clubsDisponibles.length === 0
        ? "No hay clubes disponibles con la información seleccionada"
        : ""
    );
  } catch (error) {
    console.log("❗ Error al obtener clubs disponibles:", error);
  } finally {
    setLoadingClubs(false);
  }
};

  // Función para calcular los horarios disponibles
  // const calcularHorariosDisponibles = ({ intervalos, reservas, canchas }) => {
  //   const horariosDisponibles = [];

  //   // Iterar sobre los intervalos de las canchas
  //   Object.entries(intervalos).forEach(([idCancha, tarifas]) => {
  //     tarifas.forEach((tarifa) => {
  //       const {
  //         horario_inicio,
  //         horario_fin,
  //         intervalo,
  //         id_canchas,
  //         precio,
  //         moneda,
  //       } = tarifa;

  //       const start = moment(horario_inicio, "HH:mm:ss");
  //       const end = moment(horario_fin, "HH:mm:ss");
  //       const duracion = moment.duration(intervalo);

  //       let horaActual = moment(start);

  //       // Iterar y crear los horarios disponibles
  //       while (horaActual.clone().add(duracion).isSameOrBefore(end)) {
  //         const inicio = horaActual.format("HH:mm:ss");
  //         const fin = horaActual.clone().add(duracion).format("HH:mm:ss");

  //         // Comprobar si ya existe una reserva en ese intervalo
  //         const hayReserva = reservas.some((r) => {
  //           if (r.id_cancha !== id_canchas) return false;

  //           const inicioReserva = moment(r.hora_inicio, "HH:mm:ss");
  //           const finReserva = moment(r.hora_fin, "HH:mm:ss");

  //           // Verificar si el horario se solapa con una reserva existente
  //           return (
  //             horaActual.isBefore(finReserva) &&
  //             horaActual.clone().add(duracion).isAfter(inicioReserva)
  //           );
  //         });

  //         // Si no hay reserva, agregar el horario disponible
  //         if (!hayReserva) {
  //           horariosDisponibles.push({
  //             hora_inicio: inicio,
  //             hora_fin: fin,
  //             duracion: intervalo,
  //             cancha: obtenerNombreCancha(id_canchas, canchas),
  //             id_cancha: id_canchas,
  //             precio,
  //             moneda,
  //           });
  //         }

  //         // Avanzar a la siguiente hora con el intervalo
  //         horaActual.add(duracion);
  //       }
  //     });
  //   });

  //   return horariosDisponibles;
  // };

  // Función para calcular los horarios disponibles de 00:00 a 00:00 son las 24hrs
  const calcularHorariosDisponibles = ({ intervalos, reservas, canchas }) => {
  const horariosDisponibles = [];

  console.log("📋 Reservas recibidas:");
  reservas.forEach((r) => {
    console.log(
      `📌 Reserva - Cancha: ${r.id_cancha}, Inicio: ${r.hora_inicio}, Fin: ${r.hora_fin}`
    );
  });

  Object.entries(intervalos).forEach(([idCancha, tarifas]) => {
    tarifas.forEach((tarifa) => {
      const {
        horario_inicio,
        horario_fin,
        intervalo,
        id_canchas,
        precio,
        moneda,
      } = tarifa;

      const start = moment(horario_inicio, "HH:mm:ss");
      let end = moment(horario_fin, "HH:mm:ss");

      // ✅ Si el horario_fin es 00:00:00, tratamos como 24:00 del mismo día
      if (horario_fin === "00:00:00") {
        end = moment(horario_inicio, "HH:mm:ss").startOf("day").add(1, "day"); // 24:00
        console.log(`⏰ Corrigiendo fin a 24:00 para tarifa de cancha ${id_canchas}`);
      }

      const duracion = moment.duration(intervalo);
      let horaActual = moment(start);

      console.log(
        `🧾 Intervalo cancha ${id_canchas}: ${start.format("HH:mm:ss")} - ${end.format("HH:mm:ss")} | Duración: ${intervalo}`
      );

      while (horaActual.clone().add(duracion).isSameOrBefore(end)) {
        const inicio = horaActual.format("HH:mm:ss");
        const fin = horaActual.clone().add(duracion).format("HH:mm:ss");

        console.log(`⏱ Evaluando bloque: ${inicio} - ${fin}`);

        const hayReserva = reservas.some((r) => {
          if (r.id_cancha !== id_canchas) return false;

          let inicioReserva = moment(r.hora_inicio, "HH:mm:ss");
          let finReserva = moment(r.hora_fin, "HH:mm:ss");

          // ✅ Si la reserva termina a las 00:00:00, interpretarlo como 24:00
          if (r.hora_fin === "00:00:00") {
            finReserva = moment(r.hora_inicio, "HH:mm:ss").startOf("day").add(1, "day");
          }

          const solapa =
            horaActual.isBefore(finReserva) &&
            horaActual.clone().add(duracion).isAfter(inicioReserva);

          if (solapa) {
            console.log(
              `❌ Hay solapamiento con reserva: ${r.hora_inicio} - ${r.hora_fin} en cancha ${r.id_cancha}`
            );
          }

          return solapa;
        });

        if (!hayReserva) {
          horariosDisponibles.push({
            hora_inicio: inicio,
            hora_fin: fin,
            duracion: intervalo,
            cancha: obtenerNombreCancha(id_canchas, canchas),
            id_cancha: id_canchas,
            precio,
            moneda,
          });
          console.log(`✅ Disponible: ${inicio} - ${fin}`);
        }

        horaActual.add(duracion);
      }
    });
  });

  return horariosDisponibles;
};

  const obtenerNombreCancha = (id, canchas) => {
    const cancha = canchas.find((c) => c.id_canchas === id);
    return cancha ? cancha.can_nombre : "";
  };

  return (
    <View style={styles.principal}>
      <Logo />
      <Titulo titulo="RESERVAR" />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.inputBox} onPress={handleOpenModal2}>
          <Ionicons
            name="location-outline"
            size={24}
            color="#02B9FA"
            style={styles.icon}
          />
          <Text style={styles.textInput}>
            {estado && pais
              ? `${estado}, ${pais}`
              : "Seleccionar País / Estado:"}
          </Text>
        </TouchableOpacity>

        <View style={styles.barraFechaHora}>
          <View style={{ width: "48%" }}>
            <VerCalendario
              placeholder="Fecha"
              selectedValue={selectedDate}
              onValueChange={(value) => setSelectedDate(value)}
            />
          </View>

          <View style={{ width: "50%" }}>
            <TimeSelector
              value={horas}
              onChange={setHoras}
              selectedDate={selectedDate}
              placeholder="Hora"
            />
          </View>
        </View>
      </View>

      {/* Mostrar el mensaje de carga si está cargando */}
      {loadingClubs ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="white"
            style={styles.loadingGif}
          />
        </View>
      ) : (
        <>
          {/* Mostrar el mensaje si no hay clubes disponibles */}
          {mensajeNoDisponible ? (
            <View style={styles.loadingMensajesContainer}>
              <Text style={styles.loadingMensajes}>{mensajeNoDisponible}</Text>
            </View>
          ) : (
            // Mostrar la lista de clubs filtrados
            <View style={styles.scrollable}>
              <ClubList clubsFiltrados={clubs} selectedDate={selectedDate} />
            </View>
          )}
        </>
      )}

      {/* Modal de ubicación */}
      <Ubicacion visible={modalVisible} closeModal={handleCloseModal} id={id} />
      <ModalPaises
        visible={modalVisible2}
        onClose={() => setModalVisible2(false)}
        onSelectPaisEstado={(pais, estado) => {
          console.log("Estado----", estado);
          setPais(pais);
          setEstado(estado);
        }}
        estado={estado} // Pasar estado
        pais={pais} // Pasar pais
      />

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
  fijo: {
    paddingTop: -30,
    paddingBottom: 10,
  },
  scrollable: {
    flex: 1,
    paddingBottom: 60,
  },
  detalleContainer: {
    width: "88%",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#02B9FA",
    padding: 15,
    marginTop: 15,
    alignSelf: "center",
  },
  detalleTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#809FB8",
    textAlign: "center",
  },
  detalleTexto: {
    fontSize: 14,
    color: "#809FB8",
  },
  precioTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#809FB8",
    marginTop: 5,
    textAlign: "left",
  },
  gridScrollContainer: {
    paddingBottom: 10,
    marginTop: 10,
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: -50,
  },
  loadingMensajesContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: -10,
  },
  loadingMensajes: {
    fontSize: 16,
    padding: 16,
    color: "white",
    textAlign: "center",
  },
  loadingGif: {
    width: 170, // Ajusta el tamaño del GIF
    height: 170, // Ajusta el tamaño del GIF
    resizeMode: "contain", // Asegura que el GIF no se distorsione
  },
  loadingText: {
    marginTop: -40, // Espacio entre el GIF y el texto
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    textAlign: "center", // Asegura que el texto esté centrado
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
  },
  inputContainer: {
    width: "90%",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 0,
  },
  inputBox: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16, // Cambiado de 10 a 16
    borderWidth: 3,
    borderColor: "#02B9FA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  textInput: {
    color: "#838080",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  icon: {
    marginRight: 10,
  },
  inputHalf: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#02B9FA",
    borderRadius: 16, // Cambiado de 10 a 16
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  text1: {
    color: "#809FB8",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  //barra de fecha y hora
  barraFechaHora: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
});

export default Reservas;