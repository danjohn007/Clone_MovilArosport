import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'; // Ensure this import is included
import { faMedal } from '@fortawesome/free-solid-svg-icons';
import colors from '../styles/colors';


import Principal from './screens/Principal';
import Ranking from './screens/Ranking';
import Eventos from './screens/Eventos';
import Perfil from './screens/Perfil';
import InicioSesion from './screens/InicioSesion';
import Registro from './screens/Registro';
import RecuperarContrasena from './screens/RecuperarContrasena';
import CambiarContrasena from './screens/CambiarContrasena';
import Suscripciones from './screens/Suscripciones';
import Club from './screens/Club';
import Canjear from './screens/CanjearClub';
import Notificaciones from './screens/Notificaciones';
import crearJuego from './screens/crearJuego';
import AccesoFraccionamiento from './componentes/AccesoFraccionamiento';
import ReservarFraccionamiento from './screens/ReservarFraccionamiento'
import Solicitudes from './screens/Solicitudes'

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
      <Stack.Screen name="Perfil" component={Perfil} options={{ headerShown: false }} />
      <Stack.Screen name="Suscripciones" component={Suscripciones} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function PrincipalStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Principal" component={Principal} options={{ headerShown: false }} />
      <Stack.Screen name="Notificaciones" component={Notificaciones} options={{ headerShown: false }} />
      <Stack.Screen name="Club" component={Club} options={{ headerShown: false }} />
      <Stack.Screen name="AccesoFraccionamiento" component={AccesoFraccionamiento} options={{ headerShown: false }} />
      <Stack.Screen name="ReservarFraccionamiento" component={ReservarFraccionamiento} options={{ headerShown: false }} />
      <Stack.Screen name="Solicitudes" component={Solicitudes} options={{ headerShown: false }} />


    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: '#2D2F2F',
          paddingBottom: 10,
          borderTopWidth: 0, 
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#bbb',
        tabBarLabelStyle: {
          paddingBottom: 2,
          marginTop: 1,
          textAlign: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Principal"
        component={PrincipalStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iconName="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
          name="Ranking"
          component={Ranking}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <View style={styles.circle} />
                <FontAwesomeIcon 
                  icon={faMedal} 
                  color={color} 
                  size={size} 
                  style={{ marginTop: 5 }} // Aquí se ajusta directamente
                />
              </View>
            ),
          }}
        />

      <Tab.Screen
        name="Eventos"
        component={Eventos}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iconName="calendar-number" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfilStack"
        component={PerfilStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iconName="person" color={color} size={size} />
          ),
          tabBarLabel: 'Perfil'
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="InicioSesion" 
        component={InicioSesion} 
        options={{ headerShown: false }} // Oculta el encabezado para la pantalla de InicioSesion
      />
      <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
      <Stack.Screen 
        name="Registro" 
        component={Registro} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="RecuperarContrasena" 
        component={RecuperarContrasena} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CambiarContrasena" 
        component={CambiarContrasena} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Canjear" 
        component={Canjear} 
        options={{ headerShown: false }} 
      />
       <Stack.Screen 
        name="AccesoFraccionamiento" 
        component={AccesoFraccionamiento} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="ReservarFraccionamiento" 
        component={ReservarFraccionamiento} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Solicitudes" 
        component={Solicitudes} 
        options={{ headerShown: false }} 
      />
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
    position: 'relative', 
    alignItems: 'center', 
  },
  circle: {
    position: 'absolute',
    width: 41,
    height: 41,
    borderRadius: 25,
    backgroundColor: colors.primary,
    top: -5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
});