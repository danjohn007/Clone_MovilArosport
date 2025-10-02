import React, { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import Titulo from "../componentes/Titulo";
import ComponenteNotificaciones from "../componentes/ComponenteNotificaciones";
import Logo from "../componentes/Logo";
import BannerAd from "../componentes/BannerAd";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { useAuth } from "../screens/Auth/AuthContext";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { app } from "../../src/config/firebaseConfig";
import APIManager from "../componentes/API/APIManager";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [juegoProximo, setJuegoProximo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id_usuario } = useAuth();
  const navigation = useNavigation();

  const obtenerProximoJuego = async () => {
    setIsLoading(true);
    try {
      const idUsuario = await AsyncStorage.getItem("id_usuario");
      if (!idUsuario) {
        console.warn("No se encontró el ID de usuario en AsyncStorage.");
        setIsLoading(false);
        return;
      }
      const res = await APIManager({
        url: `eventos/BrackeTorneo/juegos_usuario/${idUsuario}`,
        method: "GET",
      });
      if (res && res.length > 0) {
        setJuegoProximo(res[0]);
      } else {
        setJuegoProximo(null);
      }
    } catch (error) {
      console.log("Error obteniendo el próximo juego:", error);
      setJuegoProximo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    obtenerProximoJuego();
  }, []);

  const formatoFecha = (fecha) => {
    return moment(fecha).format("DD MMM, YYYY");
  };

  useEffect(() => {
    if (!id_usuario) return;

    const db = getDatabase(app);
    const notificacionesRef = ref(db, `notificaciones/${id_usuario}`);

    const unsubscribe = onValue(notificacionesRef, async (snapshot) => {
      const data = snapshot.val();
      const nuevasNotificaciones = [];

      if (data) {
        for (const key in data) {
          const notif = data[key];
          if (!notif.leida) {
            update(ref(db, `notificaciones/${id_usuario}/${key}`), {
              leida: true,
            });
          }

          nuevasNotificaciones.push({
            id: key,
            ...notif,
          });
        }

        nuevasNotificaciones.sort((a, b) => b.fecha - a.fecha);
      }

      setNotificaciones(nuevasNotificaciones);
    });

    return () => unsubscribe();
  }, [id_usuario]);

  const deleteNotification = async (id) => {
    try {
      const db = getDatabase(app);
      await remove(ref(db, `notificaciones/${id_usuario}/${id}`));
    } catch (error) {
      console.log("Error al eliminar la notificación:", error);
    }
  };

  const handleDeletePress = () => {
    if (selectedNotifications.length === 0) {
      Alert.alert("Selecciona notificaciones", "Por favor selecciona al menos una notificación para eliminar");
    } else {
      Alert.alert(
        "Confirmar eliminación",
        "¿Está seguro que desea eliminar las notificaciones seleccionadas?",
        [
          {
            text: "Cancelar",
            onPress: () => {
              setSelectedNotifications([]);
              setSelectAll(false);
            },
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: async () => {
              try {
                const db = getDatabase(app);
                const updates = {};
                selectedNotifications.forEach((id) => {
                  updates[`notificaciones/${id_usuario}/${id}`] = null;
                });
                await update(ref(db), updates);
                setSelectedNotifications([]);
                setSelectAll(false);
              } catch (error) {
                console.log("Error eliminando notificaciones:", error);
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notificaciones.map((n) => n.id));
    }
    setSelectAll(!selectAll);
  };

  const renderItem = ({ item }) => (
    <ComponenteNotificaciones
      key={item.id}
      titulo={item.titulo}
      descripcion={item.descripcion}
      fechaHora={item.fecha}
      leida={item.leida}
      onSwipeLeft={() => deleteNotification(item.id)}
      isSelected={selectedNotifications.includes(item.id)}
      onToggleSelect={() => toggleSelectNotification(item.id)}
      showCheckbox={selectedNotifications.length > 0}
    />
  );

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="NOTIFICACIONES" />

      {/* Juego próximo */}
      <TouchableOpacity
        style={styles.juegoProximoNotification}
        onPress={() => {
          if (juegoProximo) {
            navigation.navigate("MisJuegosPrincipal", { selectedItem: "pendientes" });
          }
        }}
        disabled={isLoading || !juegoProximo}
      >
        <Icon
          name="calendar-outline"
          size={28}
          color={"colors.primary"}
          style={styles.juegoProximoIcon}
        />
        <View style={styles.notificationContent}>
          <Text style={styles.juegoProximoTitulo}>
            {isLoading ? "Obteniendo juego próximo" : "Juego cercano"}
          </Text>
          {!isLoading && juegoProximo && juegoProximo.rival && (
            <Text style={styles.descripcion}>{`vs ${juegoProximo.rival}`}</Text>
          )}
          {!isLoading && juegoProximo && juegoProximo.jue_fecha && (
            <Text style={styles.juegoProximoFecha}>
              {formatoFecha(juegoProximo.jue_fecha)}
            </Text>
          )}
        </View>

        <Icon
          name="chevron-forward"
          size={24}
          color={isLoading || !juegoProximo ? "#ccc" : "colors.primary"}
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      {/* Barra de acciones - SIEMPRE VISIBLE */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={toggleSelectAll}
        >
          <Ionicons
            name="checkbox-outline"
            size={24}
            color={selectAll ? "colors.primary" : "#fff"}
          />
          <Text style={[styles.actionText, { color: selectAll ? "colors.primary" : "#fff" }]}>Seleccionar todo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          disabled={selectedNotifications.length === 0}
          onPress={handleDeletePress}
        >
          <Ionicons 
            name="trash" 
            size={24} 
            color={selectedNotifications.length > 0 ? "colors.primary" : "#666"} 
          />
          <Text style={[
            styles.actionText,
            { color: selectedNotifications.length > 0 ? "colors.primary" : "#666" }
          ]}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de notificaciones */}
      <FlatList
        data={notificaciones}
        renderItem={renderItem}
        keyExtractor={(item) => `notif-${item.id}`}
        contentContainerStyle={styles.list}
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
  },
  list: {
    paddingBottom: "25%",
  },
  juegoProximoNotification: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 16,
    justifyContent: "space-between",
    width: "94%",
    minHeight: 80,
    borderWidth: 3,
    borderColor: "colors.primary",
  },
  juegoProximoIcon: {
    marginRight: 8,
    marginLeft: 12,
  },
  juegoProximoTitulo: {
    color: "colors.primary",
    fontWeight: "bold",
    fontSize: 16,
  },
  juegoProximoFecha: {
    color: "#838080",
    fontSize: 14,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  descripcion: {
    color: "lightgray",
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default Notificaciones;