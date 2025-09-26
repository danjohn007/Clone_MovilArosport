import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CardPlanActual = ({ 
  titulo, 
  tipoPlan, 
  total, 
  fechaContratacion, 
  fechaCobro, 
  estatus, 
  dias,
  moneda,
  hostedInvoiceUrl,
  stripeCustomer,
  subscriptionId,
  fechaCancelacion
}) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [planAnual, setPlanAnual] = useState(null);
  const [prices, setPrices] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [fechaCancelacionState, setFechaCancelacionState] = useState(fechaCancelacion);

  const downloadFile = (url) => {
    Linking.openURL(url);
  };

  const handleCancelClick = () => {
    Alert.alert(
      'Confirmar cancelación',
      `¿Estás seguro que deseas cancelar el ${titulo}?`,
      [
        { text: 'Cancelar', onPress: () => console.log('Cancelación cancelada'), style: 'cancel' },
        { text: 'Confirmar', onPress: cancelSubscription },
      ],
      { cancelable: false }
    );
  };

  const cancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/cancelSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId })
        }
      );

      const data = await response.json();
      if (response.ok) {
        const currentDate = new Date().toLocaleDateString();
        setFechaCancelacionState(currentDate);
        Alert.alert("Suscripción cancelada", "Tu suscripción se cancelará al final del periodo de facturación");
      } else {
        throw new Error(data.error || "Error al cancelar la suscripción.");
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo cancelar la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanAnual = async () => {
    try {
      const response = await fetch('https://us-central1-arosports-3bcf3.cloudfunctions.net/getProductosPorCategoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: "usuarios" }),
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      const annualPlan = data.productos.find(product => product.name === "Plan Anual");

      if (annualPlan) {
        setPlanAnual(annualPlan);
        fetchPricesForProduct(annualPlan.id, moneda);
      } else {
        console.warn("No se encontró un producto con el nombre 'Plan Anual'");
      }
    } catch (error) {
      console.log("Error al obtener el Plan Anual:", error);
    }
  };

  const fetchPricesForProduct = async (productId, monedaActual) => {
    try {
      const response = await fetch(`https://api.stripe.com/v1/prices?product=${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer sk_test_51Qn0owBM5jYCkb8pa7pwBQHv2gH6QXKzv1fxTkJ5XhHHaKgk2GIJ8eBePnjwrx4O3OmEBH09LtgC5CMk0O73Lp8b00mz4OEdB6`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener precios del producto');
      const { data } = await response.json();
      const formattedPrices = data.map(price => ({
        id: price.id,
        currency: price.currency.toUpperCase(),
        amount: price.unit_amount / 100,
      }));

      setPrices(formattedPrices);
      const precioCoincidente = formattedPrices.find(price => price.currency === monedaActual.toUpperCase());
      setSelectedPrice(precioCoincidente ? precioCoincidente.id : formattedPrices[0]?.id || null);
      setModalVisible(true);
    } catch (error) {
      console.log("Error al obtener precios:", error);
    }
  };

  const changePlanToAnnual = async () => {
    if (!selectedPrice) {
      Alert.alert("Error", "Selecciona un precio antes de continuar.");
      return;
    }

    setLoading2(true);
    try {
      const response = await fetch(
        'https://us-central1-arosports-3bcf3.cloudfunctions.net/changeSubscriptionPlan',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId, newPriceId: selectedPrice }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Tu plan ha sido cambiado a anual.', [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setLoading2(false);
              navigation.navigate('Suscripciones', { stripeCustomer });
            },
          },
        ]);
      } else {
        throw new Error(result.error || 'Hubo un error al cambiar el plan.');
      }
    } catch (error) {
      console.log('Error al cambiar de plan:', error);
      Alert.alert('Error', 'Hubo un problema al cambiar el plan.');
    } finally {
      setLoading2(false);
    }
  };

  const handleChangeToAnnualPlan = () => {
    if (fechaCancelacionState) {
      Alert.alert(
        'Suscripción Cancelada',
        'No puedes cambiar el plan porque tu suscripción está cancelada.',
        [{ text: 'OK' }]
      );
    } else {
      fetchPlanAnual();
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{titulo}</Text>
      </View>

      {/* Body */}
      <View style={styles.content}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>DETALLES</Text>
          <View style={styles.detailRow}>
            <Icon name="cash-outline" size={16} color="#00baff" />
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>{`${total} ${moneda}`}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={16} color="#00baff" />
            <Text style={styles.detailLabel}>Fecha de Contratación:</Text>
            <Text style={styles.detailValue}>{fechaContratacion}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar-number-outline" size={16} color="#00baff" />
            <Text style={styles.detailLabel}>Fecha de Cobro:</Text>
            <Text style={styles.detailValue}>{fechaCobro}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="checkmark-circle-outline" size={16} color="#00baff" />
            <Text style={styles.detailLabel}>Estatus:</Text>
            <Text style={styles.detailValue}>{estatus === 'active' ? 'Activo' : 'Inactivo'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="time-outline" size={16} color="#00baff" />
            <Text style={styles.detailLabel}>Días Restantes:</Text>
            <Text style={styles.detailValue}>{dias} días</Text>
          </View>
          {fechaCancelacionState && (
            <View style={styles.detailRow}>
              <Icon name="close-circle-outline" size={16} color="#00baff" />
              <Text style={styles.detailLabel}>Fecha de cancelación:</Text>
              <Text style={styles.detailValue}>{fechaCancelacionState}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Icon name="download-outline" size={16} color="#00baff" />
            <Text style={styles.detailLabel}>Factura:</Text>
            <Text style={styles.linkText} onPress={() => downloadFile(hostedInvoiceUrl)}>
              Ver compra
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {titulo === 'Plan Mensual' && (
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleChangeToAnnualPlan}
            activeOpacity={0.8}
          >
            <Icon name="arrow-up-circle" size={20} color="#fff" />
            <Text style={styles.footerButtonText}>CAMBIAR A PLAN ANUAL</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: '#c70039' }, (loading || fechaCancelacionState) && styles.disabledButton]}
          onPress={handleCancelClick}
          disabled={loading || !!fechaCancelacionState}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="close-circle" size={20} color="#fff" />
              <Text style={styles.footerButtonText}>
                {fechaCancelacionState ? 'SUSCRIPCIÓN CANCELADA' : 'CANCELAR SUSCRIPCIÓN'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CAMBIAR A PLAN ANUAL</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color="#00baff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              {planAnual && (
                <>
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>DETALLES</Text>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailValue, { marginLeft: -8 , textAlign: "justify" }]}>Ahorra suscribiéndote al plan Anual con un pago único. 
                      Te llevas 12 meses por el precio de 10.
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="cash-outline" size={16} color="#00baff" />
                      <Text style={styles.detailLabel}>Costo:</Text>
                      <Text style={styles.detailValue}>
                        {prices.length > 0 
                          ? (prices.find(price => price.currency === moneda)?.amount || "N/A") 
                          : "N/A"} {moneda}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, loading2 && styles.disabledButton]}
                onPress={changePlanToAnnual}
                disabled={loading2}
                activeOpacity={0.8}
              >
                {loading2 ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>CAMBIAR</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    marginVertical: 10,
    flexShrink: 0,
    minHeight: 300, // Asegura espacio suficiente para el contenido
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
  },
  content: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00baff",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
    marginLeft: 8,
    marginRight: 15,
    width: 90,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "400",
    color: "#838080",
    flex: 1,
    textAlign: "left",
    paddingLeft: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#00baff",
    textDecorationLine: "underline",
    flex: 1,
    textAlign: "left",
    paddingLeft: 8,
  },
  footer: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  footerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 600,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00baff",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default CardPlanActual;