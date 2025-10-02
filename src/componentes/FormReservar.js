import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FormReservar = ({ placeholder, options = [], selectedValue, onValueChange, onBeforeOpen,
  isLoading = false,  
  isOpen,
  onOpen,
  onClose,
 }) => {

  const handleToggleDropdown = () => {
    if (isOpen) {
      onClose?.();
    } else {
      if (onBeforeOpen && onBeforeOpen() === false) return;
      onOpen?.();
    }
  };

  const handleSelectOption = (option) => {
    onValueChange(option);
    onClose?.();
  };

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.inputBox} onPress={handleToggleDropdown}>
        <Text style={styles.textInput}>
          {selectedValue || placeholder}
        </Text>
        <Ionicons name={isOpen ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#809FB8" style={styles.icon} />
      </TouchableOpacity>
      
      {/* Contenido desplegable */}
    {isOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.scrollView} nestedScrollEnabled>
            {isLoading ? (
              <Text style={[styles.dropdownText, { textAlign: 'center', color: 'gray' }]}>Obteniendo datos...</Text>
            ) : options.length > 0 ? (
              options.map((option, index) => (
                <TouchableOpacity key={index} onPress={() => handleSelectOption(option)}>
                  <Text style={styles.dropdownText}>{option}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.dropdownText, { textAlign: 'center', color: 'gray' }]}>No hay información disponible</Text>
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
    alignItems: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '88%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  textInput: {
    color: '#809FB8',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  icon: {
    marginLeft: 10,
  },
  dropdownContainer: {
    width: '88%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    maxHeight: 200, // Set a maximum height for the dropdown
  },
  scrollView: {
    maxHeight: 200, // Allow scrolling when dropdown is too long
  },
  dropdownText: {
    fontSize: 14,
    color: '#809FB8',
    paddingVertical: 5,
  },
});

export default FormReservar;
