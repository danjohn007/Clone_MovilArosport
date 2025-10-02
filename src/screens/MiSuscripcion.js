import { View, FlatList, StyleSheet, Image, Text, ActivityIndicator, Alert, ScrollView, Linking, TouchableOpacity, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import Titulo from '../componentes/Titulo'; 
import Logo from '../componentes/Logo';  
import CardPlanActual from '../componentes/CardPlanActual';
import { useFocusEffect } from '@react-navigation/native';
import BannerAd from '../componentes/BannerAd';

const MiSuscripcion = ({ route }) => {
  const { stripeCustomer, subscriptionId } = route.params;
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/getSubscriptionDetails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            customerId: stripeCustomer,
            subscriptionId: subscriptionId
          }),
        }
      );
      const data = await response.json();
      console.log("detalls de suscrpcion", data);
      if (!response.ok) {
        throw new Error(data.error || "Error al obtener detalles de la suscripción.");
      }

      setSubscriptionDetails(data);
      setLoading(false);
    } catch (err) {
      console.log("Error al obtener detalles de la suscripción:", err.message);
      Alert.alert("Error", "No se pudo cargar la información de la suscripción.");
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (endDate) => {
    const currentDate = new Date(); 
    const end = new Date(endDate);
    const difference = end - currentDate;
    const daysRemaining = Math.ceil(difference / (1000 * 3600 * 24));
    return daysRemaining; 
  };

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = new Date(date);
    return formattedDate.toLocaleString();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSubscriptionDetails();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Logo />
      <Titulo titulo="MI SUSCRIPCIÓN" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >   
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            subscriptionDetails && (
              <CardPlanActual
                titulo={subscriptionDetails.productName}
                total={subscriptionDetails.price}
                moneda={subscriptionDetails.currency}
                tipoPlan={subscriptionDetails.productDescription}
                fechaContratacion={formatDate(subscriptionDetails.currentPeriodStart)}
                fechaCobro={formatDate(subscriptionDetails.currentPeriodEnd)}
                estatus={subscriptionDetails.status}
                dias={calculateDaysRemaining(subscriptionDetails.currentPeriodEnd)}
                factura={subscriptionDetails.invoicePdf}
                hostedInvoiceUrl={subscriptionDetails.hostedInvoiceUrl}
                stripeCustomer={stripeCustomer}
                subscriptionId={subscriptionId}
                fechaCancelacion={formatDate(subscriptionDetails.cancellationDate)}
              />
            )
          )}
        </View>
      </ScrollView>
      <View style={styles.containerBanner}>
        <BannerAd />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e2e2e",
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 100, // Espacio para el banner
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  containerBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  priceOption: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF0000',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MiSuscripcion;