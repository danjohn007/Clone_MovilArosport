import * as React from "react";
import { useEffect, useState } from "react";
import { Text, StyleSheet, View, Alert, ActivityIndicator, ScrollView, Dimensions, RefreshControl } from "react-native";
import PendienteItem from "../componentes/PendienteItem";
import { useAuth } from './Auth/AuthContext';
import APIManager from '../componentes/API/APIManager.jsx';

const PENDIENTES = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [juegosPendientes, setJuegosPendientes] = useState([]);
  const { id_usuario, token } = useAuth();

  useEffect(() => {
    if (id_usuario) {
      fetchJuegosPendientes();
    }
  }, [id_usuario]);

  const fetchJuegosPendientes = async () => {
    if (!id_usuario) {
      console.log("No hay id_usuario, no se puede hacer la petición.");
      return;
    }
  
    console.log(`Iniciando fetch de juegos pendientes para id_usuario: ${id_usuario}`);
  
    setLoading(true);
    try {
      const url = `misJuegos/JuegosPendientes/obtener_juegos/${id_usuario}`;
      console.log(`Llamando a la API: ${url}`);
  
      const response = await APIManager({
        url: url,
        method: 'GET',
      });
  
      if (response.status) {
        if (!Array.isArray(response.juegos)) {
          console.log("Error: 'response.juegos' no es un array.", response.juegos);
          setJuegosPendientes([]);
          return;
        }
  
        if (response.juegos.length === 0) {
          console.log("No hay juegos pendientes.");
          setJuegosPendientes([]);
        } else {
          setJuegosPendientes(response.juegos);
        }
      } else {
        console.log("Error en la respuesta de la API:", response.message);
        setJuegosPendientes([]);
      }
    } catch (error) {
      console.log("Error al obtener juegos pendientes:", error);
      setJuegosPendientes([]);
    } finally {
      setLoading(false);
      console.log("Fetch finalizado");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJuegosPendientes();
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
            juegosPendientes.length > 0 ? (
              juegosPendientes.map((juego, index) => {
                return (
                  <PendienteItem
                    key={juego.id_juego || index}
                    idJuego={juego.id_juego}
                    nombreJuego={juego.jue_nombre}
                    fecha={juego.jue_fecha}
                    hora={juego.jue_hora}
                    modojuego={juego.mod_nombre}
                    creador={juego.us_nomUsuario}
                    id_creador={juego.id_usuario}
                    id_lugar={juego.id_fraccionamientoclub || juego.id_direccion}
                    tipo ={juego.tipo || "fraccionamiento"}
                    onSalirSuccess={fetchJuegosPendientes}
                  />
                );
              })
              
            ) : (
              <Text style={styles.noJuegosText}>No hay juegos pendientes</Text>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  pendientes: {
    backgroundColor: "#2e2e2e",
    flex: 1,
    alignItems: "center",
  },
  noJuegosText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7
  },
  frameGroup: {
    marginTop: screenWidth * 0.04, 
    width: screenWidth * 0.90,     
    gap: screenWidth * 0.030,      
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 55,
    alignItems: 'center', 
  }
});

export default PENDIENTES;
