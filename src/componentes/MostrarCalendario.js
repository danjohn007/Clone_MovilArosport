import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const MostrarCalendario = ({ placeholder = "Seleccionar fecha", selectedValue, onValueChange }) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (selectedValue) {
      // Crear fecha a partir del valor seleccionado y establecer a medianoche local
      const date = new Date(selectedValue);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    // Crear fecha actual y establecer a medianoche local
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Efecto para establecer la fecha inicial
  useEffect(() => {
    if (!selectedValue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Formato YYYY-MM-DD manteniendo la fecha local
      const formattedDate = formatDateToISO(today);
      onValueChange && onValueChange(formattedDate);
    }
  }, []);

  // Función auxiliar para formatear fecha a ISO string manteniendo la fecha local
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
      // Establecer la hora a medianoche en la zona horaria local
      date.setHours(0, 0, 0, 0);
      setSelectedDate(date);
      
      // Usar el formato personalizado para mantener la fecha local
      const formattedDate = formatDateToISO(date);
      if (onValueChange) onValueChange(formattedDate);
    }
  };

  const handleClose = () => {
    setIsPickerVisible(false);
  };

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity 
        style={styles.inputBox} 
        onPress={() => setIsPickerVisible(true)}
      >
        <Ionicons name="calendar-outline" size={24} color="#02B9FA" style={styles.icon} />
        <Text style={[
          styles.textInput,
          styles.selectedText
        ]}>
          {formatDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      {isPickerVisible && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="fade"
            visible={isPickerVisible}
            onRequestClose={handleClose}
          >
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
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
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
    alignItems: 'center',
    paddingHorizontal: 15, // Añadido para mantener consistencia con el selector de país
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#02B9FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%', // Cambiado de 88% a 100%
    alignItems: 'center',
    marginTop: 15,
  },
  textInput: {
    color: '#809FB8',
    fontSize: 16,
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
    borderColor: '#00baff',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#02B9FA', // Color personalizado para el botón de cierre
    fontWeight: 'bold',
  },
});

export default MostrarCalendario;
