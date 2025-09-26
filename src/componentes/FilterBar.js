import { Center } from "native-base";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";

const FilterBar = ({ onFilter, setFilteredRankings, initialGender, initialCategory, disabled }) => {
  const [selectedGender, setSelectedGender] = useState(initialGender || null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const genders = [
    { label: "Varonil", value: "M" },
    { label: "Femenil", value: "F" },
  ];

  const categories = [
    { label: "Open", value: 1 },
    { label: "Primera", value: 2 },
    { label: "Segunda", value: 3 },
    { label: "Tercera", value: 4 },
    { label: "Cuarta", value: 5 },
    { label: "Quinta", value: 6 },
  ];

  useEffect(() => {
    if (initialGender) setSelectedGender(initialGender);
  }, [initialGender]);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    onFilter(selectedGender, selectedCategory);
  }, [selectedGender, selectedCategory]);

  const renderOption = (item, setSelection, closeModal, selected) => (
    <TouchableOpacity
      style={[
        styles.pillOption,
        selected && styles.pillOptionSelected
      ]}
      onPress={() => {
        setSelection(item.value);
        closeModal(false);
      }}
    >
      <Text style={[
        styles.pillOptionText,
        selected && styles.pillOptionTextSelected
      ]}>{item.label || "Opción inválida"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.pickerRow}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Género</Text>
        <TouchableOpacity
          style={[styles.pill, disabled && { opacity: 0.5 }]}
          onPress={() => !disabled && setShowGenderModal(true)}
          disabled={disabled}
        >
          <Text style={styles.pillText}>
            {genders.find((g) => g.value === selectedGender)?.label ||
              "Selecciona un género"}
          </Text>
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={showGenderModal}
          animationType="slide"
          onRequestClose={() => setShowGenderModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowGenderModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <FlatList
                    data={genders}
                    keyExtractor={(item) => item.value.toString()}
                    renderItem={({ item }) =>
                      renderOption(item, setSelectedGender, setShowGenderModal, selectedGender === item.value)
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Categoría</Text>
        <TouchableOpacity
          style={[styles.pill, disabled && { opacity: 0.5 }]}
          onPress={() => !disabled && setShowCategoryModal(true)}
          disabled={disabled}
        >
          <Text style={styles.pillText}>
            {categories.find((c) => c.value === selectedCategory)?.label ||
              "Selecciona una categoría"}
          </Text>
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={showCategoryModal}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.value.toString()}
                    renderItem={({ item }) =>
                      renderOption(item, setSelectedCategory, setShowCategoryModal, selectedCategory === item.value)
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    marginHorizontal: 0,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff", // Fondo gris claro igual que Categorias.js
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#00baff", // Borde azul
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    color: "#808191",
    fontFamily: "Caveat", // Cambia por una fuente manuscrita si la tienes instalada
    marginBottom: 6,
    textAlign: "center",
  },
  pill: {
    backgroundColor: "#f0f0f0", // Fondo igual al fondo principal
    borderRadius: 11,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#00baff", // Borde azul
    marginTop: 4,
    width: "100%",
    alignItems: "center",
  },
  pillText: {
    fontSize: 13,
    color: "#808191",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "70%",
    borderWidth: 2,
    borderColor: "#00baff",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
  },
  option: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 15,
    color: "#808191",
    textAlign: "center",
    fontFamily: "Caveat",
  },
  pillOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pillOptionSelected: {
    backgroundColor: '#00BAFF',
    borderColor: '#00BAFF',
  },
  pillOptionText: {
    fontSize: 14,
    color: '#808191',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  pillOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FilterBar;
