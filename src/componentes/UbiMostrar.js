import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UbiMostrar = ({ placeholder, selectedValue, iconName, onPress }) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.inputBox} onPress={onPress}>
        <Ionicons name={iconName} size={24} color="#02B9FA" style={styles.icon}/>
        <Text style={styles.textInput}>
          {selectedValue || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15, 
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#02B9FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%', // Cambiado de 88% a 100%
    alignItems: 'center',
    marginTop: 15,
  },
  textInput: {
   color: '#809FB8',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  icon: {
    marginRight: 10,
  },
});

export default UbiMostrar;
