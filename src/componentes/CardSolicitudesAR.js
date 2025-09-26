import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import ComponenteRanking from './ComponenteRanking';
import APIManager from '../componentes/API/APIManager';

const CardSolicitudesAR = ({ userName, gameName, date, category, id_juego, id_usuario, onAccept, onReject }) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleViewRanking = async () => {
    setLoading(true);
  
    console.log(' Buscando id_usuario:', id_usuario);
  
    if (!id_usuario) {
      console.log(" Error: id_usuario es undefined. No se puede hacer la consulta.");
      setLoading(false);
      return;
    }
  
    try {
      let url = `/ranking/FiltroRanking/get_filtroRankings?id_usuario=${id_usuario}`;
      console.log('📡 Llamando a la API con URL:', url);
  
      const response = await APIManager({
        url: url,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      console.log(' Respuesta obtenida de la API:', response);
  
      if (response && Array.isArray(response) && response.length > 0) {
        console.log(' Lista de id_usuario disponibles en la respuesta:', response.map(user => user.id_usuario));
  
        const userRanking = response.find(user => Number(user.id_usuario) === Number(id_usuario));
  
        console.log(' Resultado encontrado:', userRanking);
  
        if (userRanking) {
          setSelectedUser({
            name: `${userRanking.us_nombre} ${userRanking.us_apellidop}`,
            puntos: userRanking.jug_puntos,
            position: userRanking.num_ranking,
          });
  
          setModalVisible(true);
        } else {
          // Mostrar un alert si el usuario no está en el ranking
          Alert.alert('Usuario no encontrado', 'El usuario no está en el ranking.', [{ text: 'Cerrar' }]);
          console.warn(' Usuario no encontrado en el ranking');
        }
      } else {
        console.warn(' No hay ranking disponible para este usuario');
      }
    } catch (error) {
      console.log(' Error al obtener el ranking:', error);
    }
    
    setLoading(false);
  };
  

  return (
    <View style={styles.card}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestText}>
          <Text style={styles.userName}>{userName}</Text> quiere unirse a tu partida:
          <Text style={styles.gameName}> {gameName}</Text>
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha:</Text>
        <Text style={styles.value}>{date}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Usuario:</Text>
        <Text style={styles.value}>{userName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Categoría:</Text>
        <Text style={styles.value}>{category}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#00AEEF" />
      ) : (
        <TouchableOpacity onPress={handleViewRanking}>
          <Text style={styles.viewProfile}>Ver Ranking</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(id_juego, id_usuario)}>
          <Text style={styles.acceptText}>ACEPTAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={() => onReject(id_juego, id_usuario)}>
          <Text style={styles.rejectText}>RECHAZAR</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para mostrar el ranking */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ranking de {selectedUser?.name}</Text>
            {selectedUser ? (
              <ComponenteRanking position={selectedUser.position} nombre={selectedUser.name} puntos={selectedUser.puntos} />
            ) : (
              <Text>No hay datos de ranking disponibles</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// **Estilos**
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#00AEEF',
    borderWidth: 2,
    padding: 15,
    margin: 10,
    alignItems: 'center',
  },
  requestHeader: {
    backgroundColor: '#00AEEF',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: '100%',
  },
  requestText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  userName: {
    fontWeight: 'bold',
  },
  gameName: {
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  value: {
    fontSize: 14,
    color: '#000',
  },
  viewProfile: {
    color: '#00AEEF',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#00AEEF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  acceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  rejectText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderWidth: 2,
    borderColor: "#00baff",
    borderRadius: 10,
    width: 380,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#00AEEF',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
   rankingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    width: '100%',
  },
});

export default CardSolicitudesAR;
