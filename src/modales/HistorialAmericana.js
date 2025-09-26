import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import HistorialPartidos from '../componentes/HistorialPartidos.js';
import  {obtenerRondasAmericana} from '../componentes/Activos/Americana/AmericanaApiService.js';
import Ionicons from 'react-native-vector-icons/Ionicons';


const HistorialAmericana = ({ visible, closeModal, juegoId, onTerminar }) => {
  console.log("id juego de historial", juegoId);
  const [data, setData] = useState([]); // Estado para almacenar las rondas
  const [loading, setLoading] = useState(false); // Estado para manejar la carga

  useEffect(() => {
  const fetchRondas = async () => {
    if (visible) {
      setLoading(true);
      try {
      const respuesta = await obtenerRondasAmericana(juegoId);
console.log("rondas de juego", respuesta);

const rondas = respuesta.rondas;

        // Agrupar rondas por número de ronda
        const rondasAgrupadas = {};

        rondas.forEach((r) => {
          const rondaNum = parseInt(r.ronda, 10);

          if (!rondasAgrupadas[rondaNum]) {
            rondasAgrupadas[rondaNum] = [];
          }

          rondasAgrupadas[rondaNum].push({
            jugadores: [
              { nombre: r.nombre_jugador1_p1 },
              { nombre: r.nombre_jugador1_p2 },
              { nombre: r.nombre_jugador2_p1 },
              { nombre: r.nombre_jugador2_p2 },
            ],
            puntos: {
              pareja1: parseInt(r.puntos_p1, 10),
              pareja2: parseInt(r.puntos_p2, 10)
            },
            tieBreak: (r.puntos_tieBreak_p1 !== null && r.puntos_tieBreak_p2 !== null) ? {
      pareja1: parseInt(r.puntos_tieBreak_p1, 10),
      pareja2: parseInt(r.puntos_tieBreak_p2, 10)
    } : null,
          });
        });

        // Convertir el objeto a array con formato esperado
        const dataFormateada = Object.entries(rondasAgrupadas).map(([ronda, parejas]) => ({
          ronda: parseInt(ronda, 10),
          parejas
        }));
        setData(dataFormateada);
      } catch (error) {
        console.log("Error al obtener las rondas:", error);
      }
      setLoading(false);
    }
  };

  fetchRondas();
}, [visible, juegoId]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
       
          <Text style={styles.title}>Historial de Rondas</Text>
          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : data.length === 0 ? (
            <Text style={styles.emptyText}>No hay rondas registradas aún</Text>
          ) : (
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
              {data.map((rondaData, index) => (
                <HistorialPartidos 
                  key={index} 
                  ronda={rondaData.ronda}
                  parejas={rondaData.parejas}
                />
              ))}
            </ScrollView>
          )}
             <TouchableOpacity style={styles.btnCerrar} onPress={closeModal}>
            <Text style={styles.textoCerrar}>Cerrar</Text>
          </TouchableOpacity>
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
          btnCerrar: {
      backgroundColor: '#02B9FA',
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
});

export default HistorialAmericana;