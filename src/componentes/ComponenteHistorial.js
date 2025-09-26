import * as React from "react";
import { Text, StyleSheet, Image, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Estadisticas from "../componentes/Estadisticas";
const Historial = ({ players, scores, logoSource, backgroundImage }) => {
  return (
    <View style={styles.historial}>
      <View style={styles.frameGroup}>
        <View style={styles.frameWrapperLayout}>
          <View style={styles.frameWrapper1}>
            <View style={styles.frameContainer}>
              <View style={styles.frameView}>
                {players.map((player, index) => (
                  <View key={index} style={styles.capturaDePantalla20241004Parent}>
                    {player.image ? (
                      <Image style={styles.capturaDePantalla20241004} resizeMode="cover" source={player.image} />
                    ) : (
                      <Icon name="person" size={25} color="#000" />
                    )}
                    <Text style={styles.fran}>{player.name}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.frameParent2}>
                <View style={styles.parent}>
                  {scores.teamA.map((score, index) => (
                    <Text key={index} style={styles.text}>{score}</Text>
                  ))}
                </View>

                <View style={styles.vectorContainer}>
                  <Image style={styles.frameChild6} resizeMode="cover" source={require('../assets/Vector146.png')} />
                </View>

                <View style={styles.group}>
                  {scores.teamB.map((score, index) => (
                    <Text key={index} style={styles.text}>{score}</Text>
                  ))}
                </View>
                
              </View>
            </View>
          </View>
        </View>
        <Estadisticas/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    frameParentFlexBox: {
        flexDirection: "row",
        alignItems: "center"
  },
  historial1Position: {
        left: 0,
        position: "absolute"
  },
  frameChildLayout: {
        maxWidth: "100%",
        overflow: "hidden"
  },
  parentFlexBox1: {
        alignContent: "center",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
  },
  parentFlexBox: {
        gap: 2,
        alignItems: "center"
  },
  textTypo1: {
        display: "flex",
        fontFamily: "Inter-SemiBold",
        color: "#000",
        fontWeight: "600",
        letterSpacing: 0,
        alignItems: "center"
  },
  frameWrapperLayout: {
        width: 228,
        height: 130
  },
  textTypo: {
        height: 18,
        display: "flex",
        fontFamily: "Inter-SemiBold",
        color: "#000",
        fontWeight: "600",
        letterSpacing: 0,
        textAlign: "left",
        fontSize: 16,
        alignItems: "center"
  },

  historial1: {
        fontWeight: "900",
        fontFamily: "Inter-Black",
        color: "#02b9fa",
        top: 0,
        left: 0,
        textAlign: "left",
        fontSize: 16
  },
  border: {
        right: 2,
        borderRadius: 3,
        borderColor: "#3c3c3c",
        borderWidth: 1,
        width: 22,
        opacity: 0.35,
        borderStyle: "solid",
        backgroundColor: "#fff",
        height: 11,
        top: 0,
        position: "absolute"
  },

  capturaDePantalla20241004: {
        borderRadius: 101,
        width: 25,
        height: 25
  },
  fran: {
        fontFamily: "Inter-SemiBold",
        color: "#000",
        fontSize: 8,
        alignSelf: "stretch",
        textAlign: "center",
        fontWeight: "600",
        letterSpacing: 0
  },
  capturaDePantalla20241004Parent: {
        width: 26
  },
  vectorIcon: {
        width: 68,
        maxHeight: "100%"
  },
  vectorWrapper: {
        padding: 3,
        width: 75
  },
  frameParent1: {
        height: 104,
        rowGap: 6,
        columnGap: 10,
        width: 75
  },
  text: {
        width: 11,
        height: 19,
        textAlign: "left",
        fontSize: 16
  },
  parent: {
        width: 86,
        height: 33,
        rowGap: 0,
        columnGap: 15
  },
  frameChild6: {
        width: 81,
        maxHeight: "100%"
  },
  vectorContainer: {
        height: 12,
        padding: 3,
        alignSelf: "stretch",
        justifyContent: "center",
        alignItems: "center"
  },
  group: {
        width: 83,
        height: 36,
        gap: 15,
        justifyContent: "center",
        alignItems: "center"
  },
  frameParent2: {
        width: 93
  },
  frameView: {
        width: 181,
        gap: 13,
        alignItems: "center"
  },
  frameContainer: {
        width: 185,
        alignItems: "flex-end"
  },
  frameWrapper: {
        height: 130,
        paddingVertical: 9,
        paddingHorizontal: 10,
        justifyContent: "flex-end",
        borderColor: "#00baff",
        borderRadius: 11,
        alignSelf: "stretch"
  },
  text6: {
        width: 19
  },
  frameWrapper1: {
        paddingVertical: 9,
        paddingHorizontal: 10,
        justifyContent: "flex-end",
        borderColor: "#00baff",
        borderRadius: 11,
        borderWidth: 3,
        borderStyle: "solid",
        backgroundColor: "#fff",
        alignItems: "center",
        width: 228,
        left: 0,
        top: 0,
        position: "absolute"
  },

  frameGroup: {
    marginTop:15,
        width: 229,
        gap: 9,
        alignItems: "center",
        position: "absolute",
        alignContent:"center",

  },
  whatsappImage20240927At5: {
        top: 568,
        width: 415,
        height: 63
  },

  logoComponenteMaestrp: {
        height: "11.96%",
        width: "23.43%",
        top: "2.17%",
        right: "42.51%",
        bottom: "85.87%",
        left: "34.06%",
        maxHeight: "100%",
        position: "absolute"
  },
  historial: {
        backgroundColor: "#2e2e2e",
        flex: 1,
        height: 736,
        overflow: "hidden",
        width: "100%",
        alignContent:"center",
        alignItems: "center",
  }
});

export default Historial;
