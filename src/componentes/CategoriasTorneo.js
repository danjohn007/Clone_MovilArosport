import React, { useState, useCallback} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import colors from "../styles/colors";


const CategoriasTorneo = ({
  iconName,
  placeholder,
  options = [],
  selectedValue,
  onValueChange,
  label,
  error,
  onPress,
  disableIfSelected = false,
  disabled = false,
  loadingClubs
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

    useFocusEffect(
    useCallback(() => {
      // Cada vez que la pantalla recibe foco, cerramos el dropdown
      setIsDropdownOpen(false);
    }, [])
  );
  const handleSelectOption = (option) => {
    onValueChange(option);
    setIsDropdownOpen(false);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      handleToggleDropdown();
    }
  };

  const isDisabled = disableIfSelected && selectedValue;

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <TouchableOpacity
        style={styles.inputBox}
        onPress={handlePress}
        disabled={disabled || isDisabled}
      >
        <Ionicons name={iconName} size={24} color={colors.primary} style={styles.icon2} />
        <Text style={styles.textInput}>
       {selectedValue || placeholder}
        </Text>
        {!disabled && !onPress && (
          <Ionicons
            name={isDropdownOpen ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color="#809FB8"
            style={styles.icon}
          />
        )}
      </TouchableOpacity>

      {isDropdownOpen && !onPress && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.scrollView} nestedScrollEnabled  keyboardShouldPersistTaps="handled">
            {loadingClubs ? (
              <Text style={styles.dropdownText}>Cargando datos...</Text>
            ) : options.length === 0 ? ( // solo tiene 'Seleccione un Club (opcional)'
              <Text style={styles.dropdownText}>No hay datos disponibles</Text>
            ) : (
              options.map((option, index) => (
                <TouchableOpacity
                   style={[
    styles.dropdownItem,               // estilo base siempre
    option === selectedValue && styles.dropdownItemSelected,  // si es seleccionada, se añade este estilo
  ]}
                  key={index}
                  onPress={() => handleSelectOption(option)}
                >
                  <Text style={styles.dropdownText}>{option}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%',
    alignItems: 'center',
    padding: 10, // ⬅ Ambos elementos tendrán el mismo padding
    height: 55,  // ⬅ Tamaño fijo para uniformidad visual
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
  dropdownContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    maxHeight: 200,
    marginVertical: 10,
    marginTop: -2
  },
  scrollView: {
    maxHeight: 130, // Allow scrolling when dropdown is too long
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 2,
    borderColor: "#eee",
  },
  labelContainer: {
    flexDirection: "column", // Asegura que el error se muestre debajo del label
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 2, // Espaciado entre label y error
  },
  dropdownItemSelected: {
  // backgroundColor: colors.primary,
    backgroundColor: 'rgba(2, 185, 250, 0.5)',
},
});

export default CategoriasTorneo;