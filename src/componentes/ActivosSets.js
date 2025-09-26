import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const HistorialPartidos = ({ title, dateTime, players, scores }) => {
  return (
    <View>
      <View style={[styles.partidosWrapper, styles.parentLayout]}>
        <Text style={[styles.partidos, styles.homeTypo]}>{title}</Text>
      </View>
      <View style={styles.frameWrapperLayout}>
        <View style={[styles.frameWrapper1, styles.frameWrapperLayout]}>
          <View style={styles.frameContainer}>
            <Text style={[styles.oct01, styles.oct01Typo]}>{dateTime}</Text>

            <View style={[styles.frameView, styles.frameParentFlexBox2]}>
              <View style={[styles.frameParent1, styles.parentFlexBox1]}>
                {players.map((player, index) => (
                  <View
                    key={index}
                    style={[styles.capturaDePantalla20241004Parent, styles.parentFlexBox]}
                  >
                    {player.image ? (
                      <Image
                        style={styles.capturaDePantalla20241004}
                        resizeMode="cover"
                        source={player.image}
                      />
                    ) : (
                      <Icon name="person" size={28.75} color="#000" /> // 15% más grande
                    )}
                    <Text style={styles.fran2}>{player.name}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.frameParent2, styles.parentFlexBox]}>
                <View style={[styles.parent, styles.parentFlexBox1]}>
                  {scores.teamA.map((score, index) => (
                    <Text key={index} style={[styles.text3, styles.textTypo3]}>
                      {score}
                    </Text>
                  ))}
                </View>

                <View style={styles.vectorContainer}>
                  <Image
                    style={styles.frameChild6}
                    resizeMode="cover"
                    source={require("../../assets/Vector146.png")}
                  />
                </View>

                <View style={[styles.group1, styles.frameParentFlexBox2]}>
                  {scores.teamB.map((score, index) => (
                    <Text key={index} style={[styles.text3, styles.textTypo3]}>
                      {score}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>   
        </View>
      </View>
  
    </View>
  );
};

const styles = StyleSheet.create({
  group1: {
    width: 95.45, 
    height: 41.4, 
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  parentLayout: {
    height: 37.95,
    justifyContent: "center",
    marginBottom: 11.5, 
  },
  frameChild6: {
    width: 93.15, 
    maxHeight: "100%",
  },
  text3: {
    width: 12.65,
    height: 21.85, 
    textAlign: "left",
    fontSize: 18.4, 
  },
  textTypo3: {
    height: 20.7, 
    display: "flex",
    fontFamily: "Inter-SemiBold",
    color: "#000",
    fontWeight: "600",
    letterSpacing: 0,
    textAlign: "left",
    fontSize: 18.4, 
    alignItems: "center",
  },
  parent: {
    width: 98.9, 
    rowGap: 0,
    columnGap: 15,
    height: 37.95, 
    justifyContent: "center",
  },
  frameParent2: {
    width: 106.95, 
  },
  fran2: {
    fontFamily: "Inter-SemiBold",
    color: "#000",
    fontSize: 9.2, 
    alignSelf: "stretch",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0,
  },
  capturaDePantalla20241004: {
    borderRadius: 116.15, 
    width: 28.75, 
    height: 28.75, 
  },
  parentFlexBox: {
    gap: 2,
    alignItems: "center",
  },
  capturaDePantalla20241004Parent: {
    width: 29.9,
  },
  parentFlexBox1: {
    alignContent: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  frameParent1: {
    height: 119.6, 
    rowGap: 6.9, 
    columnGap: 11.5, 
    width: 86.25,
  },
  frameParentFlexBox2: {
    flexDirection: "row",
    alignItems: "center",
  },
  frameView: {
    width: 208.15, 
    gap: 14.95, 
    alignItems: "center",
  },
  oct01: {
    top: -9.2,
    left: 46, 
    fontSize: 10.35, 
    color: "#000",
    letterSpacing: 0,
    position: "absolute",
  },
  oct01Typo: {
    fontFamily: "Inter-Black",
    fontWeight: "900",
    textAlign: "left",
  },
  frameContainer: {
    width: 212.75, 
    alignItems: "flex-end",
  },
  partidosWrapper: {
    borderRadius: 23, 
    backgroundColor: "#00baff",
    width: 251.85, 
    padding: 3.45, 
    borderWidth: 3.45, 
    borderColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    borderStyle: "solid",
    marginTop: 11.5, 
  },
  partidos: {
    fontSize: 12.65, 
    textAlign: "left",
    letterSpacing: 0,
  },
  homeTypo: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#fff",
  },
  frameWrapperLayout: {
    width: 262.2, 
    height: 149.5, 
  },
  frameWrapper1: {
    paddingVertical: 10.35, 
    paddingHorizontal: 11.5, 
    justifyContent: "flex-end",
    borderColor: "#00baff",
    borderRadius: 12.65, 
    borderWidth: 3.45, 
    borderStyle: "solid",
    backgroundColor: "#fff",
    alignItems: "center",
    width: 262.2,
    left: 0,
    top: 0,
    position: "absolute",
  },
});

export default HistorialPartidos;
