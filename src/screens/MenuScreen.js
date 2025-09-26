import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Logo from "../componentes/Logo";
import Titulo from "../componentes/Titulo";
import BannerAd from "../componentes/BannerAd";

const menuItems = [
  { id: "1", title: "Ranking", screen: "Ranking", icon: "trophy-outline" },
  { id: "2", title: "Crear Jugada", screen: "CrearJuego", icon: "add-circle-outline" },
  { id: "3", title: "Reservas", screen: "Reservas", icon: "calendar-outline" },
  { id: "4", title: "Clubes", screen: "ClubesStack", icon: "tennisball-outline" },
  { id: "5", title: "Mis Juegos", screen: "MisJuegos", icon: "list-outline" },
  { id: "6", title: "Solicitudes", screen: "Solicitudes", icon: "mail-outline" },
  { id: "7", title: "Eventos", screen: "EventosStack", icon: "megaphone-outline" },
  { id: "8", title: "Perfil", screen: "PerfilStack", icon: "person-outline" },
  { id: "9", title: "Desarrollos", screen: "Proximamente", icon: "business-outline", 
    titulo: "SOLICITAR ACCESO",
    nombreFeature: "Acceso a Fraccionamientos",
    descripcion: "Pronto podrás solicitar acceso directamente desde la aplicación y reservar sus espacios exclusivos" },
  { id: "10", title: "Tienda en línea", screen: "Tienda", icon: "cart-outline" },
  { id: "11", title: "Mis Ligas", screen: "MisLigas", icon: "medal-outline" },
];

const MenuScreen = () => {
  const navigation = useNavigation();

  const handleNavigation = (item) => {
    if (item.screen === "Proximamente" && item.titulo && item.nombreFeature && item.descripcion) {
      navigation.navigate("Proximamente", {
        titulo: item.titulo,
        nombreFeature: item.nombreFeature,
        descripcion: item.descripcion,
      });
    } else {
      navigation.navigate(item.screen);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleNavigation(item)}
    >
      <View style={styles.itemContent}>
        <Ionicons name={item.icon} size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.itemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color="#ffffff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="MENÚ" />
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.containerBaner}>
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
  },
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#2E2E2E",
  },
  listContainer: {
    paddingBottom: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#02B9FA",
    marginBottom: 10,
    width: "90%",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "Poppins",
  },
});

export default MenuScreen;