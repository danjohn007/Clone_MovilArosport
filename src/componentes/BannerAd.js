import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, StyleSheet, Dimensions, Linking, View } from 'react-native';
import APIManager from './API/APIManager';
import URL from "../Helper/URL";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // Asegúrate de tenerlo instalado


const BASE_URL = URL.imagen;

const BannerAd = () => {
  const screenWidth = Dimensions.get('window').width;
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [estadoDetectado, setEstadoDetectado] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
  fetchBanners();
    }, [])
);

useEffect(() => {
if (banners.length > 0) {
  const interval = setInterval(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
  }, 5000);
  return () => clearInterval(interval);
}
}, [banners]);



const fetchBanners = async () => {
  const estado = await AsyncStorage.getItem('estado_usuario');
  const pais = await AsyncStorage.getItem('pais_usuario'); 

  try {
    let url = 'Banners/Banners/getBanners';
    
    const params = [];
    if (estado) params.push(`estado=${encodeURIComponent(estado)}`);
    if (pais) params.push(`pais=${encodeURIComponent(pais)}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    const res = await APIManager({
      url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // console.log("Banners obtenidos:", res);
    if (res && Array.isArray(res)) {
      setBanners(res);
    }
  } catch (error) {
    console.log('Error al obtener los Banners:', error);
  }
};

 



  const imageUrl = `${BASE_URL}${banners[currentIndex]?.imagen}`;
const linkUrl = banners[currentIndex]?.url_destino; // URL a la que quieres redirigir


  return (
    <View style={styles.bannerContainer}>
      <TouchableOpacity 
        onPress={() => {
          if (linkUrl) {
            Linking.openURL(linkUrl); // abre la URL del banner, no la de la imagen
          }
        }} 
      style={styles.container}>
        <Image source={{ uri: imageUrl }} style={[styles.image, { width: screenWidth }]} />
      </TouchableOpacity>
    </View>
  );
};




const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 2,
  },
  container: {
    alignItems: 'center',
  },
  image: {
    height: 70,
    resizeMode: 'stretch',
  },
});

export default BannerAd;
