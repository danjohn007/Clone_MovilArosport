import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const CardPlanesDesarrollo = ({
  titulo,
  total,
  onBuyNow,
  id,
  subscription,
  status,
  stripeCustomer,
  showBuyButton,
  subscriptionId,
  currency,
  price,
  priceId,
  prices = [],
}) => {

  const navigation = useNavigation();
  console.log("showBuyButton", showBuyButton);
  console.log("subscriptionId", subscriptionId);
  // Verificar si el producto tiene una suscripción activa o pendiente
  const isSubscribed = subscription && subscription === id;

   // Verificar si hay una suscripción activa (para deshabilitar el botón en otras cards)
   const hasActiveSubscription = status === "active";

  const handlePress = async () => {
    try {
      await onBuyNow(currency, priceId, price);
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al procesar el pago.");
    }
  };

    // Determinar el color de fondo según el estado de la suscripción
    const getButtonColor = () => {
      if (isSubscribed) {
        if (status === "active") return "#66BB6A"; // Verde para "Activa"
        if (status === "pending") return "#FFEB3B"; // Amarillo para "Pendiente"
        return "#B0BEC5"; // Gris para "Cancelada"
      }
      if (hasActiveSubscription && !isSubscribed) {
        return "#B0BEC5"; // Gris para otras tarjetas con plan activo
      }
      return "#00BFFF"; // Azul para "Comprar"
    };

  return (
   <View style={styles.card}>
     <Text style={styles.title}>{titulo.toUpperCase()}</Text>
     
     <View style={styles.rowContainer}>
       <Text style={styles.totalLabel}>TOTAL:</Text>
       <Text style={styles.totalValue}>
         {`${price} ${currency.toUpperCase()}`}
       </Text>
   
       {showBuyButton && (
          <TouchableOpacity
            style={[
              styles.buyButton,
              {
                backgroundColor: getButtonColor(),
              },
            ]}
            onPress={
              hasActiveSubscription && !isSubscribed
                ? null // Deshabilitar el botón si hay una suscripción activa en otro plan
                : () =>
                    isSubscribed
                      ? navigation.navigate("MiSuscripcion", {
                          stripeCustomer,
                          subscriptionId,
                        }) // Navegar a la pantalla de suscripción con el estado
                      : handlePress() // Acción de compra para productos no suscritos
            }
            disabled={hasActiveSubscription && !isSubscribed} // Deshabilitar si hay una suscripción activa
          >
            <Text style={styles.buyButtonText}>
              {isSubscribed
                ? status === "active"
                  ? "Activa"
                  : status === "pending"
                  ? "Pendiente"
                  : "Cancelada"
                : hasActiveSubscription && !isSubscribed
                ? "Comprar" // Mostrar mensaje cuando la suscripción ya está activa en otro plan
                : "Comprar"}
            </Text>
          </TouchableOpacity>
        )}
     </View>
   </View>
  );
};



const styles = StyleSheet.create({
  card: {
    borderWidth: 3.5,
    borderColor: "#00BFFF",
    borderRadius: 16,
    padding: 10,
    backgroundColor: "#fff",
    width: width * 0.8,
    height: 100,
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00BFFF",
    textAlign: "center", // Centra el título
    marginBottom: 10, // Da un pequeño margen debajo del título
  },
  rowContainer: {
    flexDirection: "row",  // Alinea los elementos en una fila
    alignItems: "center",  // Centra verticalmente los elementos
    justifyContent: "space-between",  // Da espacio entre los elementos
    width: "100%",  // Asegura que ocupe todo el espacio disponible
  },
  totalLabel: {
    fontWeight: 'bold',  // Resalta el "TOTAL:"
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E2E2E",  // Color para el monto
    marginLeft: 5,  // Da espacio entre "TOTAL" y el valor
  },
  buyButton: {
    marginLeft: 10,  // Da espacio entre el precio y el botón
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",  // Centra verticalmente los elementos
    width: 100,
  },
  buyButtonText: {
    color: "white",  // Asegura que el texto del botón sea visible
    fontWeight: "bold",
  },
});



export default CardPlanesDesarrollo;
