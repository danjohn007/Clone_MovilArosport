import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const TimeSelectorHora = ({ value, onChange, selectedClub, iconName = "time-outline" }) => {
  const [showModal, setShowModal] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [inputMode, setInputMode] = useState('scroll');

  // Generar todas las horas y minutos
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
  // Solo mostrar minutos: 00, 15, 30, 45
const minutes = [0, 15, 30, 45];


  const handleManualInput = (text) => {
    const timeRegex = /^([0-9]{1,2}):?([0-9]{0,2})$/;
    const match = text.match(timeRegex);

    if (match) {
      let hours = parseInt(match[1]);
      let minutes = match[2] ? parseInt(match[2]) : 0;

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        setTempValue(`${hours}:${minutes.toString().padStart(2, '0')}`);
      }
    }
  };

  const handleConfirm = () => {
    if (inputMode === 'scroll') {
      const newValue = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')}`;
      onChange(newValue);
    } else {
      onChange(tempValue);
    }
    setShowModal(false);
  };

  const formatTimeDisplay = (time) => {
    if (!time || typeof time === 'object') {
      return 'Seleccionar hora:';
    }
    return `${time}hr`;
  };
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={styles.inputBox}
        onPress={() => {
       
          setShowModal(true);

          if (value && typeof value === 'string') {
            const [hours, minutes] = value.split(':').map(Number);
            setSelectedHour(hours);
            setSelectedMinute(minutes);
          } else {
            setSelectedHour(0);
            setSelectedMinute(0);
          }
        }}
      >
        <Ionicons name={iconName} size={24} color={colors.primary} style={styles.icon} />
        <Text style={styles.textInput}>{formatTimeDisplay(value)}</Text>

      <TouchableOpacity
        onPress={() => onChange(null)}
        style={{ marginLeft: 'auto', paddingLeft: 10 }}
      >
        <Ionicons name="close-circle" size={20} color={colors.primary} />
      </TouchableOpacity>
 

      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Hora</Text>

            {inputMode === 'scroll' ? (
              <View style={styles.scrollPickerContainer}>
                <ScrollView style={styles.scrollPicker} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.scrollItem,
                        selectedHour === hour && styles.selectedScrollItem
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.scrollItemText,
                        selectedHour === hour && styles.selectedScrollItemText
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.timeSeparator}>:</Text>
                <ScrollView style={styles.scrollPicker} showsVerticalScrollIndicator={false}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.scrollItem,
                        selectedMinute === minute && styles.selectedScrollItem
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={[
                        styles.scrollItemText,
                        selectedMinute === minute && styles.selectedScrollItemText
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <TextInput
                style={styles.timeInput}
                value={tempValue}
                onChangeText={handleManualInput}
                placeholder="HH:MM"
                keyboardType="numeric"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15, // Añadido para mantener consistencia
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%', // Cambiado para que sea coherente
    alignItems: 'center',
    marginTop: 15,
  },
  label: {
    color: 'white',
    marginBottom: 5,
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Poppins',
    textAlign: 'left', // 👈 Asegura que el texto esté alineado a la izquierda
    paddingLeft: -20,  
    color: '#809FB8',
    fontSize: 16,
  },
  timeDisplay: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
      borderWidth: 2,
    borderColor: colors.primary,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  timeInput: {
    fontSize: 20,
    borderBottomWidth: 1,
    width: 80,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Poppins',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  scrollPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
    marginVertical: 20,
  },
  scrollPicker: {
    height: 200,
    width: 60,
  },
  scrollItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedScrollItem: {
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
  },
  scrollItemText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Poppins',
  },
  selectedScrollItemText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#333',
  },
  toggleButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 10,
  },
  toggleButtonText: {
    color: colors.primary,
    fontFamily: 'Poppins',
  },
});