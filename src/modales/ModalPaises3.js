import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import countries from '../../assets/countries.json';
import states from '../../assets/states.json';

const ModalPaises3 = ({ visible, onClose, onSelectPaisEstado, pais, estado }) => {
  const [paises, setPaises] = useState([]);
  const [paisesFiltrados, setPaisesFiltrados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busquedaPais, setBusquedaPais] = useState('');

  const normalizarTexto = (texto) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  useEffect(() => {
    if (visible) {
      cargarPaises();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && pais && paises.length > 0) {
      const paisNormalizado = normalizarTexto(pais);
      const paisEncontrado = paises.find(p => normalizarTexto(p) === paisNormalizado);

      if (paisEncontrado) {
        setPaisSeleccionado(paisEncontrado);
        cargarEstados(paisEncontrado).then(estadosCargados => {
          if (estado && estadosCargados.length > 0) {
            const estadoNormalizado = normalizarTexto(estado);
            const estadoEncontrado = estadosCargados.find(e => normalizarTexto(e.name) === estadoNormalizado);
            setEstadoSeleccionado(estadoEncontrado || null);
          }
        });
      }
    }
  }, [visible, pais, paises]);

  const cargarPaises = () => {
    const nombres = countries.map(p => p.name).sort();
    setPaises(nombres);
    setPaisesFiltrados(nombres);
  };

  const cargarEstados = async (paisNombre) => {
    const paisObj = countries.find(p => p.name === paisNombre);
    if (paisObj) {
      setLoading(true);
      const estadosFiltrados = states.filter(e => e.country_id === paisObj.id);
      setEstados(estadosFiltrados);
      setPaisSeleccionado(paisNombre);
      setEstadoSeleccionado(null);
      setLoading(false);
      return estadosFiltrados;
    } else {
      setEstados([]);
      return [];
    }
  };

  const handleEstadoSelect = (estado) => {
    console.log('Estado seleccionado:..............................', estado);
    setEstadoSeleccionado(estado);
    onSelectPaisEstado(paisSeleccionado, estado.name);
    onClose();
  };

  const filtrarPaises = (texto) => {
    setBusquedaPais(texto);
    const textoNormalizado = normalizarTexto(texto);
    const filtrados = paises.filter(p =>
      normalizarTexto(p).includes(textoNormalizado)
    );
    setPaisesFiltrados(filtrados);
  };

  useEffect(() => {
    if (!busquedaPais && paises.length > 0) {
      setPaisesFiltrados(paises);
    }
  }, [busquedaPais, paises]);

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.header}>Selecciona tu ubicación</Text>

          <TextInput
            style={styles.inputBuscar}
            placeholder="Buscar país..."
            value={busquedaPais}
            onChangeText={filtrarPaises}
          />

          <View style={styles.listasContainer}>
            {/* Lista de Países */}
            <View style={styles.listaCol}>
              <Text style={styles.tituloCol}>País</Text>
              <FlatList
                data={
                  paisSeleccionado
                    ? [paisSeleccionado, ...paisesFiltrados.filter(p => p !== paisSeleccionado)]
                    : paisesFiltrados
                }
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.itemPais,
                      paisSeleccionado === item && styles.itemPaisSeleccionado,
                    ]}
                    onPress={() => cargarEstados(item)}
                  >
                    <Text
                      style={
                        paisSeleccionado === item
                          ? styles.textoSeleccionado
                          : styles.textoNormal
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.divider} />

            {/* Lista de Estados */}
            <View style={styles.listaCol}>
              <Text style={styles.tituloCol}>Estado</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  data={
                    estadoSeleccionado
                      ? [estadoSeleccionado, ...estados.filter(e => e.name !== estadoSeleccionado.name)]
                      : estados
                  }
                  keyExtractor={(item, index) => item.name + index}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.itemEstado,
                        estadoSeleccionado?.name === item.name && styles.itemPaisSeleccionado,
                      ]}
                      onPress={() => handleEstadoSelect(item)}
                    >
                      <Text
                        style={
                          estadoSeleccionado?.name === item.name
                            ? styles.textoSeleccionado
                            : styles.textoNormal
                        }
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.btnCerrar} onPress={onClose}>
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
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: '90%',
      height: '80%',
        borderWidth: 2,
    borderColor: '#00baff',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    header: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    listasContainer: {
      flexDirection: 'row',
      flex: 1,
    },
    listaCol: {
      width: '50%',
      paddingHorizontal: 5,
    },
    tituloCol: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    itemPais: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderColor: '#ccc',
    },
    itemPaisSeleccionado: {
      backgroundColor: '#e6f0ff',
    },
    textoSeleccionado: {
      fontWeight: 'bold',
      color: '#02B9FA',
    },
    textoNormal: {
      color: '#333',
    },
    itemEstado: {
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderColor: '#ccc',
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
    },
    divider: {
        width: 1,
        backgroundColor: '#ccc',
        marginVertical: 10,
      },
      inputBuscar: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        height: 40,
      },
  });
  

export default ModalPaises3;
