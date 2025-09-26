const functions = require("firebase-functions");
const admin = require("firebase-admin")
const stripe = require("stripe")("sk_test_51Qn0owBM5jYCkb8pa7pwBQHv2gH6QXKzv1fxTkJ5XhHHaKgk2GIJ8eBePnjwrx4O3OmEBH09LtgC5CMk0O73Lp8b00mz4OEdB6");
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const {
      amount,
      currency,
      customerId,
      saveCard,
      paymentMethodId,
      return_url,
    } = req.body;
    try {
      const adjustedAmount = amount;
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: "2023-10-16" }
      );
      const paymentIntentParams = {
        amount: adjustedAmount,
        currency,
        customer: customerId,
        setup_future_usage: saveCard ? "off_session" : undefined,
        automatic_payment_methods: {
          enabled: true,
        },
      };
      if (paymentMethodId) {
        paymentIntentParams.payment_method = paymentMethodId;
        paymentIntentParams.confirm = true;
        paymentIntentParams.return_url = return_url;
      }
      const paymentIntent = await stripe.paymentIntents.create(
        paymentIntentParams
      );
      res.json({
        clientSecret: paymentIntent.client_secret,
        ephemeralKeySecret: ephemeralKey.secret,
        paymentIntentId: paymentIntent.id,
        adjustedAmount: adjustedAmount,
      });
    } catch (error) {
      console.log("Error al crear PaymentIntent:", error);

      if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ error: `Error de Stripe: ${error.message}` });
      }

      res.status(500).json({ error: 'Ocurrió un error inesperado al crear el pago.' });
    }
  });
});

exports.listPaymentMethods = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: "Se requiere el ID del cliente" });
    }
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });
      res.json({ paymentMethods: paymentMethods.data });
    } catch (error) {
      console.log("Error al listar los métodos de pago:", error);
      res.status(500).json({ error: "Error al listar los métodos de pago" });
    }
  });
});

exports.addPaymentMethod = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { customerId, paymentMethodId } = req.body;
    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        error: "Se requieren el ID del cliente y el ID del método de pago",
      });
    }
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      res.json({ success: true, paymentMethod });
    } catch (error) {
      console.log("Error al añadir el método de pago:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

exports.getProductosPorCategoria = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { category } = req.body;  // Recibimos la categoría de usuarios

    if (!category) {
      return res.status(400).json({ error: "Se requiere la categoría de usuarios" });
    }

    try {
      // Listar todos los productos de Stripe filtrando por el metadato "category"
      const productos = await stripe.products.list({
        limit: 100,  // Limitar la cantidad de productos, ajusta según sea necesario
      });

      // Filtrar productos por el metadato 'category'
      const productosFiltrados = productos.data.filter(producto => producto.metadata.category === category);

      // Devolver los productos filtrados en la respuesta
      res.json({ productos: productosFiltrados });
    } catch (error) {
      console.log("Error al listar los productos:", error);
      res.status(500).json({ error: "Error al obtener los productos" });
    }
  });
});

exports.createSubscription = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { customerId, paymentMethodId, priceId } = req.body;  // Recibes el priceId

      if (!priceId) {
        return res.status(400).json({ error: "Falta el priceId para crear la suscripción." });
      }

      if (!customerId) {
        return res.status(400).json({ error: "Falta el customerId." });
      }

      // Si se proporciona un método de pago, asocia el método de pago con el cliente
      if (paymentMethodId && paymentMethodId !== "new") {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      }

      // Crear la suscripción
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],  // Usas el priceId recibido aquí
        expand: ["latest_invoice.payment_intent"],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } catch (error) {
      console.log("Error al crear la suscripción:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
});

exports.initiSubscription = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const {
        customerId,
        priceId,
        saveCard,
        paymentMethodId,
        return_url, 
      } = req.body;
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: "2023-10-16" }
      );

         // Si se pasa un paymentMethodId, adjúntalo al cliente y configúralo como predeterminado
         if (paymentMethodId) {
          await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
          });
        }

      if (!priceId || !customerId) {
        return res.status(400).json({ error: "Faltan parámetros requeridos (priceId o customerId)." });
      }

      // Obtén el precio desde Stripe para calcular el monto
      const price = await stripe.prices.retrieve(priceId);

      // Crea un PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price.unit_amount,
        currency: price.currency,
        customer: customerId,
        metadata: {
          priceId, // Guarda el priceId para uso posterior
        },
        setup_future_usage: saveCard ? "off_session" : undefined,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      res.json({
        clientSecret: paymentIntent.client_secret, // Envía el client_secret al frontend
        ephemeralKeySecret: ephemeralKey.secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.log("Error al crear el PaymentIntent:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
});

exports.checkSubscription = functions.https.onRequest(async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).send({ error: "El campo 'customerId' es obligatorio." });
    }

    // Consultar todas las suscripciones activas del usuario
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      return res.status(200).send({ hasSubscription: false, subscriptions: [] });
    }

    // Crear un array con todas las suscripciones activas
    const activeSubscriptions = await Promise.all(
      subscriptions.data.map(async (subscription) => {
        const productId = subscription.items.data[0].price.product;
        const product = await stripe.products.retrieve(productId);

        return {
          category: product.metadata.category || "otros", // Asegurar que tenga una categoría
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          productId: productId,
          productName: product.name,
          productDescription: product.description,
          price: subscription.items.data[0].price.unit_amount / 100,
          currency: subscription.items.data[0].price.currency.toUpperCase(),
          cancellationDate: subscription.canceled_at 
            ? new Date(subscription.canceled_at * 1000).toISOString() 
            : null,
        };
      })
    );

    return res.status(200).send({
      hasSubscription: true,
      subscriptions: activeSubscriptions, // Devolver TODAS las suscripciones activas
    });

  } catch (error) {
    console.log("Error al verificar suscripciones:", error.message);
    return res.status(500).send({ error: "Error al verificar suscripciones." });
  }
});


exports.getSubscriptionDetails = functions.https.onRequest(async (req, res) => {
  try {
    const { customerId, subscriptionId } = req.body; // Recibe customerId y subscriptionId desde la solicitud

    if (!customerId || !subscriptionId) {
      return res.status(400).json({ error: "Se requiere un customerId y subscriptionId válidos." });
    }

    // Obtener la suscripción específica por su ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ error: "No se encontró la suscripción." });
    }

    // Obtener detalles de la factura más reciente
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);

    // Obtener detalles del producto
    const productId = subscription.items.data[0].price.product;
    const product = await stripe.products.retrieve(productId);

    // Construir los detalles de la suscripción
    const subscriptionDetails = {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status, // Estado de la suscripción (active, canceled, etc.)
      productName: product.name, // Nombre del producto
      productDescription: product.description, // Descripción del producto
      price: subscription.items.data[0].price.unit_amount / 100, // Precio en formato decimal
      currency: subscription.items.data[0].price.currency.toUpperCase(), // Moneda
      currentPeriodStart: new Date(subscription.current_period_start * 1000), // Inicio del periodo
      currentPeriodEnd: new Date(subscription.current_period_end * 1000), // Fin del periodo
      hostedInvoiceUrl: invoice.hosted_invoice_url, // URL de la factura hospedada
      invoicePdf: invoice.invoice_pdf, // URL del PDF de la factura
      cancellationDate: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null, // ✅ Solo si está cancelada
      // receiptUrl: paymentIntent.charges.data[0].receipt_url, // URL del recibo de pago
      // paymentMethod: paymentIntent.charges.data[0].payment_method_details.card, // Detalles del método de pago
    };

    return res.status(200).json(subscriptionDetails); // Retorna los detalles de la suscripción
  } catch (error) {
    console.log("Error al obtener los detalles de la suscripción:", error);
    return res.status(500).json({ error: "Hubo un error al obtener los detalles de la suscripción." });
  }
});

exports.changeSubscriptionPlan = functions.https.onRequest(async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body;

    if (!subscriptionId || !newPriceId) {
      return res.status(400).send({ error: "Los campos 'subscriptionId' y 'newPriceId' son obligatorios." });
    }

    // Obtener la suscripción actual de Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === 'canceled') {
      return res.status(400).send({ error: "La suscripción está cancelada, no se puede cambiar el plan." });
    }

    // Actualizar la suscripción con el nuevo precio
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: subscription.items.data.map(item => ({
        id: item.id,  // ID del item de la suscripción actual
        price: newPriceId, // ID del nuevo precio
      })),
      proration_behavior: 'create_prorations', // Manejo de prorrateo
    });

    return res.status(200).send({
      message: "Plan cambiado con éxito.",
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
      currentPeriodEnd: updatedSubscription.current_period_end,
      newPrice: updatedSubscription.items.data.map(item => ({
        id: item.price.id,
        amount: item.price.unit_amount / 100,
        currency: item.price.currency.toUpperCase(),
      })),
    });

  } catch (error) {
    console.log("Error al cambiar de plan:", error.message);
    return res.status(500).send({ error: "Error al cambiar el plan." });
  }
});


exports.cancelSubscription = functions.https.onRequest(async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    // Validar que se haya enviado el customerId y subscriptionId
    if (!subscriptionId) {
      return res.status(400).send({ error: "Los campos subscriptionId son obligatorios." });
    }

    // Obtener la suscripción de Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Verificar si la suscripción es activa
    if (subscription.status === 'canceled') {
      return res.status(400).send({ error: "La suscripción ya está cancelada." });
    }

    // Cancelar la suscripción, pero dejarla activa hasta el final del periodo actual
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true, // La suscripción se cancelará al final del periodo
    });

    // Obtener la fecha de cancelación (será null hasta que se complete)
    const cancellationDate = new Date().toISOString();

    return res.status(200).send({
      message: "Suscripción cancelada con éxito. Seguirá activa hasta el final del periodo.",
      status: "active", // La suscripción seguirá activa hasta el final
      subscriptionId: subscriptionId,
      cancellationDate: cancellationDate, // Fecha cuando se marca como cancelada
      currentPeriodEnd: subscription.current_period_end, // Fecha de fin del periodo actual
    });
  } catch (error) {
    console.log("Error al cancelar suscripción:", error.message);
    return res.status(500).send({ error: "Error al cancelar la suscripción." });
  }
});


exports.getPaymentIntentDetails = functions.https.onRequest(async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: "El paymentIntentId es requerido" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent.payment_method) {
      return res.status(400).json({ error: "No se encontró paymentMethodId en este PaymentIntent" });
    }

    res.status(200).json({ paymentMethodId: paymentIntent.payment_method });
  } catch (error) {
    console.log("Error al obtener PaymentIntent:", error);
    res.status(500).json({ error: error.message });
  }
});
// Función para eliminar un cliente de Stripe
exports.deleteCustomer = functions.https.onRequest(async (req, res) => {
  // Verifica si la solicitud es POST y tiene el customerId
  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).send("El customerId es requerido");
  }

  try {
    // Eliminar al cliente de Stripe
    const deletedCustomer = await stripe.customers.del(customerId);

    // Responder con éxito
    return res.status(200).json({
      message: "Cliente eliminado exitosamente",
      deletedCustomer,
    });
  } catch (error) {
    // Manejo de errores
    console.log("Error al eliminar el cliente de Stripe:", error);
    return res.status(500).json({ error: "Error al eliminar el cliente" });
  }
});

exports.getUserSubscriptionData = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Divisa dinámica: si se envía una, usarla; si no, MXN por defecto
      const targetCurrency = req.body?.targetCurrency || req.query?.targetCurrency || 'MXN';
      
      // Obtener tipos de cambio para la divisa objetivo
      const exchangeData = await getExchangeRatesWithFallback(targetCurrency);
      
      const subscriptions = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        expand: ['data.items.data.price', 'data.customer']
      });

      const subscriptionDetails = [];

      for (const subscription of subscriptions.data) {
        const priceItem = subscription.items.data[0];
        const price = priceItem.price;
        
        let product;
        if (typeof price.product === 'string') {
          product = await stripe.products.retrieve(price.product);
        } else {
          product = price.product;
        }
        
        const originalAmount = price.unit_amount / 100;
        const originalCurrency = price.currency.toUpperCase();
        
        // CORREGIR: Convertir cada suscripción individual a la divisa objetivo
        const convertedAmount = convertCurrency(
          originalAmount, 
          originalCurrency, 
          targetCurrency, 
          exchangeData
        );
        
        subscriptionDetails.push({
          customerId: subscription.customer.id,
          customerEmail: subscription.customer.email,
          productName: product.name,
          interval: price.recurring?.interval,
          amount: convertedAmount,           // Monto ya convertido
          originalAmount: originalAmount,    // Monto original
          originalCurrency: originalCurrency, // Divisa original (USD, EUR, MXN)
          convertedCurrency: targetCurrency, // Divisa objetivo (MXN, USD, EUR)
          status: subscription.status
        });
      }

      res.json({
        success: true,
        data: {
          subscriptions: subscriptionDetails,
          totalSubscriptions: subscriptionDetails.length,
          targetCurrency: targetCurrency,
          exchangeInfo: {
            source: exchangeData.source,
            provider: exchangeData.provider,
            timestamp: exchangeData.timestamp,
            rates: exchangeData.rates
          }
        }
      });

    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message
      });
    }
  });
});

// Función que obtiene tipos de cambio con la divisa objetivo como base
async function getExchangeRatesWithFallback(targetCurrency) {
  // PASO 1: Intentar API con tu API key
  try {
    console.log(`Obteniendo tipos de cambio con base ${targetCurrency}...`);
    
    const apiKey = 'ace1489f9f7d3b34c23c819d';
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${targetCurrency}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      timeout: 8000
    });

    if (response.ok) {
      const apiData = await response.json();
      
      if (apiData.result === 'success') {
        console.log('✅ API con clave exitosa');
        
        return {
          rates: apiData.conversion_rates,
          source: 'api',
          timestamp: new Date().toISOString(),
          provider: 'exchangerate-api.com',
          baseCode: apiData.base_code,
          timeLastUpdated: apiData.time_last_update_utc
        };
      } else {
        console.log('❌ API respondió con error:', apiData.error_type);
        throw new Error(`API Error: ${apiData.error_type}`);
      }
    } else {
      console.log('❌ API HTTP error:', response.status);
      throw new Error(`HTTP Error: ${response.status}`);
    }

  } catch (apiError) {
    console.log('❌ Error en API con clave:', apiError.message);
    
    // PASO 2: Intentar API gratuita como backup
    try {
      console.log('🔄 Intentando API gratuita...');
      
      const freeApiUrl = `https://api.exchangerate-api.com/v4/latest/${targetCurrency}`;
      const response = await fetch(freeApiUrl, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API gratuita exitosa');
        
        return {
          rates: apiData.rates,
          source: 'api',
          timestamp: new Date().toISOString(),
          provider: 'exchangerate-api.com (free)',
          baseCode: apiData.base
        };
      }
    } catch (freeApiError) {
      console.log('❌ API gratuita también falló:', freeApiError.message);
    }
    
    // PASO 3: Fallback a tipos fijos
    console.log('🔄 Usando tipos de cambio fijos...');
    return getFixedExchangeRates(targetCurrency);
  }
}

// Tipos de cambio fijos dinámicos según divisa objetivo
function getFixedExchangeRates(targetCurrency) {
  // Matriz de tipos fijos actualizada
  const fixedRatesMatrix = {
    'MXN': {
      'USD': 0.05,    // 1 MXN = 0.05 USD  
      'EUR': 0.045,   // 1 MXN = 0.045 EUR
      'MXN': 1        // 1 MXN = 1 MXN
    },
    'USD': {
      'MXN': 20,      // 1 USD = 20 MXN
      'EUR': 0.9,     // 1 USD = 0.9 EUR  
      'USD': 1        // 1 USD = 1 USD
    },
    'EUR': {
      'MXN': 22,      // 1 EUR = 22 MXN
      'USD': 1.1,     // 1 EUR = 1.1 USD
      'EUR': 1        // 1 EUR = 1 EUR
    }
  };

  const rates = fixedRatesMatrix[targetCurrency] || fixedRatesMatrix['MXN'];

  return {
    rates: rates,
    source: 'fallback',
    timestamp: new Date().toISOString(),
    provider: 'fixed-rates',
    lastUpdated: '2025-06-19'
  };
}

// Función de conversión corregida
function convertCurrency(amount, fromCurrency, toCurrency, exchangeData) {
  // Si las divisas son iguales, no convertir
  if (fromCurrency === toCurrency) {
    return parseFloat(amount.toFixed(2));
  }

  // CORREGIR: La API devuelve tipos desde la divisa base hacia otras divisas
  // Si targetCurrency = MXN, entonces exchangeData.rates.USD = cuántos USD por 1 MXN
  // Pero necesitamos convertir USD a MXN, entonces es 1 / exchangeData.rates.USD
  
  let convertedAmount;
  
  if (fromCurrency === exchangeData.baseCode || fromCurrency === toCurrency) {
    // Conversión directa: desde divisa base hacia otra
    const rate = exchangeData.rates[toCurrency] || 1;
    convertedAmount = amount * rate;
  } else {
    // Conversión indirecta: desde otra divisa hacia divisa base
    const rateFromBase = exchangeData.rates[fromCurrency];
    if (rateFromBase) {
      // Convertir primero a divisa base, luego a divisa objetivo
      const amountInBase = amount / rateFromBase;
      const rateToTarget = exchangeData.rates[toCurrency] || 1;
      convertedAmount = amountInBase * rateToTarget;
    } else {
      // Si no hay tipo de cambio, no convertir
      console.log(`⚠️ No se encontró tipo de cambio para ${fromCurrency}`);
      convertedAmount = amount;
    }
  }

  const result = parseFloat(convertedAmount.toFixed(2));
  console.log(`💱 Conversión: ${amount} ${fromCurrency} → ${result} ${toCurrency}`);
  
  return result;
}