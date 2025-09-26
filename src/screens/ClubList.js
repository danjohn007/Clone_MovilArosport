import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import URL from "../Helper/URL";
import Ubicacion from "../modales/Ubicacion";
import { RFValue } from "react-native-responsive-fontsize";

const ClubList = ({ clubsFiltrados, selectedDate }) => {
  const navigation = useNavigation();
  const BASE_URL = URL.imagen;

  const irADetalle = (club) => {
    navigation.navigate("ReservaDetalle", { club, selectedDate });
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [idFraccionamientoClub, setIdFraccionamientoClub] = useState(null);

  const handleOpenModal = (id) => {
    setIdFraccionamientoClub(id);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={clubsFiltrados}
        keyExtractor={(item, index) => `club-${index}`}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.clubBox}>
            <Image
              source={{ uri: `${BASE_URL}${item.club.imagen_perfil}` }}
              style={styles.clubImage}
            />
            <View style={styles.infoContainer}>
              <Text style={styles.clubName}>{item.club.nombre}</Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleOpenModal(item.club.id_fraccionamientoclub)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map-outline" size={20} color="#00baff"/>
                  <Text style={styles.buttonTextFooterUbi}>Ver ubicación</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => irADetalle(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-number-outline" size={20} color="#fff"/>
                  <Text style={styles.buttonTextFooter}>Reservar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Ubicacion
        visible={modalVisible}
        closeModal={handleCloseModal}
        id={idFraccionamientoClub}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  clubBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#00baff",
    marginBottom: 20,
    overflow: "hidden",
    elevation: 5,
  },
  clubImage: {
    width: "100%",
    height: 120,
    resizeMode: "stretch",
  },
  infoContainer: {
    padding: 10,
  },
  clubName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -35,
  },
  ubicacionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ubicacionText: {
    color: "#4CAF50",
    marginLeft: 5,
    fontSize: 14,
  },
  reservarBtn: {
    backgroundColor: "#02B9FA",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonTextFooter: {
    color: "#fff",
    fontSize: RFValue(12, 667),
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonTextFooterUbi: {
    color: "#00baff",
    fontSize: RFValue(12, 667),
    fontWeight: "600",
    marginLeft: 8,
  },
  acceptButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
});

export default ClubList;