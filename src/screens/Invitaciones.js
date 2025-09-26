import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Titulo from '../componentes/Titulo';
import Logo from '../componentes/Logo';
import InivitacionJugada from '../componentes/InivitacionJugada';
import APIManager from '../componentes/API/APIManager';
import { useAuth } from './Auth/AuthContext';
import InvitacionesModal from '../modales/InivtacionesModal';
import BannerAd from '../componentes/BannerAd';

const Invitaciones = () => {
  const navigation = useNavigation();
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id_usuario } = useAuth();
  const [idJugador, setIdJugador] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState({});

  const fetchJugador = async () => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Invitaciones/Invitaciones/mostrar_jugador/${id_usuario}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res && res.length > 0) {
        setIdJugador(res[0].id_jugador);
      }
    } catch (error) {
      console.log('Error al obtener el jugador:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitaciones = async (idJugador) => {
    try {
      setLoading(true);
      const res = await APIManager({
        url: `Invitaciones/Invitaciones/mostrar_invitaciones/${idJugador}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setInvitaciones(res);
    } catch (error) {
      console.log('Error al obtener las invitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJugador();
  }, []);

  useEffect(() => {
    if (idJugador) {
      fetchInvitaciones(idJugador);
    }
  }, [idJugador]);

  const handlePress = (idJuego, idfraccionamientoclub, categoria) => {
    setSelectedData({ idJuego, idfraccionamientoclub, categoria });
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <InivitacionJugada
      juego={item.jue_nombre}
      fecha={item.jue_fecha}
      hora={item.jue_hora}
      invitado={item.usuario_nombre || 'N/A'}
      modalidad={item.modalidad_nombre || 'N/A'}
      onPress={() => handlePress(item.id_juego, item.id_fraccionamientoclub, item.nivel_juego)}
    />
  );

  const handleAceptar = async () => {
    try {
      await APIManager({
        url: `Invitaciones/Invitaciones/aceptar_rechazar/${selectedData.idJuego}/${idJugador}/${id_usuario}/aceptar`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      Alert.alert('Éxito', 'Invitación aceptada con éxito.');
      setModalVisible(false);
      fetchInvitaciones(idJugador); // Refrescar la lista
    } catch (error) {
      console.log('Error al aceptar la invitación:', error);
      Alert.alert('Error', 'No se pudo aceptar la invitación.');
    }
  };

  const handleRechazar = async () => {
    try {
      await APIManager({
        url: `Invitaciones/Invitaciones/aceptar_rechazar/${selectedData.idJuego}/${idJugador}/${id_usuario}/rechazar`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      Alert.alert('Éxito', 'Invitación rechazada con éxito.');
      setModalVisible(false);
      fetchInvitaciones(idJugador); // Refrescar la lista
    } catch (error) {
      console.log('Error al rechazar la invitación:', error);
      Alert.alert('Error', 'No se pudo rechazar la invitación.');
    }
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="INVITACIONES" />
      <View style={styles.center}>
        {loading ? (
          <Text>Cargando...</Text>
        ) : (
          <FlatList
            data={invitaciones}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
      <InvitacionesModal
        visible={modalVisible}
        closeModal={() => setModalVisible(false)}
        data={selectedData}
        onAceptar={handleAceptar}
        onRechazar={handleRechazar}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2E2E2E',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
});

export default Invitaciones;
