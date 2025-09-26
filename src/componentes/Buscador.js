import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const Buscador = ({ placeholder, onSearch }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        onChangeText={onSearch}
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    justifyContent: 'center',
    elevation: 5,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
});

export default Buscador;
