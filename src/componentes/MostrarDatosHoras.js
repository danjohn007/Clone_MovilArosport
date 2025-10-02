import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Titulo from '../componentes/Titulo';

export const DurationCounter = ({ value, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [inputMode, setInputMode] = useState('scroll');
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

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
    return time ? `${time} hrs` : 'hrs';
  };

  // Scroll automático cuando se abre el modal
  useEffect(() => {
    if (showModal && hourScrollRef.current) {
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({ y: selectedHour * 40, animated: true });
      }, 100);
    }
  }, [showModal, selectedHour]);

  useEffect(() => {
    if (showModal && minuteScrollRef.current) {
      setTimeout(() => {
        minuteScrollRef.current?.scrollTo({ y: selectedMinute * 40, animated: true });
      }, 100);
    }
  }, [showModal, selectedMinute]);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Duración</Text>
      <View style={styles.originalInputBox}>
        <Ionicons name="time-outline" size={24} color={colors.primary} style={styles.icon} />
        
        <TouchableOpacity 
          style={styles.timeDisplay}
          onPress={() => {
            setShowModal(true);
            if (value) {
              const [hours, minutes] = value.split(':').map(Number);
              setSelectedHour(hours);
              setSelectedMinute(minutes);
            }
          }}
        >
          <Text style={styles.textInput}>{formatTimeDisplay(value)}</Text>
        </TouchableOpacity>
      </View>
      
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECCIONAR DURACIÓN</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {inputMode === 'scroll' ? (
                <View style={styles.scrollPickerContainer}>
                  <ScrollView 
                    ref={hourScrollRef}
                    style={styles.scrollPicker} 
                    showsVerticalScrollIndicator={false}
                  >
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
                  <ScrollView 
                    ref={minuteScrollRef}
                    style={styles.scrollPicker} 
                    showsVerticalScrollIndicator={false}
                  >
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
            </View>
            {/* FOOTER CON BOTÓN DE CONFIRMAR */}
            <View style={styles.footerContainer}>
              <TouchableOpacity 
                style={styles.actionButtonFooter}
                onPress={handleConfirm}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.actionButtonTextFooter}>CONFIRMAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Reemplaza getClosestTime por la versión corregida
export const getClosestTime = (currentHour, currentMinute) => {
  const quarters = [0, 15, 30, 45];
  // Buscar el siguiente cuarto de hora disponible
  let nextQuarter = quarters.find(q => q > currentMinute);
  let resultHour = currentHour;
  let resultMinute = 0;

  if (nextQuarter !== undefined) {
    resultMinute = nextQuarter;
  } else {
    // Si ya pasó el último cuarto, avanzar la hora y poner minutos en 0
    resultHour = currentHour + 1;
    if (resultHour > 23) resultHour = 0; // Cambiado de 7 a 0 para permitir horas desde medianoche
    resultMinute = 0;
  }

  return { hour: resultHour, minute: resultMinute };
};

export const TimeSelector = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecciona hora',
  selectedDate,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [inputMode, setInputMode] = useState('scroll');
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  const now = new Date();

  const parseDateFromYMD = (ymd) => {
    if (!ymd) return null;
    const [year, month, day] = ymd.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleClear = () => {
    onChange('');
    setTempValue('');
    setSelectedHour(0);
    setSelectedMinute(0);
  };

  const isToday = (() => {
    if (!selectedDate) return false;
    const selected = parseDateFromYMD(selectedDate);
    return (
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate()
    );
  })();

  let availableHours = [];
  let minuteOptionsByHour = {};

  if (isToday) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const quarters = [0, 15, 30, 45];
    let nextMinutes = [];
    let minHour = currentHour;

    if (currentMinute < 15) {
      nextMinutes = [0, 15, 30, 45];
    } else if (currentMinute < 30) {
      nextMinutes = [15, 30, 45];
    } else if (currentMinute < 45) {
      nextMinutes = [30, 45];
    } else if (currentMinute < 60) {
      nextMinutes = [45];
    }

    if (nextMinutes.length === 0 || (nextMinutes.length === 1 && nextMinutes[0] === 45 && currentMinute >= 60)) {
      minHour = currentHour + 1;
      nextMinutes = [0, 15, 30, 45];
    }

    const startHour = minHour + 1;
    const maxHour = 23;

    for (let h = startHour; h <= maxHour; h++) {
      availableHours.push(h);
      minuteOptionsByHour[h] = h === startHour ? nextMinutes : [0, 15, 30, 45];
    }
  } else {
    // Cambiado de 7 a 0 para permitir todas las horas
    for (let h = 0; h <= 23; h++) {
      availableHours.push(h);
      minuteOptionsByHour[h] = [0, 15, 30, 45];
    }
  }

  const minutes = minuteOptionsByHour[selectedHour] || [0, 15, 30, 45];

  React.useEffect(() => {
    if (!minutes.includes(selectedMinute)) {
      setSelectedMinute(minutes[0]);
    }
  }, [selectedHour]);

  const formatTimeDisplay = (time) => {
    if (!time) return placeholder;
    const cleanTime = time.replace(/\s*hrs$/, '');
    return `${cleanTime} hrs`;
  };

  const handleManualInput = (text) => {
    const timeRegex = /^([0-9]{1,2}):?([0-9]{0,2})$/;
    const match = text.match(timeRegex);

    if (match) {
      let hours = parseInt(match[1]);
      let minutes = match[2] ? parseInt(match[2]) : 0;

      // Cambiado de hours >= 7 a hours >= 0 para aceptar todas las horas
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        setTempValue(`${hours}:${minutes.toString().padStart(2, '0')}`);
      }
    }
  };

  const handleConfirm = () => {
    const rawValue =
      inputMode === 'scroll'
        ? `${selectedHour}:${selectedMinute.toString().padStart(2, '0')}`
        : tempValue;

    const valueWithHrs = `${rawValue} hrs`;
    onChange(valueWithHrs);
    setShowModal(false);
  };

  // Modifica getDefaultTime dentro de TimeSelector
  const getDefaultTime = () => {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (isToday) {
      const closestTime = getClosestTime(currentHour, currentMinute);
      if (availableHours.includes(closestTime.hour)) {
        const availableMinutes = minuteOptionsByHour[closestTime.hour];
        if (availableMinutes.includes(closestTime.minute)) {
          return closestTime;
        }
      }
      if (availableHours.length > 0) {
        const firstHour = availableHours[0];
        const firstMinute = minuteOptionsByHour[firstHour]?.[0] || 0;
        return { hour: firstHour, minute: firstMinute };
      }
    } else {
      // Para otros días, redondear al cuarto de hora más cercano, sin restricciones de hora mínima
      let hour = currentHour;
      let minute = [0, 15, 30, 45].reduce((prev, curr) =>
        Math.abs(curr - currentMinute) < Math.abs(prev - currentMinute) ? curr : prev
      );
      // Eliminada la restricción de hour < 7 y hour > 23
      return { hour, minute };
    }
    // Cambiado de 7 a 0 como hora por defecto
    return { hour: 0, minute: 0 };
  };

  // Scroll automático cuando se abre el modal
  useEffect(() => {
    if (showModal && hourScrollRef.current) {
      setTimeout(() => {
        const hourIndex = availableHours.indexOf(selectedHour);
        if (hourIndex !== -1) {
          hourScrollRef.current?.scrollTo({ y: hourIndex * 40, animated: true });
        }
      }, 100);
    }
  }, [showModal, selectedHour, availableHours]);

  useEffect(() => {
    if (showModal && minuteScrollRef.current) {
      setTimeout(() => {
        const minuteIndex = minutes.indexOf(selectedMinute);
        if (minuteIndex !== -1) {
          minuteScrollRef.current?.scrollTo({ y: minuteIndex * 40, animated: true });
        }
      }, 100);
    }
  }, [showModal, selectedMinute, minutes]);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.originalInputBox}>
        <TouchableOpacity
          style={styles.timeDisplay}
          onPress={() => {
            if (disabled) return;
            setShowModal(true);
            if (value) {
              const cleanValue = value.replace(/\s*hrs$/, '');
              const [hours, minutes] = cleanValue.split(':').map(Number);
              setSelectedHour(hours);
              setSelectedMinute(minutes);
            } else {
              // Usar la hora por defecto más cercana
              const defaultTime = getDefaultTime();
              setSelectedHour(defaultTime.hour);
              setSelectedMinute(defaultTime.minute);
            }
          }}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <View style={styles.textContainer}>
            <Ionicons name="time-outline" size={24} color={colors.primary} style={styles.icon} />
            <Text style={styles.textInput}>{formatTimeDisplay(value)}</Text>
          </View>
        </TouchableOpacity>

        {value && !disabled && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 15, bottom: 10, left: 15, right: 20 }}
          >
            <Ionicons name="close-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {!disabled && (
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>SELECCIONAR HORA</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                {inputMode === 'scroll' ? (
                  availableHours.length === 0 ? (
                    <Text style={styles.noHoursText}>
                      No hay horas disponibles para hoy.
                    </Text>
                  ) : (
                    <View style={styles.scrollPickerContainer}>
                      <ScrollView 
                        ref={hourScrollRef}
                        style={styles.scrollPicker} 
                        showsVerticalScrollIndicator={false}
                      >
                        {availableHours.map((hour) => (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.scrollItem,
                              selectedHour === hour && styles.selectedScrollItem,
                            ]}
                            onPress={() => setSelectedHour(hour)}
                          >
                            <Text
                              style={[
                                styles.scrollItemText,
                                selectedHour === hour && styles.selectedScrollItemText,
                              ]}
                            >
                              {hour.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <Text style={styles.timeSeparator}>:</Text>

                      <ScrollView 
                        ref={minuteScrollRef}
                        style={styles.scrollPicker} 
                        showsVerticalScrollIndicator={false}
                      >
                        {minutes.map((minute) => (
                          <TouchableOpacity
                            key={minute}
                            style={[
                              styles.scrollItem,
                              selectedMinute === minute && styles.selectedScrollItem,
                            ]}
                            onPress={() => setSelectedMinute(minute)}
                          >
                            <Text
                              style={[
                                styles.scrollItemText,
                                selectedMinute === minute && styles.selectedScrollItemText,
                              ]}
                            >
                              {minute.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )
                ) : (
                  <TextInput
                    style={styles.timeInput}
                    value={tempValue}
                    onChangeText={handleManualInput}
                    placeholder="HH:MM"
                    keyboardType="numeric"
                  />
                )}
              </View>
              {/* FOOTER CON BOTÓN DE CONFIRMAR */}
              <View style={styles.footerContainer}>
                <TouchableOpacity 
                  style={styles.actionButtonFooter}
                  onPress={handleConfirm}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.actionButtonTextFooter}>CONFIRMAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Estilos base
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Estilo original del input
  originalInputBox: {
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
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDisplay: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    color: '#838080',
    fontSize: 14,
    fontFamily: 'Poppins',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  clearButton: {
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noHoursText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#64748b',
  },

  // Scroll picker styles
  scrollPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
    marginVertical: 20,
    justifyContent: 'center',
  },
  scrollPicker: {
    height: 200,
    width: 80,
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
    color: '#334155',
  },
  selectedScrollItemText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#334155',
  },
  timeInput: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    width: 120,
    textAlign: 'center',
    marginVertical: 20,
    color: '#334155',
  },

  // Action button (consistent with Inscripcion)
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  actionButtonFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  actionButtonTextFooter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});