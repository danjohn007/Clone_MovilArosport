import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import APIManager from "./API/APIManager";
import CardNR from "../componentes/CardNR";
import URL from "../Helper/URL";
import SwiperList from "../componentes/SwiperList";
import { Center } from "native-base";

const ClubNoticias = ({ route }) => {
  const { clubName, id } = route.params || {};
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const BASE_URL = URL.imagen;

  useEffect(() => {
    console.log("Parámetros recibidos en Club:", route?.params);
  }, [route?.params]);

  const fetchNoticias = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await APIManager({
        url: `Club/Noticias/mostrar_noticias/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("información de noticiass", res);
      setNoticias(res);
    } catch (error) {
      console.log("Error al obtener las Noticias:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    fetchNoticias(true);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchNoticias();
    }
  }, [id]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Center>
        <SwiperList id={id} />
      </Center>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.listContainer}>
        <FlatList
          data={noticias}
          keyExtractor={(item, index) => `${item.id_noticias}-${index}`}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.gridScrollContainer}
          renderItem={({ item }) => {
            const imageUrl = `${BASE_URL.replace(
              /\/$/,
              ""
            )}/${item.not_imagen.replace(/^\//, "")}`;
            console.log("URL de imagen:", imageUrl);

            return (
              <View style={{ alignItems: "center", width: "100%" }}>
                <CardNR
                  imageSource={{ uri: imageUrl }}
                  title={item.not_titulo}
                  subtitle={item.not_descripcion}
                  date={item.fecha_creacion}
                  showChevron={false}
                  touchable={false}
                />
              </View>
            );
          }}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <Text
                style={{ color: "#fff", textAlign: "center", marginTop: 20 }}
              >
                No hay noticias disponibles para este club
              </Text>
            )
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#00baff"]}
              tintColor="#00baff"
            />
          }
          style={styles.scrollView}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingBottom: "20%",
  },
  headerContainer: {
    marginBottom: 25,
  },
  gridScrollContainer: {
    paddingBottom: 40,
    width: "100%",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});

export default ClubNoticias;
