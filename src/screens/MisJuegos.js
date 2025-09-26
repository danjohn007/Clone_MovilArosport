import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import Logo from "../componentes/Logo";
import Titulo from "../componentes/Titulo";
import Activos from "../screens/Activos";
import Pendientes from "../screens/Pendientes";
import Historial from "./Historial";
import MenuItem from "../componentes/MenuItem";
import BannerAd from "../componentes/BannerAd";

const MisJuegos = () => {
  const route = useRoute();
  // Set the initial state to 'activos' to make it the default selection
  const { selectedItem: initialSelectedItem } = route.params || {}; // Lee el parámetro si existe

  // Setea el estado inicial basándose en lo que llega, sino default "activos"
  const [selectedItem, setSelectedItem] = useState(
    initialSelectedItem || "activos"
  );

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="MIS JUEGOS" />
      <View style={styles.menu}>
        <MenuItem
          label="ACTIVOS"
          isActive={selectedItem === "activos"}
          onPress={() => handleSelectItem("activos")}
        />
        <MenuItem
          label="PENDIENTES"
          isActive={selectedItem === "pendientes"}
          onPress={() => handleSelectItem("pendientes")}
        />
        <MenuItem
          label="HISTORIAL"
          isActive={selectedItem === "historial"}
          onPress={() => handleSelectItem("historial")}
        />
      </View>

      {selectedItem === "activos" && (
        <Activos handleSelectItem={handleSelectItem} />
      )}
      {selectedItem === "pendientes" && <Pendientes />}
      {selectedItem === "historial" && <Historial />}

      <View style={styles.containerBaner}>
        <View
          style={{ borderTopWidth: 8, borderTopColor: "#2E2E2E", width: "100%" }}
        />
        <BannerAd />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2E2E2E",
    paddingBottom: 50,
  },
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#2E2E2E", // <-- Asegura el fondo oscuro
  },
  contenido: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 1,
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
});

export default MisJuegos;
