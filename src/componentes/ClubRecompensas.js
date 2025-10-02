import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import APIManager from "./API/APIManager";
import CardNR from "./CardNR";
import { useAuth } from "../screens/Auth/AuthContext";
import URL from "../Helper/URL";

const BASE_URL = URL.recompensas;

const Club = ({ route }) => {
  const { id_usuario } = useAuth();
  const { clubName, id } = route.params || {};
  const [recompensas, setRecompensas] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecompensas = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await APIManager({
        url: `Club/Recompensas/mostrar_recompensas/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setRecompensas(res);
    } catch (error) {
      console.log("Error al obtener las recompensas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPuntos = async () => {
    try {
      const res = await APIManager({
        url: `Club/Recompensas/ver_ptsJugador/${id_usuario}/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.error) {
        setPuntos(0);
      } else {
        setPuntos(Number(res[0]?.puntos || 0));
      }
    } catch (error) {
      console.log("Error al obtener los Puntos:", error);
    }
  };

  const handleRefresh = useCallback(() => {
    fetchRecompensas(true);
    fetchPuntos();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRecompensas();
      fetchPuntos();
    }
  }, [id]);

  const handleRecompensaSelect = (recompensa) => {
    const puntosNecesarios = Number(recompensa.pre_ptsnecesario);
    const puntosUsuario = Number(puntos);

    if (puntosNecesarios > puntosUsuario) {
      Alert.alert("Puntos insuficientes", `No tienes los puntos suficientes.`, [
        { text: "Aceptar" },
      ]);
    } else {
      Alert.alert(
        "Confirmar",
        `¿Seguro que quieres canjear "${recompensa.pre_nombre}" por ${puntosNecesarios} puntos?`,
        [
          { text: "Cancelar", onPress: () => console.log("Cancelado") },
          {
            text: "Aceptar",
            onPress: async () => {
              try {
                const res = await APIManager({
                  url: `Club/Recompensas/canjearPuntos/${id_usuario}/${id}/${puntosNecesarios}/${recompensa.id_premios}`,
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });

                if (res.success) {
                  setPuntos(
                    (prevPuntos) =>
                      Number(prevPuntos) - Number(puntosNecesarios)
                  );
                  Alert.alert("Éxito", res.message);
                } else {
                  Alert.alert("Error", res.message);
                }
              } catch (error) {
                console.log("Error al hacer el canje:", error);
                Alert.alert("Error", "Ocurrió un error al procesar el canje.");
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <View style={styles.pointsCard}>
          <View style={styles.pointsContent}>
            <Text style={styles.pointsLabel}>PUNTOS DISPONIBLES PARA CANJEAR EN EL CLUB</Text>
          </View>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{puntos}</Text>
          </View>
        </View>
      </View>

      {/* Lista scrolleable de recompensas */}
      <View style={styles.listContainer}>
        <FlatList
          data={recompensas}
          keyExtractor={(item, index) => `${item.id_premios}-${index}`}
          // ListHeaderComponent={renderHeader} <-- Quita esta línea
          contentContainerStyle={styles.gridScrollContainer}
          renderItem={({ item }) => (
            <View style={{ alignItems: "center", width: "100%" }}>
              <CardNR
                imageSource={{ uri: `${BASE_URL}${item.imagen}` }}
                title={item.pre_nombre}
                date={`${item.pre_ptsnecesario} punto(s) necesario(s)`}
                subtitle={item.pre_descripcion}
                showChevron={false}
                touchable={true}
                onPress={() => handleRecompensaSelect(item)}
              />
            </View>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando recompensas...</Text>
              </View>
            ) : (
              <Text
                style={{ color: "#fff", textAlign: "center", marginTop: 20 }}
              >
                No hay recompensas disponibles para este club.
              </Text>
            )
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["colors.primary"]}
              tintColor="colors.primary"
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
    alignItems: "center",
  },
  gridScrollContainer: {
    paddingBottom: 40,
    width: "100%",
    paddingHorizontal: 10,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: "50%",
    paddingHorizontal: 5,
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
  flexRow: {
    marginBottom: 20,
  },
  profileName: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    color: "#808191",
    textAlign: "center",
    marginLeft: 10,
    flex: 1,
  },
  notificationBadge: {
    borderRadius: 25,
    backgroundColor: "colors.primary",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
  },
  notificationText: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#fff",
  },
  chipContainer: {
    backgroundColor: "#ffff",
    borderRadius: 30,
    width: "75%",
    height: 56,
    borderWidth: 3,
    borderColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  form123Wrapper: {
    width: 44,
    marginTop: 3,
    marginRight: -16,
    justifyContent: "center",
  },
  wrapperSpaceBlock: {
    padding: 12,
    alignItems: "center",
  },
  pointsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderColor: "colors.primary",
    borderWidth: 3,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    height: 80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pointsContent: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8F8F8F",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: 10,
  },
  pointsValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    fontWeight: "700",
  },
  pointsContainer: {
    backgroundColor: "colors.primary",
    borderRadius: 27.5, 
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
});

export default Club;
