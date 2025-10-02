import React, { useState, useEffect } from 'react';
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

const TablaHorariosModal = ({ visible, closeModal, horarios, onSelect, selectedDate,
   selectedHorario: horarioInicial = null,
  selectedCanchas: canchasIniciales = []
 }) => {
  const [filtro, setFiltro] = useState('');
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [selectedCanchas, setSelectedCanchas] = useState([]);
  // Al abrir la modal, cargar selecciones previas o limpiar
  useEffect(() => {
    if (visible) {
      setFiltro('');
      setSelectedHorario(horarioInicial);
      setSelectedCanchas(canchasIniciales);
    } else {
      // Al cerrarse la modal limpiar selecciones internas
      setSelectedHorario(null);
      setSelectedCanchas([]);
      setFiltro('');
    }
  }, [visible]);

const canchasDisponibles = horarios.reduce((acc, h) => {
  if (!acc.some(c => c.id === h.id_cancha)) {
    acc.push({ id: h.id_cancha, nombre: h.cancha });
  }
  return acc;
}, []);


  const handleSelectHorario = (horario) => {
    setSelectedHorario(horario === selectedHorario ? null : horario);
  };

const toggleCancha = (canchaObj) => {
  setSelectedCanchas((prev) =>
    prev.some(c => c.id === canchaObj.id)
      ? prev.filter(c => c.id !== canchaObj.id)
      : [...prev, canchaObj]
  );
};


  const confirmSelection = () => {
    if (!selectedHorario) {
      Alert.alert("Atención", "Debes seleccionar un horario.");
      return;
    }
    if (selectedCanchas.length === 0) {
      Alert.alert("Atención", "Debes seleccionar al menos una cancha.");
      return;
    }

    onSelect({
      horario: selectedHorario,
      canchas: selectedCanchas
    });

    setFiltro('');
    setSelectedHorario(null);
    setSelectedCanchas([]);
    closeModal();
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
const unaHoraMas = new Date(ahora.getTime() + 60 * 60 * 1000);

const horariosFiltrados = horarios.filter((item) => {
  const lower = filtro.toLowerCase();
  const cumpleFiltroTexto =
    item.hora_inicio.toLowerCase().includes(lower) ||
    item.cancha.toLowerCase().includes(lower);

  let cumpleFiltroHora = true;

  if (selectedDate && esFechaHoy(selectedDate)) {
    const horaInicioReal = horaStringAFechaCompleta(item.hora_inicio, selectedDate);
    cumpleFiltroHora = horaInicioReal >= unaHoraMas;
  }

  return cumpleFiltroTexto && cumpleFiltroHora;
});


  const formatHorario = (item) => {
    const [h1, m1] = item.hora_inicio.split(':');
    const [h2, m2] = item.hora_fin.split(':');
    const [dh, dm] = item.duracion.split(':').map(Number);
    const duracion = `${dh ? `${dh}h ` : ''}${dm ? `${dm}m` : ''}`;
    return `${h1}:${m1} - ${h2}:${m2} (${duracion.trim()})`;
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


  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={closeModal}>
      <Box flex={1} bg="rgba(0,0,0,0.5)" justifyContent="center" alignItems="center">
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          keyboardShouldPersistTaps="handled"
          mx={5}
        >
          <Box
            width={width * 0.9}
            maxHeight={height * 0.85}
            bg="white"
            p={4}
            borderRadius="15"
            borderWidth="2"
            borderColor={colors.primary}
          >
         <Titulo titulo="HORARIOS" />
            {/* <TextInput
              placeholder="Buscar por hora o cancha"
              value={filtro}
              onChangeText={setFiltro}
              style={styles.input}
            /> */}
<Text style={styles.text}>Selecciona un horario disponible:</Text>

            {/* Parte superior: horarios */}
           {/* Horarios */}
            <VStack space={3} mb={4} marginTop={-13} >
              <HStack px={6} py={2} bg="gray.300" rounded="lg">
                <Text flex={1} bold color="gray.700">Inicio</Text>
                <Text flex={1} bold color="gray.700">Fin</Text>
                <Text flex={1} bold color="gray.700">Duración</Text>
                {/* <Text flex={1} bold color="gray.700">Cancha</Text> */}
              </HStack>

              <ScrollView style={{ maxHeight: 140}} keyboardShouldPersistTaps="handled">
                {horariosFiltrados.length === 0 ? (
                  <Text style={styles.noResultsText}>No se encontraron horarios.</Text>
                ) : (
                  horariosFiltrados.map((item, index) => {
                 const isSelected = selectedHorario === item;

                    return (
                      <Pressable key={index} onPress={() => handleSelectHorario(item)}>
                        {({ isPressed }) => (
                          <HStack
                            px={3}
                            py={2}
                            bg={isSelected ? 'rgba(2, 185, 250, 0.5)' : isPressed ? 'gray.100' : '#efefef'}
                            borderRadius="lg"
                            alignItems="center"
                            mb={2}
                          >
                            <Text flex={1}>{formatHora(item.hora_inicio)}</Text>
                            <Text flex={1}>{formatHora(item.hora_fin)}</Text>
                            <Text flex={1}>{formatDuracion(item.duracion)}</Text>
                            {/* <Text flex={1}>{item.cancha}</Text> */}
                          </HStack>
                        )}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </VStack>

            {/* Parte inferior: canchas */}
            <VStack space={2} mb={4}>
                 <Titulo titulo="CANCHAS DISPONIBLES" />
           <Text style={styles.text2}>Selecciona una o más canchas disponibles:</Text>
              <ScrollView style={{ maxHeight: 130, marginTop: -15 }} keyboardShouldPersistTaps="handled">
              {canchasDisponibles.map((cancha, index) => {
  const selected = selectedCanchas.some(c => c.id === cancha.id);

  return (
    <Pressable key={index} onPress={() => toggleCancha(cancha)} >
      <HStack
        px={3}
        py={2}
        alignItems="center"
        bg={selected ? 'rgba(2, 185, 250, 0.5)' : '#efefef'}
        borderRadius="lg"
        mb={1}
      >
        <Text flex={1}>{cancha.nombre}</Text>
      </HStack>
    </Pressable>
  );
})}

              </ScrollView>
            </VStack>

            {/* Botones */}
            {/* <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setSelectedHorario(null);
                  setSelectedCanchas([]);
                  setFiltro('');
                  onSelect(null); // descartamos selección
                  closeModal();
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButton} onPress={confirmSelection}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View> */}
                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.closeButton}       
                            onPress={() => {
                  setSelectedHorario(null);
                  setSelectedCanchas([]);
                  setFiltro('');
                  onSelect(null); // descartamos selección
                  closeModal();
                }}>
                                      <Text style={styles.buttonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={styles.terminateButton}
                               onPress={confirmSelection}
            
                                    >
                                      <Text style={styles.buttonText}>Confirmar</Text>
                                    </TouchableOpacity>
                                  </View>
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
    marginTop: -10
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
    text: {
   fontSize: 14,
   color: "#809FB8",
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginVertical: 5,
    marginTop: -15,
    marginBottom: 15
  },
      text2: {
   fontSize: 14,
   color: "#809FB8",
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginVertical: 5,
    marginTop: -20,
    marginBottom: 15
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

export default TablaHorariosModal;
