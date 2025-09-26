import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ChangePlan = ({ subscriptionId, stripeCustomer, onChangePlan }) => {
  const planAnualDetalles = {
    nombre: 'Plan Anual',
    precio: '$120',
    beneficios: 'Acceso completo por un año',
  };

  const handleChangePlan = () => {
    // Llamada a la función para cambiar el plan, por ejemplo, una llamada a la API de Stripe
    onChangePlan(subscriptionId, stripeCustomer);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalles del Plan Anual</Text>
      <Text style={styles.text}>Nombre: {planAnualDetalles.nombre}</Text>
      <Text style={styles.text}>Precio: {planAnualDetalles.precio}</Text>
      <Text style={styles.text}>Beneficios: {planAnualDetalles.beneficios}</Text>

      <TouchableOpacity style={styles.button} onPress={handleChangePlan}>
        <Text style={styles.buttonText}>Confirmar Cambio de Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#00baff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChangePlan;
