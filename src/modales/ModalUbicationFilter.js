import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import countries from '../../assets/countries.json';
import states from '../../assets/states.json';
import colors from "../styles/colors";

const ModalUbicationFilter = ({
  visible,
  onClose,
  onSelect,
  tipo, // "pais" o "estado"
  pais, // solo para tipo "estado"
  disableClose = false
}) => {
  const [paises, setPaises] = useState([]);
  const [paisesFiltrados, setPaisesFiltrados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Normaliza texto para búsquedas
  const normalizarTexto = (texto) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Cargar países al abrir modal si tipo es "pais"
  useEffect(() => {
    if (visible && tipo === "pais") {
      const nombres = countries.map(p => p.name).sort();
      setPaises(nombres);
      setPaisesFiltrados(nombres);
      setBusqueda('');
    }
  }, [visible, tipo]);

  // Cargar estados al abrir modal si tipo es "estado"
  useEffect(() => {
    if (visible && tipo === "estado" && pais) {
      const paisObj = countries.find(p => p.name === pais);
      if (paisObj) {
        setLoading(true);
        const estadosFiltrados = states.filter(e => e.country_id === paisObj.id);
        setEstados(estadosFiltrados);
        setLoading(false);
        setBusqueda('');
      } else {
        setEstados([]);
      }
    }
  }, [visible, tipo, pais]);

  // Filtrar países por búsqueda
  const filtrarPaises = (texto) => {
    setBusqueda(texto);
    const textoNormalizado = normalizarTexto(texto);
    const filtrados = paises.filter(p =>
      normalizarTexto(p).includes(textoNormalizado)
    );
    setPaisesFiltrados(filtrados);
  };

  // Filtrar estados por búsqueda
  const filtrarEstados = (texto) => {
    setBusqueda(texto);
    const textoNormalizado = normalizarTexto(texto);
    const filtrados = states.filter(
      e =>
        e.country_id === countries.find(p => p.name === pais)?.id &&
        normalizarTexto(e.name).includes(textoNormalizado)
    );
    setEstados(filtrados);
  };

  // Render item país
  const renderPais = ({ item }) => (
    <TouchableOpacity
      style={styles.itemPais}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <Text style={styles.textoNormal}>{item}</Text>
    </TouchableOpacity>
  );

  // Render item estado
  const renderEstado = ({ item }) => (
    <TouchableOpacity
      style={styles.itemEstado}
      onPress={() => {
        onSelect(item.name);
        onClose();
      }}
    >
      <Text style={styles.textoNormal}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.header}>
            {tipo === "pais" ? "Selecciona un país" : "Selecciona un estado"}
          </Text>

          <TextInput
            style={styles.inputBuscar}
            placeholder={tipo === "pais" ? "Buscar país..." : "Buscar estado..."}
            value={busqueda}
            onChangeText={tipo === "pais" ? filtrarPaises : filtrarEstados}
          />

          {tipo === "pais" ? (
            <FlatList
              data={paisesFiltrados}
              keyExtractor={(item, index) => item + index}
              renderItem={renderPais}
              keyboardShouldPersistTaps="handled"
            />
          ) : loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={estados}
              keyExtractor={(item, index) => item.name + index}
              renderItem={renderEstado}
              keyboardShouldPersistTaps="handled"
            />
          )}

          <TouchableOpacity
            style={[styles.btnCerrar, disableClose && { opacity: 0.5 }]}
            onPress={onClose}
            disabled={disableClose}
          >
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
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: colors.primary,
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
  itemPais: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  itemEstado: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  textoNormal: {
    color: '#333',
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
  inputBuscar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
});

export default ModalUbicationFilter;