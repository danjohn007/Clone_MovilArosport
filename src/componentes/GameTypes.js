import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import GameInfoModal from "./GameInfoModal";
import APIManager from "./API/APIManager";
import colors from "../styles/colors";

const GameFilter = ({ selectedGameModeId, setSelectedGameModeId }) => {
  const [gameTypes, setGameTypes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isGameTypeModalVisible, setGameTypeModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGameTypes = async () => {
    try {
      setLoading(true);
      const response = await APIManager({
        url: `CrearJuego/CrearJuego/mostrar_jugadas`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setGameTypes(response);
    } catch (error) {
      console.log("Error al obtener los tipos de juego:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameTypes();
  }, []);

  const handleSelectGame = (index) => {
    setSelectedIndex(index);
    const selectedId = gameTypes[index].id_modojuego;
    setSelectedGameModeId(selectedId);
    setGameTypeModalVisible(false);
    setModalVisible(true); // Abrir modal de información después de seleccionar
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.textMuted} />;
  }

  return (
    <View style={styles.jugadaContainer}>
      {/* Card con placeholder */}
      <TouchableOpacity
        style={styles.gameTypeCard}
        onPress={() => setGameTypeModalVisible(true)}
      >
        <Ionicons
          name="tennisball-outline"
          size={24}
          color={colors.primaryLight}
          style={{ marginRight: 10 }}
        />
        <Text style={styles.cardText}>
          {selectedIndex >= 0
            ? gameTypes[selectedIndex].mod_nombre
            : "Seleccione un tipo de juego *"}
        </Text>
      </TouchableOpacity>

      {/* Modal para selección de tipos de juego */}
      <Modal
        visible={isGameTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGameTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setGameTypeModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ScrollView
                  style={styles.pillsScrollView}
                  contentContainerStyle={styles.pillsContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {gameTypes.map((item, index) => (
                    <TouchableOpacity
                      key={item.id_modojuego}
                      onPress={() => handleSelectGame(index)}
                      style={[
                        styles.pill,
                        selectedIndex === index && styles.selectedPill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          selectedIndex === index && styles.selectedPillText,
                        ]}
                      >
                        {item.mod_nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de información del tipo de juego */}
      <GameInfoModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        gameTypes={gameTypes}
        selectedIndex={selectedIndex}
        onChangeIndex={(newIndex) => {
          setSelectedIndex(newIndex);
          const selectedId = gameTypes[newIndex].id_modojuego;
          setSelectedGameModeId(selectedId);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  jugadaContainer: {
    width: "100%",
  },
  gameTypeCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.primaryLight,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: 55,
  },
  cardText: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.primaryLight,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.primaryLight,
  },
  pillsScrollView: {
    maxHeight: 300,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingBottom: 10,
  },
  pill: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  selectedPill: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  pillText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  selectedPillText: {
    color: colors.white,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    color: "white",
    marginBottom: 5,
    fontSize: 14,
    fontFamily: "Poppins",
  },
});

export default GameFilter;
