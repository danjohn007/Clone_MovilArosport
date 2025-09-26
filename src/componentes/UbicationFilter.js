import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import ModalUbicationFilter from "../modales/ModalUbicationFilter";
import countries from '../../assets/countries.json';
import states from '../../assets/states.json';
import { RFValue } from "react-native-responsive-fontsize";

function quitarAcentos(texto) {
  return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
}

const UbicationFilter = ({ onSelect, initialCountry, initialState, disabled }) => {
  const [selected, setSelected] = useState("Global");
  const [showModalPais, setShowModalPais] = useState(false);
  const [showModalEstado, setShowModalEstado] = useState(false);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);

  const hasStates = useMemo(() => {
    if (!paisSeleccionado) return false;
    const matchCountry = countries.find(
      c =>
        quitarAcentos(c.name).toLowerCase().trim() ===
        quitarAcentos(paisSeleccionado).toLowerCase().trim()
    );
    if (!matchCountry) return false;
    return states.some(s => s.country_id === matchCountry.id);
  }, [paisSeleccionado]);

  useEffect(() => {
    if (initialCountry) {
      // Busca el país cuyo nombre normalizado coincida
      const matchCountry = countries.find(
        c =>
          quitarAcentos(c.name).toLowerCase().trim() ===
          quitarAcentos(initialCountry).toLowerCase().trim()
      );
      if (matchCountry) {
        setSelected("Nacional");
        setPaisSeleccionado(matchCountry.name);
        if (onSelect) onSelect("Nacional", matchCountry.name, null);
        if (initialState) {
          const matchState = states.find(
            s =>
              s.country_id === matchCountry.id &&
              quitarAcentos(s.name).toLowerCase().trim() ===
                quitarAcentos(initialState).toLowerCase().trim()
          );
          if (matchState) {
            setSelected("Estatal");
            setEstadoSeleccionado(matchState.name);
            if (onSelect) onSelect("Estatal", matchCountry.name, matchState.name);
          }
        }
      }
    }
  }, [initialCountry, initialState, onSelect]);

  const handleGlobal = () => {
    setSelected("Global");
    setPaisSeleccionado(null);
    setEstadoSeleccionado(null);
    if (onSelect) onSelect("Global", null, null);
  };

  const handleNacional = () => {
    setSelected("Nacional");
    setShowModalPais(true);
    if (onSelect) onSelect("Nacional", paisSeleccionado, null);
  };

  const handleEstatal = () => {
    if (!paisSeleccionado) {
      Alert.alert("Error", "Primero selecciona un país en Nacional.");
      return;
    }
    if (!hasStates) {
      Alert.alert("Sin estados", "Este país no tiene estados disponibles.");
      return;
    }
    setSelected("Estatal");
    setShowModalEstado(true);
    if (onSelect) onSelect("Estatal", paisSeleccionado, estadoSeleccionado);
  };

  return (
    <View style={styles.row}>
      {/* Pill Global */}
      <View style={styles.pillContainer}>
        <TouchableOpacity
          style={[styles.pill, selected === "Global" && styles.pillSelected, disabled && { opacity: 0.5 }]}
          onPress={() => !disabled && handleGlobal()}
          activeOpacity={0.9}
          disabled={disabled}
        >
          <Text
            style={[
              styles.pillTitle,
              selected === "Global" && styles.pillTitleSelected,
            ]}
          >
            Global
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pill Nacional */}
      <View style={styles.pillContainer}>
        <TouchableOpacity
          style={[styles.pill, selected === "Nacional" && styles.pillSelected, disabled && { opacity: 0.5 }]}
          onPress={() => !disabled && handleNacional()}
          activeOpacity={0.9}
          disabled={disabled}
        >
          <Text
            style={[
              styles.pillTitle,
              selected === "Nacional" && styles.pillTitleSelected,
            ]}
          >
            Nacional
          </Text>
        </TouchableOpacity>
        {paisSeleccionado && (
          <Text style={styles.selectedText}>{paisSeleccionado}</Text>
        )}
      </View>

      {/* Pill Estatal */}
      <View style={styles.pillContainer}>
        <TouchableOpacity
          style={[
            styles.pill,
            selected === "Estatal" && styles.pillSelected,
            (disabled || !hasStates || !paisSeleccionado) && { opacity: 0.5 },
          ]}
          onPress={() => !disabled && handleEstatal()}
          activeOpacity={0.9}
          disabled={disabled || !hasStates || !paisSeleccionado}
        >
          <Text
            style={[
              styles.pillTitle,
              selected === "Estatal" && styles.pillTitleSelected,
            ]}
          >
            Estatal
          </Text>
        </TouchableOpacity>
        {estadoSeleccionado && (
          <Text style={styles.selectedText}>{estadoSeleccionado}</Text>
        )}
      </View>

      {/* Modal para seleccionar país */}
      <ModalUbicationFilter
        visible={showModalPais}
        tipo="pais"
        onSelect={(pais) => {
          setPaisSeleccionado(pais);
          setEstadoSeleccionado(null); // Resetear estado al cambiar país
          setShowModalPais(false);
          if (selected === "Nacional" && onSelect) onSelect("Nacional", pais, null);
          // Si estaba en Estatal pero el país no tiene estados, volver a Nacional
          if (selected === "Estatal" && !hasStates) {
            setSelected("Nacional");
            if (onSelect) onSelect("Nacional", pais, null);
          }
        }}
        onClose={() => setShowModalPais(false)}
        disableClose={!paisSeleccionado}
      />

      {/* Modal para seleccionar estado */}
      <ModalUbicationFilter
        visible={showModalEstado}
        tipo="estado"
        pais={paisSeleccionado}
        onSelect={(estado) => {
          setEstadoSeleccionado(estado);
          setShowModalEstado(false);
          if (selected === "Estatal" && onSelect) onSelect("Estatal", paisSeleccionado, estado);
        }}
        onClose={() => setShowModalEstado(false)}
        disableClose={!estadoSeleccionado}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    width: "100%",
  },
  pillContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 10,
  },
  pill: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "#00baff",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    width: "100%",
  },
  pillSelected: {
    backgroundColor: "#00baff",
    borderColor: "#00baff",
  },
  pillTitle: {
    color: "#808191",
    fontSize: RFValue(12, 667),
    textAlign: "center",
  },
  pillTitleSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedText: {
    marginTop: 6,
    color: "#00baff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: RFValue(10, 667),
  },
});

export default UbicationFilter;