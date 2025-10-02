import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Icon,
  ScrollView,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Titulo from '../componentes/Titulo'; // Importa el componente Titulo


const { width, height } = Dimensions.get('window');

const TablaHorariosReservaModal = ({ visible, closeModal, horarios, onSelect, selectedDate }) => {
  const [filtro, setFiltro] = useState('');
  const [selected, setSelected] = useState(null);

  const normalizarDuracion = (texto) => {
    return texto
      .toLowerCase()
      .replace(/horas?|hrs?|hr/g, 'h')
      .replace(/\s+/g, '')
      .trim();
  };

  const formatHora = (hora) => {
    const [h, m] = hora.split(':');
    return `${h}:${m}`;
  };

  const formatDuracion = (duracion) => {
    const [hrs, mins] = duracion.split(':').map(Number);
    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;
    if (mins) return `${mins}m`;
    return '';
  };

  const horaStringAFechaCompleta = (horaStr, fechaStr) => {
    const [h, m] = horaStr.split(':').map(Number);
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day, h, m, 0);
  };

  const esFechaHoy = (fechaStr) => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return fechaStr === `${yyyy}-${mm}-${dd}`;
  };

  const ahora = new Date();
  const mediaHoraDespues = new Date(ahora.getTime() + 0 * 60 * 1000); // +30 min

  const horariosFiltrados = horarios.filter((item) => {
    const lower = filtro.toLowerCase();
    const filtroNormalizado = normalizarDuracion(filtro);
    const duracionFormateada = formatDuracion(item.duracion).toLowerCase().replace(/\s+/g, '');

    const cumpleFiltroTexto =
      item.hora_inicio.toLowerCase().includes(lower) ||
      item.cancha.toLowerCase().includes(lower) ||
      duracionFormateada.includes(filtroNormalizado);

    let cumpleHora = true;
    if (selectedDate && esFechaHoy(selectedDate)) {
      const horaInicioCompleta = horaStringAFechaCompleta(item.hora_inicio, selectedDate);
      const diferenciaMin = (horaInicioCompleta - mediaHoraDespues) / (60 * 1000);
      cumpleHora = diferenciaMin >= -10;
    }

    return cumpleFiltroTexto && cumpleHora;
  });

  const handleSelect = (horario) => {
    if (selected?.hora_inicio === horario.hora_inicio && selected?.hora_fin === horario.hora_fin && selected?.cancha === horario.cancha) {
      setSelected(null); // Deselecciona si ya estaba seleccionado
    } else {
      setSelected(horario); // Selecciona nuevo horario
    }
  };

  const handleConfirm = () => {
    if (!selected) {
      Alert.alert("Atención", "Debes seleccionar un horario para confirmar.");
      return;
    }
    onSelect(selected);
    closeModal();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={closeModal}>
      <Box flex={1} bg="rgba(0,0,0,0.5)" justifyContent="center" alignItems="center">
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          mx={5}
          bg="#f2f2f2"
          borderRadius={15}
          shadow={6}
        >
          <Box
            width={width * 0.9}
            maxHeight={height * 0.8}
            bg="white"
            p={4}
            borderRadius="15"
            borderWidth="2"
            borderColor={colors.primary}
          >
            <Titulo titulo="HORARIOS" />
            <TextInput
              placeholder="Buscar por hora, duración o cancha"
              value={filtro}
              onChangeText={setFiltro}
              style={styles.input}
            />

            <VStack space={3}>
              <HStack px={3} py={2} bg="gray.300" rounded="lg">
                <Text flex={1} bold color="gray.700">Inicio</Text>
                <Text flex={1} bold color="gray.700">Fin</Text>
                <Text flex={1} bold color="gray.700">Duración</Text>
                <Text flex={1} bold color="gray.700">Cancha</Text>
              </HStack>

              <ScrollView style={{ maxHeight: 300 }}>
                {horariosFiltrados.length === 0 ? (
                  <Text style={styles.noResultsText}>No se encontraron horarios.</Text>
                ) : (
                  horariosFiltrados.map((item, index) => {
                    const isSelected = selected?.hora_inicio === item.hora_inicio &&
                      selected?.hora_fin === item.hora_fin &&
                      selected?.cancha === item.cancha;

                    return (
                      <Pressable key={index} onPress={() => handleSelect(item)}>
                        {({ isPressed }) => (
                          <HStack
                            px={3}
                            py={3}
                            bg={isSelected ? 'rgba(2, 185, 250, 0.5)' : isPressed ? 'gray.100' : '#efefef'}
                            borderRadius="lg"
                            alignItems="center"
                            mb={2}
                          >
                            <Text flex={1}>{formatHora(item.hora_inicio)}</Text>
                            <Text flex={1}>{formatHora(item.hora_fin)}</Text>
                            <Text flex={1}>{formatDuracion(item.duracion)}</Text>
                            <Text flex={1}>{item.cancha}</Text>
                          </HStack>
                        )}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>

              {/* <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                  <Text style={styles.buttonText}>CancelarKK</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
                  <Text style={styles.buttonText}>Confirmar</Text>
                </TouchableOpacity>
              </View> */}
                   <View style={styles.modalButtons}>
                                                  <TouchableOpacity style={styles.closeButton}       
                     onPress={closeModal}>
                                                    <Text style={styles.buttonText}>Cancelar</Text>
                                                  </TouchableOpacity>
                                                  <TouchableOpacity
                                                    style={styles.terminateButton}
                                              onPress={handleConfirm}
                          
                                                  >
                                                    <Text style={styles.buttonText}>Confirmar</Text>
                                                  </TouchableOpacity>
                                                </View>
            </VStack>
          </Box>
        </KeyboardAwareScrollView>
      </Box>
    </Modal>
  );
};


const styles = StyleSheet.create({
  input: {
       borderWidth: 1,
        borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
        btnCerrar: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
    },
    textoCerrar: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 14
    },
        header: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
             modalButtons: {
    flexDirection: 'row',
    marginTop: 0,
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
  closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#C9C9C9',
    borderRadius: 18,
    alignItems: 'center',
  },
   buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
     terminateButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#00BFFF',
    borderRadius: 18,
    alignItems: 'center',
  },
});

export default TablaHorariosReservaModal;