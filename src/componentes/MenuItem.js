// MenuItem.js
import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";

const MenuItem = ({ label, isActive, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <Text style={[styles.menuItem, isActive && styles.activeMenuItem]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    color: "#fff",
    fontSize: RFValue(12, 667),
    fontWeight: "bold",
  },
  activeMenuItem: {
    color: "#02B9FA", // Color activo cuando está seleccionado
    borderBottomWidth: 2,
    borderBottomColor: "#02B9FA",
    paddingBottom: 5,
  },
});

export default MenuItem;