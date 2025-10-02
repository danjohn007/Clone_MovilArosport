import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CalendarioVisual = ({ placeholder = "Seleccionar fecha", selectedValue, onValueChange }) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (selectedValue) {
      const date = new Date(selectedValue);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  useEffect(() => {
    if (!selectedValue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const formattedDate = formatDateToISO(today);
      onValueChange && onValueChange(formattedDate);
    }
  }, []);

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
        <Ionicons name="calendar-outline" size={24} color={colors.primary} style={styles.icon} />
        <Text style={[styles.textInput, styles.selectedText]}>
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
                  disabled={true} // Deshabilitar la selección
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
            disabled={true} // Deshabilitar la selección
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
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default CalendarioVisual;
