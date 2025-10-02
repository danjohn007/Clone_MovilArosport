import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Titulo from "./Titulo";
import Logo from "./Logo";
import BannerAd from "./BannerAd";

const Proximamente = ({ route }) => {
  const {
    titulo = "PRÓXIMAMENTE",
    nombreFeature = "",
    descripcion = "",
    colorTitulo = "colors.primary",
    colorTexto = "#C9C9C9",
    mostrarLogo = true,
    mostrarBanner = true,
    contenidoPersonalizado = null,
    estilosPersonalizados = {},
  } = route.params || {};

  return (
    <View style={[styles.container, estilosPersonalizados.container]}>
      {mostrarLogo && <Logo />}
      <Titulo titulo={titulo} />
      <View style={[styles.content, estilosPersonalizados.content]}>
        <Text
          style={[
            styles.comingSoonText,
            { color: colorTitulo },
            estilosPersonalizados.comingSoonText,
          ]}
        >
          Próximamente:
        </Text>
        <Text
          style={[
            styles.featureText,
            { color: colorTexto },
            estilosPersonalizados.featureText,
          ]}
        >
          {nombreFeature}
        </Text>
        <Text
          style={[
            styles.description,
            { color: colorTexto },
            estilosPersonalizados.description,
          ]}
        >
          {descripcion}
        </Text>
        {contenidoPersonalizado && contenidoPersonalizado}
      </View>
      {mostrarBanner && (
        <View
          style={[styles.containerBaner, estilosPersonalizados.containerBaner]}
        >
          <BannerAd />
        </View>
      )}
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
  content: {
    marginTop: 130,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});

export default Proximamente;
