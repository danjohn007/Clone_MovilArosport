import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';



const ModalPaises = ({ visible, onClose, onSelectPaisEstado, estado, pais }) => {
  console.log("pais recibido", pais);
  const [paises, setPaises] = useState([]);
  const [paisesFiltrados, setPaisesFiltrados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPaises, setLoadingPaises] = useState(false);
  const [busquedaPais, setBusquedaPais] = useState('');

  const listaPaisesRef = useRef(null);
  const listaEstadosRef = useRef(null);
  const username = 'impactos';

  const normalizarTexto = (texto) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  useEffect(() => {
    if (visible) {
      if (paises.length === 0) cargarPaises();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && pais && paises.length > 0) {
      const paisNormalizado = normalizarTexto(pais);
      const paisEncontrado = paises.find(p => normalizarTexto(p.countryName) === paisNormalizado);

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

  const cargarPaises = async () => {
    try {
      setLoadingPaises(true);
      const response = await fetch(`https://secure.geonames.org/countryInfoJSON?lang=es&username=${username}`);
      const data = await response.json();
      if (data && data.geonames) {
        setPaises(data.geonames);
        setPaisesFiltrados(data.geonames);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los países');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema con la conexión');
    } finally {
      setLoadingPaises(false);
    }
  };

  const cargarEstados = async (pais) => {
    setLoading(true);
    setEstados([]);
    setPaisSeleccionado(pais);
    setEstadoSeleccionado(null);

    try {
      const response = await fetch(`https://secure.geonames.org/childrenJSON?geonameId=${pais.geonameId}&lang=es&username=${username}`);
      const data = await response.json();
      if (data && data.geonames) {
        setEstados(data.geonames);
        return data.geonames;
      } else {
        setEstados([]);
        return [];
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los estados');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoSelect = (estado) => {
    setEstadoSeleccionado(estado);
    onSelectPaisEstado(paisSeleccionado.countryName, estado.name);
    onClose();
  };

  const filtrarPaises = (texto) => {
    setBusquedaPais(texto);
    const textoNormalizado = normalizarTexto(texto);

    let filtrados = paises.filter(p =>
      normalizarTexto(p.countryName).includes(textoNormalizado)
    );

    if (paisSeleccionado) {
      const seleccionado = filtrados.find(p => p.geonameId === paisSeleccionado.geonameId);
      filtrados = [
        ...(seleccionado ? [seleccionado] : []),
        ...filtrados.filter(p => p.geonameId !== paisSeleccionado.geonameId),
      ];
    }

    setPaisesFiltrados(filtrados);
  };

  useEffect(() => {
    if (!busquedaPais && paises.length > 0) {
      let lista = [...paises];

      if (paisSeleccionado) {
        const seleccionado = lista.find(p => p.geonameId === paisSeleccionado.geonameId);
        lista = [
          ...(seleccionado ? [seleccionado] : []),
          ...lista.filter(p => p.geonameId !== paisSeleccionado.geonameId),
        ];
      }

      setPaisesFiltrados(lista);
    }
  }, [busquedaPais, paisSeleccionado]);

  
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
              {loadingPaises ? (
                <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  ref={listaPaisesRef}
                  data={paisesFiltrados}
                  keyExtractor={(item) => item.geonameId.toString()}
                  initialNumToRender={20}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.itemPais, paisSeleccionado?.geonameId === item.geonameId && styles.itemPaisSeleccionado]}
                      onPress={() => cargarEstados(item)}
                    >
                      <Text
                        style={paisSeleccionado?.geonameId === item.geonameId ? styles.textoSeleccionado : styles.textoNormal}
                      >
                        {item.countryName}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>

            <View style={styles.divider} />

            {/* Lista de Estados */}
            <View style={styles.listaCol}>
              <Text style={styles.tituloCol}>Estado</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  ref={listaEstadosRef}
                  data={estadoSeleccionado ? [estadoSeleccionado, ...estados.filter(e => e.geonameId !== estadoSeleccionado.geonameId)] : estados}
                  keyExtractor={(item) => item.geonameId.toString()}
                  initialNumToRender={20}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.itemEstado, estadoSeleccionado?.geonameId === item.geonameId && styles.itemPaisSeleccionado]}
                      onPress={() => handleEstadoSelect(item)}
                    >
                      <Text
                        style={estadoSeleccionado?.geonameId === item.geonameId ? styles.textoSeleccionado : styles.textoNormal}
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
      
  });
  

export default ModalPaises;
