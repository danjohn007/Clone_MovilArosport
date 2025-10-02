import { View, StyleSheet, Text } from 'react-native';
import React from 'react';
import Titulo from '../componentes/Titulo'; // Asegúrate de que la ruta sea correcta
import Logo from '../componentes/Logo'; // Importa el componente Logo
import BannerAd from '../componentes/BannerAd';

const Tienda = () => {
  return (
    <View style={styles.container}>
      <Logo />

      <Titulo titulo="TIENDA" />

      <View style={styles.content}>
        <Text style={styles.comingSoonText}>Próximamente:</Text>
        <Text style={styles.onlineStoreText}>Tienda Online</Text>
        <Text style={styles.description}>
          Descubre productos exclusivos y ofertas especiales muy pronto
        </Text>
      </View>

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
    backgroundColor: '#2E2E2E',
  },
  containerBaner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 10,
  },
  content: {
    marginTop: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary, // Color del texto principal
    textTransform: 'uppercase',
  },
  onlineStoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C9C9C9', // Contraste claro
    textAlign: 'center',
  },
  description: {
    marginTop: 16,
    fontSize: 16,
    color: '#C9C9C9',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
});

export default Tienda;
