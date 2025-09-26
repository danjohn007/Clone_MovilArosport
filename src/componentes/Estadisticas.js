import * as React from "react";
import { Text, StyleSheet, View } from "react-native";
import Porcentaje from "../componentes/Porcentaje";
import colors from "../styles/colors";

const Estadisticas = () => {
  	
  	return (
		<View style={styles.contenedor}>
        <View style={[styles.partidosWrapper, styles.parentLayout]}>
			<Text style={styles.estadsticasDeLos}>Estadísticas de los resultados</Text>
	    </View>
    		<View style={styles.frameParent}>
				
      			<View style={styles.frameWrapper}>
        				<View style={[styles.frameGroup, styles.wrapperFlexBox]}>
          					<View style={styles.frameContainer}>
            						<View style={styles.wrapperFlexBox}>
              							<Text style={[styles.text, styles.textTypo]}>16</Text>
            						</View>
            						<Text style={[styles.totales, styles.textTypo]}>Totales</Text>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={styles.wrapperFlexBox}>
              							<Text style={[styles.text1, styles.text1Typo]}>14</Text>
            						</View>
            						<Text style={[styles.ganados, styles.text1Typo]}>Ganados</Text>
          					</View>
        				</View>
      			</View>
                  <View style={styles.frameWrapper}>
        				<View style={[styles.frameGroup, styles.wrapperFlexBox]}>
          					<View style={styles.frameContainer}>
            						<View style={styles.wrapperFlexBox}>
              							<Text style={[styles.text, styles.textTypo]}>10</Text>
            						</View>
            						<Text style={[styles.totales, styles.textTypo]}>Últimos</Text>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={styles.wrapperFlexBox}>
              							<Text style={[styles.text1, styles.text1Typo]}>10</Text>
            						</View>
            						<Text style={[styles.ganados, styles.text1Typo]}>Ganados</Text>
          					</View>
        				</View>
      			</View>
				  <Porcentaje/>

				  </View>
				  </View>
	);
};

const styles = StyleSheet.create({
	parentLayout: {
        height: 37.95, 
        justifyContent: "center"
  },
	partidosWrapper: {
		borderRadius: 23, 
		backgroundColor: colors.primary,
		width: 251.85, 
		padding: 3.45, 
		borderWidth: 3.45, 
		borderColor: colors.white,
		alignItems: "center",
		flexDirection: "row",
		borderStyle: "solid",
		marginTop: 11.5, 
	},
	contenedor: {
        width: 259.9, 
        gap: 9.2, 
        alignItems: "center",
  },
	estadsticasDeLos: {
        fontSize: 12.65, 
        letterSpacing: 0,
        fontWeight: "700",
        fontFamily: "Inter-Bold",
        color: colors.white,
        textAlign: "left"
        },
	estadsticasDeLosResultadosParent: {
        borderRadius: 23, 
        backgroundColor: colors.primary,
        borderStyle: "solid",
        borderColor: colors.white,
        borderWidth: 3.45, 
        flex: 1,
        width: "100%",
        height: 37.95, 
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 3.45, 
        marginTop: 23, 
        },
  	wrapperFlexBox: {
    		justifyContent: "center",
    		flexDirection: "row",
  	},
  	textTypo: {
    		textAlign: "left",
    		color: colors.black,
    		fontFamily: "Inter-SemiBold",
    		fontWeight: "600",
    		letterSpacing: 0
  	},
  	text1Typo: {
    		color: colors.primary,
    		textAlign: "left",
    		fontFamily: "Inter-SemiBold",
    		fontWeight: "600",
    		letterSpacing: 0
  	},
  	text: {
    		fontSize: 23 
  	},
  	totales: {
    		fontSize: 9.2, 
  	},
  	frameContainer: {
    		gap: 5.75, 
    		flexDirection: "row",
    		alignItems: "center"
  	},
  	text1: {
    		fontSize: 23, 
  	},
  	ganados: {
    		fontSize: 9.2,
  	},
  	frameGroup: {
    		width: 207, 
    		gap: 34.5, 
			marginTop: 11.5, 
  	},
  	frameWrapper: {
    		width: 241.5, 
    		height: 41.4, 
    		justifyContent: "flex-end",
    		alignItems: "center"
  	},
  	frameParent: {
    		borderRadius: 12.65, 
    		backgroundColor: "#fff",
    		borderStyle: "solid",
    		borderColor: "#00baff",
    		borderWidth: 3.45, 
    		flex: 1,
    		width: "100%",
    		height: 149.5, 
    		paddingHorizontal: 10.35, 
    		paddingVertical: 9.2, 
            marginTop: 1.15, 
  	}
});

export default Estadisticas;
