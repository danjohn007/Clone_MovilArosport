import * as React from "react";
import {Image, StyleSheet, Text, View} from "react-native";

const Porcentaje = () => {
  	
  	return (
        <View style={styles.groupWrapper}>
        <View style={styles.ellipseParent4}>
              <Image style={[styles.groupChild, styles.groupChildPosition]} resizeMode="cover" source="Ellipse 97.png" />
              <Text style={[styles.text8, styles.text8Typo]}>100%</Text>
              <Text style={[styles.eficaciaLtimos10, styles.text8Typo]}>{`Eficacia         últimos 10`}</Text>
        </View>
  </View>);
};

const styles = StyleSheet.create({
    eficaciaLtimos10: {
        top: 40,
        fontSize: 7,
        width: 65
  },
    text8Typo: {
        left: 4,
        height: 19,
        display: "flex",
        color: "#000",
        fontFamily: "Inter-SemiBold",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontWeight: "600",
        letterSpacing: 0,
        position: "absolute"
  },
    text8: {
        top: 19,
        fontSize: 18,
        width: 69
  },
    groupChildPosition: {
        left: 0,
        top: 0,
        position: "absolute"
  },
    groupChild: {
        width: 71,
        height: 71
  },
    groupWrapper: {
            width: 70, 
		height: 70,
		padding: 3,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		position: "absolute",
		borderRadius: 38.5, // Hace que el contenedor sea circular (mitad del ancho/alto)
		backgroundColor: "white", // Fondo blanco
		borderWidth: 2, // Ancho del borde
		borderColor: "#02b9fa", // Color del borde azul
		top: "80%", // Mueve al centro vertical
	    left: "37%", // Mueve al centro horizontal
  	},
      ellipseParent4: {
        width: 70,
        height: 71,
  },
});

export default Porcentaje;
