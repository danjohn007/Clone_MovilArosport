import React, { useEffect, useState, useRef } from "react";
import {
  useFonts,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { NativeBaseProvider } from "native-base";
import Navigation from "./src/Navigation/Navigation";
import { AuthProvider } from "./src/screens/Auth/AuthContext";
import { LogBox } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

const theme = {};

LogBox.ignoreLogs([
  "In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.",
  "VirtualizedLists should never be nested inside plain ScrollViews",
]);

export default function App() {
  const [fontLoaded, fontError] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });
  useEffect(() => {
    if (Platform.OS === "android") {
      // Oculta la barra de navegación (modo inmersivo)
      NavigationBar.setVisibilityAsync("hidden");
      // Opcional: para que la barra sea transparente si aparece
      NavigationBar.setBackgroundColorAsync("transparent");
    }
  }, []);

  if (!fontLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      {/*SafeAreaView style={{ flex: 1, backgroundColor: "#2E2E2E" }}*/}
        <NativeBaseProvider>
          <AuthProvider>
            <StripeProvider publishableKey="pk_test_51Qn0owBM5jYCkb8pjJw99eg3i6Jr3UOcZouRGbmUTU1mEg5HOhXCYpY6IFtMujQcA2JyFgE41NmeHLompHM4QYRf00lTEJuJ7F">
              <StatusBar hidden />
              <Navigation />
            </StripeProvider>
          </AuthProvider>
        </NativeBaseProvider>
      {/*</SafeAreaView>*/}
    </SafeAreaProvider>
  );
}
