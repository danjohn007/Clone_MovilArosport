import React, { useState } from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { useAuth } from "../screens/Auth/AuthContext.js";
import { Ionicons } from "@expo/vector-icons";
import HistorialParejaPuntos from "../modales/HistorialParejasPuntos.js";
import HistorialPuntos2 from "../modales/HistorialPuntos2.js";

const PendienteHistorial = ({
  idJuego,
  nombreJuego,
  fecha,
  hora,
  creador,
  modalidad,
  onSalirSuccess,
  tipoJuego,
}) => {
  const { id_usuario } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);

  return (
    <View style={styles.frameContainer}>
      <View style={styles.frameWrapper}>
        {/* Sección izquierda - Contenido principal */}
        <View style={styles.contentColumn}>
          <View style={styles.titleContainer}>
            <Text
              style={styles.titleGame}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {nombreJuego}
            </Text>
          </View>

          <View style={styles.horizontalDivider} />

          <View style={styles.detailsContainer}>
            <View style={styles.columnDetails}>
              <Ionicons name="calendar-outline" size={17} style={styles.icon} />
              <Text style={styles.textDetails}>{fecha}</Text>
            </View>
            <View style={styles.columnDetails}>
              <Ionicons name="time-outline" size={17} style={styles.icon} />
              <Text style={styles.textDetails}>{hora}</Text>
            </View>
            <View style={styles.columnDetails}>
              <Ionicons name="tennisball-outline" size={17} style={styles.icon} />
              <Text style={styles.textDetails}>{modalidad}</Text>
            </View>
            <View style={styles.columnDetails}>
              <Ionicons name="person-outline" size={17} style={styles.icon} />
              <Text style={styles.textDetails}>Creado por {creador}</Text>
            </View>
          </View>
        </View>

        {/* Línea divisoria vertical */}
        <View style={styles.verticalDivider} />

        {/* Sección derecha - Botones */}
        <View style={styles.optionsColumn}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={styles.optionsButtons}
          >
            <Ionicons name="list-outline" size={18} color="#FFF" />
          </Pressable>
          <Pressable
            onPress={() => setModalVisible2(true)}
            style={styles.optionsButtons}
          >
            <Ionicons name="trophy-outline" size={18} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {/* Modales */}
      <HistorialPuntos2
        visible={modalVisible}
        closeModal={() => setModalVisible(false)}
        juegoId={idJuego}
        onTerminar={() => {
          setModalVisible(false);
          if (onSalirSuccess) onSalirSuccess();
        }}
        esHistorial={true}
        tipoJuego={tipoJuego}
      />

      <HistorialParejaPuntos
        visible={modalVisible2}
        closeModal={() => setModalVisible2(false)}
        juegoId={idJuego}
        onTerminar={() => setModalVisible(false)}
        idUsuarioActual={id_usuario}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  frameContainer: {
    width: "97%",
    paddingHorizontal: 12,
    marginBottom: 10,
    width: "108%",
  },
  frameWrapper: {
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "colors.primary",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    minHeight: 140,
  },
  contentColumn: {
    flex: 3,
    paddingRight: 15,
  },
  titleContainer: {
    borderBottomWidth: 1.1,
    borderBottomColor: "#EEE",
    paddingBottom: 8,
    marginBottom: 12,
  },
  titleGame: {
    color: "colors.primary",
    fontSize: 17,
    fontWeight: "bold",
  },
  detailsContainer: {
    flexDirection: "column",
    gap: 8,
  },
  columnDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  textDetails: {
    color: "#838080",
    fontSize: 14,
    flexShrink: 1,
  },
  icon: {
    marginRight: 8,
    color: "colors.primary",
    minWidth: 20,
  },
  optionsColumn: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    borderLeftWidth: 1.1,
    borderLeftColor: "#EEE",
    paddingLeft: 10,
    marginLeft: 5,
  },
  optionsButtons: {
    backgroundColor: "colors.primary",
    padding: 12,
    borderRadius: 16,
    width: "90%",
    alignItems: "center",
  },
});

export default PendienteHistorial;
