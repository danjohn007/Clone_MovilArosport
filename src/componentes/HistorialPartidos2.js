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
import {
  actualizarRondaAmericana,
  establecerLimitePuntos,
} from "./Activos/Americana/AmericanaApiService.js";
import TimeBreak from "../modales/TimeBreak.js";
import {
  actualizarRondaReta,
  actualizarRonda,
} from "./Activos/Americana/RetaApiService.js";
import { parse } from "react-native-svg";

// Añadí estado para controlar la apertura del modal de tie break
const HistorialPartidos2 = ({
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
  const [tiebreaks, setTiebreaks] = useState({
    tiebreak1: { pareja1: null, pareja2: null },
    tiebreak2: { pareja1: null, pareja2: null },
    tiebreak3: { pareja1: null, pareja2: null },
  });
  const [limitePuntos, setLimitePuntos] = useState(0);
  const [numEnEdicion, setNumEnEdicion] = useState(0);
  const [siTiebreak, setSiTiebreak] = useState(false);

  const handleEditar = (index, pareja, setNumber) => {
    setParejaSeleccionada(index);
    setNumEnEdicion(setNumber);
    setEnEdicion(true);
    const puntos = pareja.puntos || {};
    const setKey = `set${setNumber}`;
    const nuevosPuntajes = {
      [setKey]: puntos[setKey]
        ? [String(puntos[setKey][0]), String(puntos[setKey][1])]
        : ["", ""]
    };
    setPuntajes(nuevosPuntajes);
    
    // Cargar el tiebreak específico del set que se está editando
    const tieBreakData = pareja.tieBreak || {};
    let tiebreakValues = { pareja1: "", pareja2: "" };
    
    if (tipoJuego == 10) {
      // Para juegos normales, buscar en tiebreak, tiebreak2 o tiebreak3
      const tiebreakKey = setNumber === 1 ? 'tiebreak' : setNumber === 2 ? 'tiebreak2' : 'tiebreak3';
      if (tieBreakData[tiebreakKey] && Array.isArray(tieBreakData[tiebreakKey])) {
        const [tb1, tb2] = tieBreakData[tiebreakKey];
        tiebreakValues = {
          pareja1: tb1 !== null && tb1 !== undefined ? String(tb1) : "",
          pareja2: tb2 !== null && tb2 !== undefined ? String(tb2) : ""
        };
      }
    } else {
      // Para juegos americanos, soportar array o formato objeto (tiebreak1)
      if (setNumber === 1) {
        if (Array.isArray(tieBreakData) && tieBreakData.length >= 2) {
          // Array simple: [tb1, tb2] (permitir 0)
          tiebreakValues = {
            pareja1: tieBreakData[0] !== null && tieBreakData[0] !== undefined ? String(tieBreakData[0]) : "",
            pareja2: tieBreakData[1] !== null && tieBreakData[1] !== undefined ? String(tieBreakData[1]) : ""
          };
        } else if (tieBreakData.tiebreak1 && Array.isArray(tieBreakData.tiebreak1) && tieBreakData.tiebreak1.length >= 2) {
          // Objeto: { tiebreak1: [tb1, tb2] }
          tiebreakValues = {
            pareja1: tieBreakData.tiebreak1[0] !== null && tieBreakData.tiebreak1[0] !== undefined ? String(tieBreakData.tiebreak1[0]) : "",
            pareja2: tieBreakData.tiebreak1[1] !== null && tieBreakData.tiebreak1[1] !== undefined ? String(tieBreakData.tiebreak1[1]) : ""
          };
        }
      }
    }
    
    setTiebreak(tiebreakValues);
  };

  React.useEffect(() => {
    setParejasLocal(parejas);
  }, [parejas]);

  // useEffect para obtener el límite de puntos al inicio
  useEffect(() => {
    const obtenerLimitePuntos = async () => {
      if (tipoJuego != 10 && tipoJuego != 14) {
        try {
          const limite = await establecerLimitePuntos(idJuego, 0);
          setLimitePuntos(parseInt(limite.data.set1));
        } catch (error) {
          console.error("Error al obtener límite de puntos:", error);
        }
      }
    };
    obtenerLimitePuntos();
  }, [tipoJuego, idJuego]);

  const handleCancelar = () => {
    setParejaSeleccionada(null);
    setEnEdicion(false);
    setPuntajes({ set1: [0, 0], set2: [0, 0], set3: [0, 0] });
    setTiebreak({ pareja1: "", pareja2: "" });
    setSiTiebreak(false);
    setErrorMarcador("");
  };

  // Función para validar sets en juegos NORMALES
  const validarSet = (p1, p2) => {
    p1 = parseInt(p1, 10);
    p2 = parseInt(p2, 10);

    if (p1 === "" && p2 === "") return "Ambos campos deben tener un valor"; 
    if (isNaN(p1) || isNaN(p2)) return "Los puntajes deben ser números válidos.";
    if (p1 < 0 || p2 < 0) return "No se permiten valores negativos."; 

    const msg = "Máximo 6 puntos, solo se puede terminar en 7-6, 6-7, 7-5 o 5-7";
    const max = Math.max(p1, p2);
    const min = Math.min(p1, p2);
    // No se permiten resultados mayores a 7 en un set normal
    if (max > 7) return msg; // bloquea 8-6, 9-7, etc.
    // Casos donde alguien llega a 7: solo válidos 7-5 o 7-6
    if (max === 7) {
      if (!(min === 5 || min === 6)) return msg; // bloquea 7-4, 7-3, etc.
    }
    if (p1 == p2 && p2 != 6) return "Solo se permite empate 6-6.";
    if ((p1 < 6 && p2 < 6)) return "Al menos una pareja debe tener 6 puntos para ganar.";

    return "";
  };

  // Función para validar sets en juegos americanos
  const validarSetAmericana = (p1, p2) => {
    p1 = parseInt(p1, 10);
    p2 = parseInt(p2, 10);

    if (p1 === "" || p2 === "") return "Ambos campos deben tener un valor";
    if (isNaN(p1) || isNaN(p2)) return "Solo se permiten números";
    if (p1 < 0 || p2 < 0) return "No se permiten valores negativos";
    const suma = p1 + p2;
    // Validar que la suma no exceda el límite, EXCEPTO cuando es tiebreak (7-6 o 6-7)
    const esTiebreak = (p1 === 7 && p2 === 6) || (p1 === 6 && p2 === 7);
    if (suma > limitePuntos && !esTiebreak) {
      return `La suma de puntos no puede ser mayor a ${limitePuntos}`;
    }
    if (suma < limitePuntos) return `La suma de puntos debe ser al menos ${limitePuntos}`;
    if (p1 === 0 && p2 === 0) return "El marcador 0 - 0 no es válido";
    if (p1 == p2 && p1 != 6) return "El marcador debe ser 6 - 6 para empate";

    return "";
  };

  // Función para saber si mostrar el input de tiebreak
  const shouldShowTiebreakInput = () => {
    if (parejaSeleccionada === null) return false;
    const pareja = parejasLocal[parejaSeleccionada];
    if (!pareja) return false;
    // Usar el set en edición
    const setKey = `set${numEnEdicion}`;
    const [p1, p2] = puntajes[setKey] || ["", ""];
    // Si el set en curso es 6-6, 7-6 o 6-7, o ya hay tiebreak ingresado
    const esSeisSeis = p1 === "6" && p2 === "6";
    const esSieteSeis = (p1 === "7" && p2 === "6") || (p1 === "6" && p2 === "7");
    
    // Para juegos normales (tipo 10), mostrar tiebreak en 6-6, 7-6 o 6-7
    if (tipoJuego == 10 || tipoJuego == 14) {
      return esSeisSeis || esSieteSeis || tiebreak.pareja1 || tiebreak.pareja2;
    }
    
    // Para juegos americanos, mostrar tiebreak cuando hay empate (p1 == p2) 
    // EXCEPTO para tipos 1, 15, 2
    if (tipoJuego == 1 && tipoJuego == 15) {
      return (p1 == p2 && p1 !== "" && p2 !== "") || tiebreak.pareja1 || tiebreak.pareja2;
    }

    if (tipoJuego == 2) {
      return (p1 == p2 && p1 !== "" && p2 !== "") || tiebreak.pareja1 || tiebreak.pareja2 || esSieteSeis;
    }
    
    return false;
  };

  const validarTiebreak = () => {
    // Si solo uno está vacío, es error
    if (tiebreak.pareja1 === "" || tiebreak.pareja2 === "") return "Ambos campos deben tener un valor";
    
    const tb1 = parseInt(tiebreak.pareja1, 10);
    const tb2 = parseInt(tiebreak.pareja2, 10);
    const diff = Math.abs(tb1 - tb2);
    if (isNaN(tb1) || isNaN(tb2))
      return "Los puntajes deben ser números válidos.";
    if (tb1 < 0 || tb2 < 0) return "No se permiten valores negativos.";
    if (tb1 == tb2) return "El tiebreak no puede ser empate.";
    if ((tb1 < 7 && tb2 < 7)) return "No se puede ganar con menos de 7 puntos.";
    if ((tb1 == 7 && tb2 == 6) || (tb1 == 6 && tb2 == 7)) return "La diferencia mínima en tiebreak debe ser 2.";
    if ((tb1 > 7 && tb2 < tb1 && diff > 2) || (tb2 > 7 && tb1 < tb2 && diff > 2)) return "No se puede ganar más de 7 puntos si la diferencia es mayor a 2.";
    
    return "";
  };

  const validarTiebreakAmericana = () => {
    // Si solo uno está vacío, es error
    if (tiebreak.pareja1 === "" || tiebreak.pareja2 === "") return "Ambos campos deben tener un valor";
    
    const tb1 = parseInt(tiebreak.pareja1, 10);
    const tb2 = parseInt(tiebreak.pareja2, 10);

    if (isNaN(tb1) || isNaN(tb2)) return "Los puntajes deben ser números válidos.";
    if (tb1 == tb2) return "El tiebreak no puede ser empate.";
    if (tb1 < 0 || tb2 < 0) return "No se permiten valores negativos.";
    if (tb1 > 5 || tb2 > 5) return "El máximo permitido en tiebreak es 5.";
    if ((tb1 > tb2 && tb1 < 5) || (tb2 > tb1 && tb2 < 5)) return "Para ganar en tiebreak, un equipo debe ser el primero en llegar a 5 puntos.";

    return "";
  };

  const handleConfirmar = async () => {
    let tiebreakobj = {};
    // Validar el set en edición antes de continuar
    if (parejaSeleccionada !== null && numEnEdicion) {
      const setKey = `set${numEnEdicion}`;
      const [p1, p2] = puntajes[setKey] || ["", ""];
      let setError = "";
      if (tipoJuego == 10) {
        setError = validarSet(p1, p2);
      } else {
        setError = validarSetAmericana(p1, p2);
      }
      if (setError) {
        setErrorMarcador(setError);
        return;
      } else {
        setErrorMarcador("");
      }
    }
    if (parejaSeleccionada !== null) {
      const pareja = parejasLocal[parejaSeleccionada];
      const sets = {};

      //validar tiebreak si corresponde
      let hayTiebreakValido = false;
      if (shouldShowTiebreakInput()) {
        let errorTiebreak = "";
        if (tipoJuego == 10) {
          errorTiebreak = validarTiebreak();
        } else {
          errorTiebreak = validarTiebreakAmericana();
        }
        if (errorTiebreak) {
          setErrorMarcador(errorTiebreak);
          return;
        } else {
          const setKey = `set${numEnEdicion}`;
          let [p1, p2] = puntajes[setKey] || ["", ""];
          // Convertir a número para evitar concatenación de strings
          p1 = Number(p1);
          p2 = Number(p2);
          const p1gana = tiebreak.pareja1 > tiebreak.pareja2;
          const p2gana = tiebreak.pareja2 > tiebreak.pareja1;
          if (p1gana && p1 == p2) p1 = p1 + 1;
          if (p2gana && p1 == p2) p2 = p2 + 1;
          if (p1gana && p2 > p1) {
            p2 = p2 - 1;
            p1 = p1 + 1;
          }
          if (p2gana && p1 > p2) {
            p1 = p1 - 1;
            p2 = p2 + 1;
          }
          puntajes[setKey] = [p1, p2];
        }
        // Solo marcar tiebreak como válido si ambos campos tienen valores
        if (tiebreak.pareja1 !== "" && tiebreak.pareja2 !== "") {
          hayTiebreakValido = true;
          setSiTiebreak(true);
        }
      } else {
        setTiebreak({
          pareja1: "",
          pareja2: ""
        });
      }

      // Tomar los puntajes previos y solo actualizar el set en edición
      const prevPuntos = pareja.puntos || {};
      const puntajesNumericos = {
        set1: numEnEdicion == 1
          ? puntajes['set1'].map((v) => parseInt(v, 10))
          : (prevPuntos.set1 ? prevPuntos.set1.map((v) => parseInt(v, 10)) : [0, 0]),
        set2: numEnEdicion == 2
          ? puntajes['set2'].map((v) => parseInt(v, 10))
          : (prevPuntos.set2 ? prevPuntos.set2.map((v) => parseInt(v, 10)) : [0, 0]),
        set3: numEnEdicion == 3
          ? puntajes['set3'].map((v) => parseInt(v, 10))
          : (prevPuntos.set3 ? prevPuntos.set3.map((v) => parseInt(v, 10)) : [0, 0]),
      };

      // Tomar los tiebreaks previos y solo actualizar el del set en edición
      let tiebreakToSend = null;
      const prevTieBreak = pareja.tieBreak || {};
      
      // Solo enviar tiebreak si hay valores válidos y se cumple la condición
      if (hayTiebreakValido && tiebreak.pareja1 !== "" && tiebreak.pareja2 !== "") {
        if (tipoJuego != 10) {
          // Para juegos americanos, enviar como array simple
          tiebreakToSend = [parseInt(tiebreak.pareja1, 10), parseInt(tiebreak.pareja2, 10)];
        } else {
          // Para juegos normales, enviar como array de arrays
          tiebreakToSend = [
            [
              numEnEdicion == 1
                ? parseInt(tiebreak.pareja1, 10)
                : (prevTieBreak.tiebreak && prevTieBreak.tiebreak[0] != null ? prevTieBreak.tiebreak[0] : null),
              numEnEdicion == 2
                ? parseInt(tiebreak.pareja1, 10)
                : (prevTieBreak.tiebreak2 && prevTieBreak.tiebreak2[0] != null ? prevTieBreak.tiebreak2[0] : null),
              numEnEdicion == 3
                ? parseInt(tiebreak.pareja1, 10)
                : (prevTieBreak.tiebreak3 && prevTieBreak.tiebreak3[0] != null ? prevTieBreak.tiebreak3[0] : null)
            ],
            [
              numEnEdicion == 1
                ? parseInt(tiebreak.pareja2, 10)
                : (prevTieBreak.tiebreak && prevTieBreak.tiebreak[1] != null ? prevTieBreak.tiebreak[1] : null),
              numEnEdicion == 2
                ? parseInt(tiebreak.pareja2, 10)
                : (prevTieBreak.tiebreak2 && prevTieBreak.tiebreak2[1] != null ? prevTieBreak.tiebreak2[1] : null),
              numEnEdicion == 3
                ? parseInt(tiebreak.pareja2, 10)
                : (prevTieBreak.tiebreak3 && prevTieBreak.tiebreak3[1] != null ? prevTieBreak.tiebreak3[1] : null)
            ]
          ];
        }
      }

      const idRonda = pareja.id_ronda;
      const idRonda2 = pareja?.id_ronda2;
      if (!idRonda) return;

      setLoadingConfirmar(true);

      let respuesta = null;
      
      if (tipoJuego == 10) {
        respuesta = await actualizarRonda(
          idRonda,
          idRonda2,
          puntajesNumericos,
          tiebreakToSend
        );
      } else {
        respuesta = await actualizarRondaReta(
          idRonda,
          idRonda2,
          puntajesNumericos,
          tiebreakToSend
        );
      }

      if (respuesta.status) {
        setLoadingConfirmar(false);
        const nuevasParejas = [...parejasLocal];
        // Actualizar solo el set en edición, los demás conservarlos
        const prevPuntos = nuevasParejas[parejaSeleccionada]?.puntos || {};
        const setKey = `set${numEnEdicion}`;
        const nuevosPuntos = { ...prevPuntos, [setKey]: puntajes[setKey] };
        // Actualizar tiebreak local correctamente
        const prevTieBreak = nuevasParejas[parejaSeleccionada]?.tieBreak || {};
        let nuevosTieBreak;
        if (tipoJuego == 10) {
          nuevosTieBreak = {
            tiebreak: prevTieBreak.tiebreak || [null, null],
            tiebreak2: prevTieBreak.tiebreak2 || [null, null],
            tiebreak3: prevTieBreak.tiebreak3 || [null, null],
          };
          if (hayTiebreakValido) {
            const key = numEnEdicion === 1 ? 'tiebreak' : numEnEdicion === 2 ? 'tiebreak2' : 'tiebreak3';
            nuevosTieBreak[key] = [
              tiebreak.pareja1 !== '' ? parseInt(tiebreak.pareja1, 10) : null,
              tiebreak.pareja2 !== '' ? parseInt(tiebreak.pareja2, 10) : null
            ];
          }
        } else {
          // Para juegos distintos de 10, guardar como { tiebreak1: [x, y] }
          nuevosTieBreak = { ...prevTieBreak };
          if (hayTiebreakValido) {
            nuevosTieBreak.tiebreak1 = [
              tiebreak.pareja1 !== '' ? parseInt(tiebreak.pareja1, 10) : null,
              tiebreak.pareja2 !== '' ? parseInt(tiebreak.pareja2, 10) : null
            ];
          }
        }
        nuevasParejas[parejaSeleccionada] = {
          ...nuevasParejas[parejaSeleccionada],
          puntos: nuevosPuntos,
          tieBreak: nuevosTieBreak,
        };
        setParejasLocal(nuevasParejas);
        setParejaSeleccionada(null);
        setEnEdicion(false);
        setPuntajes({ set1: [0, 0], set2: [0, 0], set3: [0, 0] });
        setTiebreak({ pareja1: "", pareja2: "" });
        setSiTiebreak(false);
      } else {
        setLoadingConfirmar(false);
        setErrorMarcador("No se pudo actualizar la ronda");
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
          {!esHistorial && tipoJuego != 10 && (
            <TouchableOpacity
              onPress={() => handleEditar(index, pareja, 1)}
              style={styles.editIcon}
            >
              <Ionicons name="create-outline" size={24} color="#02B9FA" />
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
                  {["set1", "set2", "set3"].map((set, idx) => {
                    const puntos = pareja.puntos[set];
                    if (!puntos || (puntos[0] === 0 && puntos[1] === 0))
                      return null;
                    // Buscar tiebreak correspondiente en el nuevo formato
                    let tb = null;
                    if (
                      pareja.tieBreak &&
                      pareja.tieBreak[`tiebreak${idx + 1}`]
                    ) {
                      const [tb1, tb2] = pareja.tieBreak[`tiebreak${idx + 1}`];
                      tb = { pareja1: tb1, pareja2: tb2 };
                    }
                    // Contar cuántos tiebreaks existen antes de este set
                    let tiebreaksPrevios = 0;
                    for (let i = 1; i < idx + 1; i++) {
                      if (pareja.tieBreak && pareja.tieBreak[`tiebreak${i}`]) {
                        tiebreaksPrevios++;
                      }
                    }
                    let tbMargin = "35%";
                    if (tiebreaksPrevios === 1) tbMargin = "40%";
                    if (tiebreaksPrevios === 2) tbMargin = "45%";
                    let edmargin = "6%";
                    if (tb) edmargin = "4%";
                    if (idx == 2 && !tb) edmargin = "6%";
                    if (idx == 2 && tb) edmargin = "4%";
                    return (
                      <View
                        key={set}
                        style={
                          idx === 2
                            ? {
                                position: "absolute",
                                width: "100%",
                                marginTop: tbMargin,
                              }
                            : {}
                        }
                      >
                        <Text
                          key={set}
                          style={[
                            styles.puntos,
                            tb
                              ? { marginTop: 2, marginBottom: -2 }
                              : { marginTop: idx === 0 ? 6 : 8 },
                          ]}
                        >
                          {puntos[0]} - {puntos[1]}
                        </Text>
                        {!esHistorial && (
                          <TouchableOpacity
                            style={{ position: "absolute", right: "20%", marginTop: edmargin }}
                            onPress={() => handleEditar(index, pareja, idx + 1)}
                          >
                            <Ionicons name="create-outline" size={20} color="#FFF" />
                          </TouchableOpacity>
                        )}
                        {tb && tb.pareja1 !== null && tb.pareja1 !== undefined && tb.pareja1 !== "" &&
                          tb.pareja2 !== null && tb.pareja2 !== undefined && tb.pareja2 !== "" && (
                            <Text style={[styles.tieReta]}>
                              {tb.pareja1} TieBreak {tb.pareja2}
                            </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {tipoJuego != 10 &&
                (() => {
                  // Solo mostrar set1 si existe y no es 0-0
                  const puntosSet1 = pareja.puntos["set1"];
                  if (
                    !puntosSet1 ||
                    (puntosSet1[0] === 0 && puntosSet1[1] === 0)
                  )
                    return null;
                  // Si hay tiebreak, marcador azul, si no, naranja
                  const hayTiebreak = pareja.tieBreak ;
                  return (
                    <View style={styles.puntosContainer}>
                      <Text
                        style={[
                          styles.puntos,
                          !hayTiebreak && styles.puntosNaranja,
                        ]}
                      >
                        {puntosSet1[0]} - {puntosSet1[1]}
                      </Text>
                    </View>
                  );
                })()}

              {pareja.tieBreak &&
                pareja.tieBreak.tiebreak1 &&
                tipoJuego != 10 &&
                (() => {
                  const [tb1, tb2] = pareja.tieBreak.tiebreak1;
                  if (
                    tb1 !== null && tb1 !== undefined && tb1 !== "" &&
                    tb2 !== null && tb2 !== undefined && tb2 !== ""
                  ) {
                    return (
                      <View style={{ marginTop: "58%", position: "absolute", alignSelf: "center", width: "100%", alignItems: "center" }}>
                        <Text style={styles.tie} key={0}>
                          Tie Break {tb1} - {tb2}
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
            </>
          )}

          {parejaSeleccionada === index && enEdicion && (
            <View style={styles.editorContainer}>
              {/* Inputs de sets */}
              <View style={styles.inputsRow}>
                <TextInput
                  style={styles.marcadorInput}
                  keyboardType="numeric"
                  maxLength={2}
                  value={
                    puntajes[`set${numEnEdicion}`]
                      ? puntajes[`set${numEnEdicion}`][0]
                      : ""
                  }
                  onChangeText={(text) => {
                    const setKey = `set${numEnEdicion}`;
                    const nuevo = {
                      ...puntajes,
                      [setKey]: [
                        text,
                        puntajes[setKey] ? puntajes[setKey][1] : ""
                      ],
                    };
                    // Si ya no es 6-6, limpiar tiebreak
                    const [p1, p2] = nuevo[setKey];
                    if (!(p1 === "6" && p2 === "6") && tipoJuego != 1 && tipoJuego != 15 && tipoJuego != 2) {
                      setTiebreak({ pareja1: "", pareja2: "" });
                    } else if (!(p1 == p2)) {
                      setTiebreak({ pareja1: "", pareja2: "" });
                    }
                    setPuntajes(nuevo);
                  }}
                  placeholder="0"
                  placeholderTextColor="#00BAFF"
                />
                <Text style={styles.vs}>-</Text>
                <TextInput
                  style={styles.marcadorInput}
                  keyboardType="numeric"
                  maxLength={2}
                  value={
                    puntajes[`set${numEnEdicion}`]
                      ? puntajes[`set${numEnEdicion}`][1]
                      : ""
                  }
                  onChangeText={(text) => {
                    const setKey = `set${numEnEdicion}`;
                    const nuevo = {
                      ...puntajes,
                      [setKey]: [
                        puntajes[setKey] ? puntajes[setKey][0] : "",
                        text
                      ],
                    };
                    // Si ya no es 6-6, limpiar tiebreak
                    const [p1, p2] = nuevo[setKey];
                    if (!(p1 === "6" && p2 === "6") && tipoJuego != 1 && tipoJuego != 15 && tipoJuego != 2) {
                      setTiebreak({ pareja1: "", pareja2: "" });
                    } else if (!(p1 == p2)) {
                      setTiebreak({ pareja1: "", pareja2: "" });
                    }
                    setPuntajes(nuevo);
                  }}
                  placeholder="0"
                  placeholderTextColor="#00BAFF"
                />
              </View>

              {/* Inputs de tiebreak solo si corresponde */}
              {shouldShowTiebreakInput() && (
                <View style={[styles.inputsRow, {marginTop: 10}]}>
                  <TextInput
                    style={styles.marcadorInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={tiebreak.pareja1}
                    onChangeText={(text) => {
                      setTiebreak({ ...tiebreak, pareja1: text });
                      setTiebreaks({
                        ...tiebreaks,
                        [`tiebreak${numEnEdicion}`]: {
                          ...tiebreaks[`tiebreak${numEnEdicion}`],
                          pareja1: text
                        }
                      });
                    }}
                    placeholder="0"
                    placeholderTextColor="#00BAFF"
                  />
                  <Text style={styles.vs}>-</Text>
                  <TextInput
                    style={styles.marcadorInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={tiebreak.pareja2}
                    onChangeText={(text) => {
                      setTiebreak({ ...tiebreak, pareja2: text });
                      setTiebreaks({
                        ...tiebreaks,
                        [`tiebreak${numEnEdicion}`]: {
                          ...tiebreaks[`tiebreak${numEnEdicion}`],
                          pareja2: text
                        }
                      });
                    }}
                    placeholder="0"
                    placeholderTextColor="#00BAFF"
                  />
                </View>
              )}
              {errorMarcador !== "" && (
                <View style={{ alignSelf: "center", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 0, marginTop: 10, width: "85%" }}>
                  <Ionicons name="alert-circle-outline" size={24} color="#C70039" />
                  <Text style={styles.errorText}>{errorMarcador}</Text>
                </View>
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
    backgroundColor: "#02B9FA",
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
    borderColor: "#02B9FA",
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
    backgroundColor: "#02B9FA",
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
    backgroundColor: "#02B9FA",
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
    backgroundColor: "#02B9FA",
    padding: 6,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#fff",
    width: "70%", 
    zIndex: 1,
  },
  //estilos de tibreak para la reta
  tieReta: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFF",
    backgroundColor: "#02B9FA",
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
    gap: 8,
  },
  marcadorInput: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FFF",
    color: "#00BAFF",
    borderWidth: 1.5,
    borderColor: "#00BAFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 15,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "center",
    gap: 10,
    marginBottom: -15,
  },
  cancelButton: {
    backgroundColor: "#838080",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#02B9FA",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 15,
  },
  errorText: {
    color: "#C70039",
    fontSize: 11,
    textAlign: "center",
    width: "95%"
  },
});

export default HistorialPartidos2;