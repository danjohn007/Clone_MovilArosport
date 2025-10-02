import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Pressable, Alert } from "react-native";
import { useAuth } from '../screens/Auth/AuthContext';  
import APIManager from '../componentes/API/APIManager.jsx';  
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from "react-native-vector-icons/Ionicons";
import EditarJugadas from '../modales/EditarJugada.js';
import Ubicacion from '../modales/Ubicacion.js';

const PendienteItem = ({ idJuego, nombreJuego, fecha, hora, onSalirSuccess, modojuego, creador, id_creador, id_lugar, tipo = "fraccionamiento" }) => {
  const { id_usuario } = useAuth();
  const [esCreador, setEsCreador] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleUbiModal, setVisibleUbiModal] = useState(false);

  useEffect(() => {
    if (id_creador == id_usuario) {
      setEsCreador(true);
    };
  }, []);

  const closeModal = () => {
    setVisibleModal(false);
  };

  const closeUbiModal = () =>{
    setVisibleUbiModal(false);
  };

  const handleSalir = async () => {
    if (!idJuego || !id_usuario) {
      Alert.alert("Error", "No se encontró el ID del juego o del usuario.");
      return;
    }

    try {
      const url = `misJuegos/JuegosPendientes/salir_juego/${idJuego}/${id_usuario}`;
      console.log(`📡 Enviando petición: ${url}`);

      const response = await APIManager({
        url: url,
        method: "PUT",
      });

      if (response.status) {
        Alert.alert("Éxito", "Has salido del juego.");
        
        // 👉 Si quieres refrescar la información de los juegos
        if (onSalirSuccess) {
          onSalirSuccess(); 
        }
        
      } else {
        Alert.alert("Error", response.message || "No se pudo salir del juego.");
      }
    } catch (error) {
      console.log("❌ Error al salir del juego:", error);
      Alert.alert("Error", "Hubo un problema al salir del juego.");
    }
  };

    const confirmarSalir = () => {
      Alert.alert(
        "Confirmar salida",
        "¿Estás seguro que deseas salir del juego?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Aceptar", onPress: handleSalir }
        ]
      );
    };


  
    return (
      <View style={styles.frameContainer}>
        <View style={styles.frameWrapper}>
          {/* Columna izquierda - Información */}
          <View style={styles.infoColumn}>
            <View style={styles.headerRow}>
              <Text style={styles.titleGame} numberOfLines={1} ellipsizeMode="tail">
                {nombreJuego}
              </Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.columnDetails}>
                <Ionicons name="calendar-outline" size={17} style={styles.icon} />
                <Text style={styles.textDetails}> {fecha} </Text>
              </View>
              <View style={styles.columnDetails}>
                <Ionicons name="time-outline" size={17} style={styles.icon} />
                <Text style={styles.textDetails}> {hora} </Text>
              </View>
              <View style={styles.columnDetails}>
                <Ionicons name="tennisball-outline" size={17} style={styles.icon} />
                <Text style={styles.textDetails}> {modojuego} </Text>
              </View>
              <View style={styles.columnDetails}>
                <Icon name="person-outline" size={17} style={styles.icon} />
                <Text style={styles.textDetails}> Creado por {creador} </Text>
              </View>
            </View>
          </View>

  
          {/* Columna derecha - Botones */}
          <View style={styles.buttonsColumn}>
            <Pressable style={styles.mapButton} onPress={() => setVisibleUbiModal(true)}>
              <Ionicons name="map-outline" size={18} color="#FFF" />
            </Pressable>

            {esCreador && (
              <Pressable style={styles.editButton} onPress={() => setVisibleModal(true)}>
                <Ionicons name="pencil-outline" size={18} color="#FFF" />
              </Pressable>
            )}
            
            {!esCreador && (
              <Pressable style={styles.exitButton} onPress={confirmarSalir}>
                <Ionicons name="exit-outline" size={19} color="#FFF" />
              </Pressable>
            )}
          </View>
        </View>
  
        <Ubicacion
          visible={visibleUbiModal}
          closeModal={closeUbiModal}
          id={Number(id_lugar)}
          tipo={tipo}
        />
  
        <EditarJugadas
          visible={visibleModal}
          closeModal={closeModal}
          id_juego={idJuego}
          id_user={id_usuario}
        />
      </View>
    );   
  };
  
  const styles = StyleSheet.create({
    frameContainer: {
      width: "100%",
      paddingHorizontal: 12,
      marginBottom: 10,
    },
    frameWrapper: {
      backgroundColor: "#FFF",
      borderWidth: 3,
      borderColor: "colors.primary",
      borderRadius: 16,
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    // Columna de información
    infoColumn: {
      flex: 3,
      paddingRight: 15,
    },
    headerRow: {
      borderBottomWidth: 1.1,
      borderBottomColor: "#EEE",
      paddingBottom: 8,
      marginBottom: 12,
    },
    titleGame: {
      color: "colors.primary",
      fontSize: 17,
      fontWeight: "bold",
    },
    detailsContainer: {
      flexDirection: "column",
      gap: 8,
    },
    columnDetails: {
      flexDirection: "row",
      alignItems: "center",
    },
    textDetails: {
      color: "#838080",
      fontSize: 14,
    },
    icon: {
      marginRight: 8,
      color: "colors.primary",
    },
    // Columna de botones
    buttonsColumn: {
      width: 60, // Aumenté ligeramente el ancho para dar espacio
      justifyContent: 'center',
      alignItems: 'center',
      gap: 15,
      borderLeftWidth: 1.1,
      borderLeftColor: "#EEE",
      paddingLeft: 10, // Espacio entre la línea y los botones
      marginLeft: 5, // Espacio adicional entre el contenido y la línea
    },
    mapButton: {
      backgroundColor: "colors.primary",
      padding: 12,
      borderRadius: 16,
      width: '90%', // Reduje el ancho de los botones para que no toquen la línea
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: "colors.primary",
      padding: 12,
      borderRadius: 16,
      width: '90%',
      alignItems: 'center',
    },
    exitButton: {
      backgroundColor: "colors.primary",
      padding: 12,
      borderRadius: 16,
      width: '90%',
      alignItems: 'center',
    },
  });
  
  export default PendienteItem;