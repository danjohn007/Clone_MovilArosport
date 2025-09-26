import { Text, StyleSheet, View, Alert, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import HistorialPartidos from "../componentes/HistorialPartidos";
import APIManager from "../componentes/API/APIManager";
import { useAuth } from "../screens/Auth/AuthContext";
import React, { useState, useEffect } from "react";
import PendienteItem from "../componentes/PendienteHistorial";

const HISTORIAL = () => {
  const { id_usuario } = useAuth();
  const [juegosActivos, setJuegosActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJuegosActivos = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Activos/Activos/mostrar_finalizados/${id_usuario}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      setJuegosActivos(res);
    } catch (error) {
      console.log("Error al obtener los juegos finalizados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuegosActivos();
  }, [id_usuario]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJuegosActivos();
    setRefreshing(false);
  };

  return (
    <View style={styles.pendientes}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00baff']} // Android
            tintColor="#00baff" // iOS
          />
        }
      >
        <View style={styles.frameGroup}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" marginTop={100} />
          ) : (
            juegosActivos.length > 0 ? (
              juegosActivos.map((juego, index) => (
                <PendienteItem
                  key={juego.id_juego || index}
                  idJuego={juego.id_juego}
                  nombreJuego={juego.jue_nombre}
                  fecha={juego.jue_fecha}
                  hora={juego.jue_hora}
                  modalidad={juego.mod_nombre}
                  creador={juego?.creador}
                  tipoJuego={juego.id_modojuego}
                />
              ))
            ) : (
              <Text style={styles.noJuegosText}>No hay juegos finalizados.</Text>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

  const styles = StyleSheet.create({
    noJuegosText: {
      color: "#fff",
      fontSize: 18,
      textAlign: "center",
      marginTop: 20,
      opacity: 0.7
    },
    frameGroup: {
      marginTop: 15 * 1.15,
      //width: 229 * 1.15,
      width: "100%",
      //gap: 9 * 1.15,
      alignItems: "center",
    },
    scrollContainer: {
      marginHorizontal: "5%",
      paddingBottom: 275, // Espaciado al final para que la última tarjeta no se oculte
      alignItems: 'center',
    }
  });
  

export default HISTORIAL;
