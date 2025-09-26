import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import APIManager from "./API/APIManager.jsx";
import { useAuth } from "../screens/Auth/AuthContext";
 // import JugadorDetalle from "../componentes/JugadorDetalle";

// const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

const capitalizarPrimeraLetra = (texto) => {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

const SearchBar = ({ onJugadorSeleccionado, placeholder = "Buscar...", clearSearch = false }) => {
  const { id_usuario } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false); // Nuevo estado separado
  const inputRef = useRef(null);

  // Limpiar el campo de búsqueda cuando clearSearch cambia a true
  useEffect(() => {
    if (clearSearch) {
      setSearchTerm("");
      setResultados([]);
      setMostrarLista(false);
      if (onJugadorSeleccionado) onJugadorSeleccionado(null);
    }
  }, [clearSearch]);

  const handleSearch = async (text) => {
    setSearchTerm(text);
    setBuscando(true);

    try {
      const data = new FormData();
      data.append("nombre", text);
      data.append("id_usuario", id_usuario);

      const res = await APIManager({
        url: "eventos/Eventos/lista_jugadores",
        method: "POST",
        data: data,
      });

      const resultadosFiltrados = (res?.data || []).filter(
        (jugador) => jugador.id_jugador !== id_usuario
      );

      setResultados(resultadosFiltrados);
      setMostrarLista(resultadosFiltrados.length > 0); // Mostrar lista si hay resultados
    } catch (error) {
      setResultados([]);
      setMostrarLista(false);
    } finally {
      setBuscando(false);
    }
  };

  const handleSeleccionar = async (jugador) => {
    Keyboard.dismiss(); // Cierra el teclado al seleccionar un jugador
    setSearchTerm(jugador.us_nombre || jugador.nombre_completo);
    setResultados([]);
    setMostrarLista(false);

    try {
      const res = await APIManager({
        url: `ranking/FiltroRanking/get_infoSearch?id_jugador=${jugador.id_jugador}`,
        method: "GET",
      });

      // Accede directamente a las propiedades de la respuesta
      const info_usuario = res?.info_usuario || {};

      const rankings = res?.rankings || {};

      const usuario = rankings?.usuario || {};

      // Ahora extrae los datos verificando cada nivel
      const datos = {
        genero: info_usuario?.genero,
        categoria: info_usuario?.nombre_categoria,
        estado: capitalizarPrimeraLetra(info_usuario?.estado),
        pais: capitalizarPrimeraLetra(info_usuario?.pais),
        us_nombre: usuario?.us_nombre,
        us_foto: usuario?.us_foto,
        num_partidos: usuario?.num_partidos,
        jug_puntos: usuario?.jug_puntos,
        ranking: usuario?.ranking,
      };

      if (datos.genero === "M") {
        datos.genero = "Varonil";
      }
      else {
        datos.genero = "Femenil";
      }
      console.log("Datos completos del jugador:", datos);

      if (onJugadorSeleccionado) onJugadorSeleccionado(datos);
    } catch (error) {
      if (onJugadorSeleccionado) onJugadorSeleccionado(null);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <Ionicons name="search" style={styles.icon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={handleSearch}
          onFocus={() => setMostrarLista(resultados.length > 0)}
        />
        {(searchTerm.length > 0) && (
        <TouchableOpacity
          onPress={() => {
            setSearchTerm("");
            setResultados([]);
            setMostrarLista(false);
            if (onJugadorSeleccionado) onJugadorSeleccionado(null);
          }}
        >
          <Ionicons name="close-circle" size={22} color="#aaa" />
        </TouchableOpacity>
      )}
      </View>
      {buscando && (
        <ActivityIndicator
          size="small"
          color="#00baff"
          style={{ marginTop: 10 }}
        />
      )}
      {mostrarLista &&
        searchTerm.length > 0 &&
        !buscando &&
        resultados.length > 0 && (
          <FlatList
            data={resultados}
            keyExtractor={(item) => item.id_jugador.toString()}
            style={styles.lista}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSeleccionar(item)}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Text style={styles.itemText}>
                  {(item.us_nombre || item.nombre_completo) + (item.usuario ? ` (${item.usuario})` : "")}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 47,
    marginBottom: 10,
    borderColor: "#00baff",
    borderWidth: 3,
    width: "95%",
    alignSelf: "center",
  },
  icon: {
    fontSize: 20,
    color: "#aaa",
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: "100%",
  },
  lista: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: "2.5%",
    borderColor: "#00baff",
    borderWidth: 1,
    marginBottom: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    color: "#222",
    fontSize: 15,
  },
});

export default SearchBar;
