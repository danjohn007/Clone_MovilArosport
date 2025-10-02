import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

const GameInfoModal = ({ visible, onClose, gameTypes, selectedIndex }) => {
  const game = gameTypes[selectedIndex] || {};

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Encabezado del modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {(game.mod_nombre || "").toUpperCase()}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Contenido principal con scroll */}
          <ScrollView style={styles.modalContent}>
            {/* Sección de Descripción */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descriptionText}>
                {game.mod_descripcion}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Estilo base del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "colors.primary",
  },

  // Encabezado
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "colors.primary",
    textAlign: "center",
    flex: 1,
    marginRight: -28, // Compensa el espacio del botón para un centrado perfecto
  },
  closeButton: {
    padding: 4,
  },

  // Contenido
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Secciones
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "colors.primary",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  descriptionText: {
    fontSize: 15,
    color: "#808188", // Un gris oscuro para buena legibilidad
    lineHeight: 22, 
    textAlign: "justify", 
  },
});

export default GameInfoModal;