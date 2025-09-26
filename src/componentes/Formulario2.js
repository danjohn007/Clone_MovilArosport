import React from "react";
import { TextInput, StyleSheet, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Asegúrate de tener esta librería instalada

const Formulario2 = ({ placeholder, value, onChangeText, secureTextEntry = false }) => {
    return (
        <View style={styles.franBeltranParent}>
            <TextInput
                style={styles.input} // Cambia el nombre de estilo a 'input' para que sea más descriptivo
                placeholder={placeholder}
                placeholderTextColor="#727272"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        fontSize: 14,
        letterSpacing: 0,
        fontWeight: "600",
        fontFamily: "Inter-SemiBold",
        color: "#838080",
        textAlign: "left",
        flex: 1, // Asegúrate de que el TextInput ocupe el espacio disponible
    },
    franBeltranParent: {
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.86)",
        borderStyle: "solid",
        borderColor: "#02b9fa",
        borderWidth: 2,
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 48,
        padding: 10,
    },
    icon: {
        marginRight: 10,
    },
});

export default Formulario2;
