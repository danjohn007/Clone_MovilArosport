import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const CategoriasClub = ({
  iconName,
  placeholder,
  options = [],
  selectedValue,
  renderValue,
  onValueChange,
  onPress,
  disableIfSelected = false,
  disabled = false,
  loadingClubs,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelectOption = (option) => {
    if (loadingClubs || opcionesFiltradas.length === 0) return;
    onValueChange(option);
    setShowModal(false);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowModal(true);
    }
  };

  const isDisabled = disableIfSelected && selectedValue;
  const opcionesFiltradas = options.filter((opt) => opt && opt.trim() !== "");

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={[styles.inputBox, renderValue && styles.inputBoxExpanded]}
        onPress={handlePress}
        disabled={disabled || isDisabled}
      >
        {!renderValue && (
          <>
            <Ionicons
              name={iconName}
              size={24}
              color={colors.primary}
              style={styles.icon2}
            />
            <Text
              style={styles.textInput}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedValue || placeholder}
            </Text>
          </>
        )}
        {renderValue && renderValue}
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ScrollView contentContainerStyle={styles.pillsContainer}>
                  {loadingClubs ? (
                    <View style={styles.noInfoPill}>
                      <Text style={styles.noInfoText}>Cargando clubs...</Text>
                    </View>
                  ) : opcionesFiltradas.length === 0 ? (
                    <View style={styles.noInfoPill}>
                      <Text style={styles.noInfoText}>
                        No hay clubs disponibles
                      </Text>
                    </View>
                  ) : (
                    opcionesFiltradas.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pill,
                          option === selectedValue && styles.pillSelected,
                        ]}
                        onPress={() => handleSelectOption(option)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            option === selectedValue && styles.pillTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
  },
  inputBox: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "colors.primary",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "100%",
    alignItems: "center",
    height: 55,
  },
  inputBoxExpanded: {
    height: "auto",
    minHeight: 120,
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    color: "#838080",
    fontSize: 14,
    fontFamily: "Poppins",
    textAlignVertical: "center",
    includeFontPadding: false,
    lineHeight: 22, 
    height: Platform.OS === "ios" ? 24 : "auto", 
    marginLeft: 0,
    marginTop: Platform.OS === "ios" ? 2 : 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  icon: {
    marginLeft: 10,
  },
  icon2: {
    marginRight: 12,
    width: 24,
    height: 24,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "colors.primary",
    padding: 20,
    width: "85%",
    maxHeight: "80%",
  },
  pillsContainer: {
    width: "100%",
  },
  pill: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  pillSelected: {
    backgroundColor: "colors.primary",
    borderColor: "colors.primary",
  },
  pillText: {
    fontSize: 14,
    color: "#808191",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  pillTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  noInfoPill: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    margin: 6,
    alignItems: "center",
  },
  noInfoText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontFamily: "Poppins",
  },
});

export default CategoriasClub;
