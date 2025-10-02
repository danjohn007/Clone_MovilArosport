import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import colors from "../styles/colors";

const Categorias = ({
  iconName,
  placeholder,
  options = [],
  selectedValue,
  onValueChange,
  onPress,
  disableIfSelected = false,
  disabled = false,
  borderColor,
  borderWidth,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelectOption = (option) => {
    if (option !== "NO_INFO") {
      onValueChange(option);
      setShowModal(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowModal(true);
    }
  };

  const isDisabled = disableIfSelected && selectedValue;
  const opcionesFiltradas = options.filter(opt => opt && opt.trim() !== "");

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={[
          styles.inputBox,
          borderColor ? { borderColor } : {},
          borderWidth ? { borderWidth } : {},
        ]}
        onPress={handlePress}
        disabled={disabled || isDisabled}
      >
        <Ionicons name={iconName} size={24} color={colors.primary} style={styles.icon2} />
        <Text style={styles.textInput}>
          {selectedValue ? `Categoría: ${selectedValue}` : placeholder}
        </Text>
        {/* Flecha eliminada */}
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
                  {opcionesFiltradas.length === 0 ? (
                    <View style={styles.noInfoPill}>
                      <Text style={styles.noInfoText}>No hay información disponible</Text>
                    </View>
                  ) : (
                    opcionesFiltradas.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pill,
                          option === selectedValue && styles.pillSelected
                        ]}
                        onPress={() => handleSelectOption(option)}
                      >
                        <Text style={[
                          styles.pillText,
                          option === selectedValue && styles.pillTextSelected
                        ]}>{option}</Text>
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
    width: '100%',
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%',
    alignItems: 'center',
    padding: 10,
    height: 55,
  },
  textInput: {
    flex: 1,
    color: '#838080',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  icon: {
    marginLeft: 10,
  },
  icon2: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  pillsContainer: {
    width: '100%',
  },
  pill: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc', // Borde gris
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Ocupa todo el ancho de la modal
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 14,
    color: '#808191',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  pillTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noInfoPill: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    margin: 6,
    alignItems: 'center',
  },
  noInfoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});

export default Categorias;