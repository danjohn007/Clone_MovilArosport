import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, ScrollView, ActivityIndicator, Alert } from "react-native";
import PendientesEnJugar from "../PendientesEnJugar";
import APIManager from "../API/APIManager";
import { useAuth } from '../../screens/Auth/AuthContext';
import CustomButton from '../Buttons';
import JugadoresModal from '../../modales/Jugadores';
import HistorialTresSets from '../../modales/HistorialTresSets';
import RetaParejasVS from '../RetaParejasVS';

const Reta = ({ juego }) => {  
  const [juegosActivos, setJuegosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [jugadoresActivos, setJugadoresActivos] = useState([]);
  const [parejasActivas, setParejasActivas] = useState({});
  const [jugadoresManuales, setJugadoresManuales] = useState({});
  const [loadingJugadores, setLoadingJugadores] = useState(false);
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null);
  const [rondaActual, setRondaActual] = useState({});
  const { id_usuario } = useAuth();
  const [historialVisible, setHistorialVisible] = useState(false);
  const [historialJuego, setHistorialJuego] = useState(null);
  const [historialPartidas, setHistorialPartidas] = useState({});
  const [jugadoresGuardados, setJugadoresGuardados] = useState({});
  const [puntosPartida, setPuntosPartida] = useState({});
  const [savingPoints, setSavingPoints] = useState(false);
  const [puntosCancha, setPuntosCancha] = useState({});
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (juego) {
      setJuegosActivos([juego]);
      verificarJugadores(juego.id_juego);
    }
  }, [juego]);

  const fetchJuegosActivos = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Activos/Activos/mostrar_activos/${id_usuario}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const now = new Date();
      const juegosFiltrados = res.filter((juego) => {
        const fechaInicio = new Date(`${juego.jue_fecha}T${juego.jue_hora}`);
        return fechaInicio <= now;
      });

      setJuegosActivos(juegosFiltrados);
    } catch (error) {
      console.log("Error al obtener los juegos activos:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {

    let intervalId;
    
    const fetchLatestScores = async () => {
      if (juegosActivos.length > 0) {
        try {
          for (const juego of juegosActivos) {
            const response = await APIManager({
              url: `Activos/Reta/Reta/getPuntosActuales/${juego.id_juego}`,
              method: "GET"
            });
            
            if (response.status && response.puntos) {
              // Guardar los datos en puntosCancha para referencia
              setPuntosCancha(prev => ({
                ...prev,
                [juego.id_juego]: response.puntos
              }));
              
              // Comparar con los datos actuales para determinar si hay cambios
              const currentState = puntosPartida[juego.id_juego] || {};
              const hasChanges = compareWithCurrentState(response.puntos, currentState, juego.id_juego);
              
              // Solo actualizar si hay cambios y no estamos editando actualmente
              if (hasChanges && !savingPoints) {
                updateScoresWithoutFlicker(response.puntos, juego.id_juego);
              }
            }
          }
        } catch (error) {
          console.log("Error en la actualización en tiempo real:", error);
        }
      }
    };
    
    // Iniciar el intervalo solo si hay juegos activos
    if (juegosActivos.length > 0 && !savingPoints) {
      intervalId = setInterval(fetchLatestScores, 5000);
    }
    
    // Limpiar el intervalo al desmontar o cuando cambian los juegos
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [juegosActivos, savingPoints]);
  
  const compareWithCurrentState = (apiPuntos, currentState, idJuego) => {
    // Obtener las parejas activas
    const parejasActualesDB = parejasActivas[idJuego] || [];
    let hasChanges = false;
    
    // Número de canchas para este juego
    const numCanchas = juegosActivos.find(j => j.id_juego === idJuego)?.num_canchas || 1;
    
    // Para cada cancha, verificar si hay cambios
    for (let i = 0; i < numCanchas; i++) {
      const pair1Index = i * 2;
      const pair2Index = i * 2 + 1;
      
      // Verificar que existan las parejas
      if (pair1Index < parejasActualesDB.length && pair2Index < parejasActualesDB.length) {
        const pareja1DB = parejasActualesDB[pair1Index];
        const pareja2DB = parejasActualesDB[pair2Index];
        
        // Extraer nombres de jugadores
        const jugador1Nombre = pareja1DB.jugador1?.us_nomUsuario || pareja1DB.jugador1 || "";
        const jugador2Nombre = pareja1DB.jugador2?.us_nomUsuario || pareja1DB.jugador2 || "";
        const jugador3Nombre = pareja2DB.jugador1?.us_nomUsuario || pareja2DB.jugador1 || "";
        const jugador4Nombre = pareja2DB.jugador2?.us_nomUsuario || pareja2DB.jugador2 || "";
        
        // Buscar los puntos correspondientes a estas parejas en la API
        const puntoPareja1 = apiPuntos.find(p => 
          (p.us_jugador1 === jugador1Nombre && p.us_jugador2 === jugador2Nombre) ||
          (p.us_jugador1 === jugador2Nombre && p.us_jugador2 === jugador1Nombre)
        );
        
        const puntoPareja2 = apiPuntos.find(p => 
          (p.us_jugador1 === jugador3Nombre && p.us_jugador2 === jugador4Nombre) ||
          (p.us_jugador1 === jugador4Nombre && p.us_jugador2 === jugador3Nombre)
        );
        
        // Comparar con el estado actual
        const currentPuntos1 = currentState[`pareja${i}_1`] || {};
        const currentPuntos2 = currentState[`pareja${i}_2`] || {};
        
        if (puntoPareja1 && (
            puntoPareja1.set1 !== currentPuntos1.set1 ||
            puntoPareja1.set2 !== currentPuntos1.set2 ||
            puntoPareja1.set3 !== currentPuntos1.set3
        )) {
          hasChanges = true;
        }
        
        if (puntoPareja2 && (
            puntoPareja2.set1 !== currentPuntos2.set1 ||
            puntoPareja2.set2 !== currentPuntos2.set2 ||
            puntoPareja2.set3 !== currentPuntos2.set3
        )) {
          hasChanges = true;
        }
      }
    }
    
    return hasChanges;
  };
  
  const updateScoresWithoutFlicker = (apiPuntos, idJuego) => {
    // Obtener parejas activas y número de canchas
    const parejasActualesDB = parejasActivas[idJuego] || [];
    const numCanchas = juegosActivos.find(j => j.id_juego === idJuego)?.num_canchas || 1;
    
    // Preservar valores vacíos, no convertir automáticamente a "0"
    const safeGetValue = (value) => {
      if (value === undefined || value === null || value === '') {
        return '';
      }
      return String(value);
    };
    
    // Preparar nuevos datos sin modificar el objeto actual (para evitar parpadeos)
    const newScores = {};
    
    // Para cada cancha, buscar los puntos correspondientes
    for (let i = 0; i < numCanchas; i++) {
      const pair1Index = i * 2;
      const pair2Index = i * 2 + 1;
      
      // Verificar que existan las parejas
      if (pair1Index < parejasActualesDB.length && pair2Index < parejasActualesDB.length) {
        const pareja1DB = parejasActualesDB[pair1Index];
        const pareja2DB = parejasActualesDB[pair2Index];
        
        // Extraer nombres de jugadores
        const jugador1Nombre = pareja1DB.jugador1?.us_nomUsuario || pareja1DB.jugador1 || "";
        const jugador2Nombre = pareja1DB.jugador2?.us_nomUsuario || pareja1DB.jugador2 || "";
        const jugador3Nombre = pareja2DB.jugador1?.us_nomUsuario || pareja2DB.jugador1 || "";
        const jugador4Nombre = pareja2DB.jugador2?.us_nomUsuario || pareja2DB.jugador2 || "";
        
        // Buscar los puntos correspondientes a estas parejas
        const puntoPareja1 = apiPuntos.find(p => 
          (p.us_jugador1 === jugador1Nombre && p.us_jugador2 === jugador2Nombre) ||
          (p.us_jugador1 === jugador2Nombre && p.us_jugador2 === jugador1Nombre)
        );
        
        const puntoPareja2 = apiPuntos.find(p => 
          (p.us_jugador1 === jugador3Nombre && p.us_jugador2 === jugador4Nombre) ||
          (p.us_jugador1 === jugador4Nombre && p.us_jugador2 === jugador3Nombre)
        );
        
        if (puntoPareja1 && puntoPareja2) {
          newScores[`pareja${i}_1`] = {
            set1: safeGetValue(puntoPareja1.set1),
            set2: safeGetValue(puntoPareja1.set2),
            set3: safeGetValue(puntoPareja1.set3)
          };
          
          newScores[`pareja${i}_2`] = {
            set1: safeGetValue(puntoPareja2.set1),
            set2: safeGetValue(puntoPareja2.set2),
            set3: safeGetValue(puntoPareja2.set3)
          };
        }
      }
    }
    
    // Actualizar el estado solo si hay nuevos datos
    if (Object.keys(newScores).length > 0) {
      setPuntosPartida(prev => ({
        ...prev,
        [idJuego]: {
          ...(prev[idJuego] || {}),
          ...newScores
        }
      }));
    }
  };
  
  const savePointsToDatabase = async (idJuego, canchas, puntos, canchaIndex) => {
    try {
      setSavingPoints(true);

      const parejasData = [];
      const parejasActualesDB = parejasActivas[idJuego] || [];
      
      const pair1Index = canchaIndex * 2;       // First pair index
      const pair2Index = canchaIndex * 2 + 1;   // Second pair index
      
      if (pair1Index >= parejasActualesDB.length || pair2Index >= parejasActualesDB.length) {
        console.log("Parejas no encontradas para la cancha", canchaIndex);
        setSavingPoints(false);
        return;
      }
      
      const pareja1DB = parejasActualesDB[pair1Index]; 
      const pareja2DB = parejasActualesDB[pair2Index];
      
      // Get the scores from the state
      const scoresPair1 = puntos[`pareja${canchaIndex}_1`];
      const scoresPair2 = puntos[`pareja${canchaIndex}_2`];
  
      // Verificar que existan los puntos
      if (!scoresPair1 || !scoresPair2) {
        console.log("Puntos no encontrados para la cancha", canchaIndex);
        setSavingPoints(false);
        return;
      }
      
      // Preservar valores vacíos, no convertir automáticamente a "0"
      const safeGetValue = (value) => {
        // Si el valor es undefined, null o vacío, devolver cadena vacía
        if (value === undefined || value === null || value === '') {
          return '';
        }
        // De lo contrario, devolver el valor como cadena
        return String(value);
      };
      
      // Crear el objeto de datos para la primera pareja
      const parejaData1 = {
        id_juego: idJuego,
        id_jugador1: pareja1DB.jugador1?.id_usuario || null,
        us_jugador1: pareja1DB.jugador1?.us_nomUsuario || pareja1DB.jugador1 || "",
        id_jugador2: pareja1DB.jugador2?.id_usuario || null,
        us_jugador2: pareja1DB.jugador2?.us_nomUsuario || pareja1DB.jugador2 || "",
        set1: safeGetValue(scoresPair1.set1),
        set2: safeGetValue(scoresPair1.set2),
        set3: safeGetValue(scoresPair1.set3),
        timestamp: new Date().getTime()
      };
      
      // Crear el objeto de datos para la segunda pareja
      const parejaData2 = {
        id_juego: idJuego,
        id_jugador1: pareja2DB.jugador1?.id_usuario || null,
        us_jugador1: pareja2DB.jugador1?.us_nomUsuario || pareja2DB.jugador1 || "",
        id_jugador2: pareja2DB.jugador2?.id_usuario || null,
        us_jugador2: pareja2DB.jugador2?.us_nomUsuario || pareja2DB.jugador2 || "",
        set1: safeGetValue(scoresPair2.set1),
        set2: safeGetValue(scoresPair2.set2),
        set3: safeGetValue(scoresPair2.set3),
        timestamp: new Date().getTime()
      };
      
      parejasData.push(parejaData1, parejaData2);
      
      
      try {
        const response = await APIManager({
          url: `Activos/Reta/Reta/actualizarPuntosReta`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(parejasData)
        });
        console.log("Respuesta de actualización:", response);

        setTimeout(() => {
          fetchPuntosActuales(idJuego, canchaIndex);
        }, 500);
        
        console.log("Puntos guardados exitosamente");
      } catch (err) {
        console.log("Error al guardar los datos:", err);
      }
    } catch (error) {
      console.log("Error al guardar los puntos en tiempo real:", error);
    } finally {
      setSavingPoints(false);
    }
  };
  
  useEffect(() => {
    const cargarPuntos = async () => {
      const puntos = await fetchPuntosActuales(juego.id_juego);
      if (puntos) {
        setPuntosCancha(prev => ({
          ...prev,
          [juego.id_juego]: puntos
        }));
      }
    };
    
    if (juego && juego.id_juego) {
      cargarPuntos();
    }
  }, [juego?.id_juego]);

  const fetchPuntosActuales = async (idJuego, specificCanchaIndex = null) => {
    try {
      
      const response = await APIManager({
        url: `Activos/Reta/Reta/getPuntosActuales/${idJuego}`,
        method: "GET"
      });
      
      if (response.status && response.puntos) {
        setPuntosCancha(prev => ({
          ...prev,
          [idJuego]: response.puntos
        }));
        
        const safeGetValue = (value) => {
          if (value === undefined || value === null || value === '') {
            return '';
          }
          return String(value);
        };
        
        if (specificCanchaIndex !== null) {
          console.log(`Procesando solo cancha ${specificCanchaIndex}`);         
          const parejasActualesDB = parejasActivas[idJuego] || [];
      
          const pair1Index = specificCanchaIndex * 2;
          const pair2Index = specificCanchaIndex * 2 + 1;
          
          if (pair1Index < parejasActualesDB.length && pair2Index < parejasActualesDB.length) {
            const pareja1DB = parejasActualesDB[pair1Index];
            const pareja2DB = parejasActualesDB[pair2Index];
            
            const jugador1Nombre = pareja1DB.jugador1?.us_nomUsuario || pareja1DB.jugador1 || "";
            const jugador2Nombre = pareja1DB.jugador2?.us_nomUsuario || pareja1DB.jugador2 || "";
            const jugador3Nombre = pareja2DB.jugador1?.us_nomUsuario || pareja2DB.jugador1 || "";
            const jugador4Nombre = pareja2DB.jugador2?.us_nomUsuario || pareja2DB.jugador2 || "";
            
            const puntoPareja1 = response.puntos.find(p => 
              (p.us_jugador1 === jugador1Nombre && p.us_jugador2 === jugador2Nombre) ||
              (p.us_jugador1 === jugador2Nombre && p.us_jugador2 === jugador1Nombre)
            );
            
            const puntoPareja2 = response.puntos.find(p => 
              (p.us_jugador1 === jugador3Nombre && p.us_jugador2 === jugador4Nombre) ||
              (p.us_jugador1 === jugador4Nombre && p.us_jugador2 === jugador3Nombre)
            );
            
            if (puntoPareja1 && puntoPareja2) {
              
              setPuntosPartida(prev => {
                const currentGameState = prev[idJuego] || {};               
                const newPuntos = {
                  ...prev,
                  [idJuego]: {
                    ...currentGameState,
                    [`pareja${specificCanchaIndex}_1`]: {
                      set1: safeGetValue(puntoPareja1.set1),
                      set2: safeGetValue(puntoPareja1.set2),
                      set3: safeGetValue(puntoPareja1.set3)
                    },
                    [`pareja${specificCanchaIndex}_2`]: {
                      set1: safeGetValue(puntoPareja2.set1),
                      set2: safeGetValue(puntoPareja2.set2),
                      set3: safeGetValue(puntoPareja2.set3)
                    }
                  }
                };
                
                console.log(`Nuevos puntos para pareja${specificCanchaIndex}_1:`, newPuntos[idJuego][`pareja${specificCanchaIndex}_1`]);
                console.log(`Nuevos puntos para pareja${specificCanchaIndex}_2:`, newPuntos[idJuego][`pareja${specificCanchaIndex}_2`]);
                
                return newPuntos;
              });
            } else {
              console.log(`No se encontraron puntos en la respuesta para cancha ${specificCanchaIndex}`);
            }
          } else {
            console.log(`Índices de pareja inválidos para cancha ${specificCanchaIndex}`);
          }
        } else {
         
          const newPuntosPartida = {};        
          const parejasActualesDB = parejasActivas[idJuego] || [];  
          const numCanchas = juegosActivos.find(j => j.id_juego === idJuego)?.num_canchas || 1;
          
          for (let i = 0; i < numCanchas; i++) {
            const pair1Index = i * 2;
            const pair2Index = i * 2 + 1;
            
            if (pair1Index < parejasActualesDB.length && pair2Index < parejasActualesDB.length) {
              const pareja1DB = parejasActualesDB[pair1Index];
              const pareja2DB = parejasActualesDB[pair2Index];
              
              const jugador1Nombre = pareja1DB.jugador1?.us_nomUsuario || pareja1DB.jugador1 || "";
              const jugador2Nombre = pareja1DB.jugador2?.us_nomUsuario || pareja1DB.jugador2 || "";
              const jugador3Nombre = pareja2DB.jugador1?.us_nomUsuario || pareja2DB.jugador1 || "";
              const jugador4Nombre = pareja2DB.jugador2?.us_nomUsuario || pareja2DB.jugador2 || "";
              
              const puntoPareja1 = response.puntos.find(p => 
                (p.us_jugador1 === jugador1Nombre && p.us_jugador2 === jugador2Nombre) ||
                (p.us_jugador1 === jugador2Nombre && p.us_jugador2 === jugador1Nombre)
              );
              
              const puntoPareja2 = response.puntos.find(p => 
                (p.us_jugador1 === jugador3Nombre && p.us_jugador2 === jugador4Nombre) ||
                (p.us_jugador1 === jugador4Nombre && p.us_jugador2 === jugador3Nombre)
              );
              
              if (puntoPareja1 && puntoPareja2) {
                newPuntosPartida[`pareja${i}_1`] = {
                  set1: safeGetValue(puntoPareja1.set1),
                  set2: safeGetValue(puntoPareja1.set2),
                  set3: safeGetValue(puntoPareja1.set3)
                };
                
                newPuntosPartida[`pareja${i}_2`] = {
                  set1: safeGetValue(puntoPareja2.set1),
                  set2: safeGetValue(puntoPareja2.set2),
                  set3: safeGetValue(puntoPareja2.set3)
                };
                
              } else {
                console.log(`No se encontraron puntos para la cancha ${i}`);
              }
            }
          }
          
          if (Object.keys(newPuntosPartida).length > 0) {
            setPuntosPartida(prev => {
              const newState = {
                ...prev,
                [idJuego]: newPuntosPartida
              };
              
              return newState;
            });
          }
        }
        
        return response.puntos;
      }
      return null;
    } catch (error) {
      console.log("Error al obtener puntos actuales:", error);
      return null;
    }
  };
  
  const handleGuardarRonda = async (idJuego) => {
    try {
      Alert.alert(
        "Guardar Ronda",
        "¿Estás seguro que quieres guardar esta ronda?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Guardar",
            onPress: async () => {
              try {
                const puntos = puntosCancha[idJuego];
  
                if (!puntos || !Array.isArray(puntos)) {
                  console.log("Error: No se encontraron datos válidos en puntosCancha", puntos);
                  Alert.alert("Error", "No se encontraron datos válidos para guardar.");
                  return;
                }
  
                const ids = puntos.map(punto => punto.id_jugadaReta);
  
                if (ids.length === 0) {
                  Alert.alert("Error", "No hay registros para actualizar");
                  return;
                }
  
                console.log("IDs a actualizar:", ids);
  
                const updateResponse = await APIManager({
                  url: `Activos/Reta/Reta/updateStatus`,
                  method: "POST",
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: JSON.stringify({ ids }) 
                });
  
  
                if (!updateResponse.status) {
                  Alert.alert("Error", `No se pudo actualizar el estatus: ${JSON.stringify(updateResponse)}`);
                  return;
                }
  
                console.log("Estatus actualizado correctamente");
  
                const duplicateResponse = await APIManager({
                  url: `Activos/Reta/Reta/duplicateRecords`,
                  method: "POST",
                  data: JSON.stringify({ ids }) 
                });
  
                if (!duplicateResponse.status) {
                  Alert.alert("Error", "No se pudieron duplicar los registros");
                  return;
                }
  
                console.log("Registros duplicados correctamente");
  
  
                Alert.alert("Éxito", "Ronda guardada correctamente");
              } catch (error) {
                console.log("Error al guardar la ronda:", error);
                Alert.alert("Error", "Ocurrió un error al guardar la ronda");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.log("Error en handleGuardarRonda:", error);
    }
  };
  
  const fetchData = async (idJuego) => {
    try {
      const response = await APIManager({
        url: `Activos/Reta/Reta/getHistorialReta/${juego.id_juego}`,
        method: "GET",
      });
  
      console.log("API Response:", response);
  
      if (!response || !response.data) {
        throw new Error("Respuesta inválida de la API");
      }
  
      const transformedData = transformData(response.data);
      setHistorial(transformedData);
      setHistorialVisible(true);
    } catch (error) {
      console.log("Error al obtener historial:", error.message || error);
      Alert.alert("Error", "No se pudo obtener el historial");
    }
  };
  const transformData = (data) => {
    const juegosMap = new Map();
  
    data.forEach((item) => {
      const parejaId = item.pareja;
  
      if (!juegosMap.has(parejaId)) {
        juegosMap.set(parejaId, {
          ronda: parejaId,
          parejas: []
        });
      }
  
      const juego = juegosMap.get(parejaId);
  
      juego.parejas.push({
        jugadores: [
          item.jugador1 ? { id: item.jugador1.id_usuario, nombre: item.jugador1.us_nomUsuario } : null,
          item.jugador2 ? { id: item.jugador2.id_usuario, nombre: item.jugador2.us_nomUsuario } : null
        ],
        puntosSets: item.sets || { 
          set1: { pareja1: "0", pareja2: "0" }, 
          set2: { pareja1: "0", pareja2: "0" }, 
          set3: { pareja1: "0", pareja2: "0" }
        }
      });
    });
  
    return Array.from(juegosMap.values());
  };
  
  

  const handleActualizarPuntos = (idJuego, parejaIndex, sets) => {
    console.log(`handleActualizarPuntos - juego: ${idJuego}, parejaIndex: ${parejaIndex}`, sets);
    
    if (!sets || !Array.isArray(sets) || sets.length < 3) {
      console.log("Formato de sets inválido:", sets);
      return;
    }
    
    // Extraer los datos estructurados de los sets (mantener los valores originales, no convertir a '0')
    const formattedSets = {
      set1: sets[0]?.pareja1 || '',
      set2: sets[1]?.pareja1 || '', 
      set3: sets[2]?.pareja1 || ''
    };
    
    const formattedSets2 = {
      set1: sets[0]?.pareja2 || '', 
      set2: sets[1]?.pareja2 || '',
      set3: sets[2]?.pareja2 || ''
    };
  
    // Actualizar solo el estado de la pareja/cancha específica que cambió
    setPuntosPartida(prev => {
      // Asegurarnos de no perder el estado anterior
      const prevStateForGame = prev[idJuego] || {};
      
      console.log("Estado previo para este juego:", prevStateForGame);
      
      const newState = {
        ...prev,
        [idJuego]: {
          ...prevStateForGame,
          [`pareja${parejaIndex}_1`]: formattedSets,
          [`pareja${parejaIndex}_2`]: formattedSets2
        }
      };
      
      console.log("Nuevo estado a guardar:", newState[idJuego]);
      
      // Actualizar la base de datos, pero con un pequeño retraso para evitar problemas de concurrencia
      setTimeout(() => {
        const { canchas } = asignarJugadoresACanchas(
          jugadoresActivos, 
          juegosActivos.find(j => j.id_juego === idJuego)?.num_canchas || 1, 
          idJuego
        );
        
        savePointsToDatabase(idJuego, canchas, newState[idJuego], parejaIndex);
      }, 200);
      
      return newState;
    });
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (juegosActivos.length > 0) {
        juegosActivos.forEach(juego => {
          fetchPuntosActuales(juego.id_juego).then(puntos => {
            if (puntos) {
              setPuntosCancha(prev => ({
                ...prev,
                [juego.id_juego]: puntos
              }));
            }
          });
        });
      }
    }, 10000); // 10 segundos
    
    return () => clearInterval(intervalo); // Limpiar el intervalo al desmontar
  }, [juegosActivos]);

  const asignarJugadoresACanchas = (jugadores, numCanchas, id_juego) => {
    if (parejasActivas[id_juego] && parejasActivas[id_juego].length > 0) {
      const parejas = parejasActivas[id_juego];
      const canchas = [];
      
      for (let i = 0; i < parejas.length; i += 2) {
        const cancha = [];
        
        // Primera pareja
        if (i < parejas.length) {
          cancha.push({
            tipo: 'jugador',
            valor: parejas[i].jugador1
          });
          cancha.push({
            tipo: 'jugador',
            valor: parejas[i].jugador2
          });
        }
        
        // Segunda pareja (si existe)
        if (i + 1 < parejas.length) {
          cancha.push({
            tipo: 'jugador',
            valor: parejas[i + 1].jugador1
          });
          cancha.push({
            tipo: 'jugador',
            valor: parejas[i + 1].jugador2
          });
        }
        
        canchas.push(cancha);
      }
      
      // Calcular jugadores pendientes si hay más jugadores que posiciones en canchas
      const pendientes = [];
      const jugadoresManualesDelJuego = jugadoresManuales[id_juego] || [];
      const totalJugadores = [...jugadores, ...jugadoresManualesDelJuego];
      
      // Contar los jugadores ya asignados a las canchas
      const jugadoresAsignados = new Set();
      canchas.forEach(cancha => {
        cancha.forEach(jugador => {
          if (jugador.tipo === 'jugador' && jugador.valor.id_usuario) {
            jugadoresAsignados.add(jugador.valor.id_usuario);
          }
        });
      });
      
      // Identificar jugadores pendientes (no asignados a canchas)
      totalJugadores.forEach(jugador => {
        if (jugador.id_usuario && !jugadoresAsignados.has(jugador.id_usuario)) {
          pendientes.push({
            tipo: 'jugador',
            valor: jugador
          });
        }
      });
      
      return { canchas, pendientes };
    }
    
    // Si no hay parejas guardadas, usar el comportamiento original
    const jugadoresManualesDelJuego = jugadoresManuales[id_juego] || [];
    const totalJugadores = [...jugadores, ...jugadoresManualesDelJuego];
    const canchas = Array.from({ length: numCanchas }, () => []);
    const pendientes = [];
    const ronda = rondaActual[id_juego] || 0;
    const jugadoresVacios = numCanchas * 4;
  
    let posiciones = Array.from({ length: jugadoresVacios }, (_, i) => ({
      tipo: 'numero',
      valor: `Jugador${i + 1}`
    }));
  
    totalJugadores.forEach((jugador, index) => {
      if (index < jugadoresVacios) {
        posiciones[index] = {
          tipo: 'jugador',
          valor: jugador
        };
      }
    });
  
    if (ronda > 0) {
      const rotacion = ronda % posiciones.length;
      posiciones = [
        ...posiciones.slice(rotacion),
        ...posiciones.slice(0, rotacion)
      ];
    }
  
    posiciones.forEach((posicion, index) => {
      const indiceCancha = Math.floor(index / 4);
      if (indiceCancha < numCanchas) {
        canchas[indiceCancha].push(posicion);
      } else {
        pendientes.push(posicion);
      }
    });
  
    return { canchas, pendientes };
  };

  const handleVerJugadores = async (juego) => {
    setJuegoSeleccionado(juego);
    await fetchJugadoresJuego(juego.id_juego);
    setModalVisible(true);
  };

  const verificarJugadores = async (id_juego) => {
    try {
      setLoadingJugadores(true);
  
      // Hacemos la verificación si existen jugadores en el juego
      const resVerificar = await APIManager({
        url: `Activos/Reta/Reta/verificarJugadores/${id_juego}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (resVerificar && resVerificar.existenJugadas) {
        // Si ya hay jugadores, obtener las parejas de la tabla jugadaReta
        await fetchParejasReta(id_juego);
        await fetchJugadoresReta(id_juego);
        // Obtener los puntos actuales
        const puntos = await fetchPuntosActuales(id_juego);
        if (puntos) {
          setPuntosCancha(prev => ({
            ...prev,
            [id_juego]: puntos
          }));
        }
        
        // Marcar que los jugadores ya están guardados
        setJugadoresGuardados(prevState => ({
          ...prevState,
          [id_juego]: true,
        }));
      } else {
        // Si no hay jugadores, traer los jugadores disponibles del juego
        await fetchJugadoresJuego(id_juego);
      }
  
    } catch (error) {
      console.log("Error al verificar jugadores:", error);
    } finally {
      setLoadingJugadores(false);
    }
  };

  const fetchParejasReta = async (id_juego) => {
    try {
      const res = await APIManager({
        url: `Activos/Reta/Reta/getParejasReta/${id_juego}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      setParejasActivas(prev => ({
        ...prev,
        [id_juego]: res
      }));
    } catch (error) {
      console.log("Error al obtener las parejas de la reta:", error);
    }
  };
const prepareScoreData = (idJuego, canchaIndex) => {
  
  // Get player data from parejasActivas
  const parejasActualesDB = parejasActivas[idJuego] || [];
  
  // Calcular índices para las parejas de esta cancha
  const pair1Index = canchaIndex * 2;
  const pair2Index = canchaIndex * 2 + 1;
  
  // Verificar si tenemos suficientes parejas
  if (pair1Index >= parejasActualesDB.length || pair2Index >= parejasActualesDB.length) {
    console.log(`No hay suficientes parejas para la cancha ${canchaIndex}`);
    return { status: false, puntos: [] };
  }
  
  // Obtener información de las parejas
  const pareja1DB = parejasActualesDB[pair1Index];
  const pareja2DB = parejasActualesDB[pair2Index];
  
  // Extraer nombres de los jugadores (manejando casos donde pueden ser strings u objetos)
  const jugador1Nombre = pareja1DB.jugador1?.us_nomUsuario || pareja1DB.jugador1 || "";
  const jugador2Nombre = pareja1DB.jugador2?.us_nomUsuario || pareja1DB.jugador2 || "";
  const jugador3Nombre = pareja2DB.jugador1?.us_nomUsuario || pareja2DB.jugador1 || "";
  const jugador4Nombre = pareja2DB.jugador2?.us_nomUsuario || pareja2DB.jugador2 || "";
  
  
  // Intentar obtener puntos desde puntosPartida
  const gamePoints = puntosPartida[idJuego] || {};
  
  // Si no hay puntos en puntosPartida, obtener de puntosCancha
  if (!gamePoints[`pareja${canchaIndex}_1`] || !gamePoints[`pareja${canchaIndex}_2`]) {
    console.log(`Buscando puntos en puntosCancha para cancha ${canchaIndex}`);
    const puntosJuego = puntosCancha[idJuego] || [];
    
    // Buscar puntos coincidentes en puntosCancha
    const puntoPareja1 = puntosJuego.find(p => 
      (p.us_jugador1 === jugador1Nombre && p.us_jugador2 === jugador2Nombre) ||
      (p.us_jugador1 === jugador2Nombre && p.us_jugador2 === jugador1Nombre)
    );
    
    const puntoPareja2 = puntosJuego.find(p => 
      (p.us_jugador1 === jugador3Nombre && p.us_jugador2 === jugador4Nombre) ||
      (p.us_jugador1 === jugador4Nombre && p.us_jugador2 === jugador3Nombre)
    );
    
    // Si encontramos puntos, usarlos
    if (puntoPareja1 && puntoPareja2) {
      return {
        status: true,
        puntos: [
          {
            set1: puntoPareja1.set1 || "",
            set2: puntoPareja1.set2 || "",
            set3: puntoPareja1.set3 || "",
            us_jugador1: jugador1Nombre,
            us_jugador2: jugador2Nombre
          },
          {
            set1: puntoPareja2.set1 || "",
            set2: puntoPareja2.set2 || "", 
            set3: puntoPareja2.set3 || "",
            us_jugador1: jugador3Nombre,
            us_jugador2: jugador4Nombre
          }
        ]
      };
    }
  }
  
  const pair1Points = gamePoints[`pareja${canchaIndex}_1`] || { set1: "", set2: "", set3: "" };
  const pair2Points = gamePoints[`pareja${canchaIndex}_2`] || { set1: "", set2: "", set3: "" };
  
    return {
    status: true,
    puntos: [
      {
        set1: pair1Points.set1 || "",
        set2: pair1Points.set2 || "",
        set3: pair1Points.set3 || "",
        us_jugador1: jugador1Nombre,
        us_jugador2: jugador2Nombre
      },
      {
        set1: pair2Points.set1 || "",
        set2: pair2Points.set2 || "", 
        set3: pair2Points.set3 || "",
        us_jugador1: jugador3Nombre,
        us_jugador2: jugador4Nombre
      }
    ]
  };
};

  const fetchJugadoresReta = async (id_juego) => {
    try {
      setLoadingJugadores(true);
      const res = await APIManager({
        url: `Activos/Reta/Reta/getJugadoresReta/${id_juego}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setJugadoresActivos(res);
    } catch (error) {
      console.log("Error al obtener los jugadores de la reta:", error);
    } finally {
      setLoadingJugadores(false);
    }
  };

  const fetchJugadoresJuego = async (id_juego) => {
    try {
      setLoadingJugadores(true);
      const res = await APIManager({
        url: `Activos/Activos/getJugadoresJuego/${id_juego}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setJugadoresActivos(res);
      console.log("jugaores de reta", res);
    } catch (error) {
      console.log("Error al obtener los jugadores:", error);
    } finally {
      setLoadingJugadores(false);
    }
  };

  useEffect(() => {
    if (juegosActivos.length > 0) {
      juegosActivos.forEach(juego => {
        verificarJugadores(juego.id_juego);
      });
    }
  }, [juegosActivos]);
  
  useEffect(() => {
    fetchJuegosActivos();
  }, []);

  

  const renderCanchasJugadores = (juego) => {
    const numCanchas = parseInt(juego.num_canchas);
    const { canchas, pendientes } = asignarJugadoresACanchas(jugadoresActivos, numCanchas, juego.id_juego);
    const nombresCanchas = (juego.nombre_canchas ? juego.nombre_canchas.split(",").map(nombre => nombre.trim()) : []);
    
    // Obtener las parejas actuales de la base de datos para este juego
    const parejasActualesDB = parejasActivas[juego.id_juego] || [];
    
    // Obtener los puntos para este juego
  
    return (
      <View>
        {!jugadoresGuardados[juego.id_juego] && (
        <CustomButton 
          onPress={() => handleVerJugadores(juego)}
          buttonText="Ver Jugadores"
          style={styles.button}
        />
        )}
       
        {canchas.map((jugadoresCancha, index) => {
          // Verificar si hay suficientes parejas para esta cancha
          if (parejasActualesDB.length > 0 && (index * 2 >= parejasActualesDB.length || index * 2 + 1 >= parejasActualesDB.length)) {
            return null;
          }
  
          const nombreCancha = nombresCanchas[index] || `Cancha ${index + 1}`;
          
          // Crear los datos para el componente RetaParejasVS
          const scoreData = prepareScoreData(juego.id_juego, index);
          
          // Solo renderizar si tenemos datos válidos
          if (!scoreData.status) {
            return null;
          }
  
          return (
            <View key={`cancha-${index}`} style={styles.grupoContainer}>
              <RetaParejasVS
                jugador1={scoreData.puntos.length > 0 ? scoreData.puntos[0].us_jugador1 : (jugadoresCancha[0]?.tipo === 'jugador' ? jugadoresCancha[0].valor.us_nomUsuario : jugadoresCancha[0]?.valor || `Jugador ${index * 4 + 1}`)}
                jugador2={scoreData.puntos.length > 0 ? scoreData.puntos[0].us_jugador2 : (jugadoresCancha[1]?.tipo === 'jugador' ? jugadoresCancha[1].valor.us_nomUsuario : jugadoresCancha[1]?.valor || `Jugador ${index * 4 + 2}`)}
                jugador3={scoreData.puntos.length > 0 ? scoreData.puntos[1].us_jugador1 : (jugadoresCancha[2]?.tipo === 'jugador' ? jugadoresCancha[2].valor.us_nomUsuario : jugadoresCancha[2]?.valor || `Jugador ${index * 4 + 3}`)}
                jugador4={scoreData.puntos.length > 0 ? scoreData.puntos[1].us_jugador2 : (jugadoresCancha[3]?.tipo === 'jugador' ? jugadoresCancha[3].valor.us_nomUsuario : jugadoresCancha[3]?.valor || `Jugador ${index * 4 + 4}`)}
                juegoNombre={nombreCancha}
                onPuntosChange={(sets) => handleActualizarPuntos(juego.id_juego, index, sets)}
                initialPuntos={scoreData}
                resetPuntos={false}
              />
            </View>
          );
        })}
          {pendientes.length > 0 && (
            <PendientesEnJugar 
              jugadoresPendientes={pendientes.map(p => 
                p.tipo === 'jugador' ? p.valor.us_nomUsuario : p.valor
              )} 
            />
          )}
  
        <View style={styles.buttonsContainer}>
          <CustomButton 
            buttonText="Guardar Ronda"
            onPress={() => handleGuardarRonda(juego.id_juego, canchas, puntosPartida[juego.id_juego] || {})}
            style={styles.button}
          />
        <CustomButton
            onPress={() => fetchData(historialJuego?.id_juego)} // ✅ Pasa el id_juego correctamente
            buttonText="Ver Historial"
            style={styles.button}
          />
        </View>
        <HistorialTresSets
      visible={historialVisible}
      closeModal={() => setHistorialVisible(false)}
      data={historial}
      onTerminar={() => {
        Alert.alert("Terminar juego", "¿Estás seguro de que deseas terminar el juego?", [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Terminar",
            onPress: async () => {
              try {
                const res = await APIManager({
                  url: `Activos/Reta/Reta/terminarJuego/${historialJuego?.id_juego}`,
                  method: "POST"
                });
                if (res.status) {
                  Alert.alert("Éxito", "Juego terminado correctamente");
                  fetchJuegosActivos(); // ✅ Refrescar lista de juegos activos
                  setModalVisible(false);
                }
              } catch (error) {
                console.log("Error al terminar el juego:", error);
                Alert.alert("Error", "No se pudo terminar el juego");
              }
            }
          }
        ]);
      }}
    />
  </View>
);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8D288E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {juegosActivos.map((juego, index) => (
          <View key={index} style={styles.juegoContainer}>
            {renderCanchasJugadores(juego)}
          </View>
        ))}
      </ScrollView>

      <JugadoresModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (juegoSeleccionado?.id_juego) {
            setJugadoresGuardados(prevState => ({
              ...prevState,
              [juegoSeleccionado.id_juego]: true
            }));
          }
        }}
        jugadores={jugadoresActivos}
        loading={loadingJugadores}
        idJuego={juegoSeleccionado?.id_juego}
        tipoJuego={10} 
        onJugadorAgregado={() => {
          if (juegoSeleccionado?.id_juego) {
            fetchJugadoresReta(juegoSeleccionado.id_juego);
          }
        }}
        onAgregarJugadorManual={(idJuego, jugador) => setJugadoresManuales(prev => ({
          ...prev,
          [idJuego]: [...(prev[idJuego] || []), jugador]
        }))}
        jugadoresManuales={jugadoresManuales[juegoSeleccionado?.id_juego] || []}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    margin: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
  },
  savingText: {
    marginLeft: 10,
    color: '#8D288E',
  },
  container: {
    backgroundColor: "#2e2e2e",
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2e2e2e",
  },
  juegoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  grupoContainer: {
    marginBottom: 15,
  },
  sinCancha: {
    color: "#fff",
    fontSize: 14,
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'cloumn',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  button: {
    minWidth: 120,
  }
});

export default Reta;