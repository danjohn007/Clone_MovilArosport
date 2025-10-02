import { View, Text, Button, StyleSheet, TouchableOpacity, Image, ScrollView, Pressable } from 'react-native';
import React, { useState } from 'react'; 
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const Canjear = () => {
  const navigation = useNavigation(); 
  const [selectedMenu, setSelectedMenu] = useState(''); // Estado para el menú seleccionado

  // Función para seleccionar el menú
  const handleMenuSelect = (menuItem) => {
    setSelectedMenu(menuItem);
  };

  const handleCanjearPress = () => {
    handleMenuSelect('CANJEAR'); // Cambiar color al seleccionar "CANJEAR"
  };

  return (
    <View style={styles.principalClub}>
      <View style={styles.header1}>
        <Image
          source={require('../../assets/logo3.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>THE CLUB PADEL & ACADEMY</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {/* Reservar */}
        <Pressable onPress={() => handleMenuSelect('RESERVAR')}>
          <Text style={[
            styles.menuItem, 
            selectedMenu === 'RESERVAR' && styles.selectedMenuItem
          ]}>RESERVAR</Text>
        </Pressable>

        {/* Noticias */}
        <Pressable onPress={() => handleMenuSelect('NOTICIAS')}>
          <Text style={[
            styles.menuItem, 
            selectedMenu === 'NOTICIAS' ? styles.selectedMenuItemNoticias : styles.menuItem
          ]}>NOTICIAS</Text>
        </Pressable>

        {/* Canjear */}
        <Pressable onPress={handleCanjearPress}>
          <Text style={[
            styles.menuItem, 
            selectedMenu === 'CANJEAR' && styles.selectedMenuItem
          ]}>CANJEAR</Text>
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.gridScrollContainer} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={[styles.gridItem, selectedItem === 'item1' && styles.selectedItem]} // Cambia el estilo si está seleccionado
            onPress={() => handleSelectItem('item1')} // Maneja la selección
          >
            <Image
              source={require('../../assets/DemoDay.jpeg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Demo Day</Text>
          <Text style={styles.description}>¿Quieres comprar una pala nueva y no sabes cuál?</Text>

          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, selectedItem === 'item2' && styles.selectedItem]}
            onPress={() => handleSelectItem('item2')}
          >
            <Image
              source={require('../../assets/TheClub.jpeg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Clases</Text>
                    <Text style={styles.description}>Horarios Disponibles: 7:00 am, 10:00 am</Text>

          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, selectedItem === 'item3' && styles.selectedItem]}
            onPress={() => handleSelectItem('item3')}
          >
            <Image
              source={require('../../assets/TorneoExpress.jpeg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Torneo Relampago</Text>
          	<Text style={styles.description}>Inscripciones Abiertas</Text>

          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, selectedItem === 'item4' && styles.selectedItem]}
            onPress={() => handleSelectItem('item4')}
          >
            <Image
              source={require('../../assets/CanchasDisponibles.jpeg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Canchas disponibles</Text>
       		<Text style={styles.description}>Escoge la mejor</Text>

          </TouchableOpacity>

              <TouchableOpacity 
            style={[styles.gridItem, selectedItem === 'item5' && styles.selectedItem]}
            onPress={() => handleSelectItem('item5')}
          >
            <Image
              //source={require('../../assets/opcion4.png')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Opción 4</Text>
          </TouchableOpacity>
               <TouchableOpacity 
            style={[styles.gridItem, selectedItem === 'item6' && styles.selectedItem]}
            onPress={() => handleSelectItem('item6')}
          >
            <Image
             // source={require('../../assets/opcion4.png')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Opción 4</Text>
          </TouchableOpacity>
        </View>
  
          </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  principalClub: {
    flex: 1,
    backgroundColor: "#2E2E2E", // Fondo gris oscuro
    padding: 10,
  },
  selectedItem: {
    borderColor: colors.primary, // Cambia el color del borde cuando está seleccionado
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly', // Centra los elementos de forma equitativa
    marginVertical: 10,
    width: '100%',
    marginTop: 5, // Baja las cuadrículas para dejar espacio para el botón "Juego cercano"
  },
  header: {
    backgroundColor: "#00bfff",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    alignItems: "center",
  },
  menuItem: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuItemNoticias: {
    color: "colors.primary", // Color azul para "NOTICIAS"
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 2, // Línea debajo de "NOTICIAS"
    borderBottomColor: "colors.primary",
    paddingBottom: 5,
  },
  selectedMenuItem: {
    color: "colors.primary", // Cambia el color al azul cuando está seleccionado
    borderBottomWidth: 2,
    borderBottomColor: "colors.primary",
    paddingBottom: 5,
  },
  selectedMenuItemNoticias: {
    color: "#fff", // Cuando "NOTICIAS" no está seleccionado, se vuelve blanco
    borderBottomWidth: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: '45%',  // Ajusta el tamaño para que haya espacio entre los botones y estén centrados
    height: 180,  // Altura del botón
    backgroundColor: 'white',
    borderRadius: 25,  // Puntas redondeadas
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'transparent', // Cambia el color por defecto a transparente
    overflow: 'hidden',
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  gridImage: {
    width: '99.99%',
    height: '58%',  // Cambia a '50%' para que la imagen ocupe la mitad del contenedor
    borderTopLeftRadius: 21,  // Esquinas superiores redondeadas
    borderTopRightRadius: 21,
    marginTop: -28,
  },
  gridText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 27,
  },
  logo: {
    width: 85,
    height: 85,
    marginRight: -5, // Asegura que el logo tenga espacio suficiente del lado izquierdo
  },
  header1: {
    width: '100%',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});

export default Canjear;
