import * as React from "react";
import { Text, StyleSheet, View } from "react-native";

const CardCambiarPlan = ({ titulo, total, }) => {
  	return (
    		<View style={styles.cardContainer}>
      			<View style={styles.header}>
        				<Text style={styles.headerText}>{titulo}</Text>
      			</View>
      			
      			<View style={styles.row}>
        				<Text style={styles.label}>Total:</Text>
        				<Text style={styles.value}>${total}</Text>
      			</View>
      			
    		</View>
  	);
};

const styles = StyleSheet.create({
  	cardContainer: {
    		borderRadius: 15,
    		backgroundColor: "#fff",
    		borderColor: "colors.primary",
    		borderWidth: 3.5,
    		padding: 15,
    		width: 300,
  	},
  	header: {
    		backgroundColor: "colors.primary",
    		borderRadius: 20,
    		paddingVertical: 8,
    		alignItems: "center",
    		marginBottom: 10,
  	},
  	headerText: {
    		color: "#fff",
    		fontSize: 16,
    		fontWeight: "bold",
  	},
  	row: {
    		flexDirection: "row",
    		justifyContent: "space-between",
    		marginBottom: 5,
  	},
  	label: {
    		fontSize: 14,
    		fontWeight: "bold",
    		color: "#000",
  	},
  	value: {
    		fontSize: 14,
    		color: "#000",
  	},
});

export default CardCambiarPlan;
