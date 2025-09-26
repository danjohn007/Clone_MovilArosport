import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import APIManager from "../componentes/API/APIManager";
import { useAuth } from "../screens/Auth/AuthContext";
import Americana from "../componentes/Activos/Americana";
import Rey from "../componentes/Activos/Rey";
import Reta from "../componentes/Activos/Reta2";
import SeisLoco from "../componentes/Activos/SeisLoco";
import AmericanaParejas from "../componentes/Activos/AmericanaParejas";

const COMPONENTES_MODOS = {
  1: Americana,
  2: Rey,
  10: Reta,
  14: SeisLoco,
  15: AmericanaParejas,
};

const Activos = ({ handleSelectItem }) => {
  const { id_usuario } = useAuth();
  const [juegosActivos, setJuegosActivos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Extraemos para poder llamar desde otros lados
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
    fetchJuegosActivos();
  }, [id_usuario]);

  // Función para actualizar solo el nombre de canchas en un juego específico
  const actualizarNombresCanchas = (id_juego, nuevosNombres) => {
    setJuegosActivos((prev) =>
      prev.map((j) =>
        j.id_juego === id_juego ? { ...j, nombre_canchas: nuevosNombres } : j
      )
    );
    // NO toca loading aquí, solo actualiza estado local
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" />;
  }

  return (
    <View style={styles.container}>
      {juegosActivos.length === 0 ? (
        <Text style={styles.noJuegosText}>No hay juegos activos</Text>
      ) : (
        juegosActivos.map((juego) => {
          const Componente = COMPONENTES_MODOS[juego.id_modojuego];
          return Componente ? (
            <Componente
              key={juego.id_juego}
              juego={juego}
              onTerminarJuego={() => handleSelectItem("historial")}
              actualizarNombresCanchas={actualizarNombresCanchas}
            />
          ) : null;
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  noJuegosText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
  },
});

export default Activos;