import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; // Add this import
import Logo from "../componentes/Logo";
import Contador from "../componentes/Contador";
import GameFilter from "../componentes/GameTypes";
import MostrarDatos from "../componentes/MostrarDatos";
import CustomButton from "../componentes/Buttons";
import SeleccionarMostrarDato from "../componentes/SeleccionarMostrarDato";
import AgregarJugadores from "../modales/AgregarJugadores";
import APIManager from "../componentes/API/APIManager";
import Titulo from "../componentes/Titulo";
import VerCalendario from "../componentes/VerCalendario";
import Categorias from "../componentes/Categorias";
import CategoriasTipo from "../componentes/CategoriasTipo";
import CategoriasClub from "../componentes/CategoriasClub";
import {
  TimeSelector,
  DurationCounter,
} from "../componentes/MostrarDatosHoras";
import { useAuth } from "./Auth/AuthContext";
const { width } = Dimensions.get("window");
import { VideoView, useVideoPlayer } from "expo-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TablaReservas from "../componentes/TablaReservas";
import TablaHorariosModal from "../componentes/TablaHorariosModal";
import moment from "moment";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// 🚫 COMENTADO: Import de Stripe ya no es necesario
// import { useStripe } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";
import UbicacionPerfil from "../modales/UbicacionPerfil";
const RETURN_URL = "prorally-movil://stripe-redirect";

const formularioJugada = ({
  numberOfPlayedGames,
  subscription,
  tipoJugada,
}) => {
  console.log("numberOfPlayedGames", numberOfPlayedGames);
  console.log("subscription", subscription);
  console.log("🎯 tipoJugada desde menu:", tipoJugada); // ← Agregado para depuración
  const selectedTipo =
    tipoJugada === "publica" ? 1 : tipoJugada === "privada" ? 2 : null;
  console.log("🎯 selectedTipo calculado:", selectedTipo); // ← Agregado para depuración

  const [isPaid, setIsPaid] = useState(false);
  // 🚫 COMENTADO: Variables de estado de Stripe ya no son necesarias
  /*
  const [savedCards, setSavedCards] = useState([]);
  const [paidSubscriptions, setPaidSubscriptions] = useState([]);
  const [saveCard, setSaveCard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("new");
  */
  // 🚫 COMENTADO: Variables de Stripe ya no son necesarias
  /*
  const { initPaymentSheet, presentPaymentSheet, handleURLCallback } =
    useStripe();
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [adjustedTotal, setAdjustedTotal] = useState(0);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [stripeCustomer, setStripe] = useState("");
  */
  const [userEmail, setEmail] = useState("");

  const [horaFin, setHoraFin] = useState("");

  const navigation = useNavigation();
  const [id, setId] = useState(null);
  console.log("id club", id);
  const [idCancha, setIdCancha] = useState(null);
  const [nombre, setNombre] = useState("");
  const [hora, setHora] = useState("");
  const [horario, setHorario] = useState("");
  console.log("hora selelcionada", hora);
  const [duracion, setDuracion] = useState("02:00");
  console.log("duracion", duracion);
  const [selectedDate, setSelectedDate] = useState("");
  console.log("fecha recibida", selectedDate);
  const [numCanchas, setNumCanchas] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [gameTypes, setGameTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);

  const [precio, setPrecio] = useState(null);
  const [moneda, setMoneda] = useState(null);

  const [selectedReservas, setSelectedReservas] = useState(null);
  console.log("rsrevas selelcionada", selectedReservas);
  const [fieldsLocked, setFieldsLocked] = useState(false); // Para controlar si los campos están bloqueados

  const [categorias, setCategorias] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null); // NUEVO

  const [tipos, setTipos] = useState([]);
  console.log("tipos d ejugada", tipos);
  const { id_usuario } = useAuth();
  const [selectedGameModeId, setSelectedGameModeId] = useState(null);
  console.log("selectedGameModeId", selectedGameModeId);

  // 🆕 Estado para el nombre del usuario (para automatizar nombre de jugada)
  const [nombreUsuario, setNombreUsuario] = useState("");

  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]); // Jugadores seleccionados
  const [horarioTexto, setHorarioTexto] = useState(null); // solo para mostrar
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null); // objeto real

  // 🆕 Estados para ubicación
  const [modalUbicacionVisible, setModalUbicacionVisible] = useState(false);
  const [ubicacionJugada, setUbicacionJugada] = useState(null);

  const [visibleComponents, setVisibleComponents] = useState({
    // Componentes iniciales siempre visibles
    jugadasCreadas: true, // 1. Jugadas creadas
    nombreJugada: true, // 2. Nombre de jugada

    // Componentes que se mostrarán según el flujo
    gameMode: false, // 3. Tipo de juego
    fecha: false, // 4. Fecha
    hora: false, // 5. Hora
    club: false, // 6. Club
    ubicacion: false, // 7. Ubicación
    canchas: false, // 8. Número de canchas
    categoria: false, // 9. Categoría
    jugadores: false, // 10. Invitar jugadores

    // Componentes obsoletos (mantenidos para compatibilidad)
    seleccionarReserva: false, // ❌ OCULTO - ya no se usa en ningún flujo
    horario: false, // ❌ OCULTO - ya no se usa
  });

  const updateComponentVisibility = () => {
    // Crear un objeto con todos los componentes inicializados como ocultos
    const newVisibility = {
      // Por defecto, estos componentes siempre son visibles:
      jugadasCreadas: true,
      nombreJugada: true,

      // Los demás componentes empiezan ocultos:
      seleccionarReserva: false, // Oculto por defecto ahora
      gameMode: false,
      fecha: false,
      hora: false,
      club: false,
      horario: false, // Ya no se usa
      canchas: false,
      categoria: false,
      jugadores: false,
      ubicacion: false,
    };

    // IMPORTANTE: Permitir crear jugada si hay tipo seleccionado O si el usuario puede crear gratis
    if (selectedTipo || numberOfPlayedGames < 5) {
      // Mostrar todos los componentes necesarios
      newVisibility.gameMode = true;
      newVisibility.fecha = true;
      newVisibility.hora = true;
      newVisibility.club = true;
      newVisibility.ubicacion = true;
      newVisibility.canchas = true;
      newVisibility.categoria = true;
      newVisibility.jugadores = true;
    }

    setVisibleComponents(newVisibility);
  };

  // 🆕 LLAMAR A updateComponentVisibility CUANDO CAMBIEN selectedTipo O tipoJugada
  useEffect(() => {
    updateComponentVisibility();
  }, [selectedTipo, tipoJugada]); // ← Eliminado reservaSeleccionada

  // 🆕 Regenerar nombre automáticamente si ya hay tipo seleccionado y se obtiene el usuario
  useEffect(() => {
    if (selectedGameModeId && gameTypes.length > 0) {
      console.log("Intentando generar nombre con:", {
        selectedGameModeId,
        nombreUsuario,
        gameTypesLength: gameTypes.length,
      });
      generarNombreJugada(selectedGameModeId);
    }
  }, [nombreUsuario, gameTypes, selectedGameModeId]);

  // 🆕 Regenerar nombre cuando se selecciona explícitamente un modo de juego
  const handleGameModeSelect = (modeId) => {
    console.log("Modo de juego seleccionado:", modeId);
    setSelectedGameModeId(modeId);

    // Intentar generar el nombre inmediatamente si ya tenemos los datos necesarios
    if (modeId && gameTypes.length > 0) {
      generarNombreJugada(modeId);
    }
  };

  // 🆕 Resetear numCanchas a 1 cuando se selecciona RETA
  useEffect(() => {
    if (selectedGameModeId && gameTypes.length > 0) {
      const tipoJuegoSeleccionado = gameTypes.find(
        (game) => game.id_modojuego === selectedGameModeId
      );

      if (
        tipoJuegoSeleccionado &&
        tipoJuegoSeleccionado.mod_nombre?.toLowerCase().includes("reta")
      ) {
        if (numCanchas > 1) {
          setNumCanchas(1);
          console.log("🎾 RETA detectado: número de canchas reseteado a 1");
        }
      }
    }
  }, [selectedGameModeId, gameTypes]);

  //video
  const [loading2, setLoading2] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const playerRef = useRef(null);

  const [videoEnded, setVideoEnded] = useState(false);
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);

  const [errors, setErrors] = useState({});
  const [clubs, setClubsFiltrados] = useState([]);
  console.log("clubs disponñpes para esa fecha", clubs);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [mensajeNoDisponible, setMensajeNoDisponible] = useState("");
  const [horariosClubSeleccionado, setHorariosClubSeleccionado] = useState([]);
  console.log("horariosDisponibles", horariosClubSeleccionado);
  const [bloquearContador, setBloquearContador] = useState(false);
  const [canchasSeleccionadas, setCanchasSeleccionadas] = useState([]);
  console.log("ids canchasSeleccionadas", canchasSeleccionadas);

  const handleOpenReservas = () => {
    setModalVisible2(true);
    fetchReservas();
  };

  const handleOpenHorarios = () => {
    setModalVisible3(true);
  };

  const handleCloseReservas = () => {
    setModalVisible2(false);
  };
  const handleCloseHorarios = () => {
    setModalVisible3(false);
  };
  const getDatos = async () => {
    try {
      setLoading(true);

      // 🆕 Primero intentar obtener el nombre desde AsyncStorage
      try {
        const nombreStorage = await AsyncStorage.getItem("nombre_usuario");
        if (nombreStorage) {
          console.log(
            "👤 Nombre de usuario obtenido desde AsyncStorage:",
            nombreStorage
          );
          // Almacenar el nombre inmediatamente
          setNombreUsuario(nombreStorage);
        } else {
          console.log("⚠️ No se encontró nombre_usuario en AsyncStorage");
        }
      } catch (error) {
        console.log("Error al obtener nombre desde AsyncStorage:", error);
      }

      const res = await APIManager({
        url: `Perfil/get_info`,
        method: "GET",
      });
      console.log("Respuesta del servidor:", res);

      if (res && res.data) {
        if (res.data.stripe_id) {
          setEmail(res.data.us_correo);
        }

        // 🆕 Verificar si tenemos un nombre desde la API
        if (res.data.nombre) {
          console.log("👤 Nombre obtenido desde API:", res.data.nombre);

          // Siempre actualizar el nombre desde la API para mantenerlo al día
          setNombreUsuario(res.data.nombre);

          // Guardar en AsyncStorage para futuras consultas
          try {
            await AsyncStorage.setItem("nombre_usuario", res.data.nombre);
            console.log("💾 Nombre guardado en AsyncStorage:", res.data.nombre);
          } catch (error) {
            console.log("Error al guardar nombre en AsyncStorage:", error);
          }
        }
      } else {
        console.log("stripe_id no disponible.");
      }
    } catch (error) {
      console.log("Error al obtener la información:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Función para generar automáticamente el nombre de la jugada
  const generarNombreJugada = (gameModeId) => {
    console.log("🔍 DEBUG generarNombreJugada:");
    console.log(
      "  - gameModeId recibido:",
      gameModeId,
      "(tipo:",
      typeof gameModeId,
      ")"
    );
    console.log("  - nombreUsuario:", nombreUsuario);
    console.log("  - gameTypes length:", gameTypes.length);
    console.log("  - gameTypes:", gameTypes);

    // Verificar que tengamos un modo de juego válido y datos de tipos de juego
    if (!gameModeId || !gameTypes.length) {
      console.log("⚠️ Faltan datos para generar nombre automático:", {
        gameModeId,
        gameTypesLength: gameTypes.length,
      });
      return;
    }

    // Si no tenemos nombre de usuario, usar un valor por defecto
    const nombreUsuarioFinal = nombreUsuario || "Jugador";

    // 🔧 Convertir gameModeId a número para asegurar comparación correcta
    const gameModeIdNumber = parseInt(gameModeId);
    console.log("  - gameModeId convertido a número:", gameModeIdNumber);

    // Buscar el tipo de juego seleccionado en gameTypes
    const tipoJuegoSeleccionado = gameTypes.find((game) => {
      console.log(
        "    Comparando:",
        game.id_modojuego,
        "(tipo:",
        typeof game.id_modojuego,
        ") con",
        gameModeIdNumber
      );
      // Comparar tanto como número como string para mayor compatibilidad
      return (
        game.id_modojuego === gameModeIdNumber ||
        game.id_modojuego === gameModeId ||
        String(game.id_modojuego) === String(gameModeId)
      );
    });

    console.log("  - tipoJuegoSeleccionado encontrado:", tipoJuegoSeleccionado);

    if (tipoJuegoSeleccionado && tipoJuegoSeleccionado.mod_nombre) {
      // ✅ MANTENER ESPACIOS: No limpiar espacios del modo y nombre del usuario
      const nombreGenerado = `${tipoJuegoSeleccionado.mod_nombre} ${nombreUsuarioFinal}`;
      setNombre(nombreGenerado);
      console.log(
        "🎯 Nombre de jugada generado automáticamente:",
        nombreGenerado
      );
      console.log("📋 Basado en:", {
        modo: tipoJuegoSeleccionado.mod_nombre,
        usuario: nombreUsuarioFinal,
      });

      // Limpiar errores del nombre si los hay
      handleValidation("nombre", nombreGenerado);
    } else {
      console.log("⚠️ No se encontró el tipo de juego con ID:", gameModeId);
      console.log(
        "⚠️ IDs disponibles en gameTypes:",
        gameTypes.map((g) => `${g.id_modojuego} (${typeof g.id_modojuego})`)
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getDatos();
    }, [])
  );

  const fetchVideos = async () => {
    try {
      // Obtener estado y país desde AsyncStorage
      const estado = await AsyncStorage.getItem("estado_usuario");
      const pais = await AsyncStorage.getItem("pais_usuario");

      const res = await APIManager({
        url: `Club/Club/mostrar_videos?estado=${estado}&pais=${pais}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Videos obtenidos:", res);

      if (!Array.isArray(res)) {
        throw new Error("La respuesta de la API no es un array válido");
      }

      const orderedVideos = res.sort(
        (a, b) => parseInt(a.orden) - parseInt(b.orden)
      );
      setVideos(orderedVideos);

      if (orderedVideos.length > 0) {
        getLastPlayedIndex(orderedVideos.length);
      } else {
        console.log(
          "No se encontraron videos para esta ubicación, se procede a generar jugada."
        );
        // Aquí puedes ejecutar la lógica para "generar jugada"
      }
    } catch (error) {
      console.log("Error al obtener los videos:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar los videos. Verifique su conexión a internet."
      );
    }
  };

  const esReta = gameTypes
    .find((game) => game.id_modojuego === selectedGameModeId)
    ?.mod_nombre?.toLowerCase()
    .includes("reta");

  const videoSource =
    videos.length > 0 && currentIndex !== null
      ? { uri: `https://arosports.app/arosports/${videos[currentIndex].video}` }
      : null;

  const getLastPlayedIndex = async (totalVideos) => {
    try {
      const lastIndex = await AsyncStorage.getItem("lastVideoIndex");
      let nextIndex =
        lastIndex !== null ? (parseInt(lastIndex) + 1) % totalVideos : 0;

      console.log("Índice del siguiente video:", nextIndex);

      setCurrentIndex(nextIndex);
      await AsyncStorage.setItem("lastVideoIndex", nextIndex.toString());
    } catch (error) {
      console.log("Error al recuperar el último índice:", error);
    }
  };

  // Función para validar y actualizar errores en tiempo real
  const handleValidation = (field, value) => {
    let newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);

    switch (field) {
      case "nombre":
        break;

      case "selectedDate":
        if (!value) {
          newErrors.selectedDate = "Debe seleccionar una fecha";
        } else {
          delete newErrors.selectedDate;
        }
        break;

      case "selectedTipo":
        if (!value) {
          newErrors.selectedTipo = "Debe seleccionar un tipo de juego";
        } else {
          delete newErrors.selectedTipo;
        }

        // Si tipo es 1, club es obligatorio
        if (Number(value) === 1 && !selectedClub) {
          newErrors.selectedClub = "Debe seleccionar un club";
        } else {
          delete newErrors.selectedClub;
        }

        // ❌ COMENTADO: Validación de horario ya no es necesaria
        /*
        // Validación de horario u hora
        if (selectedClub && !horario) {
          newErrors.horario = "Debe seleccionar un horario";
        } else {
          delete newErrors.horario;
          delete newErrors.hora;
        }
        */

        if (!selectedClub && !horario && (!hora || hora.trim() === "")) {
          newErrors.hora =
            "Debe ingresar una hora si no eligió un club con horario";
        } else {
          delete newErrors.hora;
        }

        break;

      case "selectedClub":
        if (!value) {
          delete newErrors.selectedClub;
          delete newErrors.ubicacion;
        }
        // ❌ COMENTADO: Validación de horario ya no es necesaria
        /*
        if (value && !horario) {
          newErrors.horario = "Debe seleccionar un horario";
        } else {
          delete newErrors.horario;
        }
        */

        // 🔴 Cuando se selecciona un club, eliminamos el error de 'hora'
        break;

      // ❌ COMENTADO: Case de horario ya no es necesario
      /*
      case "horario":
        if (selectedClub && !value) {
          newErrors.horario = "Debe seleccionar un horario";
        } else {
          delete newErrors.horario;
          delete newErrors.hora;
        }
        break;
      */

      case "hora":
        if (!value || value.trim() === "") {
          delete newErrors.hora;
        }
        break;

      case "selectedGameModeId":
        if (!value) {
          newErrors.selectedGameModeId = "Debe seleccionar un modo de juego.";
        } else {
          delete newErrors.selectedGameModeId;
        }
        break;

      case "numCanchas":
        // 🆕 Obtener el tipo de juego seleccionado
        const tipoJuegoSeleccionadoCanchas = gameTypes.find(
          (game) => game.id_modojuego === selectedGameModeId
        );

        // 🎯 Para RETA: validar máximo 1 cancha
        if (
          tipoJuegoSeleccionadoCanchas &&
          tipoJuegoSeleccionadoCanchas.mod_nombre
            ?.toLowerCase()
            .includes("reta")
        ) {
          if (value > 1) {
            newErrors.numCanchas =
              "Para el tipo RETA solo se puede seleccionar 1 cancha";
          } else if (!value) {
            newErrors.numCanchas = "Debe indicar el número de canchas";
          } else {
            delete newErrors.numCanchas;
          }
        } else {
          // Para otros tipos de juego, validación normal
          if (!value) {
            newErrors.numCanchas = "Debe indicar el número de canchas";
          } else {
            delete newErrors.numCanchas;
          }
        }
        break;

      case "selectedCategoria":
        if (!value) {
          newErrors.selectedCategoria = "Debe seleccionar una categoría";
        } else {
          delete newErrors.selectedCategoria;
        }
        break;

      case "jugadoresSeleccionados":
        // 🆕 Obtener el tipo de juego seleccionado
        const tipoJuegoSeleccionado = gameTypes.find(
          (game) => game.id_modojuego === selectedGameModeId
        );

        // 🎯 Para RETA: validar máximo 3 jugadores
        if (
          tipoJuegoSeleccionado &&
          tipoJuegoSeleccionado.mod_nombre?.toLowerCase().includes("reta")
        ) {
          if (Array.isArray(value) && value.length > 3) {
            newErrors.jugadoresSeleccionados =
              "Para el tipo RETA no puede seleccionar más de 3 jugadores";
          } else {
            delete newErrors.jugadoresSeleccionados;
          }
        } else {
          // Para otros tipos de juego, jugadores es opcional
          delete newErrors.jugadoresSeleccionados;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Función para validar antes de enviar
  const validarFormulario = () => {
    const nuevosErrores = {};

    // 1. Validar nombre de jugada (siempre obligatorio)
    if (!nombre || nombre.trim() === "")
      nuevosErrores.nombre = "Debe ingresar un nombre para la jugada";
    // 2. Validar tipo de juego (siempre obligatorio)
    if (!selectedGameModeId)
      nuevosErrores.selectedGameModeId = "Debe seleccionar un modo de juego";

    // 3. Validar tipo de jugada pública/privada (siempre obligatorio)
    if (!selectedTipo) nuevosErrores.selectedTipo = "Campo obligatorio";

    // 4. Validar fecha (siempre obligatoria)
    if (!selectedDate) nuevosErrores.selectedDate = "Campo obligatorio";

    // 5. Validar hora (siempre obligatoria)
    if (!hora || hora.trim() === "") {
      nuevosErrores.hora = "Debe ingresar una hora para la jugada.";
    }

    // 6. Validar club/ubicación
    // Si no hay club ni ubicación válida, mostrar error
    if (
      (!id || id === "" || id === null) &&
      (!ubicacionJugada ||
        !ubicacionJugada.direccion_completa ||
        !ubicacionJugada.latitude ||
        !ubicacionJugada.longitude)
    ) {
      nuevosErrores.ubicacion =
        "Debe seleccionar un club o una ubicación válida";
    }

    // 7. Validar número de canchas con restricción para RETA
    const tipoJuegoSeleccionadoCanchas = gameTypes.find(
      (game) => game.id_modojuego === selectedGameModeId
    );

    if (!numCanchas || numCanchas < 1) {
      nuevosErrores.numCanchas = "Campo obligatorio";
    } else if (
      tipoJuegoSeleccionadoCanchas &&
      tipoJuegoSeleccionadoCanchas.mod_nombre?.toLowerCase().includes("reta")
    ) {
      // Para RETA: máximo 1 cancha
      if (numCanchas > 1) {
        nuevosErrores.numCanchas =
          "Para el tipo RETA solo se puede seleccionar 1 cancha.";
      }
    }

    // 8. Validar categoría (siempre obligatorio)
    if (!selectedCategoria)
      nuevosErrores.selectedCategoria = "Campo obligatorio";

    // 9. Validar jugadores: opcional excepto para RETA
    const tipoJuegoSeleccionado = gameTypes.find(
      (game) => game.id_modojuego === selectedGameModeId
    );

    if (
      tipoJuegoSeleccionado &&
      tipoJuegoSeleccionado.mod_nombre?.toLowerCase().includes("reta")
    ) {
      // Para RETA: máximo 3 jugadores
      if (
        Array.isArray(jugadoresSeleccionados) &&
        jugadoresSeleccionados.length > 3
      ) {
        nuevosErrores.jugadoresSeleccionados =
          "Para el tipo RETA no puede seleccionar más de 3 jugadores.";
      }
    }
    // Para otros tipos de juego, jugadores es opcional (no se valida)

    setErrors(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      const mensajesDeError = {
        nombre: "Debe ingresar un nombre para la jugada.",
        selectedGameModeId: "Debe seleccionar un modo de juego.",
        selectedDate: "Debe seleccionar una fecha.",
        hora: "Debe ingresar una hora para la jugada.",
        ubicacion: "Debe seleccionar un club o una ubicación válida.",
        numCanchas: "Para el tipo RETA solo se puede seleccionar 1 cancha.",
        selectedCategoria: "Debe seleccionar una categoría.",
        selectedTipo: "Debe seleccionar un tipo de juego.",
        jugadoresSeleccionados:
          "Para el tipo RETA no puede seleccionar más de 3 jugadores.",
      };

      const primerError = Object.keys(nuevosErrores)[0];
      console.log("No se puede crear el juego", mensajesDeError[primerError]);
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  // const handleCrearJuego = async () => {
  //     if (validarFormulario()) {
  //         if (subscription.exists) {
  //             crearJugada(); // Si tiene suscripción, juega directamente
  //         } else if (numberOfPlayedGames < 5) {
  //             setVideoEnded(false); // Reiniciar el estado del video
  //             setShowVideo(true);    // Mostrar el modal con el video
  //         } else {
  //             console.log("No puedes jugar más sin suscripción."); // O manejar un mensaje para el usuario
  //         }
  //     }
  // };

  const handleCrearJuego = async () => {
    if (!validarFormulario()) return;

    // 🆕 FLUJO SIMPLIFICADO: Ir directo a crear la jugada
    console.log("📌 clubId:", id);
    console.log("📌 reservaId:", selectedReservas);

    // 🚫 COMENTADO: Lógica de pago eliminada
    /*
    const requierePago =
      id !== null &&
      id !== undefined &&
      id !== "" &&
      (selectedReservas === null ||
        selectedReservas === undefined ||
        selectedReservas === "");

    console.log("🔍 ¿Requiere pago?", requierePago);

    if (requierePago) {
      const pagoExitoso = await handlePaymentValidation(); // ⬅️ devuelve true/false

      if (!pagoExitoso) {
        console.log("⛔ Pago fallido o cancelado. No se continúa.");
        return; // 🔒 Detener todo si no se pagó
      }

      // Si el pago fue exitoso, sigue flujo normal
      if (subscription.exists) {
        crearJugada();
      } else if (numberOfPlayedGames < 5) {
        setVideoEnded(false);
        setShowVideo(true);
      } else {
        Alert.alert(
          "Atención",
          "Has alcanzado el límite de jugadas gratuitas. Necesitas una suscripción."
        );
      }

      return;
    }

    // 🔁 Flujo normal sin pago
    if (subscription.exists) {
      crearJugada();
    } else if (numberOfPlayedGames < 5) {
      setVideoEnded(false);
      setShowVideo(true);
    } else {
      Alert.alert(
        "Atención",
        "Has alcanzado el límite de jugadas gratuitas. Necesitas una suscripción."
      );
    }
    */

    // 🎯 FLUJO DIRECTO: Crear jugada sin validaciones de pago o suscripción
    if (subscription.exists) {
      crearJugada(); // Si tiene suscripción, crear directamente
    } else if (numberOfPlayedGames < 5) {
      setVideoEnded(false); // Reiniciar el estado del video
      setShowVideo(true); // Mostrar el modal con el video
    } else {
      // Incluso si excede el límite, permitir crear la jugada
      crearJugada();
    }
  };

  // 🚫 COMENTADO: Validaciones de pago ya no son necesarias
  /*
  const isFormValid = () => {
    const errores = [];

    if (!canchasSeleccionadas || canchasSeleccionadas.length === 0) {
      errores.push("Debes seleccionar al menos una cancha.");
    }
    if (!selectedDate) {
      errores.push("Selecciona una fecha.");
    }
    if (!duracion) {
      errores.push("Selecciona una duración.");
    }
    if (!horario) {
      errores.push("Selecciona un horario.");
    }
    if (!horaFin) {
      errores.push("Falta la hora de finalización.");
    }
    if (!precio || precio <= 0) {
      errores.push("El precio debe ser mayor a 0.");
    }
    if (!stripeCustomer) {
      errores.push("No se pudo cargar el cliente de Stripe.");
    }

    if (errores.length > 0) {
      Alert.alert("Campos incompletos", errores[0]); // muestra solo el primer error
      return false;
    }

    return true;
  };
  */

  // 🚫 COMENTADO: Funciones de pago ya no son necesarias
  /*
  const handlePaymentValidation = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Atención",
        "Por favor, completa todos los campos antes de continuar."
      );
      return false;
    }

    try {
      const pagoExitoso = await handlePayment(precio, moneda); // ✅ ¡Verifica el resultado!
      return pagoExitoso;
    } catch (error) {
      console.log("❌ Error en handlePaymentValidation:", error.message);
      return false;
    }
  };
  */

  // 🚫 COMENTADO: Funciones de pago ya no son necesarias
  /*
  const handlePayment = async (precio, moneda) => {
    if (!paymentSheetEnabled) {
      alert(
        "La hoja de pago no está inicializada. Por favor, espera o intenta de nuevo."
      );
      return false; // ⬅️ Muy importante
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      console.log("❌ Pago cancelado o fallido:", error.message);
      return false; // ⬅️ No continuar
    }

    try {
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

      const newPaymentMethodId = confirmedData.paymentMethodId || null;
      if (newPaymentMethodId) {
        const methodSaved = await addPaymentMethod(newPaymentMethodId);
        if (!methodSaved) {
          console.log(
            "El método de pago no se guardó, pero el pago fue exitoso."
          );
        }
      }

      await handleCorreo(); // ✅ Correo tras pago
      return true; // ⬅️ Éxito
    } catch (error) {
      console.log("❌ Error al manejar el pago:", error.message);
      return false; // ⬅️ También marcar como fallo
    }
  };
  */

  // 🚫 COMENTADO: Funciones de correo y pago ya no son necesarias
  /*
  const handleCorreo = async () => {
    try {
      if (!paymentIntentId || !userEmail) {
        throw new Error("Faltan datos necesarios para enviar el correo.");
      }

      const formData = new FormData();
      formData.append("paymentIntentId", paymentIntentId);
      formData.append("email", userEmail);
      formData.append("club", selectedClub);
      formData.append(
        "descripcion",
        `Reservación de la canchas ${canchasSeleccionadas}`
      );
      formData.append("fecha", selectedDate);
      formData.append("tiempo", duracion);
      formData.append("hora_inicio", horario);
      formData.append("hora_fin", horaFin);

      console.log("FormData de correo:", formData);
      setLoading2(true);

      const response = await APIManager({
        url: `PaymentController/handle_payment_reserva`,
        method: "POST",
        data: formData,
      });

      setLoading2(false);

      if (response.resultado === true) {
        return true; // ✅ Éxito
      } else {
        Alert.alert("Error", "Hubo un problema al procesar el correo.");
        return false; // ❌ Falla
      }
    } catch (error) {
      setLoading2(false);
      Alert.alert(
        "Error",
        "Hubo un problema al enviar el correo. Intenta más tarde."
      );
      return false;
    }
  };
  */

  // 🚫 COMENTADO: Funciones de Stripe ya no son necesarias
  /*
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
  */

  // 🆕 Función para obtener los tipos de juego (modos de juego)
  const fetchGameTypes = async () => {
    try {
      setLoading(true);
      const response = await APIManager({
        url: "CrearJuego/CrearJuego/mostrar_jugadas",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("🎮 Tipos de juego obtenidos:", response);
      setGameTypes(response);
    } catch (error) {
      console.log("Error al obtener los tipos de juego:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚫 COMENTADO: useEffect de Stripe ya no es necesario
  /*
  useEffect(() => {
    if (precio && moneda && stripeCustomer) {
      console.log("Inicializando hoja de pago con:", {
        precio,
        moneda,
        stripeCustomer,
      });
      initializePaymentSheet(precio, moneda);
    } else {
      console.log("Esperando datos para inicializar Stripe...", {
        precio,
        moneda,
        stripeCustomer,
      });
    }
  }, [precio, moneda, stripeCustomer]);
  */

  // 🚫 COMENTADO: initializePaymentSheet ya no es necesario
  /*
  const initializePaymentSheet = async (precio, moneda) => {
    try {
      const amountInCents = Math.round(Math.max(precio) * 100);
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
        merchantDisplayName: "ProRally",
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
  */

  // 🚫 COMENTADO: useEffect de deep linking de Stripe ya no es necesario
  /*
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
  */

  // Efecto para manejar la reproducción del video solo cuando el modal se muestra
  useEffect(() => {
    if (showVideo && playerRef.current) {
      playerRef.current.currentTime = 0; // Reiniciar el video al principio
      playerRef.current.play(); // Reproducir
    }
  }, [showVideo]); // Se ejecuta solo cuando `showVideo` cambia

  // Efecto para revisar cada cierto tiempo si el video ha terminado
  useEffect(() => {
    let interval;

    // Solo ejecuta el efecto si el modal está abierto
    if (showVideo) {
      interval = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.currentTime;
          const duration = playerRef.current.duration;

          // Detecta si el video terminó (considerando que el tiempo de duración puede no ser exacto)
          if (currentTime >= duration - 1) {
            setVideoEnded(true); // Cambiar el estado cuando el video termine
          }
        }
      }, 500); // Revisar cada 500ms
    }

    // Limpiar el intervalo cuando el componente se desmonte o se cierre el modal
    return () => clearInterval(interval);
  }, [showVideo]); // Este efecto depende de `showVideo`

  // Efecto que se ejecuta cuando el video termina (videoEnded es true)
  useEffect(() => {
    if (videoEnded) {
      setShowVideo(false); // Cerrar el modal
      crearJugada(); // Crear la jugada después de que el video termine
    }
  }, [videoEnded]); // Se ejecuta cuando `videoEnded` cambia a true

  // Crear el reproductor de video
  const player = useVideoPlayer(videoSource, (player) => {
    console.log("Reproductor inicializado");
    player.loop = false;
    playerRef.current = player;
  });

  //termino de video

  const handleSeleccionarJugadores = (jugadores) => {
    console.log("Actualizando jugadores seleccionados:", jugadores);

    // 🆕 Validar límite para RETA
    const tipoJuegoSeleccionado = gameTypes.find(
      (game) => game.id_modojuego === selectedGameModeId
    );

    if (
      tipoJuegoSeleccionado &&
      tipoJuegoSeleccionado.mod_nombre?.toLowerCase().includes("reta")
    ) {
      if (jugadores.length > 3) {
        Alert.alert(
          "Límite de jugadores",
          "Para el tipo de juego reta no puede invitar más de 3 jugadores"
        );
        return; // No actualizar si excede el límite
      }
    }

    setJugadoresSeleccionados(jugadores);
    handleValidation("jugadoresSeleccionados", jugadores);
  };

  useEffect(() => {
    console.log("Jugadores en CrearJuego:", jugadoresSeleccionados);
  }, [jugadoresSeleccionados]);

  const abrirModal = () => setModalVisible(true);
  const cerrarModal = () => setModalVisible(false);

  // const fetchClubs = async () => {
  //     try {
  //         const res = await APIManager({
  //             url: 'Club/Club/mostrar_clubs',
  //             method: 'GET',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             },
  //         });
  //         setClubs(res);
  //     } catch (error) {
  //         console.log('Error al obtener los clubs:', error);
  //         Alert.alert("Error", "No se pudieron cargar los clubs. Verifique su conexión a internet.");
  //     }
  // };

  useEffect(() => {
    // fetchClubs();
    fetchVideos();
  }, []);
  useEffect(() => {
    fetchTipos();
  }, []);
  useEffect(() => {
    fetchGameTypes(); // 🆕 Cargar tipos de juego para automatizar nombres
  }, []);
  useEffect(() => {
    fetchReservas();
  }, []);

  // useEffect(() => {
  //   if (selectedDate) {
  //     obtenerClubsDisponibles();
  //   }
  // }, [selectedDate]);
  useFocusEffect(
    useCallback(() => {
      const fechaValida = selectedDate && selectedDate.trim() !== "";

      if (fechaValida) {
        // Limpiar selección previa
        setSelectedClub(null);
        setId(null);
        setIdCancha(null);
        setHorario(null);
        setHorariosClubSeleccionado([]);
        setSelectedReservas(null); // si aplica
        setDuracion(null);
        setBloquearContador(false);
        obtenerClubsDisponibles();
      }
    }, [selectedDate, hora])
  );

  useEffect(() => {
    if (selectedDate && selectedDate.trim() !== "") {
      setHora(null); // ✅ Limpia la hora cuando cambia la fecha
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedClub && !fieldsLocked) {
      setHorario(null);
      setHorarioSeleccionado(null);
      setHorarioTexto(null);
      setIdCancha(null);
    }
  }, [selectedClub]);

  const obtenerClubsDisponibles = async () => {
    try {
      setLoadingClubs(true);
      const clubsRes = await APIManager({
        url: `Club/Reservas/obtenerClubsConHorariosYIntervalos/${selectedDate}/`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const clubsDisponibles = [];
      // const horaSeleccionada = hora ? moment(hora, "HH:mm").format("HH:mm:ss") : null;

      //     for (const item of clubsRes) {
      //       const { club, intervalos, reservas, canchas } = item;

      //       const horariosDisponibles = calcularHorariosDisponibles({
      //         intervalos,
      //         reservas: reservas || [],
      //         canchas,
      //       });

      //       const horariosFiltrados = horaSeleccionada
      //         ? horariosDisponibles.filter(horario => horario.hora_inicio === horaSeleccionada)
      //         : horariosDisponibles;

      //       if (horariosFiltrados.length > 0) {
      //         clubsDisponibles.push({ club, horarios: horariosFiltrados });
      //       }
      //     }
      const esHoy = moment(selectedDate).isSame(moment(), "day");
      const ahoraMasUnaHora = moment().add(1, "hour").format("HH:mm:ss");
      const horaSeleccionada = hora
        ? moment(hora, "HH:mm").format("HH:mm:ss")
        : null;

      for (const item of clubsRes) {
        const { club, intervalos, reservas, canchas } = item;

        const horariosDisponibles = calcularHorariosDisponibles({
          intervalos,
          reservas: reservas || [],
          canchas,
        });

        let horariosFiltrados = [];

        if (horaSeleccionada) {
          // Filtrar por hora exacta si fue seleccionada
          horariosFiltrados = horariosDisponibles.filter(
            (horario) => horario.hora_inicio === horaSeleccionada
          );
        } else if (esHoy) {
          // Filtrar si es hoy y no hay hora seleccionada
          horariosFiltrados = horariosDisponibles.filter(
            (horario) => horario.hora_inicio >= ahoraMasUnaHora
          );
        } else {
          // Si no es hoy, mostrar todos los horarios disponibles
          horariosFiltrados = horariosDisponibles;
        }

        if (horariosFiltrados.length > 0) {
          clubsDisponibles.push({ club, horarios: horariosFiltrados });
        }
      }

      setClubsFiltrados(clubsDisponibles);
      setMensajeNoDisponible(
        clubsDisponibles.length === 0
          ? "No hay clubes disponibles con la información seleccionada."
          : ""
      );
    } catch (error) {
      console.log("❗ Error al obtener clubs disponibles:", error);
    } finally {
      setLoadingClubs(false);
    }
  };

  // Función para calcular los horarios disponibles
  const calcularHorariosDisponibles = ({ intervalos, reservas, canchas }) => {
    const horariosDisponibles = [];

    // Iterar sobre los intervalos de las canchas
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
        const end = moment(horario_fin, "HH:mm:ss");
        const duracion = moment.duration(intervalo);

        let horaActual = moment(start);

        // Iterar y crear los horarios disponibles
        while (horaActual.clone().add(duracion).isSameOrBefore(end)) {
          const inicio = horaActual.format("HH:mm:ss");
          const fin = horaActual.clone().add(duracion).format("HH:mm:ss");

          // Comprobar si ya existe una reserva en ese intervalo
          const hayReserva = reservas.some((r) => {
            if (r.id_cancha !== id_canchas) return false;

            const inicioReserva = moment(r.hora_inicio, "HH:mm:ss");
            const finReserva = moment(r.hora_fin, "HH:mm:ss");

            // Verificar si el horario se solapa con una reserva existente
            return (
              horaActual.isBefore(finReserva) &&
              horaActual.clone().add(duracion).isAfter(inicioReserva)
            );
          });

          // Si no hay reserva, agregar el horario disponible
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
          }

          // Avanzar a la siguiente hora con el intervalo
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

  const handleReserva = () => {
    if (selectedReservas) {
      const reservaSeleccionada = reservas.find(
        (r) => r.id_reserva === selectedReservas
      );
      if (reservaSeleccionada) {
        const clubDisponible = clubs.find(
          (c) =>
            c.club?.id_fraccionamientoclub ===
            reservaSeleccionada.id_fraccionamientoclub
        );

        const clubSeleccionado = clubDisponible
          ? clubDisponible.club
          : {
              id_fraccionamientoclub:
                reservaSeleccionada.id_fraccionamientoclub,
              fc_nombre: reservaSeleccionada.fc_nombre,
            };

        setSelectedClub(clubSeleccionado.fc_nombre);
        setId(clubSeleccionado.id_fraccionamientoclub);
        setIdCancha(reservaSeleccionada.id_cancha);
        setSelectedDate(reservaSeleccionada.fecha);

        const horaInicio = reservaSeleccionada.hora_inicio.slice(0, 5);
        const horaFin = reservaSeleccionada.hora_fin.slice(0, 5);
        const [horas, minutos] = reservaSeleccionada.duracion
          .split(":")
          .map(Number);
        let duracionTexto = "";
        if (horas > 0) duracionTexto += `${horas}h`;
        if (minutos > 0)
          duracionTexto += `${horas > 0 ? " " : ""}${minutos}min`;
        const horarioFormateado = `${horaInicio} - ${horaFin} (${duracionTexto})`;

        setHorario(`${horaInicio} - ${horaFin} (${duracionTexto})`);
        setHorarioTexto(horarioFormateado);
        setDuracion(reservaSeleccionada.duracion);
        setNumCanchas(parseInt(reservaSeleccionada.num_canchas));
        setFieldsLocked(true);
      }
    }
  };

  // Ejecuta solo cuando `selectedReservas` cambia
  useEffect(() => {
    if (selectedReservas) {
      handleReserva();
    } else {
      // ⚠️ Solo establecer fecha actual si NO hay una ya seleccionada
      if (!selectedDate) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const todayFormatted = `${yyyy}-${mm}-${dd}`;
        setSelectedDate(todayFormatted);
      }

      setSelectedClub("");
      setId("");
      setIdCancha("");
      setHorario("");
      setDuracion("");
      setNumCanchas(1);
      setFieldsLocked(false);
    }
  }, [selectedReservas, reservas]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await APIManager({
        url: "CrearJuego/CrearJuego/mostrar_categorias",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCategorias(response);
    } catch (error) {
      console.log("Error al obtener las categorías:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar las categorías. Verifique su conexión a internet."
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchReservas = async () => {
    try {
      setLoading(true);
      const response = await APIManager({
        url: `CrearJuego/CrearJuego/mostrar_Reservas/${id_usuario}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const now = new Date();

      const reservasValidas = response.filter((reserva) => {
        const [year, month, day] = reserva.fecha.split("-").map(Number);
        const [horaFinH, horaFinM] = reserva.hora_fin.split(":").map(Number);

        const fechaFin = new Date(year, month - 1, day, horaFinH, horaFinM);
        return fechaFin > now; // ✅ Solo muestra las que no han terminado
      });

      setReservas(reservasValidas);
    } catch (error) {
      console.log("Error al obtener las reservas:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar las reservas. Verifique su conexión a internet."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
    try {
      setLoading(true);
      const response = await APIManager({
        url: "CrearJuego/CrearJuego/mostrar_Tipos",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("tipos de jugada", response);
      setTipos(response);
    } catch (error) {
      console.log("Error al obtener los tipos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleCategoriaChange = (categoria) => {
    setSelectedCategoria(categoria.id_categoria);
    handleValidation("selectedCategoria", categoria.id_categoria);
    console.log("ID:", categoria.id_categoria);
    console.log("Nombre:", categoria.categoria);
  };
  const limpiarCampos = () => {
    setId(null);
    setIdCancha(null);
    setNombre("");
    setHorario("");
    setHora("");
    setDuracion("02:00");
    setSelectedDate("");
    setNumCanchas(1);
    setSelectedCategoria(null);
    setSelectedClub(null);
    setSelectedReservas(null);
    // ❌ ELIMINADO: setSelectedTipo(null) - selectedTipo es una variable calculada, no un estado
    setSelectedGameModeId(null);
    setJugadoresSeleccionados([]);
    setUbicacionJugada(null);
    setFieldsLocked(false);
    setErrors({});
  };

  const normalizarTexto = (texto) => {
    if (!texto) return "";

    // Eliminar acentos
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Función para obtener componentes detallados de una dirección usando Google Maps API
  const obtenerComponentesDireccion = async (latitud, longitud) => {
    try {
      // Usar la API Key real en tu proyecto
      const googleApiKey = "AIzaSyCI78o_JODtkwvB7ydLkvU-GCHwdOT8qv8"; // Ya tienes la clave correcta

      console.log(
        `🔍 Obteniendo componentes de dirección para: ${latitud}, ${longitud}`
      );

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitud},${longitud}&key=${googleApiKey}&language=es`
      );

      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        console.log("❌ Error en respuesta de Google Maps:", data.status);
        return null;
      }

      // Extraer componentes de la dirección desde la respuesta
      const result = data.results[0];
      console.log("📍 Dirección completa:", result.formatted_address);

      const direccionComponentes = {
        calle: "",
        num_ext: "",
        num_int: "",
        colonia: "",
        cp: "",
        estado: "",
        pais: "",
        direccion_completa: result.formatted_address,
      };

      // Mapear componentes de dirección
      if (result.address_components && result.address_components.length > 0) {
        result.address_components.forEach((component) => {
          const types = component.types;

          if (types.includes("route")) {
            direccionComponentes.calle = component.long_name;
          } else if (types.includes("street_number")) {
            direccionComponentes.num_ext = component.long_name;
          } else if (types.includes("subpremise")) {
            direccionComponentes.num_int = component.long_name;
          } else if (
            types.includes("sublocality_level_1") ||
            types.includes("neighborhood") ||
            types.includes("sublocality")
          ) {
            direccionComponentes.colonia = component.long_name;
          } else if (types.includes("postal_code")) {
            direccionComponentes.cp = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            // Normalizar estado: convertir a minúsculas y quitar acentos
            direccionComponentes.estado = normalizarTexto(component.long_name);
          } else if (types.includes("country")) {
            // Normalizar país: convertir a minúsculas y quitar acentos
            direccionComponentes.pais = normalizarTexto(component.long_name);
          } else if (
            types.includes("locality") &&
            !direccionComponentes.colonia
          ) {
            direccionComponentes.colonia = component.long_name;
          }
        });
      }

      console.log("📑 Componentes extraídos:", direccionComponentes);
      return direccionComponentes;
    } catch (error) {
      console.log("❌ Error al obtener componentes de dirección:", error);
      return null;
    }
  };

  const crearJugada = async () => {
    setLoading2(true);
    try {
      // Obtener id_jugador del usuario actual
      let id_jugador_actual = null;
      try {
        const respuesta = await APIManager({
          url: `/CrearJuego/CrearJuego/obtenerJugadorPorUsuario/${id_usuario}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (respuesta && respuesta.id_jugador) {
          id_jugador_actual = respuesta.id_jugador;
        }
      } catch (error) {
        console.log("Error al obtener el jugador del usuario:", error);
        Alert.alert("Error", "No se pudo determinar su perfil de jugador.");
        setLoading2(false);
        return;
      }

      if (!id_jugador_actual) {
        Alert.alert("Error", "No tiene un perfil de jugador asociado.");
        setLoading2(false);
        return;
      }

      const data = new FormData();

      // Datos básicos obligatorios
      data.append("nombre", nombre);

      // 🎯 MANEJAR DATOS SEGÚN SI HAY RESERVA O NO
      if (reservaSeleccionada) {
        // ✅ USAR DATOS DE LA RESERVA
        data.append(
          "id_club",
          reservaSeleccionada.id_fraccionamientoclub || ""
        );
        data.append("id_canchas", reservaSeleccionada.id_cancha || "");
        data.append("fecha", reservaSeleccionada.fecha);
        data.append("hora", reservaSeleccionada.hora_inicio);
        data.append("tiempo", reservaSeleccionada.duracion);
        data.append("num_canchas", "1"); // Las reservas son siempre 1 cancha
        data.append("id_reserva", reservaSeleccionada.id_reserva);
      } else {
        // ✅ USAR DATOS INGRESADOS MANUALMENTE
        data.append("id_club", id || "");

        if (canchasSeleccionadas.length > 0) {
          const idsCanchas = canchasSeleccionadas.map((cancha) => cancha.id);
          data.append("id_canchas", idsCanchas.join(","));
        } else {
          data.append("id_canchas", idCancha || "");
        }

        data.append("fecha", selectedDate);

        if (horario && horario.trim() !== "") {
          data.append("hora", horario);
          data.append("tiempo", duracion);
        } else {
          data.append("hora", hora);
          data.append("tiempo", "02:00:00");
        }

        data.append("num_canchas", numCanchas.toString());
      }

      // Datos comunes para ambos casos
      data.append("id_categoria", selectedCategoria);
      data.append("id_usuario", id_usuario);
      data.append("id_modojuego", selectedGameModeId);
      data.append("moneda", moneda || "");
      data.append("precio", precio || "0");
      data.append("hora_fin", horaFin || "");

      if (selectedTipo) {
        data.append("id_tipo", selectedTipo);
      }

      // Jugadores
      let listaJugadores = [...jugadoresSeleccionados];
      const creadorYaIncluido = listaJugadores.some(
        (jugador) => jugador.id_jugador === id_jugador_actual
      );

      if (!creadorYaIncluido) {
        listaJugadores.push({ id_jugador: id_jugador_actual });
      }

      // 🆕 Validar jugadores solo para RETA
      const tipoJuegoSeleccionado = gameTypes.find(
        (game) => game.id_modojuego === selectedGameModeId
      );

      if (
        tipoJuegoSeleccionado &&
        tipoJuegoSeleccionado.mod_nombre?.toLowerCase().includes("reta")
      ) {
        if (listaJugadores.length > 4) {
          // Máximo 4 incluyendo al creador
          Alert.alert(
            "Error",
            "Para RETA no puede haber más de 3 jugadores invitados (4 total incluyendo creador)."
          );
          setLoading2(false);
          return;
        }
      }

      if (listaJugadores.length > 0) {
        listaJugadores.forEach((jugador, index) => {
          data.append(`jugadores[${index}]`, jugador.id_jugador);
        });
      }
      if (!id && ubicacionJugada) {
        // Agregar coordenadas básicas
        data.append("latitud", ubicacionJugada.latitude || "");
        data.append("longitud", ubicacionJugada.longitude || "");
        data.append("descripcion", ubicacionJugada.direccion_completa || "");

        try {
          // Obtener componentes detallados usando la API de Google
          console.log(
            "🔍 Obteniendo componentes de dirección para la jugada..."
          );
          const componentesDireccion = await obtenerComponentesDireccion(
            ubicacionJugada.latitude,
            ubicacionJugada.longitude
          );

          if (componentesDireccion) {
            // Usar componentes obtenidos de la API de Google
            console.log("✅ Componentes de dirección obtenidos correctamente");
            data.append("calle", componentesDireccion.calle || "");
            data.append("num_ext", componentesDireccion.num_ext || "");
            data.append("num_int", componentesDireccion.num_int || "");
            data.append("colonia", componentesDireccion.colonia || "");
            data.append("cp", componentesDireccion.cp || "");
            data.append("estado", componentesDireccion.estado || "");
            data.append("pais", componentesDireccion.pais || "");

            // Si obtenemos una dirección formateada mejor, actualizar la descripción
            if (componentesDireccion.direccion_completa) {
              data.append(
                "descripcion",
                componentesDireccion.direccion_completa
              );
            }
          } else {
            // Si falló la geocodificación, usar el método simple (fallback)
            console.log(
              "⚠️ No se pudieron obtener componentes, usando método simple"
            );
            const direccionParts = ubicacionJugada.direccion_completa
              .split(",")
              .map((part) => part.trim());

            // Asignar componentes básicos
            data.append("calle", direccionParts[0] || "");

            if (direccionParts.length > 1) {
              data.append("colonia", direccionParts[1] || "");
            } else {
              data.append("colonia", "");
            }

            if (direccionParts.length > 2) {
              data.append("estado", direccionParts[2] || "");
            } else {
              data.append("estado", "");
            }

            if (direccionParts.length > 3) {
              data.append(
                "pais",
                direccionParts[direccionParts.length - 1] || ""
              );
            } else {
              data.append("pais", "");
            }

            // Campos adicionales
            data.append("num_ext", "");
            data.append("num_int", "");
            data.append("cp", "");
          }
        } catch (error) {
          console.log("❌ Error al procesar dirección:", error);

          // En caso de error, usar el método simple
          const direccionParts = ubicacionJugada.direccion_completa
            .split(",")
            .map((part) => part.trim());
          data.append("calle", direccionParts[0] || "");
          data.append("colonia", direccionParts[1] || "");
          data.append("estado", direccionParts[2] || "");
          data.append("pais", direccionParts[direccionParts.length - 1] || "");
          data.append("num_ext", "");
          data.append("num_int", "");
          data.append("cp", "");
        }
      }

      // 🆕 Ya no es obligatorio tener jugadores para todos los tipos

      console.log("📤 DATOS ENVIADOS:", data);

      const res = await APIManager({
        url: "CrearJuego/CrearJuego/crearJuego",
        method: "POST",
        data: data,
      });

      console.log("📥 RESPUESTA API RECIBIDA:");
      console.log("--------------------------------------------------");
      console.log("📊 STATUS:", res.success ? "ÉXITO ✅" : "ERROR ❌");
      console.log("📝 MENSAJE:", res.message || "Sin mensaje");
      console.log("🔄 CÓDIGO:", res.codigo || "N/A");
      console.log("📋 DATOS COMPLETOS:", JSON.stringify(res, null, 2));
      console.log("--------------------------------------------------");

      // También puedes agregar un mejor log para los datos enviados:
      console.log("📤 DATOS ENVIADOS A LA API:");
      console.log("--------------------------------------------------");
      // Convertir el FormData a un objeto legible para debug
      const dataObject = {};
      data._parts.forEach(([key, value]) => {
        dataObject[key] = value;
      });
      console.log(JSON.stringify(dataObject, null, 2));
      console.log("--------------------------------------------------");

      if (res && res.success) {
        Alert.alert("Éxito", res.message, [
          {
            text: "Aceptar",
            onPress: () => {
              limpiarCampos();
              navigation.navigate("MisJuegos", { selectedItem: "pendientes" });
            },
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          res.message || "Error al crear el juego. Intente de nuevo."
        );
      }
      setLoading2(false);
    } catch (error) {
      console.log("Error en la solicitud de crear juego:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al intentar crear el juego. Verifique su conexión e intente de nuevo."
      );
      setLoading2(false);
    }
  };
  const handleReservaSeleccionada = (reserva) => {
    if (reserva) {
      setSelectedReservas(reserva.id_reserva);
      setReservaSeleccionada(reserva);
      setFieldsLocked(true);
    } else {
      // Deseleccionar reserva
      setSelectedReservas(null); // <--- Esto activa el useEffect en el bloque else
      setReservaSeleccionada(null);
      setFieldsLocked(false);
    }
  };
  const handleHorarioSeleccionada = (horario) => {
    if (horario) {
      setSelectedClub(horario.id_fraccionamientoclub);
      setFieldsLocked(true);
    } else {
      // Deseleccionar reserva
      setSelectedClub(null); // <--- Esto activa el useEffect en el bloque else
      setFieldsLocked(false);
    }
  };

  return (
    <View style={styles.container}>
      {showVideo && (
        <Modal visible={showVideo} animationType="fade" transparent={true}>
          <View style={styles.videoContainer}>
            {videos.length > 0 && (
              <VideoView
                source={videoSource}
                style={styles.fullscreenVideo}
                player={player}
                resizeMode="cover"
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
                onEnd={() => setVideoEnded(true)}
              />
            )}
          </View>
        </Modal>
      )}

      {/* Modal de carga */}
      <Modal transparent={true} animationType="fade" visible={loading2}>
        <View style={styles.modalContainer2}>
          <View style={styles.modalContent2}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Creando jugada...</Text>
          </View>
        </View>
      </Modal>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={-60}
        keyboardOpeningTime={0}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            {/* 1. Jugadas creadas - SIEMPRE VISIBLE */}
            {visibleComponents.jugadasCreadas && (
              <View style={styles.jugadasContainer}>
                <Text style={styles.jugadasText}>
                  {`Jugadas creadas: ${numberOfPlayedGames}`}
                </Text>
              </View>
            )}

            {/* 2. Tipo de juego (Game Mode) - REORDENADO */}
            {visibleComponents.gameMode && (
              <>
                <GameFilter
                  selectedGameModeId={selectedGameModeId}
                  setSelectedGameModeId={(value) => {
                    handleGameModeSelect(value);
                    handleValidation("selectedGameModeId", value);
                  }}
                />
                {errors.selectedGameModeId && (
                  <Text style={styles.errorText}>
                    {errors.selectedGameModeId} *
                  </Text>
                )}
              </>
            )}
            {/* 3. Nombre de jugada - SIEMPRE VISIBLE */}
            {visibleComponents.nombreJugada && (
              <>
                <MostrarDatos
                  iconName="person-outline"
                  placeholder="Nombra a tu jugada *"
                  onChangeText={(value) => {
                    setNombre(value);
                    handleValidation("nombre", value);
                  }}
                  autoCapitalize="words"
                  value={nombre}
                />
                {errors.nombre && (
                  <Text style={styles.errorText}>{errors.nombre} *</Text>
                )}
              </>
            )}


            {/* 4. Fecha */}
            {visibleComponents.fecha && (
              <>
                <VerCalendario
                  placeholder="Selecciona una fecha"
                  selectedValue={selectedDate}
                  onValueChange={(value) => {
                    setSelectedDate(value);
                    handleValidation("selectedDate", value);
                  }}
                  disabled={fieldsLocked}
                />
                {errors.selectedDate && (
                  <Text style={styles.errorText}>{errors.selectedDate} *</Text>
                )}
              </>
            )}

            {/* 5. Hora */}
            {visibleComponents.hora && !selectedReservas && (
              <>
                <TimeSelector
                  value={hora}
                  placeholder="Seleccione una hora *"
                  onChange={(value) => {
                    setHora(value);
                    handleValidation("hora", value);
                  }}
                  selectedDate={selectedDate}
                />
                {errors.hora && (
                  <Text style={styles.errorText}>{errors.hora} *</Text>
                )}
              </>
            )}

            {/* 6. Club */}
            {visibleComponents.club && (
              <>
                <CategoriasClub
                  iconName="business-outline"
                  loadingClubs={loadingClubs}
                  placeholder={
                    selectedTipo === 1
                      ? "Seleccione un club *"
                      : "Seleccione un club"
                  }
                  options={
                    loadingClubs
                      ? ["Cargando..."]
                      : clubs.length === 0
                      ? ["No hay clubs disponibles"]
                      : clubs.map((item) => item.club.fc_nombre)
                  }
                  selectedValue={
                    selectedClub ||
                    (selectedTipo === 1
                      ? "Seleccione un club *"
                      : "Seleccione un club")
                  }
                  onValueChange={(value) => {
                    const textoPlaceholder =
                      selectedTipo === 1
                        ? "Seleccione un club *"
                        : "Seleccione un club";

                    if (!fieldsLocked) {
                      if (value === selectedClub) {
                        // Deselecciona el club si se da tap sobre el mismo
                        setSelectedClub(null);
                        setId(null);
                        setIdCancha(null);
                        setHorario(null);
                        setBloquearContador(false);
                        handleValidation("selectedClub", null);
                      } else if (value === textoPlaceholder) {
                        setSelectedClub(null);
                        setId(null);
                        setIdCancha(null);
                        setHorario(null);
                        setBloquearContador(false);
                        handleValidation("selectedClub", null);
                      } else if (
                        value !== "Cargando..." &&
                        value !== "No hay clubs disponibles"
                      ) {
                        const selectedItem = clubs.find(
                          (item) => item.club.fc_nombre === value
                        );
                        if (selectedItem) {
                          const { club, canchas, horarios } = selectedItem;
                          setSelectedClub(club.fc_nombre);
                          setId(club.id_fraccionamientoclub);
                          setHorariosClubSeleccionado(horarios);
                          setIdCancha(canchas?.[0]?.id_canchas || null);
                          setHorario(null);
                          handleValidation("selectedClub", club.fc_nombre);

                          // Limpiar ubicación al seleccionar un club
                          setUbicacionJugada(null);
                        }
                      }
                    } else {
                      Alert.alert(
                        "Campo bloqueado",
                        "Este campo se completó desde una reserva y no puede modificarse."
                      );
                    }
                  }}
                  disabled={fieldsLocked}
                />
                {selectedTipo === 1 && errors.selectedClub && (
                  <Text style={styles.errorText}>{errors.selectedClub} *</Text>
                )}
              </>
            )}

            {/* 7. Ubicación - REORDENADO */}
            {visibleComponents.ubicacion && !selectedClub && (
              <>
                <SeleccionarMostrarDato
                  iconName="location-outline"
                  placeholder={
                    ubicacionJugada
                      ? `${ubicacionJugada.direccion_completa}`
                      : "Seleccionar ubicación (opcional)"
                  }
                  onPress={() => setModalUbicacionVisible(true)}
                />
              </>
            )}
            {/* 8. Contador canchas - REORDENADO */}
            {visibleComponents.canchas && (
              <>
                <Contador
                  count={numCanchas}
                  increment={() => {
                    if (!fieldsLocked && !bloquearContador && !esReta) {
                      // 🆕 Para RETA ya no necesitamos validar límite aquí porque está deshabilitado
                      setNumCanchas((prev) => Math.min(prev + 1, 10));
                      handleValidation("numCanchas", numCanchas + 1);
                    } else if (esReta) {
                      // ✅ Mensaje específico para RETA
                      Alert.alert(
                        "RETA - 1 cancha fija",
                        "Para el tipo de juego RETA solo se puede usar 1 cancha."
                      );
                    } else {
                      Alert.alert(
                        "Campo bloqueado",
                        "Este campo se completó desde una reserva y no puede modificarse."
                      );
                    }
                  }}
                  decrement={() => {
                    if (!fieldsLocked && !bloquearContador && !esReta) {
                      setNumCanchas((prev) => Math.max(prev - 1, 1));
                      handleValidation(
                        "numCanchas",
                        Math.max(numCanchas - 1, 1)
                      );
                    } else if (esReta) {
                      // ✅ Mensaje específico para RETA
                      Alert.alert(
                        "RETA - 1 cancha fija",
                        "Para el tipo de juego RETA solo se puede usar 1 cancha."
                      );
                    } else {
                      Alert.alert(
                        "Campo bloqueado",
                        "Este campo se completó desde una reserva y no puede modificarse."
                      );
                    }
                  }}
                  disabled={fieldsLocked || bloquearContador || esReta}
                />
                {errors.numCanchas && (
                  <Text style={styles.errorText}>{errors.numCanchas} *</Text>
                )}
              </>
            )}

            {/* 9. Categoría - REORDENADO */}
            {visibleComponents.categoria && (
              <>
                <Categorias
                  iconName="list"
                  placeholder="Seleccione una categoría *"
                  options={categorias.map((categoria) => categoria.categoria)}
                  selectedValue={
                    categorias.find(
                      (cat) => cat.id_categoria === selectedCategoria
                    )?.categoria || ""
                  }
                  onValueChange={(selectedValue) => {
                    const selected = categorias.find(
                      (cat) => cat.categoria === selectedValue
                    );
                    if (selected) {
                      setSelectedCategoria(selected.id_categoria);
                      handleValidation(
                        "selectedCategoria",
                        selected.id_categoria
                      );
                    }
                  }}
                />
                {errors.selectedCategoria && (
                  <Text style={styles.errorText}>
                    {errors.selectedCategoria} *
                  </Text>
                )}
              </>
            )}

            {/* 10. Jugadores - REORDENADO */}
            {visibleComponents.jugadores && (
              <>
                <SeleccionarMostrarDato
                  iconName="people-outline"
                  placeholder={(() => {
                    const tipoJuegoSeleccionado = gameTypes.find(
                      (game) => game.id_modojuego === selectedGameModeId
                    );
                    if (
                      tipoJuegoSeleccionado &&
                      tipoJuegoSeleccionado.mod_nombre
                        ?.toLowerCase()
                        .includes("reta")
                    ) {
                      return "Invitar jugadores (Opcional, máx. 3)";
                    }
                    return "Invitar jugadores (Opcional)";
                  })()}
                  onPress={abrirModal}
                />
                {errors.jugadoresSeleccionados && (
                  <Text style={styles.errorText}>
                    {errors.jugadoresSeleccionados} *
                  </Text>
                )}
                {jugadoresSeleccionados.length > 0 && (
                  <Text style={styles.infoText}>
                    {(() => {
                      const tipoJuegoSeleccionado = gameTypes.find(
                        (game) => game.id_modojuego === selectedGameModeId
                      );
                      if (
                        tipoJuegoSeleccionado &&
                        tipoJuegoSeleccionado.mod_nombre
                          ?.toLowerCase()
                          .includes("reta")
                      ) {
                        return `Jugadores seleccionados: ${jugadoresSeleccionados.length}/3 (máximo reta)`;
                      }
                      return `Jugadores seleccionados: ${jugadoresSeleccionados.length}`;
                    })()}
                  </Text>
                )}
              </>
            )}

            {/* Componente de reserva - Mantener pero oculto por defecto */}
            {visibleComponents.seleccionarReserva && (
              <CategoriasClub
                iconName="calendar-number-outline"
                placeholder="Seleccione una reserva"
                renderValue={
                  reservaSeleccionada && (
                    <View style={{ flexDirection: "column", width: "100%" }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 16,
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#838080",
                            fontSize: 16,
                            justifyContent: "center",
                          }}
                        >
                          {reservaSeleccionada.fc_nombre}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "column", marginLeft: 0 }}>
                        {/* Fecha */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color={colors.primary}
                            style={{ marginRight: 8, width: 32 }} // 🎯 ANCHO FIJO
                          />
                          <Text
                            style={{
                              marginRight: 8,
                              fontSize: 14,
                              color: "#838080",
                              fontWeight: "bold",
                              width: 80,
                            }}
                          >
                            Fecha:
                          </Text>
                          <Text style={{ fontSize: 14, color: "#838080" }}>
                            {reservaSeleccionada.fecha}
                          </Text>
                        </View>

                        {/* Cancha */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <Ionicons
                            name="location-outline"
                            size={24}
                            color={colors.primary}
                            style={{ marginRight: 8, width: 32 }} // 🎯 ANCHO FIJO
                          />
                          <Text
                            style={{
                              marginRight: 8,
                              fontSize: 14,
                              color: "#838080",
                              fontWeight: "bold",
                              width: 80,
                            }}
                          >
                            Cancha:
                          </Text>
                          <Text style={{ fontSize: 14, color: "#838080" }}>
                            {reservaSeleccionada.can_nombre}
                          </Text>
                        </View>

                        {/* Horario */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={24}
                            color={colors.primary}
                            style={{ marginRight: 8, width: 32 }} // 🎯 ANCHO FIJO
                          />
                          <Text
                            style={{
                              marginRight: 8,
                              fontSize: 14,
                              color: "#838080",
                              fontWeight: "bold",
                              width: 80,
                            }}
                          >
                            Horario:
                          </Text>
                          <Text style={{ fontSize: 14, color: "#838080" }}>
                            {reservaSeleccionada.hora_inicio.slice(0, 5)} -{" "}
                            {reservaSeleccionada.hora_fin.slice(0, 5)}
                          </Text>
                        </View>

                        {/* Duración */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Ionicons
                            name="timer-outline"
                            size={24}
                            color={colors.primary}
                            style={{ marginRight: 8, width: 32 }} // 🎯 ANCHO FIJO
                          />
                          <Text
                            style={{
                              marginRight: 8,
                              fontSize: 14,
                              color: "#838080",
                              fontWeight: "bold",
                              width: 80,
                            }}
                          >
                            Duración:
                          </Text>
                          <Text style={{ fontSize: 14, color: "#838080" }}>
                            {reservaSeleccionada.duracion}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
                }
                selectedValue={
                  reservaSeleccionada ? "" : "Seleccione una reserva"
                }
                onPress={handleOpenReservas}
              />
            )}

            {/* 
              Horario component - Ya no se usa en ningún flujo 
              {visibleComponents.horario && selectedClub && (
                // Todo el componente de horarios está comentado
              )}
            */}
          </View>
          <View style={styles.guardar}>
            <CustomButton buttonText="Crear" onPress={handleCrearJuego} />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <AgregarJugadores
        visible={modalVisible}
        closeModal={cerrarModal}
        onJugadoresSeleccionados={handleSeleccionarJugadores}
        esReta={esReta}
        esOpcional={!esReta}
      />
      <TablaReservas
        visible={modalVisible2}
        closeModal={handleCloseReservas}
        reservas={reservas}
        loading={loading}
        onSelect={handleReservaSeleccionada}
        selectedReserva={reservaSeleccionada}
      />

      {/* 🆕 Modal de ubicación */}
      <UbicacionPerfil
        visible={modalUbicacionVisible}
        closeModal={() => setModalUbicacionVisible(false)}
        ubicacionUsuario={ubicacionJugada}
        onUbicacionCambiada={setUbicacionJugada}
        modo="jugada"
        titulo="UBICACIÓN DE LA JUGADA"
        guardarEnBD={false}
        placeholder="Buscar dirección o arrastra el marcador..."
      />

      {/* <TablaHorariosModal
        visible={modalVisible3}
        closeModal={handleCloseHorarios}
        horarios={horariosClubSeleccionado} // Lista de horarios generados
        selectedDate={selectedDate}
        selectedHorario={horarioSeleccionado} // 🟢 solo 1 horario (objeto)
        selectedCanchas={canchasSeleccionadas} // 🟢 array de canchas { id, nombre }
        loading={loading}
        onSelect={(seleccion) => {
          if (!seleccion) {
            setHorarioTexto(null);
            setHorarioSeleccionado(null);
            setCanchasSeleccionadas([]);
            setNumCanchas(1);
            setIdCancha(null);
            setDuracion(null);
            setPrecio(null);
            setMoneda(null);
            setHoraFin(null);
            setBloquearContador(false);
            return;
          }

          const horario = seleccion.horario;
          const canchas = seleccion.canchas;

          console.log("🔍 HORARIO SELECCIONADO:", horario);
          console.log("🔍 CANCHAS SELECCIONADAS:", canchas);

          const horaInicio = horario.hora_inicio.slice(0, 5);
          const horaFin = horario.hora_fin.slice(0, 5);

          const [horas, minutos] = horario.duracion.split(":").map(Number);
          let duracionTexto = "";
          if (horas > 0) duracionTexto += `${horas}h`;
          if (minutos > 0)
            duracionTexto += `${horas > 0 ? " " : ""}${minutos}min`;

          const horarioFormateado = `${horaInicio} - ${horaFin} (${duracionTexto})`;

          // ✅ ESTABLECER TODOS LOS VALORES
          setHorarioTexto(horarioFormateado);
          setHorario(horarioFormateado);
          setHorarioSeleccionado(horario); // 🎯 ¡IMPORTANTE! Para mostrar en el renderValue
          setCanchasSeleccionadas(canchas);
          setNumCanchas(canchas.length);
          setIdCancha(canchas.map((c) => c.id));
          setDuracion(horario.duracion);
          setPrecio(horario.precio); // 🎯 ¡IMPORTANTE! Para mostrar el precio
          setMoneda(horario.moneda); // 🎯 ¡IMPORTANTE! Para mostrar la moneda
          setHoraFin(horario.hora_fin);
          setBloquearContador(true);

          console.log("✅ VALORES ESTABLECIDOS:");
          console.log("- Precio:", horario.precio);
          console.log("- Moneda:", horario.moneda);
          console.log(
            "- Canchas:",
            canchas.map((c) => c.nombre)
          );
        }}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    marginBottom: 30,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject, // Ocupa toda la pantalla sin importar el padding del contenedor
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // El video debe estar encima del formulario
  },
  fullscreenVideo: {
    width: "100%", // Asegura que el video ocupe todo el ancho
    height: "100%", // Asegura que el video ocupe toda la altura
  },
  formContainer: {
    flex: 1,
    zIndex: 0, // El formulario debe estar por debajo del video
    marginTop: 0, // El formulario no debe interferir con el video
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 50,
  },
  inputContainer: {
    width: "90%",
    paddingBottom: 10,
    marginTop: -40,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "left",
    marginVertical: 10,
  },
  jugadasContainer: {
    marginTop: 10, // Espacio superior para separación
    padding: 4, // Espaciado dentro del contenedor
    borderRadius: 16, // Bordes redondeados
    backgroundColor: "white", // Fondo suave
    alignItems: "center", // Centra el contenido
    justifyContent: "center", // Centra el contenido
    alignSelf: "center", // Centra el contenedor en la pantalla
    borderWidth: 3,
    borderColor: "colors.primary", // Color del borde
    marginBottom: 10,
    width: width * 0.825,
    height: 52,
  },
  // Estilo para el texto de parejas inscritas
  jugadasText: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#809FB8",
    alignContent: "center",
    justifyContent: "center",
  },

  modalContainer2: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00bfff",
  },
  modalContent2: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00bfff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "colors.primary",
  },
  errorText: {
    color: "colors.error",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  guardar: {
    marginTop: "-10%",
    marginBottom: 60,
  },
  infoText: {
    color: "#0088cc",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
    alignSelf: "flex-start",
    fontStyle: "italic",
  },
  labelText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  selectedItem: {
    borderColor: "colors.primary",
  },
});

export default formularioJugada;
