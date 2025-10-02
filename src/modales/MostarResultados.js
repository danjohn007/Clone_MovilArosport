import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import CustomButton from '../componentes/Buttons';
import Titulo from '../componentes/Titulo';
import HistorialPartidos from '../componentes/HistorialPartidos';
import colors from "../styles/colors";

const ModalHistorialPartidos = ({ visible, closeModal, data }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Titulo titulo="Historial de Partidos" />
          <HistorialPartidos {...data} />
          <CustomButton buttonText="Cerrar" onPress={closeModal} style={styles.closeButton} />
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
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    padding: '5%',
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  closeButton: {
    backgroundColor: '#C9C9C9',
    paddingVertical: '4%',
    borderRadius: 10,
    width: '60%',
    alignSelf: 'center',
  },
});

export default ModalHistorialPartidos;
