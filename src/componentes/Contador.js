import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

function Contador({ count, increment, decrement, onChange, disabled }) {
  const handleManualChange = (text) => {
    if (disabled) return;
    const newValue = text.replace(/[^0-9]/g, '');
    if (onChange) {
      onChange(Number(newValue || 0));
    }
  };

  return (
    <View style={styles.rowContainer}>
      {/* Bloque informativo a la izquierda */}
      <View style={styles.infoBox}>
        <Ionicons name="layers-outline" size={22} color={colors.primary} style={styles.icon} />
        <Text style={styles.infoText}>Número de canchas</Text>
      </View>
      {/* Bloque contador a la derecha */}
      <View style={styles.counterBox}>
        <TextInput
          style={styles.countText}
          value={String(count)}
          onChangeText={handleManualChange}
          keyboardType="numeric"
          maxLength={3}
          editable={!disabled}
        />
        {!disabled && (
          <View style={styles.arrowContainer}>
            <TouchableOpacity onPress={increment} style={styles.incrementButton}>
              <Ionicons name="caret-up-outline" size={20} color="#838080" />
            </TouchableOpacity>
            <TouchableOpacity onPress={decrement} style={styles.decrementButton}>
              <Ionicons name="caret-down-outline" size={20} color="#838080" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 13 : 5,
    height: 55,
    marginRight: 10,
    flex: 1.7, // Aumenta el espacio para el texto
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    color: '#838080',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    paddingHorizontal: 6,
    height: 55,
    flex: 0.5, // Reduce el espacio para el número
    minWidth: 60,
    maxWidth: 80,
    justifyContent: 'center',
  },
  countText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15, // Un poco más pequeño
    color: '#838080',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  arrowContainer: {
    marginLeft: 2,
    justifyContent: 'center',
    gap: 0,
  },
  decrementButton: {
    padding: 2,
    borderRadius: 5,
  },
  incrementButton: {
    padding: 2,
    borderRadius: 5,
  },
});

export default Contador;