import { View, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import Logo from '../componentes/Logo';  
import Titulo from '../componentes/Titulo'; 
import MenuItem from '../componentes/MenuItem'; 
import ClubNoticias from '../componentes/ClubNoticias';
import ClubRecompensas from '../componentes/ClubRecompensas';
import ClubReservas from '../componentes/ClubReservar';
import BannerAd from '../componentes/BannerAd';



const Club = ({ route }) => {
  const { clubName, id_fra } = route.params || {};
  const [selectedItem, setSelectedItem] = useState('noticias');
 

  useEffect(() => {
    console.log('Parámetros recibidos en Club:', route?.params);
  }, [route?.params]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  return (
    <View style={styles.principalClub}>
      <Logo /> 
      <Titulo titulo={clubName.toUpperCase()} />
      <View style={styles.menu}>
        <MenuItem
          label="RESERVAR"
          isActive={selectedItem === 'reservar'}
          onPress={() => handleSelectItem('reservar')}
        />
        <MenuItem
          label="NOTICIAS"
          isActive={selectedItem === 'noticias'}
          onPress={() => handleSelectItem('noticias')}
        />
        <MenuItem
          label="RECOMPENSAS"
          isActive={selectedItem === 'canjear'}
          onPress={() => handleSelectItem('canjear')}
        />
      </View>

      {selectedItem === 'reservar' && (
        <ClubReservas route={route} />
      )}
      {selectedItem === 'noticias' && (
        <ClubNoticias route={route} />
      )}
      {selectedItem === 'canjear' && (
        <ClubRecompensas route={route} />
      )}


<View style={styles.containerBaner}>
          <BannerAd />
          </View>

    </View>
  );
};

const styles = StyleSheet.create({
  principalClub: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 16,
  },
  containerBaner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 10,
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    alignItems: "center",
  },
});

export default Club;