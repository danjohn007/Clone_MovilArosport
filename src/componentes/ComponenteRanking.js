import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileChip from "../componentes/ComponetePerfil";

// Componente Frame adaptado
const ComponenteRanking = ({ position, nombre, puntos }) => {
  return (
    <View>
       
       <View style={styles.frameParent}>
      {/* 1. Posición + Icono persona */}
      <View style={[styles.leftSection, styles.wrapperFlexBox]}>
        <View style={styles.positionWrapper}>
          <Text style={styles.text}>{position}</Text>
        </View>
        <Ionicons name="people-outline" style={styles.vectorIcon2} />
      </View>

      {/* 2. Nombre del jugador */}
      <View style={styles.centerSection}>
        <Text style={[styles.franBeltrn, styles.text1Typo]}>{nombre}</Text>
      </View>

      {/* 3. Icono torneo + puntos */}
      <View style={styles.rightSection}>
        <Ionicons name="trophy-outline" style={styles.vectorIcon} />
        <Text style={[styles.text1, styles.text1Typo]}>{puntos}</Text>
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frameParent: {
    borderRadius: 20,
    borderColor: colors.primary,
    borderWidth: 2,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapperFlexBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  positionWrapper: {
    borderRadius: 20,
    backgroundColor: colors.primary,
    width: 27,
    paddingHorizontal: 1,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
  },
  vectorIcon2: {
    fontSize: 19,
    color: '#809FB8',
  },
  centerSection: {
    flex: 1,
    paddingHorizontal: 10,
  },
  franBeltrn: {
    fontSize: 13,
    color: '#838080',
  },
  text1Typo: {
    fontFamily: 'Poppins-Regular',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 90, // espacio fijo para que todo se alinee igual
    gap: 5,
  },
  vectorIcon: {
    fontSize: 19,
    color: colors.primary,
  },
  text1: {
    fontSize: 15,
    color: colors.primary,
    textAlign: 'right',
    minWidth: 40, // garantiza espacio mínimo para número
  },
});

  
  export default ComponenteRanking;