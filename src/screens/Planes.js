import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Logo from '../componentes/Logo';
import Titulo from '../componentes/Titulo';
import Activos from '../screens/Activos';
import Pendientes from '../screens/Pendientes';
import Historial from "./Historial";
import MenuItem from '../componentes/MenuItem';

const MisJuegos = () => {
    // Set the initial state to 'activos' to make it the default selection
    const [selectedItem, setSelectedItem] = useState("activos");

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    return (
        <View style={styles.container}>
            <Logo />
            <Titulo titulo="PLANES" />
            <View style={styles.menu}>
                <MenuItem
                    label="USUARIO"
                    isActive={selectedItem === 'activos'}  // Ensure 'activos' is compared
                    onPress={() => handleSelectItem('activos')}
                />
                <MenuItem
                    label="CLUBES"
                    isActive={selectedItem === 'pendientes'}  // Ensure 'pendientes' is compared
                    onPress={() => handleSelectItem('pendientes')}
                />
                <MenuItem
                    label="DESARROLLOS"
                    isActive={selectedItem === 'historial'}  // Ensure 'historial' is compared
                    onPress={() => handleSelectItem('historial')}
                />
            </View>

            {/* ScrollView para permitir desplazamiento sin límite */}
            <ScrollView 
                contentContainerStyle={styles.contenido}  // Asegura que el contenido se expanda
                style={styles.scrollView}  // Permite que el ScrollView ocupe todo el espacio disponible
            >
                {selectedItem === 'activos' && <Activos />}
                {selectedItem === 'pendientes' && <Pendientes />}
                {selectedItem === 'historial' && <Historial />}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 16,
        backgroundColor: '#2E2E2E',
    },
    contenido: {
        alignItems: "center",
        justifyContent: 'flex-start',
    },
    menu: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 1,
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
    },
});

export default MisJuegos;
