import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const parseDateWithoutTimezone = (dateString) => {
  if (typeof dateString !== 'string' || !dateString.includes('-')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

// Función para obtener fecha hoy sin horas
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const VerCalendario = ({ placeholder = "Seleccionar fecha", selectedValue, onValueChange, disabled }) => {
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);

  // Inicializa con fecha parseada o fecha de hoy si no viene o está vacío
  const [selectedDate, setSelectedDate] = React.useState(() => {
    return selectedValue && selectedValue !== '' 
      ? parseDateWithoutTimezone(selectedValue) 
      : getToday();
  });

React.useEffect(() => {
  if (selectedValue && selectedValue !== '') {
    setSelectedDate(parseDateWithoutTimezone(selectedValue));
  } else {
    // Cuando no hay fecha (cadena vacía o undefined), establecemos hoy y avisamos al padre
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);

    if (onValueChange) {
      onValueChange(formatDateToISO(today));  // envía "YYYY-MM-DD"
    }
  }
}, [selectedValue]);



  const formatDateToISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleDateChange = (event, date) => {
    setIsPickerVisible(Platform.OS === 'ios');
    if (date) {
      date.setHours(0, 0, 0, 0);
      setSelectedDate(date);
      if (onValueChange) onValueChange(formatDateToISO(date));
    }
  };

  const handleClose = () => setIsPickerVisible(false);

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={styles.inputBox}
        onPress={() => !disabled && setIsPickerVisible(true)}
        disabled={disabled}
      >
        <Ionicons name="calendar-outline" size={24} color={colors.primary} style={styles.icon} />
        <Text style={[styles.textInput]}>
          {formatDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      {isPickerVisible && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible={isPickerVisible} onRequestClose={handleClose}>
            <View style={styles.modalContainer}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  themeVariant="light"
                  minimumDate={new Date()}
                />
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )
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
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.primary,
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
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00bfff',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.primary, // Color personalizado para el botón de cierre
    fontWeight: 'bold',
  },
});

export default VerCalendario;
