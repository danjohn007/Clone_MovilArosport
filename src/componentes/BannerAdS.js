import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, StyleSheet, Dimensions, Linking, View } from 'react-native';
import APIManager from './API/APIManager';
import URL from "../Helper/URL";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = URL.imagen;

const BannerAdS = ({ banners }) => {
  
  

  const screenWidth = Dimensions.get('window').width;
  const [currentIndex, setCurrentIndex] = useState(0);



  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);


  const imageUrl = `${BASE_URL}${banners[currentIndex]?.imagen}`;
  return (
    <View style={styles.bannerContainer}>
      <TouchableOpacity onPress={() => Linking.openURL(imageUrl)} style={styles.container}>
        <Image source={{ uri: imageUrl }} style={[styles.image, { width: screenWidth }]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: "absolute",
    bottom: 0, 
    width: "100%",
    alignItems: "center",
  },
  container: {
    alignItems: 'center',
  },
  image: {
    height: 60,
    resizeMode: 'stretch',
  },
});

export default BannerAdS;
