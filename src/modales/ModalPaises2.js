import React, { useEffect, useRef, useState } from 'react';
import {
import colors from "../styles/colors";
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

const ModalPaises2 = ({ visible, onClose, onSelectPaisEstado, estado, pais }) => {
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
      const response = await fetch('https://restcountries.com/v3.1/all');
      const data = await response.json();
      const nombres = data
        .map(p => ({ countryName: p.name.common }))
        .sort((a, b) => a.countryName.localeCompare(b.countryName));
      setPaises(nombres);
      setPaisesFiltrados(nombres);
    } catch (error) {
      console.log('Error cargando países:', error);
    } finally {
      setLoadingPaises(false);
    }
  };

  const cargarEstados = async (pais) => {
    try {
      setLoading(true);
      setEstados([]);
      setPaisSeleccionado(pais);
      setEstadoSeleccionado(null);

      const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country: pais.countryName }),
      });

      const data = await response.json();
      if (data?.data?.states) {
        setEstados(data.data.states);
        return data.data.states;
      } else {
        setEstados([]);
        return [];
      }
    } catch (error) {
      console.log('Error cargando estados:', error);
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
    const filtrados = paises.filter(p =>
      normalizarTexto(p.countryName).includes(textoNormalizado)
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
              {loadingPaises ? (
                <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  ref={listaPaisesRef}
                  data={
                    paisSeleccionado
                      ? [paisSeleccionado, ...paisesFiltrados.filter(p => p.countryName !== paisSeleccionado.countryName)]
                      : paisesFiltrados
                  }
                  keyExtractor={(item, index) => index.toString()}
                  initialNumToRender={20}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.itemPais,
                        paisSeleccionado?.countryName === item.countryName && styles.itemPaisSeleccionado,
                      ]}
                      onPress={() => cargarEstados(item)}
                    >
                      <Text
                        style={
                          paisSeleccionado?.countryName === item.countryName
                            ? styles.textoSeleccionado
                            : styles.textoNormal
                        }
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
                  data={
                    estadoSeleccionado
                      ? [estadoSeleccionado, ...estados.filter(e => e.name !== estadoSeleccionado.name)]
                      : estados
                  }
                  keyExtractor={(item, index) => index.toString()}
                  initialNumToRender={20}
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
    height: '85%',
    backgroundColor: '#fff',
      borderWidth: 2,
    borderColor: colors.primary,
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
    color: colors.primary,
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
    backgroundColor: colors.primary,
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

export default ModalPaises2;
