import React, { useState } from "react";
import { Dimensions, StyleSheet, View, TouchableOpacity } from "react-native";
import { Image, Box } from "native-base";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import APIManager from "../componentes/API/APIManager";
import URL from "../Helper/URL";
import Loader from "../modales/Loader";

const SwiperList = ({ id }) => {
  const navigation = useNavigation();
  const BASE_URL = URL.imagen;
  const [banners, setBanners] = useState([]);

  const getBanners = async () => {
    const data = new FormData();
    data.append("id_club_fraccionamiento", id);
    const response = await APIManager({
      url: `Club/Noticias/Banners_Noticias`,
      method: "POST",
      data: data,
    });

    if (response !== null) {
      setBanners(response.datos);
    } else {
      alert("Revisa tu conexión a internet");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getBanners();
    }, [])
  );

  return (
    <View style={styles.container}>
      {banners === undefined ? (
        <Loader />
      ) : (
        <View style={styles.sliderContainer}>
          <SwiperFlatList
            autoplay
            autoplayDelay={3}
            autoplayLoop
            showPagination={false} 
            paginationStyle={styles.pagination}
          >
            {Array.isArray(banners) &&
              banners.map((banner, index) => (
                <TouchableOpacity key={index} style={styles.slide}>
                  <Box style={styles.card} shadow={4}>
                    <Image
                      source={{ uri: `${BASE_URL}${banner.url_imagen}` }}
                      alt={`banner${index + 1}`}
                      style={styles.image}
                    />
                    {/* Degradado overlay */}
                    <View style={styles.overlay} />
                  </Box>
                </TouchableOpacity>
              ))}
          </SwiperFlatList>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  sliderContainer: {
    width: width,
    height: 180,
  },
  slide: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  card: {
    width: "95%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)", // capa sutil para dar contraste
  },
});

export default SwiperList;