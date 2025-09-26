import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import APIManager from './API/APIManager.jsx';

const SearchBarClubes = ({ onClubSeleccionado, placeholder = 'Buscar club...', clearSearch = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);
  const inputRef = useRef(null);

  // Limpiar el campo de búsqueda cuando clearSearch cambia a true
  useEffect(() => {
    if (clearSearch) {
      setSearchTerm('');
      setResultados([]);
      setMostrarLista(false);
      if (onClubSeleccionado) onClubSeleccionado(null);
    }
  }, [clearSearch, onClubSeleccionado]);

  // Maneja la búsqueda de clubes usando la API lista_clubes
  const handleSearch = async (text) => {
    setSearchTerm(text);
    setBuscando(true);

    try {
      const data = new FormData();
      data.append('nombre', text);

      const res = await APIManager({
        url: 'eventos/Eventos/lista_clubes',
        method: 'POST',
        data: data,
      });

      setResultados(res?.data || []);
      setMostrarLista((res?.data || []).length > 0);
    } catch (error) {
      console.log('Error al buscar clubes:', error);
      setResultados([]);
      setMostrarLista(false);
    } finally {
      setBuscando(false);
    }
  };

  // Maneja la selección de un club
  const handleSeleccionar = (club) => {
    Keyboard.dismiss();
    setSearchTerm(club.fc_nombre || 'Club sin nombre');
    setResultados([]);
    setMostrarLista(false);
    if (onClubSeleccionado) onClubSeleccionado(club);
  };

  return (
    <View>
      <View style={styles.container}>
        <Ionicons name='search' style={styles.icon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor='#aaa'
          value={searchTerm}
          onChangeText={handleSearch}
          onFocus={() => setMostrarLista(resultados.length > 0)}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchTerm('');
              setResultados([]);
              setMostrarLista(false);
              if (onClubSeleccionado) onClubSeleccionado(null);
            }}
          >
            <Ionicons name='close-circle' size={22} color='#aaa' />
          </TouchableOpacity>
        )}
      </View>
      {buscando && (
        <ActivityIndicator
          size='small'
          color='#00baff'
          style={{ marginTop: 10 }}
        />
      )}
      {mostrarLista && searchTerm.length > 0 && !buscando && resultados.length > 0 && (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id_fraccionamientoclub.toString()}
          style={styles.lista}
          keyboardShouldPersistTaps='handled'
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleSeleccionar(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemText}>{item.fc_nombre || 'Club sin nombre'}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 47,
    marginBottom: 10,
    borderColor: '#00baff',
    borderWidth: 3,
    width: '95%',
    alignSelf: 'center',
  },
  icon: {
    fontSize: 20,
    color: '#aaa',
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: '100%',
  },
  lista: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: '2.5%',
    borderColor: '#00baff',
    borderWidth: 1,
    marginBottom: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    color: '#222',
    fontSize: 15,
  },
});

export default SearchBarClubes;