import {
  View,
  StyleSheet,
  Text,
} from "react-native";
import React, { useState, useEffect } from "react";
import colors from "../styles/colors";


//modal
const Jugadas = ({
  visible,
  nombre_jugada,
  fecha_jugada,
  horario_jugada,
  duracion_jugada
}) => {


  useEffect(() => {
    if (!visible) {

    }
  }, [visible]);




  return (
  

            <View style={styles.formContainer}>
            

              <View style={styles.detalleContainer}>
           
                <Text style={styles.detalleTexto}>
                  Nombre de la jugada: {nombre_jugada}
                </Text>
                <Text style={styles.detalleTexto}>
 Fecha: {fecha_jugada}
</Text>

                <Text style={styles.detalleTexto}>
                  Horario: {horario_jugada}
                </Text>
                <Text style={styles.detalleTexto}>
                  Duración: {duracion_jugada}
                </Text>
               
              </View>
             
            </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente para resaltar el modal
  },
  modalContainer: {
    backgroundColor: "rgba(255, 255, 255, 1)", // Fondo blanco translúcido
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.primary, // Color del borde
    padding: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Sombra para Android
  },
  formContainer: {
    marginTop: -3,
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F9F9F9", // Fondo claro para inputs
    borderRadius: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#8D288E", // Botón morado
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  closeButton: {
    backgroundColor: "#C9C9C9", // Botón gris claro
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#",
    textAlign: "center",
    marginBottom: 20,
  },
  close: {
    position: "absolute",
    top: -2,
    right: -2,
    zIndex: 10,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  resultText: {
    fontSize: 16,
  },
  listaVacia: {
    textAlign: "center",
    marginTop: -4,
    right: 25,
  },
  detalleContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: 15,
    marginTop: 15,
    alignSelf: "center",
  },
  detalleTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#809FB8",
    textAlign: "center",
  },
  detalleTexto: {
    fontSize: 14,
    color: "#809FB8",
  },
  precioTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#809FB8",
    marginTop: 5,
    textAlign: "left",
  },
  dropdownToggle: {
    backgroundColor: "#00bfff",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    maxHeight: 200,
    marginVertical: 10,
  },
  scrollView: {
    maxHeight: 130,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Jugadas;
