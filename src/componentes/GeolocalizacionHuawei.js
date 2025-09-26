import { View, Text } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";

export default function GeolocalizacionHuawei() {
  return (
    <View>
      <Text style={estilo}>
        Por el momento los dispositivos Huawei no cuentan con geolocalización
      </Text>
    </View>
  );
}

const estilo = StyleSheet.create({
  fontWeight: "bold",
  color: "#FF0000",
  letterSpacing: 0,
});
