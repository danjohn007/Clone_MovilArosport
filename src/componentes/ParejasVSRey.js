
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import CustomButton from "./Buttons";
import { FontAwesome5 } from "@expo/vector-icons"; // Asegúrate de tener este paquete instalado
import {
  mandarRanking,
  verificarMarcador,
  terminarPartidaReta,
} from "./Activos/Americana/RetaApiService";
import TieBreakRonda from "../modales/TieBreakRonda";
import { text } from "@fortawesome/fontawesome-svg-core";
import TieBreak2 from "../modales/TimeBreak2";
import { Ionicons } from "@expo/vector-icons";
import { establecerLimitePuntos } from "./Activos/Americana/AmericanaApiService";

const ParejasVSRey = ({
  jugador1,
  jugador2,
  jugador3,
  jugador4,
  juegoNombre,
  onPuntosChange,
  resetPuntos,
  index,
  soyCreador,
  rondaIds,
  puntos,
  puntosTotales,
  tiebreak, // <--- nueva prop
  idJuego,
}) => {
  const [puntos1, setPuntos1] = useState("");
  const [puntos2, setPuntos2] = useState("");
  console.log("nombres de canchas rey ", puntosTotales);
  const pareja1Gana = parseInt(puntos1) > parseInt(puntos2);
  const pareja2Gana = parseInt(puntos2) > parseInt(puntos1);
  //arreglos de rondas terminadas
  const [rondasCerradas, setRondasCerradas] = useState({});
  const [editable, setEditable] = useState(true);
  const [estadoPartida, setEstadoPartida] = useState(1);
  const [setScores, setSetScores] = useState({
    set1: [0, 0],
  });
  const [tieBreakVisible, setTieBreakVisible] = useState(false);
  const [tieBreakPuntajes, setTieBreakPuntajes] = useState({});
  const input2ref = useRef(null);
  const input1ref = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [hayTiebreak, setHayTiebreak] = useState(false);
  const [tiebreakConfirmado, setTiebreakConfirmado] = useState(null);
  const [limitePuntos, setLimitePuntos] = useState(12);

  // useEffect para obtener el límite de puntos al inicio
  useEffect(() => {
    const obtenerLimitePuntos = async () => {
      try {
        const limite = await establecerLimitePuntos(idJuego, 0);
        console.log("Límite de puntos obtenido:", limite.data.set1);
        setLimitePuntos(parseInt(limite.data.set1));
      } catch (error) {
        console.error("Error al obtener límite de puntos:", error);
      }
    };
    obtenerLimitePuntos();
  }, [idJuego]);

  const validarPuntosEnTiempoReal = ({ pareja1, pareja2 }) => {
    const p1 = parseInt(pareja1, 10);
    const p2 = parseInt(pareja2, 10);

    if (pareja1 === "" || pareja2 === "")
      return "Ambos campos deben tener un valor";

    if (isNaN(p1) || isNaN(p2)) return "Solo se permiten números";

    if (p1 < 0 || p2 < 0) return "No se permiten valores negativos";

    const suma = p1 + p2;
    // Validar que la suma no exceda el límite, EXCEPTO cuando es tiebreak (7-6 o 6-7)
    const esTiebreak = (p1 === 7 && p2 === 6) || (p1 === 6 && p2 === 7);
    if (suma > limitePuntos && !esTiebreak) {
      return `La suma de puntos no puede ser mayor a ${limitePuntos}`;
    }

    if (suma < limitePuntos)
      return `La suma de puntos debe ser al menos ${limitePuntos}`;

    if (p1 === 0 && p2 === 0) return "El marcador 0 - 0 no es válido";
    if (p1 == p2 && p1 != 6) return "El marcador debe ser 6 - 6 para empate";

    return "";
  };

  useEffect(() => {
    // Solo ejecuta si rondaIds existe y tiene ambos IDs
    if (!rondaIds || !rondaIds.idRondaJuego || !rondaIds.idRondaJuego2) {
      return;
    }
    const intervalId = setInterval(async () => {
      try {
        const [marcador1, marcador2] = await Promise.all([
          verificarMarcador(rondaIds.idRondaJuego),
          verificarMarcador(rondaIds.idRondaJuego2),
        ]);
        console.log("Marcadores recibidos:", { marcador1, marcador2 });
        setEstadoPartida(marcador1[4]);
        if (estadoPartida === "1") {
          setEditable(true);
        }
        if (estadoPartida === "2" || estadoPartida === "3") {
          setEditable(false);
          if (marcador1[3] != null) {
            setHayTiebreak(true);
          } else {
            setHayTiebreak(false);
          }
        }
        if (estadoPartida == "1") {
          setHayTiebreak(false);
        }
        if (marcador1 && marcador2) {
          const updatedScores = {
            set1: [parseInt(marcador1[0]) || 0, parseInt(marcador2[0]) || 0],
          };
          const scoresChanged =
            setScores.set1[0] !== updatedScores.set1[0] ||
            setScores.set1[1] !== updatedScores.set1[1];
          if (scoresChanged) {
            setSetScores(updatedScores);
            setPuntos1(marcador1[0]);
            setPuntos2(marcador2[0]);
            // --- AJUSTE CLAVE ---
            let tieBreak = null;
            let tieBreakScore = null;
            if (
              (marcador1[0] === "7" && marcador2[0] === "6") ||
              (marcador1[0] === "6" && marcador2[0] === "7")
            ) {
              if (tiebreakConfirmado) {
                tieBreak = tiebreakConfirmado.tieBreak;
                tieBreakScore = tiebreakConfirmado.tieBreakScore;
              }
            }
            onPuntosChange({
              pareja1: parseInt(marcador1[0]) || 0,
              pareja2: parseInt(marcador2[0]) || 0,
              tieBreak:
                tieBreak !== null
                  ? tieBreak
                  : tieBreakPuntajes?.[0]
                  ? [
                      parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
                      parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
                    ]
                  : null,
              tieBreakScore:
                tieBreakScore !== null
                  ? tieBreakScore
                  : tieBreakPuntajes?.[0]
                  ? {
                      pareja1: parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
                      pareja2: parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
                    }
                  : null,
            });
          }
        } else {
          console.warn("No se pudieron obtener los marcadores válidos.");
        }
      } catch (error) {}
    }, 2000);
    return () => clearInterval(intervalId);
  }, [rondaIds?.idRondaJuego, rondaIds?.idRondaJuego2, onPuntosChange]);

  const handleTerminarRonda = async () => {
    const error = validarPuntosEnTiempoReal({
      pareja1: puntos1,
      pareja2: puntos2,
    });

    if (error) {
      setErrorMsg(error);
      return;
    }

    setErrorMsg("");
    setGuardando(true); // ⏳ Empieza la carga
    setEditable(false);

    const nuevasCerradas = { ...rondasCerradas, [rondaIds.idRondaJuego]: true };

    // Si hay empate 6-6, mostrar modal de tie-break y no terminar la partida aún
    if (puntos1 === "6" && puntos2 === "6") {
      setTieBreakVisible(true);
      setRondasCerradas(nuevasCerradas);
      setGuardando(false);
      return; // Salir sin terminar la partida
    }

    try {
      await terminarPartidaReta(rondaIds.idRondaJuego);
      await terminarPartidaReta(rondaIds.idRondaJuego2);
      setEstadoPartida(3);
    } catch (e) {
      console.error("Error al guardar partida:", e);
    }

    setRondasCerradas(nuevasCerradas);
    setGuardando(false); // ✅ Finaliza la carga
  };

  // Verificamos si esta es la primera cancha
  const esPrimeraCancha = index === 0;

  useEffect(() => {
    if (resetPuntos) {
      setPuntos1("");
      setPuntos2("");
    }
  }, [resetPuntos]);

  // Inicializar puntos1, puntos2 y tiebreakConfirmado desde props.puntos y tiebreak
  useEffect(() => {
    if (typeof puntos === "object") {
      if (puntos.pareja1 !== undefined && puntos.pareja2 !== undefined) {
        setPuntos1(
          puntos.pareja1 === 0 ? "0" : puntos.pareja1?.toString() || ""
        );
        setPuntos2(
          puntos.pareja2 === 0 ? "0" : puntos.pareja2?.toString() || ""
        );
      }
    }

    // Actualizar tiebreak confirmado desde props
    if (tiebreak && tiebreak.tieBreak && tiebreak.tieBreakScore) {
      setTiebreakConfirmado({
        tieBreak: tiebreak.tieBreak,
        tieBreakScore: tiebreak.tieBreakScore,
      });
      setHayTiebreak(true);
    } else if (puntos && puntos.tieBreak && puntos.tieBreakScore) {
      // También verificar si viene en puntos directamente
      console.log(`[Cancha ${index}] - Estableciendo tiebreak desde puntos`);
      setTiebreakConfirmado({
        tieBreak: puntos.tieBreak,
        tieBreakScore: puntos.tieBreakScore,
      });
      setHayTiebreak(true);
    } else {
      console.log(`[Cancha ${index}] - No hay tiebreak, reseteando estado`);
      setHayTiebreak(false);
      setTiebreakConfirmado(null);
    }
  }, [puntos, tiebreak, index]);

  const actualizarPuntos = (punto1, punto2) => {
    onPuntosChange({
      pareja1: punto1 === "" ? "" : parseInt(punto1, 10),
      pareja2: punto2 === "" ? "" : parseInt(punto2, 10),
      tieBreak: tieBreakPuntajes?.[0]
        ? [
            parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
            parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
          ]
        : null,
      tieBreakScore: tieBreakPuntajes?.[0]
        ? {
            pareja1: parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
            pareja2: parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
          }
        : null,
    });
  };

  // Detectar empate 6-6
  const empateSeis = puntos1 === "6" && puntos2 === "6";

  // Validar automáticamente cuando cambian los puntos o se monta el componente
  useEffect(() => {
    if (puntos1 !== "" && puntos2 !== "") {
      let error = "";
      error = validarPuntosEnTiempoReal({
        pareja1: puntos1,
        pareja2: puntos2,
      });
      setErrorMsg(error);
    } else if (puntos1 !== "" || puntos2 !== "") {
      // Si solo uno de los campos tiene valor, mostrar error
      setErrorMsg("Ambos campos deben tener un valor");
    } else {
      // Si ambos campos están vacíos, limpiar error
      setErrorMsg("");
    }
  }, [puntos1, puntos2, limitePuntos]);

  return (
    <>
      <View style={styles.rectangleParent}>
        <View style={styles.groupChild}>
          <View style={styles.frameParentFlexBox}>
            <Text style={styles.juegoNombre}>{juegoNombre}</Text>
          </View>
          <View
            style={[
              styles.jugadoresContainer,
              hayTiebreak ? { marginBottom: "8%" } : { marginBottom: "14%" },
            ]}
          >
            {/* Columna 1 */}
            <View style={styles.jugadoresColumn}>
              <Text
                style={styles.jugadorText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {jugador1}
              </Text>
              <Text
                style={styles.jugadorText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {jugador2}
              </Text>
            </View>
            {/* Separador versus */}
            <Text style={styles.vs}>vs</Text>
            {/* Columna 2 */}
            <View style={styles.jugadoresColumn}>
              <Text
                style={[styles.jugadorText, { textAlign: "right" }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {jugador3}
              </Text>
              <Text
                style={[styles.jugadorText, { textAlign: "right" }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {jugador4}
              </Text>
            </View>
            {/* Coronita dorada para pareja ganadora */}
            {pareja1Gana && (
              <FontAwesome5
                name="crown"
                size={24}
                color="gold"
                style={{ position: "absolute", top: "-40%", left: "3%" }}
              />
            )}
            {pareja2Gana && (
              <FontAwesome5
                name="crown"
                size={24}
                color="gold"
                style={{ position: "absolute", top: "-40%", right: "3%" }}
              />
            )}
          </View>
          <View
            style={
              hayTiebreak ? styles.marcadorContainer2 : styles.marcadorContainer
            }
          >
            <TextInput
              placeholder="0"
              placeholderTextColor="#FFF"
              textAlign="center"
              style={styles.marcadorInput}
              keyboardType="number-pad"
              returnKeyType="done"
              ref={input1ref}
              value={puntos1}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9]/g, "");
                setPuntos1(sanitized);
                const error = validarPuntosEnTiempoReal({
                  pareja1: sanitized,
                  pareja2: puntos2,
                });
                setErrorMsg(error);

                // Siempre enviar tieBreak y tieBreakScore aunque sean null
                onPuntosChange({
                  pareja1: sanitized === "" ? "" : parseInt(sanitized, 10),
                  pareja2: puntos2 === "" ? "" : parseInt(puntos2, 10),
                  tieBreak: tiebreakConfirmado?.tieBreak
                    ? tiebreakConfirmado.tieBreak
                    : tieBreakPuntajes?.[0]
                    ? [
                        parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
                        parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
                      ]
                    : null,
                  tieBreakScore: tiebreakConfirmado?.tieBreakScore
                    ? tiebreakConfirmado.tieBreakScore
                    : tieBreakPuntajes?.[0]
                    ? {
                        pareja1:
                          parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
                        pareja2:
                          parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
                      }
                    : null,
                });
              }}
              onFocus={() => setPuntos1("")}
              onSubmitEditing={() => Keyboard.dismiss()}
              maxLength={4}
              editable={editable}
            />
            <Text style={styles.marcadorSeparador}>-</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor="#FFF"
              textAlign="center"
              style={styles.marcadorInput}
              keyboardType="number-pad"
              returnKeyType="done"
              ref={input2ref}
              value={puntos2}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9]/g, "");
                setPuntos2(sanitized);
                const error = validarPuntosEnTiempoReal({
                  pareja1: puntos1,
                  pareja2: sanitized,
                });
                setErrorMsg(error);
                // Siempre enviar tieBreak y tieBreakScore aunque sean null
                onPuntosChange({
                  pareja1: puntos1 === "" ? "" : parseInt(puntos1, 10),
                  pareja2: sanitized === "" ? "" : parseInt(sanitized, 10),
                  tieBreak: tiebreakConfirmado?.tieBreak
                    ? tiebreakConfirmado.tieBreak
                    : tieBreakPuntajes?.[0]
                    ? [
                        parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
                        parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
                      ]
                    : null,
                  tieBreakScore: tiebreakConfirmado?.tieBreakScore
                    ? tiebreakConfirmado.tieBreakScore
                    : tieBreakPuntajes?.[0]
                    ? {
                        pareja1:
                          parseInt(tieBreakPuntajes[0]?.pareja1, 10) || 0,
                        pareja2:
                          parseInt(tieBreakPuntajes[0]?.pareja2, 10) || 0,
                      }
                    : null,
                });
              }}
              onFocus={() => setPuntos2("")}
              onSubmitEditing={() => Keyboard.dismiss()}
              maxLength={4}
              editable={editable}
            />
          </View>

          {errorMsg !== "" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "8%",
                marginBottom: "4%",
                width: "88%",
                alignSelf: "center",
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color="red"
                style={{ marginRight: 1 }}
              />
              <Text
                style={{
                  color: "red",
                  fontSize: 11,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {errorMsg}
              </Text>
            </View>
          )}

          {hayTiebreak && (
            <View style={[styles.marcadorContainer, { marginTop: "58%" }]}>
              <Text style={styles.textInput}>
                {tiebreakConfirmado && tiebreakConfirmado.tieBreakScore
                  ? tiebreakConfirmado.tieBreakScore.pareja1
                  : 0}
              </Text>
              <Text style={styles.marcadorSeparador}>TieBreak </Text>
              <Text style={styles.textInput}>
                {tiebreakConfirmado && tiebreakConfirmado.tieBreakScore
                  ? tiebreakConfirmado.tieBreakScore.pareja2
                  : 0}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View>
        {estadoPartida === "1" && soyCreador === true && (
          <View style={[styles.buttonContainer, (errorMsg !== "" || guardando) && { opacity: 0.5 }]}>
            <CustomButton
              buttonText={
                guardando ? "Guardando partida..." : "Terminar Partida"
              }
              onPress={errorMsg !== "" || guardando ? null : handleTerminarRonda}
              disabled={errorMsg !== "" || guardando}
            />
          </View>
        )}
      </View>

      {/* Mostrar el modal solo si la partida no está terminada */}
      {estadoPartida === "1" && (
        <TieBreak2
          visible={tieBreakVisible}
          onClose={() => setTieBreakVisible(false)}
          onConfirm={(puntajes) => {
            setTieBreakPuntajes(puntajes);
            // Determina el ganador y actualiza los puntos principales
            const tie1 = parseInt(puntajes[0]?.pareja1, 10);
            const tie2 = parseInt(puntajes[0]?.pareja2, 10);
            let puntosFinales = {};
            if (!isNaN(tie1) && !isNaN(tie2)) {
              if (tie1 > tie2) {
                setPuntos1("7");
                setPuntos2("6");
                puntosFinales = {
                  pareja1: 7,
                  pareja2: 6,
                  tieBreak: [tie1, tie2],
                  tieBreakScore: { pareja1: tie1, pareja2: tie2 },
                };
              } else if (tie2 > tie1) {
                setPuntos1("6");
                setPuntos2("7");
                puntosFinales = {
                  pareja1: 6,
                  pareja2: 7,
                  tieBreak: [tie1, tie2],
                  tieBreakScore: { pareja1: tie1, pareja2: tie2 },
                };
              }
              setTiebreakConfirmado({
                tieBreak: [tie1, tie2],
                tieBreakScore: { pareja1: tie1, pareja2: tie2 },
              });
              setHayTiebreak(true);
              onPuntosChange(puntosFinales);
            } else {
              // Si no hay tiebreak válido, igual manda la estructura
              onPuntosChange({
                pareja1: parseInt(puntos1) || 0,
                pareja2: parseInt(puntos2) || 0,
                tieBreak: null,
                tieBreakScore: null,
              });
              setHayTiebreak(false);
            }
            // Ahora que se registró el tie-break, terminar la partida
            if (rondaIds?.idRondaJuego && rondaIds?.idRondaJuego2) {
              terminarPartidaReta(rondaIds.idRondaJuego);
              terminarPartidaReta(rondaIds.idRondaJuego2);
              setEstadoPartida("3");
            }
          }}
          pareja={[
            {
              canchaIndex: 0,
              nombre_cancha: esPrimeraCancha
                ? `${juegoNombre}`
                : `${juegoNombre}`,
              jugadores: [jugador1, jugador2, jugador3, jugador4],
            },
          ]}
          puntajes={tieBreakPuntajes}
          setPuntajes={setTieBreakPuntajes}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  //fondo de la cancha
  rectangleParent: {
    minHeight: 186.3,
    width: 308.2,
    marginTop: "5%",
    marginBottom: 0,
  },
  groupChild: {
    top: "9.9%",
    borderRadius: 16,
    borderColor: "#00baff",
    borderWidth: 3.45,
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: "3%",
    position: "relative",
  },
  //Titulo de las canchas
  frameParentFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#02B9FA",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
    width: "78.5%",
    alignSelf: "center",
    position: "absolute",
    top: -20,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  juegoNombre: {
    fontSize: 12.65,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    alignSelf: "center",
    width: "100%",
    textTransform: "uppercase",
  },
  //Jugadores de la cancha
  jugadoresContainer: {
    marginTop: "12%",
    paddingHorizontal: 11.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  jugadoresColumn: {
    flex: 3,
    gap: 20,
  },
  jugadorText: {
    color: "#000",
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    fontSize: 16,
  },
  //Marcadores estilos
  marcadorContainer: {
    flexDirection: "row",
    paddingHorizontal: 45,
    paddingVertical: 3,
    backgroundColor: "#02B9FA",
    borderRadius: 16,
    justifyContent: "space-between",
    width: "78.5%",
    alignSelf: "center",
    alignItems: "center",
    position: "absolute",
    marginTop: "42%",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  marcadorContainer2: {
    flexDirection: "row",
    paddingHorizontal: 45,
    paddingVertical: 3,
    backgroundColor: "#02B9FA",
    borderRadius: 16,
    justifyContent: "space-between",
    width: "78.5%",
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    marginBottom: "9%",
  },
  //Inputs de los marcadores
  marcadorInput: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    paddingBottom: 0,
    paddingTop: 0,
  },
  marcadorSeparador: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  textInput: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
  },
  //separador versus
  vs: {
    fontSize: 28.75,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    fontWeight: "600",
    position: "absolute",
    left: "50%",
  },

  botonDeshabilitado: {
    backgroundColor: "#ccc", // gris
    opacity: 0.6,
  },
});

export default ParejasVSRey;