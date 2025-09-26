import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import Titulo from '../componentes/Titulo';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


const TimeBreak = ({ visible, onClose, onConfirm, pareja, puntajes = { pareja1: '', pareja2: '' }, setPuntajes }) => {
  const [error, setError] = useState('');
  const inputRefs = useRef({});
  useEffect(() => {
  if (!visible) {
    setError('');
    setPuntajes({ pareja1: '', pareja2: '' });
  }
}, [visible]);


  const validarPuntaje = (p1, p2) => {
    if (p1 === '' || p2 === '') return 'Ambos campos son obligatorios';

    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);

    if (isNaN(n1) || isNaN(n2)) return 'Ambos valores deben ser números';
    if (n1 < 0 || n2 < 0) return 'Los puntos deben ser positivos';
    if (n1 === n2) return 'El marcador no puede ser empate';

    const diff = Math.abs(n1 - n2);

      // ✅ Nuevo criterio: al menos uno debe ser >= 7 y diferencia mínima de 2
  if ((n1 < 7 && n2 < 7) || diff < 2) {
    return 'Uno de los equipos debe tener al menos 7 puntos y diferencia mínima de 2.';
  }


    return '';
  };

  const handleChange = (field, value) => {
    if (value.length > 2) return;

    const updated = { ...puntajes, [field]: value };
    setPuntajes(updated);

    // Validación en tiempo real
    const err = validarPuntaje(updated.pareja1, updated.pareja2);
    setError(err);

    // Autoenfocar al siguiente input si ya ingresó 2 dígitos en el primero
    if (field === 'pareja1' && value.length === 2) {
      inputRefs.current['pareja2']?.focus();
    }
  };

  const handleConfirm = () => {
    const err = validarPuntaje(puntajes.pareja1, puntajes.pareja2);
    if (err) {
      setError(err);
      return;
    }

    onConfirm({
      pareja1: parseInt(puntajes.pareja1, 10),
      pareja2: parseInt(puntajes.pareja2, 10),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      
      
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>   
          <Titulo titulo="TIE-BREAK" />
          <Text style={styles.label}>Ingresa el marcador del Tie-Break:</Text>
                <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          {pareja && (
            <View style={styles.parejaContainer}>
                    <Text style={styles.cancha}>Cancha: {pareja.nombre_cancha}</Text>
              <View style={styles.jugadoresContainer}>
                <View style={styles.equipo1}>
                  <Text style={styles.nombreJugador}>{pareja.jugadores[0]?.nombre || '-'}</Text>
                  <Text style={styles.nombreJugador}>{pareja.jugadores[2]?.nombre || '-'}</Text>
                </View>

                <View style={styles.equipo2}>
                  <Text style={styles.nombreJugador}>{pareja.jugadores[1]?.nombre || '-'}</Text>
                  <Text style={styles.nombreJugador}>{pareja.jugadores[3]?.nombre || '-'}</Text>
                </View>

                <View style={styles.vsContainer}>
                  <Text style={styles.vs}>VS</Text>
                </View>
              </View>

              <View style={styles.editorContainer}>
              <View style={styles.inputsRow}>
                <TextInput
                  ref={(ref) => (inputRefs.current['pareja1'] = ref)}
                  style={styles.marcadorInput}
                  keyboardType="number-pad"
                  value={puntajes.pareja1}
                  onChangeText={(text) => handleChange('pareja1', text)}
                  maxLength={2}
                  placeholder="0"
                  placeholderTextColor="#fff"
                  keyboardShouldPersistTaps="handled"
                />
                <Text style={styles.vs}>-</Text>
                <TextInput
                  ref={(ref) => (inputRefs.current['pareja2'] = ref)}
                  style={styles.marcadorInput}
                  keyboardType="number-pad"
                  value={puntajes.pareja2}
                  onChangeText={(text) => handleChange('pareja2', text)}
                  maxLength={2}
                  placeholder="0"
                  placeholderTextColor="#fff"
                />
              </View>
              </View>

              {error !== '' && <Text style={styles.errorText}>{error}</Text>}
            </View>
          )}
</ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};




const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00baff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  scrollView: {
    maxHeight: '90%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
    buttonRow: {
     flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
   cancelButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#C9C9C9',
    borderRadius: 18,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#00BFFF',
    borderRadius: 18,
    alignItems: 'center',
  },
  closeButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#C9C9C9',
    borderRadius: 30,
    alignItems: 'center',
  },
  terminateButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#00BFFF',
    borderRadius: 30,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  input: {
  borderWidth: 1,
  borderColor: '#00BFFF',      // Borde azul para que combine con tus botones
  borderRadius: 12,            // Bordes más redondeados
  paddingVertical: 10,         // Espaciado vertical
  paddingHorizontal: 15,       // Espaciado horizontal
  fontSize: 16,
  color: '#333',
  backgroundColor: '#F8F8F8',  // Fondo claro para destacar el campo
  marginBottom: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,                // Sombra para Android
},
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: -5,
  },
    parejaContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    elevation: 8,
    marginTop: 6, 
      borderWidth: 2,
  borderColor: '#00BFFF', 
  },
   jugadoresContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 1,
  position: 'relative', // necesario para el posicionamiento absoluto de VS
},
equipo1: {
  flex: 1,
  alignItems: 'flex-start',
},

equipo2: {
  flex: 1,
  alignItems: 'flex-end',
},

vsContainer: {
  position: 'absolute',
  left: '50%',
  transform: [{ translateX: -15 }], // Ajusta este valor según el ancho de "VS"
  zIndex: 1,
},

vs: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#666',
},
  editorContainer: { marginTop: 10, alignItems: 'center' },
  inputsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 , gap: 8},
  marcadorInput: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#02B9FA',
    color: 'white',
    borderWidth: 2,
    borderColor: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 15,
  },
  cancha: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#666',
  marginTop: -4
},
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20, // Espaciado vertical para el contenido
  },
});

export default TimeBreak;