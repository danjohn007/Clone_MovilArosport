import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../screens/Auth/AuthContext";
import APIManager from "../componentes/API/APIManager.jsx";
import MiSuscripcion from "../screens/MiSuscripcion";
import MisJuegos from "../screens/MisJuegos";
import Principal from "../screens/Principal";
import Ranking from "../screens/Ranking";
import Eventos from "../screens/Eventos";
import Perfil from "../screens/Perfil";
import InicioSesion from "../screens/InicioSesion";
import Registro from "../screens/Registro";
import RecuperarContrasena from "../screens/RecuperarContrasena";
import CambiarContrasena from "../screens/CambiarContrasena";
import Suscripciones from "../screens/Suscripciones";
import Club from "../screens/Club";
import Canjear from "../screens/CanjearClub";
import Notificaciones from "../screens/Notificaciones";
import MisTorneos from "../screens/MisTorneos";
import CrearJuego from "../screens/crearJuego";
import Activos from "../screens/Activos";
import Pendientes from "../screens/Pendientes";
import Historial from "../screens/Historial";
import AccesoFraccionamiento from "../componentes/AccesoFraccionamiento";
import ReservarFraccionamiento from "../screens/ReservarFraccionamiento";
import Solicitudes from "../screens/Solicitudes";
import Invitaciones from "../screens/Invitaciones";
import DetallesInvitacion from "../screens/DetallesInvitacion";
import Reservas from "../screens/Reservas";
import ReservaDetalle from "../screens/ReservaDetalle";
import Tienda from "../screens/Tienda";
import MisLigas from "../screens/MisLigas";
import MenuScreen from "../screens/MenuScreen";
import ClubesScreen from "../screens/ClubesScreen";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  guardarTokenNotification,
} from "../Notificacion";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseDatabase } from "../../src/config/firebaseConfig.js";
import { ref, push, set } from "firebase/database";
import Proximamente from '../componentes/Proximamente.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabBarIcon({ iconName, color, size }) {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.circle} />
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
}

function PerfilStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Perfil"
        component={Perfil}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Suscripciones"
        component={Suscripciones}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MiSuscripcion"
        component={MiSuscripcion}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function EventosStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Eventos"
        component={Eventos}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MisTorneos"
        component={MisTorneos}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function ClubesStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Clubes"
        component={ClubesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Club"
        component={Club}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Proximamente"
        component={Proximamente}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function ReservasStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Reservar"
        component={Reservas}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ReservaDetalle"
        component={ReservaDetalle}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function MenuStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Ranking"
        component={Ranking}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CrearJuego"
        component={CrearJuego}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Reservas"
        component={ReservasStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccesoFraccionamiento"
        component={AccesoFraccionamiento}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MisJuegos"
        component={MisJuegos}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Solicitudes"
        component={Solicitudes}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Tienda"
        component={Tienda}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MisLigas"
        component={MisLigas}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Activos"
        component={Activos}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Pendientes"
        component={Pendientes}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Historial"
        component={Historial}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReservarFraccionamiento"
        component={ReservarFraccionamiento}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Invitaciones"
        component={Invitaciones}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetallesInvitacion"
        component={DetallesInvitacion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Suscripciones"
        component={Suscripciones}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MiSuscripcion"
        component={MiSuscripcion}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Proximamente"
        component={Proximamente}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function PrincipalStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Principal"
        component={Principal}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notificaciones"
        component={Notificaciones}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ReservasPrincipal"
        component={ReservasStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CrearJuegoPrincipal"
        component={CrearJuego}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="RankingPrincipal"
        component={Ranking}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MisJuegosPrincipal"
        component={MisJuegos}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "white",
          headerTitle: () => null,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const { id_usuario } = useAuth();

  useEffect(() => {
    if (!id_usuario) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        guardarTokenNotification(token);
      } else {
        Alert.alert(
          "Alerta",
          "No se pudo obtener el token para notificaciones push."
        );
      }
    });

    const updateNotificationCount = async () => {
      try {
        const storedNotifications =
          JSON.parse(await AsyncStorage.getItem("notifications")) || [];
        const unreadNotifications = storedNotifications.filter((n) => !n.leida);
        const newCount = unreadNotifications.length;
        setNotificationCount(newCount);
        await AsyncStorage.setItem(
          "notificationCount",
          JSON.stringify(newCount)
        );
      } catch (error) {
        console.log("Error al actualizar contador de notificaciones:", error);
      }
    };

    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        console.log("📩 Notificación recibida:", notification);
        updateNotificationCount();
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔔 Notificación tocada:", response);
        navigation.navigate("Notificaciones");
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [id_usuario]);

  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const storedCount = await AsyncStorage.getItem("notificationCount");
        if (storedCount !== null) {
          setNotificationCount(JSON.parse(storedCount));
        }
      } catch (error) {
        console.log("Error al cargar el contador de notificaciones:", error);
      }
    };
    loadNotificationCount();
  }, []);

  const irAClubes = () => {
    navigation.navigate("ClubesStack");
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#2D2F2F",
          paddingBottom: 15,
          borderTopWidth: -1,
          height: 80,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarLabelStyle: {
          paddingBottom: -15,
          fontSize: 12,
          textAlign: "center",
        },
      }}
    >
      <Tab.Screen
        name="Principal"
        component={PrincipalStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconName={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ClubesStack"
        component={ClubesStackNavigator}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            irAClubes();
          },
        }}
        options={{
          headerShown: false,
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <View style={styles.iconContainer}>
                <View style={[styles.circle, { backgroundColor: "#00BAFF" }]} />
                <Ionicons
                  name="tennisball"
                  size={size}
                  color="#fff"
                  style={{ alignSelf: "center", marginTop: 3 }}
                />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <View style={[styles.circle, { backgroundColor: "#00BAFF" }]} />
                <Ionicons
                  name="tennisball-outline"
                  size={size}
                  color="#fff"
                  style={{ alignSelf: "center", marginTop: 3 }}
                />
              </View>
            ),
          tabBarLabel: "Clubes",
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <View style={styles.iconContainer}>
                <View style={[styles.circle, { backgroundColor: "#FFF" }]} />
                <Ionicons
                  name="list-sharp"
                  size={size}
                  color="#00BAFF"
                  style={{ alignSelf: "center", marginTop: 3 }}
                />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <View style={[styles.circle, { backgroundColor: "#FFF" }]} />
                <Ionicons
                  name="list-outline"
                  size={size}
                  color="#00BAFF"
                  style={{ alignSelf: "center", marginTop: 3 }}
                />
              </View>
            ),
        }}
      />
      <Tab.Screen
        name="EventosStack"
        component={EventosStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <View style={styles.circle} />
              <Ionicons
                name={focused ? "calendar-number" : "calendar-number-outline"}
                color={color}
                size={size}
                style={{ marginTop: 2 }}
              />
            </View>
          ),
          tabBarLabel: "Eventos",
        }}
      />
      <Tab.Screen
        name="PerfilStack"
        component={PerfilStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconName={focused ? "person" : "person-outline"}
              color={color}
              size={size}
            />
          ),
          tabBarLabel: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator>
      {token == null ? (
        <>
          <Stack.Screen
            name="InicioSesion"
            component={InicioSesion}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Registro"
            component={Registro}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RecuperarContrasena"
            component={RecuperarContrasena}
            options={{
              headerShown: true,
              headerTransparent: true,
              headerTintColor: "white",
              headerTitle: () => null,
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="CambiarContrasena"
            component={CambiarContrasena}
            options={{
              headerShown: true,
              headerTransparent: true,
              headerTintColor: "white",
              headerTitle: () => null,
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="Canjear"
            component={Canjear}
            options={{ headerShown: true }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    alignItems: "center",
  },
  circle: {
    position: "absolute",
    width: 41,
    height: 41,
    borderRadius: 25,
    backgroundColor: "#00BAFF",
    top: -5,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
});
