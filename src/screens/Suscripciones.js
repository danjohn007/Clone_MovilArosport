import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  Image,
  ScrollView,
  Dimensions,
  Button,
  BackHandler,
  TextInput,
} from "react-native";
import Constants from "expo-constants";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import Titulo from "../componentes/Titulo";
import Logo from "../componentes/Logo";
import CardPlanesSuscripcion from "../componentes/CardPlanesSuscripcion";
import CardPlanesDesarrollo from "../componentes/CardPlanesDesarrollo";
import MenuItem from "../componentes/MenuItem";
import CustomButton from "../componentes/Buttons";
import APIManager from "../componentes/API/APIManager.jsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStripe } from "@stripe/stripe-react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import MostrarDatos from "../componentes/MostrarDatos";
import Categorias from "../componentes/Categorias";
const RETURN_URL = "prorally-movil://stripe-redirect";
const { width } = Dimensions.get("window");
import Icono from "react-native-vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import BannerAd from "../componentes/BannerAd";
import debounce from "lodash.debounce";

const Suscripciones = () => {
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedItem, setSelectedItem] = useState("usuarios");
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [prices, setPrices] = useState([]);
  const [subscription, setSubscription] = useState(null); // Estado para la suscripción del usuario
  const route = useRoute();
  const {
    stripeCustomer,
    id_usuario,
    userNombre,
    userApellido,
    userSexo,
    usuarioNom,
    userEmail,
  } = route.params;
  const [saveCard, setSaveCard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("new");
  const { initPaymentSheet, presentPaymentSheet, handleURLCallback } =
    useStripe();
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Nuevo estado para bloquear múltiples clics
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [secureTextEntry, setSecureTextEntry] = useState(true); // Estado para mostrar/ocultar la contraseña

  const handleIconPress = () => {
    setSecureTextEntry((prevState) => !prevState); // Alternar la visibilidad de la contraseña
  };

  const handleContactPress = () => {
    const email = "contactanos@arosports.app"; // Cambia esto por tu correo
    const subject = "Consulta sobre el servicio"; // Asunto opcional
    const body = "Hola, me gustaría obtener más información sobre..."; // Cuerpo opcional

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoLink).catch((err) =>
      console.log("No se pudo abrir el correo", err)
    );
  };

  // Función para manejar la selección de la categoría
  const handleSelectItem = (item) => {
    setSelectedItem(item); // Actualiza el estado de la categoría seleccionada
    fetchProductsByCategory(item); // Llama a la función para obtener productos por categoría
  };

  const validarCorreoEnServidor = debounce(async (correo, setErrors) => {
    try {
      const res = await APIManager({
        url: `Registro/validar_correo_existe?correo=${encodeURIComponent(
          correo
        )}`,
        method: "GET",
      });

      if (res.existe) {
        setErrors((prev) => ({
          ...prev,
          correo: "Este correo ya está registrado* ",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.correo;
          return newErrors;
        });
      }
    } catch (error) {
      console.log("Error validando correo en servidor:", error);
    }
  }, 500);

  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  console.log("codigoInvitac", codigoInvitacion);
  const [codigoAplicado, setCodigoAplicado] = useState(false);
  const [codigoError, setCodigoError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const aplicarCodigo = async () => {
    if (!codigoInvitacion.trim()) {
      setCodigoError("Ingresa un código válido");
      return;
    }

    setIsApplying(true);
    setCodigoError("");
    setCodigoAplicado(false);

    try {
      const response = await APIManager({
        url: `Perfil/validarCodigoInvitacion?codigo=${encodeURIComponent(
          codigoInvitacion
        )}`,
        method: "get",
      });

      console.log("res de codigo", response);

      if (response?.status) {
        setCodigoAplicado(true);
        ajustarPreciosConDescuento(); // Aplica el descuento
      } else {
        setCodigoError(response?.message || "Código inválido");
      }
    } catch (error) {
      console.log("Error al validar código:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const normalizarTexto = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const obtenerMonedaSegunPais = async (
    countryToCurrency,
    uniqueCurrencies,
    defaultCurrencyStripe = "usd"
  ) => {
    try {
      const paisGuardado = await AsyncStorage.getItem("pais_usuario");
      console.log("pais guardado", paisGuardado);
      if (!paisGuardado) return defaultCurrencyStripe; // Si no hay país guardado, usa la predeterminada

      // Normalizamos el objeto countryToCurrency para búsqueda más robusta
      const countryMapNormalized = Object.fromEntries(
        Object.entries(countryToCurrency).map(([k, v]) => [
          normalizarTexto(k),
          v,
        ])
      );

      const monedaDelPais = countryMapNormalized[normalizarTexto(paisGuardado)];

      if (monedaDelPais && uniqueCurrencies.includes(monedaDelPais)) {
        return monedaDelPais; // Si encontramos la moneda y existe en Stripe → usarla
      }

      return defaultCurrencyStripe; // Si no está en las monedas de Stripe → usar default
    } catch (error) {
      console.log("Error obteniendo moneda:", error);
      return defaultCurrencyStripe;
    }
  };

  const countryToCurrency = {
    Afganistán: "afn",
    Albania: "all",
    Alemania: "eur",
    Andorra: "eur",
    Angola: "aoa",
    Argentina: "ars",
    Armenia: "amd",
    Australia: "aud",
    Austria: "eur",
    Bangladés: "bdt",
    Bélgica: "eur",
    Belice: "bzd",
    Bolivia: "bob",
    "Bosnia y Herzegovina": "bam",
    Brasil: "brl",
    Bulgaria: "bgn",
    Canadá: "cad",
    Chile: "clp",
    China: "cny",
    Colombia: "cop",
    "Corea del Sur": "krw",
    "Costa Rica": "crc",
    Croacia: "eur",
    Cuba: "cup",
    Dinamarca: "dkk",
    Ecuador: "usd",
    Egipto: "egp",
    "El Salvador": "usd",
    "Emiratos Árabes Unidos": "aed",
    Eslovaquia: "eur",
    Eslovenia: "eur",
    España: "eur",
    "Estados Unidos": "usd",
    Estonia: "eur",
    Filipinas: "php",
    Finlandia: "eur",
    Francia: "eur",
    Grecia: "eur",
    Guatemala: "gtq",
    Honduras: "hnl",
    Hungría: "huf",
    India: "inr",
    Indonesia: "idr",
    Irlanda: "eur",
    Islandia: "isk",
    Israel: "ils",
    Italia: "eur",
    Japón: "jpy",
    Jordania: "jod",
    Kazajistán: "kzt",
    Kenia: "kes",
    Letonia: "eur",
    Lituania: "eur",
    Luxemburgo: "eur",
    Malasia: "myr",
    Maldivas: "mvr",
    Marruecos: "mad",
    México: "mxn",
    Mónaco: "eur",
    Noruega: "nok",
    "Nueva Zelanda": "nzd",
    "Países Bajos": "eur",
    Panamá: "usd",
    Paraguay: "pyg",
    Perú: "pen",
    Polonia: "pln",
    Portugal: "eur",
    "Reino Unido": "gbp",
    "República Checa": "czk",
    "República Dominicana": "dop",
    Rumanía: "ron",
    Rusia: "rub",
    Serbia: "rsd",
    Singapur: "sgd",
    Sudáfrica: "zar",
    Suecia: "sek",
    Suiza: "chf",
    Tailandia: "thb",
    Turquía: "try",
    Ucrania: "uah",
    Uruguay: "uyu",
    Venezuela: "ves",
    Vietnam: "vnd",
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    // Si los precios están disponibles y el primer producto tiene un precio por defecto, usar su moneda
    const defaultCurrency =
      prices.length > 0 && prices[0].defaultPrice?.currency;
    return defaultCurrency || "usd"; // Si no se encuentra, usar "usd" como moneda por defecto
  });

  const [priceInSelectedCurrency, setPriceInSelectedCurrency] = useState(() => {
    // Establecer el precio inicial de acuerdo con la moneda seleccionada
    const defaultPrice = prices.length > 0 && prices[0].defaultPrice;
    return defaultPrice ? defaultPrice.amount : 0;
  });

  const [showExtraModal, setShowExtraModal] = useState(false);
  const [subscriptionCategory, setSubscriptionCategory] = useState(""); // Guardar la categoría
  const [activeModal, setActiveModal] = useState(null);
  const [priceId, setPriceId] = useState(null);

  // Función para abrir el modal correspondiente
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  useEffect(() => {
    const establecerMonedaInicial = async () => {
      const defaultCurrencyStripe = prices[0]?.defaultPrice?.currency || "usd";
      const monedasUnicas = getUniqueCurrencies(prices);

      const moneda = await obtenerMonedaSegunPais(
        countryToCurrency,
        monedasUnicas,
        defaultCurrencyStripe
      );

      setSelectedCurrency(moneda);
    };

    if (prices.length > 0) {
      establecerMonedaInicial();
    }
  }, [prices]);

  // Filtrar monedas únicas
  const getUniqueCurrencies = (prices) => {
    const allCurrencies = prices.flatMap((price) =>
      price.prices.map((p) => p.currency)
    );
    return [...new Set(allCurrencies)]; // Usamos Set para eliminar duplicados
  };

  // const uniqueCurrencies = getUniqueCurrencies(prices);
  const uniqueCurrencies = useMemo(() => getUniqueCurrencies(prices), [prices]);

  const filteredPrices = useMemo(() => {
    return prices.map((item) => {
      const selectedPrice = item.prices.find(
        (price) => price.currency === selectedCurrency
      );

      const descuento = codigoAplicado ? 0.1 : 0; // 10% si el código es válido
      const precioConDescuento = selectedPrice
        ? (selectedPrice.amount * (1 - descuento)).toFixed(2)
        : 0;

      return {
        ...item,
        selectedPrice,
        precioOriginal: selectedPrice ? selectedPrice.amount : 0,
        precioConDescuento: precioConDescuento,
      };
    });
  }, [prices, selectedCurrency, codigoAplicado]);

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setIsDropdownOpen(false);
  };

  const getFlagImageUrl = (currency) => {
    const currencyToCountryMap = {
      usd: "US",
      eur: "EU",
      mxn: "MX",
      jpy: "JP",
      gbp: "GB",
      cad: "CA",
      ars: "AR",
      aud: "AU",
      cny: "CN",
      inr: "IN",
      brl: "BR",
      chf: "CH",
      sek: "SE",
      nok: "NO",
      dkk: "DK",
      pln: "PL",
      zar: "ZA",
      krw: "KR",
      idr: "ID",
      try: "TR",
      sgd: "SG",
      nzd: "NZ",
      hkd: "HK",
      myr: "MY",
      php: "PH",
      vnd: "VN",
      mad: "MA",
      lkr: "LK",
      thb: "TH",
      pkr: "PK",
    };
    const countryCode = currencyToCountryMap[currency?.toLowerCase()] || "UN";
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };
  //termino de la mooneda

  const fetchPricesForProduct = async (productId) => {
    try {
      const response = await fetch(
        `https://api.stripe.com/v1/prices?product=${productId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer sk_test_51Qn0owBM5jYCkb8pa7pwBQHv2gH6QXKzv1fxTkJ5XhHHaKgk2GIJ8eBePnjwrx4O3OmEBH09LtgC5CMk0O73Lp8b00mz4OEdB6`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener precios del producto");
      }

      const { data } = await response.json();
      console.log("fetchPricesForProduct", data);
      return data.map((price) => ({
        id: price.id, // Incluimos el ID del precio
        currency: price.currency,
        amount: price.unit_amount / 100, // Convertimos de centavos a la unidad base
      }));
    } catch (error) {
      console.log("Error al obtener precios:", error);
      return [];
    }
  };

  const fetchProductsByCategory = async (category) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/getProductosPorCategoria",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: category }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("fetchProductsByCategory", data);

      const productsWithPrices = await Promise.all(
        data.productos.map(async (product) => {
          const prices = await fetchPricesForProduct(product.id); // Obtenemos todos los precios del producto

          // Buscamos el precio por defecto usando el ID de default_price
          const defaultPrice =
            prices.find((price) => price.id === product.default_price) || {};
          console.log("precio default", defaultPrice);
          return {
            ...product,
            prices,
            defaultPrice, // Añadimos el precio por defecto al objeto del producto
          };
        })
      );

      setPrices(productsWithPrices);

      // Establecer la moneda seleccionada por defecto con la moneda del primer producto
      if (productsWithPrices.length > 0 && productsWithPrices[0].defaultPrice) {
        setSelectedCurrency(productsWithPrices[0].defaultPrice.currency);
      }
    } catch (error) {
      console.log("Error al obtener productos y precios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Usar useEffect para obtener los productos cada vez que se cambie la categoría seleccionada
  useFocusEffect(
    React.useCallback(() => {
      if (selectedItem) {
        fetchProductsByCategory(selectedItem);
      }
    }, [selectedItem])
  );

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/checkSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: stripeCustomer }),
        }
      );

      const data = await response.json();
      console.log("Datos de suscripción", data);

      if (!response.ok)
        throw new Error(data.error || "Error al verificar suscripciones.");

      if (data.subscriptions && data.subscriptions.length > 0) {
        // Organizar suscripciones por categoría
        const groupedSubscriptions = {};
        data.subscriptions.forEach((sub) => {
          groupedSubscriptions[sub.category] = sub;
        });

        setSubscription(groupedSubscriptions);
      } else {
        setSubscription({});
      }
    } catch (err) {
      console.log("Error al verificar suscripciones:", err.message);
    }
  };

  const handleBuyNow = async (priceId, category) => {
    console.log("Precio ID:", priceId, "Categoría:", category);

    if (isProcessing) return; // Si ya está procesando, no permitir otro intento

    if (!priceId) {
      Alert.alert("Alerta", "Debes seleccionar un plan antes de continuar.");
      return;
    }

    // Verificar si ya tiene una suscripción en la misma categoría
    if (subscription[category]) {
      Alert.alert(
        "Información",
        `Ya tienes una suscripción activa en la categoría ${category}.`
      );
      return; // Detener el flujo si ya existe una suscripción en esa categoría
    }

    // Si la categoría es "club" o "desarrollo", mostrar la modal
    if (category === "club" || category === "desarrollos") {
      setSelectedCategory(category); // Guardamos la categoría
      setPriceId(priceId);
      setShowExtraModal(true);
      return; // Detener el flujo aquí hasta que el usuario complete el registro
    }

    try {
      setIsProcessing(true); // Bloquear múltiples clics

      // Paso 1: Cargar tarjetas guardadas antes de continuar al pago
      await fetchSavedCards(); // Cargar tarjetas guardadas

      // Paso 2: Inicializar suscripción y obtener PaymentIntent
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/initiSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId,
            customerId: stripeCustomer,
            saveCard: true,
            paymentMethodId:
              paymentMethod !== "new" ? paymentMethod : undefined,
            return_url: RETURN_URL,
          }),
        }
      );
      // saveCard: saveCard se cambio a true solamnete para que se guarde en automatico la creacion de tarjeta y se pueda crear la susucripcion
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al inicializar el pago.");
      }

      const { clientSecret, paymentIntentId } = data;
      setPaymentIntentId(paymentIntentId);

      // Paso 3: Inicializar la hoja de pago
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Prorally",
        customerId: stripeCustomer, // Se pasa aquí también
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        returnURL: RETURN_URL,
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        throw new Error(initError.message);
      }
      // Paso 4: Presentar la hoja de pago
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.log("Pago Cancelado", "El pago no fue completado.");
      } else {
        console.log("Pago Exitoso", "Pago completado exitosamente.");

        // Obtener el paymentMethodId del PaymentIntent confirmado
        const confirmedPaymentIntent = await fetch(
          `https://us-central1-arosports-3bcf3.cloudfunctions.net/getPaymentIntentDetails`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId }),
          }
        );

        const confirmedData = await confirmedPaymentIntent.json();

        if (!confirmedPaymentIntent.ok || !confirmedData.paymentMethodId) {
          throw new Error("No se pudo obtener el método de pago.");
        }

        const newPaymentMethodId = confirmedData.paymentMethodId;

        // Guardar el nuevo método de pago
        const methodSaved = await addPaymentMethod(newPaymentMethodId);

        if (methodSaved) {
          await createSubscriptionAfterPayment(priceId, category);
        }
      }
    } catch (err) {
      console.log("Error en el proceso de pago:", err.message);
      Alert.alert("Alerta", "Hubo un error al procesar el pago.");
    } finally {
      setIsProcessing(false); // Liberar el botón después del proceso
    }
  };

  const handleBuyNowDesarrollo = async (priceId, category) => {
    console.log("Precio ID:", priceId, "Categoría:", category);

    if (isProcessing) return; // Si ya está procesando, no permitir otro intento

    if (!priceId) {
      Alert.alert("Alerta", "Debes seleccionar un plan antes de continuar.");
      return;
    }

    // Verificar si ya tiene una suscripción en la misma categoría
    if (subscription[category]) {
      Alert.alert(
        "Información",
        `Ya tienes una suscripción activa en la categoría ${category}.`
      );
      return; // Detener el flujo si ya existe una suscripción en esa categoría
    }

    try {
      setIsProcessing(true); // Bloquear múltiples clics

      // Crear cliente en Stripe
      const clienteStripe = await crearClienteStripe(
        personalesData.correo,
        userNombre
      );

      if (!clienteStripe) {
        console.log("Error al crear cliente en Stripe.");
        return;
      }

      // Ahora que tenemos el customerId de Stripe, pasamos directamente el ID a la función de pago
      const stripeCustomerId = clienteStripe; // Utiliza el ID recién creado

      // Paso 1: Cargar tarjetas guardadas antes de continuar al pago
      await fetchSavedCardsDesa(stripeCustomerId); // Cargar tarjetas guardadas

      // Paso 2: Inicializar suscripción y obtener PaymentIntent
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/initiSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId,
            customerId: stripeCustomerId,
            saveCard: true,
            paymentMethodId:
              paymentMethod !== "new" ? paymentMethod : undefined,
            return_url: RETURN_URL,
          }),
        }
      );
      console.log("datos a ntes de enviar", response);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al inicializar el pago.");
      }

      const { clientSecret, paymentIntentId } = data;
      setPaymentIntentId(paymentIntentId);
      setShowExtraModal(false);

      // Paso 3: Inicializar la hoja de pago
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Prorally",
        customerId: stripeCustomerId, // Se pasa aquí también
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        returnURL: RETURN_URL,
        allowsDelayedPaymentMethods: true,
        presentationStyle: "fullscreen",
        disableBackButton: true,
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Paso 4: Presentar la hoja de pago
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.log("Pago Cancelado", "El pago no fue completado.");
        // Si el pago fue cancelado o hubo un error, eliminar al cliente de Stripe
        await deleteCustomer(stripeCustomerId);
      } else {
        console.log("Pago Exitoso", "Pago completado exitosamente.");

        // Obtener el paymentMethodId del PaymentIntent confirmado
        const confirmedPaymentIntent = await fetch(
          `https://us-central1-arosports-3bcf3.cloudfunctions.net/getPaymentIntentDetails`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId }),
          }
        );

        const confirmedData = await confirmedPaymentIntent.json();

        if (!confirmedPaymentIntent.ok || !confirmedData.paymentMethodId) {
          throw new Error("No se pudo obtener el método de pago.");
        }

        const newPaymentMethodId = confirmedData.paymentMethodId;

        // Guardar el nuevo método de pago
        const methodSaved = await addPaymentMethodDesa(
          stripeCustomerId,
          newPaymentMethodId
        );

        if (methodSaved) {
          await createSubscriptionAfterPaymentDesa(
            priceId,
            category,
            stripeCustomerId
          );
        }
      }
    } catch (err) {
      console.log("Error en el proceso de pago:", err.message);
      Alert.alert("Alerta", "Hubo un error al procesar el pago.");
    } finally {
      setIsProcessing(false); // Liberar el botón después del proceso
    }
  };

  const [stripeCustomerId, setStripeUsuario] = useState("");

  const crearClienteStripe = async (correo, nombre) => {
    try {
      const response = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer sk_test_51Qn0owBM5jYCkb8pa7pwBQHv2gH6QXKzv1fxTkJ5XhHHaKgk2GIJ8eBePnjwrx4O3OmEBH09LtgC5CMk0O73Lp8b00mz4OEdB6`,
        },
        body: new URLSearchParams({
          email: correo,
          name: nombre,
        }).toString(),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Cliente creado en Stripe:", data);

        // Actualiza el estado de stripeUsuario con el ID de cliente de Stripe
        setStripeUsuario(data.id);

        // Ahora puedes usar el estado stripeUsuario en tu aplicación
        console.log("ID de cliente de Stripe:", stripeCustomerId);

        return data.id; // Devuelve el ID de cliente de Stripe
      } else {
        console.log("Error al crear cliente en Stripe:", data.error);
        return null;
      }
    } catch (error) {
      console.log("Error al crear cliente en Stripe:", error);
      return null;
    }
  };

  // Función para eliminar el cliente de Stripe
  const deleteCustomer = async (customerId) => {
    try {
      const response = await fetch(
        `https://us-central1-arosports-3bcf3.cloudfunctions.net/deleteCustomer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el cliente de Stripe.");
      }

      console.log("Cliente de Stripe eliminado exitosamente.");
    } catch (err) {
      console.log("Error al eliminar el cliente de Stripe:", err.message);
    }
  };

  const addPaymentMethod = async (paymentMethodId) => {
    console.log("methodo id", paymentMethodId);
    setLoading2(true); // Mostrar modal de carga
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/addPaymentMethod",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: stripeCustomer,
            paymentMethodId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fallo al agregar el método de pago");
      }

      console.log("Método de pago agregado correctamente.");
      setLoading2(false); // Ocultar modal de carga
      return true;
    } catch (error) {
      console.log("Error al agregar el método de pago", error);
      setLoading2(false); // Mostrar modal de carga
      return false;
    }
  };

  const fetchSavedCards = async () => {
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/listPaymentMethods",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: stripeCustomer }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSavedCards(data.paymentMethods || []);
      } else {
        console.log(
          "Error al obtener las tarjetas:",
          data.error || "Error al obtener las tarjetas"
        );
      }
    } catch (error) {
      console.log("Error al obtener las tarjetas:", error);
    }
  };

  const addPaymentMethodDesa = async (stripeCustomerId, paymentMethodId) => {
    console.log("methodo id", paymentMethodId);
    setLoading2(true); // Mostrar modal de carga
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/addPaymentMethod",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: stripeCustomerId,
            paymentMethodId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fallo al agregar el método de pago");
      }

      console.log("Método de pago agregado correctamente.");
      setLoading2(false); // Ocultar modal de carga
      return true;
    } catch (error) {
      console.log("Error al agregar el método de pago", error);
      setLoading2(false); // Mostrar modal de carga
      return false;
    }
  };

  const fetchSavedCardsDesa = async (stripeCustomerId) => {
    try {
      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/listPaymentMethods",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: stripeCustomerId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSavedCards(data.paymentMethods || []);
      } else {
        console.log(
          "Error al obtener las tarjetas:",
          data.error || "Error al obtener las tarjetas"
        );
      }
    } catch (error) {
      console.log("Error al obtener las tarjetas:", error);
    }
  };

  const createSubscriptionAfterPayment = async (priceId, category) => {
    console.log(
      "datos recibido en la funcion de createSubscriptionAfterPayment",
      priceId
    );
    console.log(
      "datos recibido en la funcion de createSubscriptionAfterPayment",
      category
    );
    try {
      setLoading2(true); // Mostrar modal de carga

      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/createSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId,
            customerId: stripeCustomer,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al crear la suscripción.");
      }

      console.log("Suscripción creada exitosamente:", data.subscriptionId);

      // Ejecutar la función antes de mostrar la alerta de éxito
      await fetchUserSubscription();

      setLoading2(false);

      // Verificar la categoría y mostrar la alerta correspondiente
      if (category === "club" || category === "desarrollos") {
        Alert.alert(
          "Suscripción exitosa",
          "Te llegara un correo para el acceso a la web",
          [
            {
              text: "OK", // El botón solo cierra la alerta, no realiza ninguna acción
              onPress: () => {
                // Aquí no se realiza ninguna acción adicional, solo se cierra la alerta
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Suscripción exitosa",
          "Tu suscripción ha sido activada correctamente.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      setLoading2(false); // Asegurar que el modal se oculte en caso de error
      console.log("Error al crear la suscripción:", err.message);
      Alert.alert(
        "Alerta",
        "Hubo un problema al crear la suscripción. Inténtalo de nuevo."
      );
    }
  };

  const createSubscriptionAfterPaymentDesa = async (
    priceId,
    category,
    stripeCustomerId
  ) => {
    console.log(
      "datos recibido en la funcion de createSubscriptionAfterPayment",
      priceId
    );
    console.log(
      "datos recibido en la funcion de createSubscriptionAfterPayment",
      category
    );
    try {
      setLoading2(true); // Mostrar modal de carga

      const response = await fetch(
        "https://us-central1-arosports-3bcf3.cloudfunctions.net/createSubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId,
            customerId: stripeCustomerId,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al crear la suscripción.");
      }

      console.log("Suscripción creada exitosamente:", data.subscriptionId);

      // Ejecutar la función antes de mostrar la alerta de éxito
      await handleRegistro(stripeCustomerId);

      setLoading2(false);

      // Verificar la categoría y mostrar la alerta correspondiente
      if (category === "club" || category === "desarrollos") {
        Alert.alert(
          "Suscripción exitosa",
          "Te llegara un correo para el acceso a la web",
          [
            {
              text: "OK", // El botón solo cierra la alerta, no realiza ninguna acción
              onPress: () => {
                // Aquí no se realiza ninguna acción adicional, solo se cierra la alerta
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Suscripción exitosa",
          "Tu suscripción ha sido activada correctamente.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      setLoading2(false); // Asegurar que el modal se oculte en caso de error
      console.log("Error al crear la suscripción:", err.message);
      Alert.alert(
        "Alerta",
        "Hubo un problema al crear la suscripción. Inténtalo de nuevo."
      );
    }
  };

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (url && url.includes("stripe-redirect")) {
        await handleURLCallback(url);
      }
    };

    Linking.addEventListener("url", ({ url }) => handleDeepLink(url));

    return () => {
      Linking.removeAllListeners("url");
    };
  }, [handleURLCallback]);

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedCards();
      fetchUserSubscription();
      setCodigoInvitacion("");
      setCodigoError("");
      setCodigoAplicado(false);
    }, [selectedItem])
  );

  //validaciones de la mddal
  // Estado para gestionar los valores de los campos en cada modal
  const [selectedCategory, setSelectedCategory] = useState("");
  const [personalesData, setPersonalesData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    usuario: "",
  });

  const [organizacionData, setOrganizacionData] = useState({
    nombreOrganizacion: "",
  });

  const [domicilioData, setDomicilioData] = useState({
    calle: "",
    colonia: "",
    codigoPostal: "",
    numeroExterior: "",
    latitud: "",
    longitud: "",
  });

  // Llamar a esta función cuando sea necesario, por ejemplo, al actualizar el estado de la dirección

  const [personalesCompletado, setPersonalesCompletado] = useState(false);
  const [organizacionCompletado, setOrganizacionCompletado] = useState(false);
  const [domicilioCompletado, setDomicilioCompletado] = useState(false);

  // Errores de validación
  const [errors, setErrors] = useState({
    correo: "",
    contrasena: "",
    apellido: "",
    nombreOrganizacion: "",
    calle: "",
    colonia: "",
    codigoPostal: "",
    numeroExterior: "",
  });

  // Funciones de validación para cada sección
  const validarDatosPersonales = async () => {
    const { correo, contrasena, apellido } = personalesData;
    let valid = true;
    let newErrors = {};

    if (!correo) {
      newErrors.correo = "Campo obligatorio*";
      valid = false;
    } else {
      const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(correo)) {
        newErrors.correo = "Correo inválido (ej. usuario@dominio.com)";
        valid = false;
      } else {
        // Validar en backend solo si pasa la validación local
        try {
          const res = await APIManager({
            url: `Registro/validar_correo_existe?correo=${encodeURIComponent(
              correo
            )}`,
            method: "GET",
          });

          if (res.existe) {
            newErrors.correo = "Este correo ya está registrado* ";
            valid = false;
          }
        } catch (error) {
          console.log("Error validando correo:", error);
          // Opcionalmente puedes marcar error o no
        }
      }
    }

    if (!contrasena) {
      newErrors.contrasena = "Campo obligatorio*";
      valid = false;
    } else if (contrasena.length < 5 || contrasena.length > 20) {
      newErrors.contrasena = "Debe tener entre 5 y 20 caracteres*";
      valid = false;
    } else if (!/\d/.test(contrasena)) {
      newErrors.contrasena = "Debe contener al menos un número*";
      valid = false;
    }

    if (!apellido) {
      newErrors.apellido = "Campo obligatorio*";
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const validarDatosOrganizacion = () => {
    const { nombreOrganizacion } = organizacionData;
    let valid = true;
    let newErrors = {};

    if (!nombreOrganizacion) {
      newErrors.nombreOrganizacion = "Campo obligatorio*";
      valid = false;
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const validarDatosDomicilio = async () => {
    const { calle, colonia, codigoPostal, numeroExterior } = domicilioData;
    let valid = true;
    let newErrors = {};

    if (!calle) {
      newErrors.calle = "Campo obligatorio*";
      valid = false;
    }
    if (!colonia) {
      newErrors.colonia = "Campo obligatorio*";
      valid = false;
    }
    if (!codigoPostal) {
      newErrors.codigoPostal = "Campo obligatorio*";
      valid = false;
    } else if (!/^\d{5}$/.test(codigoPostal)) {
      newErrors.codigoPostal = "El código debe tener 5 dígitos*";
      valid = false;
    }

    if (!numeroExterior) {
      newErrors.numeroExterior = "Campo obligatorio*";
      valid = false;
    } else if (!/^\d+$/.test(numeroExterior)) {
      newErrors.numeroExterior = "Debe ser numérico";
      valid = false;
    }

    // Si los datos son válidos, obtenemos las coordenadas de latitud y longitud
    if (valid) {
      const direccionCompleta = `${calle}, ${colonia}, ${codigoPostal}, ${numeroExterior}`;
      const googleApiKey = "AIzaSyCI78o_JODtkwvB7ydLkvU-GCHwdOT8qv8";
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        direccionCompleta
      )}&key=${googleApiKey}`;

      try {
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status === "OK") {
          const latitud = geocodeData.results[0].geometry.location.lat;
          const longitud = geocodeData.results[0].geometry.location.lng;

          // Guardamos las coordenadas en el estado o en el lugar necesario
          setDomicilioData((prev) => ({
            ...prev,
            latitud,
            longitud,
          }));

          console.log("📍 Coordenadas obtenidas:", { latitud, longitud });
        } else {
          console.log(
            "⚠️ Error al obtener latitud y longitud:",
            geocodeData.status
          );
          valid = false;
        }
      } catch (error) {
        console.log("⚠️ Error al obtener coordenadas:", error);
        valid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  // Función para cerrar el modal solo si la validación es exitosa
  const closeModal = () => {
    if (activeModal === "personales" && validarDatosPersonales()) {
      setShowExtraModal(true); // Cambiar el estado para mostrar el modal de registro
      setActiveModal(null); // Cerrar el modal actual
    } else if (activeModal === "organizacion" && validarDatosOrganizacion()) {
      setShowExtraModal(true); // Cambiar el estado para mostrar el modal de registro
      setActiveModal(null); // Cerrar el modal actual
    } else if (activeModal === "domicilio" && validarDatosDomicilio()) {
      setShowExtraModal(true); // Cambiar el estado para mostrar el modal de registro
      setActiveModal(null); // Cerrar el modal actual
    }
  };

  const handleRegistro = async (stripeCustomerId) => {
    console.log("se recibio en resgitro el stripeCustomerId", stripeCustomerId);
    try {
      const formData = new FormData();
      const tipoOrganizacion =
        selectedCategory === "club"
          ? 5
          : selectedCategory === "desarrollos"
          ? 7
          : null;
      const asignarUsuario =
        selectedCategory === "club"
          ? 14
          : selectedCategory === "desarrollos"
          ? 18
          : null;

      // Agregar los datos  a la tabla de usuarios
      formData.append("us_nombre", userNombre);
      formData.append("us_apellidop", personalesData.apellido);
      formData.append("us_correo", personalesData.correo);
      formData.append("us_contrasena", personalesData.contrasena);
      formData.append("us_nomUsuario", usuarioNom);
      formData.append("us_sexo", userSexo);
      formData.append("stripe_id", stripeCustomerId);
      formData.append("id_perfil", asignarUsuario);
      formData.append("categoria", selectedCategory);

      // Agregar los datos  a la tabla de direccion
      formData.append("calle", domicilioData.calle);
      formData.append("colonia", domicilioData.colonia);
      formData.append("cp", domicilioData.codigoPostal);
      formData.append("num_ext", domicilioData.numeroExterior);
      formData.append("latitud", domicilioData.latitud);
      formData.append("longitud", domicilioData.longitud);

      // Agregar los datos a la tabla de fraccionamiento_club
      formData.append("fc_nombre", organizacionData.nombreOrganizacion);
      formData.append("tipo", tipoOrganizacion);

      console.log("Datos enviados de torneo: ", formData);

      // Realizar el POST a la API
      const response = await APIManager({
        url: `Suscripciones/Suscripciones/registrar_organizacion`,
        method: "POST",
        data: formData,
      });

      console.log("Respuesta de la API: ", response); // Verifica la respuesta de la API

      if (response && response.resultado) {
        console.log("Registro de la organización exitoso");
        // Limpiar los datos de los modales (resetear los estados)
        setDomicilioData({
          calle: "",
          colonia: "",
          codigoPostal: "",
          numeroExterior: "",
          latitud: null,
          longitud: null,
        });
        setPersonalesData({
          correo: "",
          contrasena: "",
          apellido: "",
        });
        setOrganizacionData({
          nombreOrganizacion: "",
        });
        setSelectedCategory(null);
        setPersonalesCompletado(false);
        setOrganizacionCompletado(false);
        setDomicilioCompletado(false);
      } else {
        console.log("Hubo un problema al registrar la suscripción");
      }
    } catch (error) {
      console.log("Error en handleRegistro: ", error);
    }
  };

  const closeModal2 = async () => {
    console.log("Validando datos...");

    console.log("Datos personales:", personalesData);
    console.log("Datos organización:", organizacionData);
    console.log("Datos domicilio:", domicilioData);

    const validPersonales = await validarDatosPersonales();
    const validOrganizacion = validarDatosOrganizacion();
    const validDomicilio = await validarDatosDomicilio(); // 👈 IMPORTANTE

    if (validPersonales && validOrganizacion && validDomicilio) {
      console.log("Datos válidos. Cerrando modal y realizando compra...");
      setIsProcessing(true);
      handleBuyNowDesarrollo(priceId, selectedCategory);
    } else {
      console.log("Datos no válidos.");
      Alert.alert(
        "Atención",
        "Por favor, completa todos los formularios correctamente."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Modal transparent={true} animationType="fade" visible={loading2}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#00baff" />
            <Text style={styles.loadingText}>Procesando suscripción...</Text>
          </View>
        </View>
      </Modal>

      <Titulo titulo="SUSCRIPCIONES" />

      <View style={styles.menu}>
        <MenuItem
          label="USUARIOS"
          isActive={selectedItem === "usuarios"}
          onPress={() => handleSelectItem("usuarios")}
        />

        <MenuItem
          label="CLUB"
          isActive={selectedItem === "club"}
          onPress={() => handleSelectItem("club")}
        />
        <MenuItem
          label="DESARROLLOS"
          isActive={selectedItem === "desarrollos"}
          onPress={() => handleSelectItem("desarrollos")}
        />
      </View>

      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator size="large" color="#fffff" />
        ) : (
          <>
            <Text style={styles.promoText}>
              {selectedItem === "usuarios"
                ? "Lleva tu juego al siguiente nivel con Arosports, jugadas personalizadas, ranking, beneficios únicos y más, se parte de nuestra comunidad ¡Únete ahora!"
                : selectedItem === "club"
                ? "Haz crecer tu club con Arosports, herramientas inteligentes para optimizar cada aspecto de tu operación. ¡Lleva tu gestión al siguiente nivel!"
                : "Optimiza la gestión de tu desarrollo con Arosports, controla horarios, accesos y mucho más desde una sola plataforma. ¡Suscríbete ahora!"}
            </Text>

            {selectedItem === "usuarios" ? (
              <FlatList
                data={filteredPrices}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                // 👉 Aquí agregamos el header arriba de la lista:
                ListHeaderComponent={
                  <View style={{ marginTop: 10 }}>

                    {/* Codigo de descuento para proxima version */}
                    {/*
                    <View style={styles.codigoContainer}>
                      <View style={styles.monedasContainer2}>
                        <View style={{ flex: 1, position: "relative" }}>
                          <TextInput
                            style={styles.codigoInput}
                            placeholder="Ingresa tu código"
                            value={codigoInvitacion}
                            onChangeText={setCodigoInvitacion}
                          />

                          {codigoInvitacion.length > 0 && (
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: [{ translateY: -10 }],
                              }}
                              onPress={() => {
                                setCodigoInvitacion(""); // Borra el texto
                                setCodigoError(""); // Borra error si existía
                                setCodigoAplicado(false); // Borra mensaje de "Código aplicado"
                              }}
                            >
                              <Icon name="refresh" size={20} color="#999" />
                            </TouchableOpacity>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.aplicarButton}
                          onPress={aplicarCodigo}
                          disabled={isApplying}
                        >
                          {isApplying ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.aplicarButtonText}>
                              Aplicar
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {codigoAplicado && (
                        <Text style={styles.codigoExito}>
                          ¡Código aplicado!
                        </Text>
                      )}
                      {codigoError && (
                        <Text style={styles.codigoError}>{codigoError}</Text>
                      )}
                    </View>
                        */}
                    <View style={styles.monedasContainer}>
                      <Text style={styles.parejasText}>Moneda:</Text>

                      <TouchableOpacity
                        style={styles.currencySelector}
                        onPress={() => setIsModalVisible(true)}
                      >
                        <View style={styles.currencyInfo}>
                          <Image
                            source={{ uri: getFlagImageUrl(selectedCurrency) }}
                            style={styles.flag}
                          />
                          <Text style={styles.currencyText}>
                            {selectedCurrency?.toUpperCase() || "..."}
                          </Text>
                          <Icon name="chevron-down" size={15} color="#00BAFF" />
                        </View>
                      </TouchableOpacity>

                      {/* Modal de selección de moneda */}
                      <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setIsModalVisible(false)}
                      >
                        <View style={styles.currencyModalOverlay}>
                          <View style={styles.currencyModalContainer}>
                            <View style={styles.currencyModalHeader}>
                              <Text style={styles.currencyModalTitle}>
                                SELECCIÓN DE MONEDA
                              </Text>
                              <TouchableOpacity
                                style={styles.currencyCloseButton}
                                onPress={() => setIsModalVisible(false)}
                                activeOpacity={0.7}
                              >
                                <Icono name="close" size={24} color="#00baff" />
                              </TouchableOpacity>
                            </View>
                            <ScrollView
                              style={styles.currencyModalContent}
                              showsVerticalScrollIndicator={false}
                            >
                              {uniqueCurrencies.map((currency, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={styles.currencyModalItem}
                                  onPress={() => {
                                    handleCurrencySelect(currency);
                                    setIsModalVisible(false);
                                  }}
                                  activeOpacity={0.8}
                                >
                                  <Image
                                    source={{ uri: getFlagImageUrl(currency) }}
                                    style={styles.flag}
                                  />
                                  <Text style={styles.modalText}>
                                    {currency.toUpperCase()}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                      </Modal>

                      <Modal
                        visible={showExtraModal}
                        transparent={true}
                        animationType="slide"
                      >
                        <View style={styles.modalContainerRe}>
                          <View style={styles.modalContentR}>
                            <Titulo titulo="REGISTRO DE CLUB" />
                            <TouchableOpacity
                              style={styles.closeIcon}
                              onPress={() => {
                                setShowExtraModal(false);
                              }}
                            >
                              <Icono
                                name="close-circle"
                                size={30}
                                color="#00bfff"
                              />
                            </TouchableOpacity>

                            {/* Botones de acceso a los modales */}
                            <View style={styles.buttonContainerR}>
                              <TouchableOpacity
                                style={[
                                  styles.buttonR,
                                  personalesCompletado
                                    ? styles.buttonGuardarActive
                                    : styles.buttonGuardarInactive,
                                ]}
                                onPress={() => openModal("personales")}
                              >
                                <Icon
                                  name="edit"
                                  size={20}
                                  color={
                                    personalesCompletado ? "white" : "#00baff"
                                  }
                                  style={styles.buttonIconR}
                                />
                                <Text
                                  style={[
                                    styles.buttonTextR,
                                    personalesCompletado
                                      ? styles.textActive
                                      : styles.textInactive,
                                  ]}
                                >
                                  Datos Personales
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.buttonR,
                                  organizacionCompletado
                                    ? styles.buttonGuardarActive
                                    : styles.buttonGuardarInactive,
                                ]}
                                onPress={() => openModal("organizacion")}
                              >
                                <Icon
                                  name="edit"
                                  size={20}
                                  color={
                                    organizacionCompletado ? "white" : "#00baff"
                                  }
                                  style={styles.buttonIconR}
                                />
                                <Text
                                  style={[
                                    styles.buttonTextR,
                                    organizacionCompletado
                                      ? styles.textActive
                                      : styles.textInactive,
                                  ]}
                                >
                                  Datos de la Organización
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.buttonR,
                                  domicilioCompletado
                                    ? styles.buttonGuardarActive
                                    : styles.buttonGuardarInactive,
                                ]}
                                onPress={() => openModal("domicilio")}
                              >
                                <Icon
                                  name="edit"
                                  size={20}
                                  color={
                                    domicilioCompletado ? "white" : "#00baff"
                                  }
                                  style={styles.buttonIconR}
                                />
                                <Text
                                  style={[
                                    styles.buttonTextR,
                                    domicilioCompletado
                                      ? styles.textActive
                                      : styles.textInactive,
                                  ]}
                                >
                                  Datos de Domicilio
                                </Text>
                              </TouchableOpacity>
                              <View style={styles.buttonRegistrarse}>
                                <TouchableOpacity
                                  disabled={isProcessing}
                                  style={[
                                    styles.buttonRegistro,
                                    isProcessing && styles.buttonDisabled,
                                  ]}
                                  onPress={() => closeModal2()}
                                >
                                  <Text style={styles.headerText}>
                                    {isProcessing
                                      ? "Registrando..."
                                      : "Registrarse"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>

                            {/* Modal de Datos Personaless */}
                            {activeModal === "personales" && (
                              <Modal
                                visible={true}
                                transparent={true}
                                animationType="slide"
                              >
                                <View style={styles.modalContainerR}>
                                  <View style={styles.modalContentS}>
                                    <KeyboardAwareScrollView
                                      contentContainerStyle={{ padding: 20 }}
                                      extraScrollHeight={50}
                                      keyboardShouldPersistTaps="handled"
                                    >
                                      <Titulo titulo="DATOS PERSONALES" />

                                      <TouchableOpacity
                                        style={styles.closeIconS}
                                        onPress={() => {
                                          setShowExtraModal(true);
                                          setActiveModal(null);
                                        }}
                                      >
                                        <Icono
                                          name="close-circle"
                                          size={30}
                                          color="#00bfff"
                                        />
                                      </TouchableOpacity>

                                      <MostrarDatos
                                        iconName="person-outline"
                                        placeholder="Nombre"
                                        value={`Nombre: ${userNombre}`}
                                        editable={false}
                                      />
                                      <MostrarDatos
                                        iconName="person-circle-outline"
                                        placeholder="Usuario"
                                        value={`Usuario: ${usuarioNom}`}
                                        editable={false}
                                      />

                                      <MostrarDatos
                                        iconName="person-outline"
                                        placeholder="Ingresa tu apellido"
                                        value={personalesData.apellido}
                                        onChangeText={(text) => {
                                          // Validación en tiempo real apellido
                                          let errorMsg = "";
                                          if (!text.trim())
                                            errorMsg = "Campo obligatorio*";

                                          setErrors((prev) => ({
                                            ...prev,
                                            apellido: errorMsg,
                                          }));
                                          setPersonalesData({
                                            ...personalesData,
                                            apellido: text,
                                          });
                                        }}
                                        error={errors.apellido}
                                      />

                                      <MostrarDatos
                                        iconName="mail-outline"
                                        placeholder="Correo:"
                                        value={personalesData.correo}
                                        borderWidth={1}
                                        onChangeText={(text) => {
                                          // Validación en tiempo real correo
                                          let errorMsg = "";
                                          const emailRegex =
                                            /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

                                          if (!text.trim()) {
                                            errorMsg = "Campo obligatorio*";
                                          } else if (!emailRegex.test(text)) {
                                            errorMsg =
                                              "Correo inválido (ej. usuario@dominio.com)";
                                          } else if (text === userEmail) {
                                            errorMsg =
                                              "El correo debe ser diferente al actual*";
                                          }

                                          setErrors((prev) => ({
                                            ...prev,
                                            correo: errorMsg,
                                          }));
                                          setPersonalesData({
                                            ...personalesData,
                                            correo: text,
                                          });
                                        }}
                                        error={errors.correo}
                                      />

                                      <MostrarDatos
                                        iconName="lock-closed-outline"
                                        placeholder="Contraseña:"
                                        maxLength={20}
                                        value={personalesData.contrasena}
                                        onChangeText={(text) => {
                                          // Validación en tiempo real contraseña
                                          let errorMsg = "";
                                          if (!text.trim()) {
                                            errorMsg = "Campo obligatorio*";
                                          } else if (text.length < 8) {
                                            errorMsg =
                                              "Debe tener entre 5 y 20 caracteres*";
                                          } else if (!/\d/.test(text)) {
                                            errorMsg =
                                              "Debe contener al menos un número*";
                                          }

                                          setErrors((prev) => ({
                                            ...prev,
                                            contrasena: errorMsg,
                                          }));
                                          setPersonalesData({
                                            ...personalesData,
                                            contrasena: text,
                                          });
                                        }}
                                        error={errors.contrasena}
                                        secureTextEntry={secureTextEntry}
                                        onPressIcon={handleIconPress}
                                      />

                                      <View style={styles.buttonGuardar}>
                                        <CustomButton
                                          buttonText="Guardar"
                                          onPress={async () => {
                                            const datosPersonalesValidados =
                                              await validarDatosPersonales();
                                            if (datosPersonalesValidados) {
                                              setPersonalesCompletado(true);
                                              closeModal();
                                            } else {
                                              console.log(
                                                "Los datos personales contienen errores, por favor revisa."
                                              );
                                            }
                                          }}
                                        />
                                      </View>
                                    </KeyboardAwareScrollView>
                                  </View>
                                </View>
                              </Modal>
                            )}

                            {/* Modal de Datos de la Organización */}
                            {activeModal === "organizacion" && (
                              <Modal
                                visible={true}
                                transparent={true}
                                animationType="slide"
                              >
                                <View style={styles.modalContainerR}>
                                  <View style={styles.modalContentS}>
                                    <KeyboardAwareScrollView
                                      contentContainerStyle={{ padding: 20 }}
                                      extraScrollHeight={50}
                                      keyboardShouldPersistTaps="handled"
                                    >
                                      <Titulo titulo="DATOS ORGANIZACIÓN" />
                                      <TouchableOpacity
                                        style={styles.closeIconS}
                                        onPress={() => {
                                          setShowExtraModal(true); // Cambiar el estado para mostrar el modal de registro
                                          setActiveModal(null); // Cerrar el modal actual
                                        }}
                                      >
                                        <Icono
                                          name="close-circle"
                                          size={30}
                                          color="#00bfff"
                                        />
                                      </TouchableOpacity>
                                      <MostrarDatos
                                        iconName="person-outline"
                                        placeholder="Nombre:"
                                        value={
                                          organizacionData.nombreOrganizacion
                                        }
                                        onChangeText={(text) => {
                                          // Validación en tiempo real para nombreOrganizacion
                                          let errorMsg = "";
                                          if (!text.trim()) {
                                            errorMsg = "Campo obligatorio*";
                                          }
                                          setErrors((prev) => ({
                                            ...prev,
                                            nombreOrganizacion: errorMsg,
                                          }));
                                          setOrganizacionData({
                                            ...organizacionData,
                                            nombreOrganizacion: text,
                                          });
                                        }}
                                        error={errors.nombreOrganizacion}
                                      />

                                      <MostrarDatos
                                        iconName="business-outline"
                                        placeholder="Tipo de Organización"
                                        value={`Tipo: ${selectedCategory}`}
                                        editable={false}
                                        borderWidth={2}
                                      />

                                      <View style={styles.buttonGuardar}>
                                        <CustomButton
                                          buttonText="Guardar"
                                          onPress={() => {
                                            const datosOrganzacionValidados =
                                              validarDatosOrganizacion();
                                            if (datosOrganzacionValidados) {
                                              setOrganizacionCompletado(true);
                                              closeModal();
                                            } else {
                                              console.log(
                                                "Los datos de la organizacion contienen errores, por favor revisa."
                                              );
                                            }
                                          }}
                                        />
                                      </View>
                                    </KeyboardAwareScrollView>
                                  </View>
                                </View>
                              </Modal>
                            )}

                            {/* Modal de Datos de Domicilio */}
                            {activeModal === "domicilio" && (
                              <Modal
                                visible={true}
                                transparent={true}
                                animationType="slide"
                              >
                                <View style={styles.modalContainerR}>
                                  <View style={styles.modalContentS}>
                                    <KeyboardAwareScrollView
                                      contentContainerStyle={{ padding: 20 }}
                                      extraScrollHeight={50}
                                      keyboardShouldPersistTaps="handled"
                                    >
                                      <Titulo titulo="DATOS DOMICILIO" />
                                      <TouchableOpacity
                                        style={styles.closeIconS}
                                        onPress={() => {
                                          setShowExtraModal(true); // Cambiar el estado para mostrar el modal de registro
                                          setActiveModal(null); // Cerrar el modal actual
                                        }}
                                      >
                                        <Icono
                                          name="close-circle"
                                          size={30}
                                          color="#00bfff"
                                        />
                                      </TouchableOpacity>
                                      <MostrarDatos
                                        iconName="home-outline"
                                        placeholder="Calle:"
                                        value={domicilioData.calle}
                                        onChangeText={(text) => {
                                          if (text.trim() !== "") {
                                            setErrors((prev) => ({
                                              ...prev,
                                              calle: "",
                                            })); // Limpia el error para 'nombreUsuario'
                                          }
                                          setDomicilioData({
                                            ...domicilioData,
                                            calle: text,
                                          });
                                        }}
                                        error={errors.calle} // Mostrar error debajo del campo
                                      />
                                      <MostrarDatos
                                        iconName="home-outline"
                                        placeholder="Colonia:"
                                        value={domicilioData.colonia}
                                        onChangeText={(text) => {
                                          if (text.trim() !== "") {
                                            setErrors((prev) => ({
                                              ...prev,
                                              colonia: "",
                                            })); // Limpia el error para 'nombreUsuario'
                                          }
                                          setDomicilioData({
                                            ...domicilioData,
                                            colonia: text,
                                          });
                                        }}
                                        error={errors.colonia} // Mostrar error debajo del campo
                                      />
                                      <MostrarDatos
                                        iconName="location-outline"
                                        placeholder="CP:"
                                        keyboardType="numeric"
                                        maxLength={5}
                                        value={domicilioData.codigoPostal}
                                        onChangeText={(text) => {
                                          if (text.trim() !== "") {
                                            setErrors((prev) => ({
                                              ...prev,
                                              codigoPostal: "",
                                            })); // Limpia el error para 'nombreUsuario'
                                          }
                                          setDomicilioData({
                                            ...domicilioData,
                                            codigoPostal: text,
                                          });
                                        }}
                                        error={errors.codigoPostal} // Mostrar error debajo del campo
                                      />
                                      <MostrarDatos
                                        iconName="calendar-number-outline"
                                        placeholder="Num.Ext:"
                                        keyboardType="numeric"
                                        maxLength={5}
                                        value={domicilioData.numeroExterior}
                                        onChangeText={(text) => {
                                          if (text.trim() !== "") {
                                            setErrors((prev) => ({
                                              ...prev,
                                              numeroExterior: "",
                                            })); // Limpia el error para 'nombreUsuario'
                                          }
                                          setDomicilioData({
                                            ...domicilioData,
                                            numeroExterior: text,
                                          });
                                        }}
                                        error={errors.numeroExterior} // Mostrar error debajo del campo
                                      />

                                      <View style={styles.buttonGuardar}>
                                        <CustomButton
                                          buttonText="Guardar"
                                          onPress={async () => {
                                            // Cambiar a función asíncrona
                                            const datosDomicilioValidados =
                                              await validarDatosDomicilio(); // Esperar que se validen los datos
                                            if (datosDomicilioValidados) {
                                              setDomicilioCompletado(true);
                                              closeModal(); // Cerrar el modal solo si los datos son válidos
                                            } else {
                                              console.log(
                                                "Los datos del domicilio contienen errores, por favor revisa."
                                              );
                                            }
                                          }}
                                        />
                                      </View>
                                    </KeyboardAwareScrollView>
                                  </View>
                                </View>
                              </Modal>
                            )}
                          </View>
                        </View>
                      </Modal>
                    </View>
                  </View>
                }
                renderItem={({ item }) => {
                  // Filtrar el precio por la moneda seleccionada, validando que "prices" no sea null o vacío
                  const selectedPrice = item.prices
                    ? item.prices.find(
                        (price) => price.currency === selectedCurrency
                      )
                    : null;

                  // Verificamos si subscription[selectedItem] es válido
                  const activeSubscription =
                    subscription && selectedItem
                      ? subscription[selectedItem]
                      : null;

                  // Verificamos que activeSubscription no sea null y que productId esté presente
                  const isSubscribed =
                    activeSubscription?.productId === item.id;

                  return (
                    <CardPlanesSuscripcion
                      titulo={item.name}
                      id={item.id}
                      subscription={activeSubscription?.productId ?? ""}
                      status={activeSubscription?.status ?? ""}
                      subscriptionId={activeSubscription?.subscriptionId ?? ""}
                      prices={item.prices} // Pasamos todos los precios disponibles
                      price={Number(item.precioConDescuento)}
                      // price={selectedPrice ? selectedPrice.amount : 0} // Pasamos el precio según la moneda seleccionada
                      priceId={selectedPrice ? selectedPrice.id : ""} // Enviamos el ID del precio
                      currency={selectedCurrency} // Pasamos la moneda seleccionada
                      onBuyNow={(currency, priceId, amount) =>
                        handleBuyNow(priceId, "usuarios")
                      }
                      paymentSheetEnabled={paymentSheetEnabled}
                      id_usuario={id_usuario}
                      stripeCustomer={stripeCustomer}
                      showBuyButton={selectedItem === "usuarios"}
                    />
                  );
                }}
                ListFooterComponent={
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={handleContactPress}
                    >
                      <Text style={styles.loginButtonText}>CONTÁCTANOS</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            ) : (
              <FlatList
                data={filteredPrices}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View style={{ marginTop: 10 }}>
                    {/* Selector de MONEDA */}

                    {/* Código para descuento en las proximas versiones*/}
                    {/*
                    <View style={styles.codigoContainer}>
                      <View style={styles.monedasContainer2}>
                        <View style={{ flex: 1, position: "relative" }}>
                          <TextInput
                            style={styles.codigoInput}
                            placeholder="Ingresa tu código"
                            value={codigoInvitacion}
                            onChangeText={setCodigoInvitacion}
                          />

                          {codigoInvitacion.length > 0 && (
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: [{ translateY: -10 }],
                              }}
                              onPress={() => {
                                setCodigoInvitacion(""); // Borra el texto
                                setCodigoError(""); // Borra error si existía
                                setCodigoAplicado(false); // Borra mensaje de "Código aplicado"
                              }}
                            >
                              <Icon name="refresh" size={20} color="#999" />
                            </TouchableOpacity>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.aplicarButton}
                          onPress={aplicarCodigo}
                          disabled={isApplying}
                        >
                          {isApplying ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.aplicarButtonText}>
                              Aplicar
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {codigoAplicado && (
                        <Text style={styles.codigoExito}>
                          ¡Código aplicado!
                        </Text>
                      )}
                      {codigoError && (
                        <Text style={styles.codigoError}>{codigoError}</Text>
                      )}
                    </View>
                    */}
                    <View style={styles.monedasContainer}>
                      <Text style={styles.parejasText}>Moneda:</Text>

                      <TouchableOpacity
                        style={styles.currencySelector}
                        onPress={() => setIsModalVisible(true)}
                      >
                        <View style={styles.currencyInfo}>
                          <Image
                            source={{ uri: getFlagImageUrl(selectedCurrency) }}
                            style={styles.flag}
                          />
                          <Text style={styles.currencyText}>
                            {selectedCurrency?.toUpperCase() || "..."}
                          </Text>
                          <Icon name="chevron-down" size={15} color="#00BAFF" />
                        </View>
                      </TouchableOpacity>

                      {/* Modal de selección de moneda */}
                      <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setIsModalVisible(false)}
                      >
                        <View style={styles.currencyModalOverlay}>
                          <View style={styles.currencyModalContainer}>
                            <View style={styles.currencyModalHeader}>
                              <Text style={styles.currencyModalTitle}>
                                SELECCIÓN DE MONEDA
                              </Text>
                              <TouchableOpacity
                                style={styles.currencyCloseButton}
                                onPress={() => setIsModalVisible(false)}
                                activeOpacity={0.7}
                              >
                                <Icono name="close" size={24} color="#00baff" />
                              </TouchableOpacity>
                            </View>
                            <ScrollView
                              style={styles.currencyModalContent}
                              showsVerticalScrollIndicator={false}
                            >
                              {uniqueCurrencies.map((currency, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={styles.currencyModalItem}
                                  onPress={() => {
                                    handleCurrencySelect(currency);
                                    setIsModalVisible(false);
                                  }}
                                  activeOpacity={0.8}
                                >
                                  <Image
                                    source={{ uri: getFlagImageUrl(currency) }}
                                    style={styles.flag}
                                  />
                                  <Text style={styles.modalText}>
                                    {currency.toUpperCase()}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                      </Modal>

                      {/* Modal de registro */}
                      <Modal
                        visible={showExtraModal}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowExtraModal(false)}
                      >
                        <View style={styles.registerModalOverlayNew}>
                          <View style={styles.registerModalContainerNew}>
                            <View style={styles.registerModalHeaderNew}>
                              <Text style={styles.registerModalTitleNew}>
                                REGISTRO
                              </Text>
                              <TouchableOpacity
                                style={styles.registerModalCloseButtonNew}
                                onPress={() => setShowExtraModal(false)}
                                activeOpacity={0.7}
                              >
                                <Icono name="close" size={24} color="#00baff" />
                              </TouchableOpacity>
                            </View>
                            <ScrollView
                              style={styles.registerModalContentNew}
                              showsVerticalScrollIndicator={false}
                            >
                              <View style={styles.registerModalContentInnerNew}>
                                <TouchableOpacity
                                  style={[
                                    styles.registerModalButtonNew,
                                    personalesCompletado &&
                                      styles.registerModalButtonActiveNew,
                                  ]}
                                  onPress={() => openModal("personales")}
                                  activeOpacity={0.8}
                                >
                                  <Icon
                                    name="edit"
                                    size={20}
                                    color={
                                      personalesCompletado ? "#fff" : "#00baff"
                                    }
                                    style={styles.registerModalButtonIconNew}
                                  />
                                  <Text
                                    style={[
                                      styles.registerModalButtonTextNew,
                                      personalesCompletado &&
                                        styles.registerModalButtonTextActiveNew,
                                    ]}
                                  >
                                    Datos Personales
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.registerModalButtonNew,
                                    organizacionCompletado &&
                                      styles.registerModalButtonActiveNew,
                                  ]}
                                  onPress={() => openModal("organizacion")}
                                  activeOpacity={0.8}
                                >
                                  <Icon
                                    name="edit"
                                    size={20}
                                    color={
                                      organizacionCompletado
                                        ? "#fff"
                                        : "#00baff"
                                    }
                                    style={styles.registerModalButtonIconNew}
                                  />
                                  <Text
                                    style={[
                                      styles.registerModalButtonTextNew,
                                      organizacionCompletado &&
                                        styles.registerModalButtonTextActiveNew,
                                    ]}
                                  >
                                    Datos de la Organización
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.registerModalButtonNew,
                                    domicilioCompletado &&
                                      styles.registerModalButtonActiveNew,
                                  ]}
                                  onPress={() => openModal("domicilio")}
                                  activeOpacity={0.8}
                                >
                                  <Icon
                                    name="edit"
                                    size={20}
                                    color={
                                      domicilioCompletado ? "#fff" : "#00baff"
                                    }
                                    style={styles.registerModalButtonIconNew}
                                  />
                                  <Text
                                    style={[
                                      styles.registerModalButtonTextNew,
                                      domicilioCompletado &&
                                        styles.registerModalButtonTextActiveNew,
                                    ]}
                                  >
                                    Datos de Domicilio
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </ScrollView>
                            <View style={styles.registerModalFooterNew}>
                              <TouchableOpacity
                                style={[
                                  styles.registerModalSubmitButtonNew,
                                  isProcessing &&
                                    styles.registerModalSubmitButtonDisabledNew,
                                ]}
                                onPress={() => closeModal2()}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                              >
                                <Icono
                                  name="checkmark-circle"
                                  size={20}
                                  color="#fff"
                                />
                                <Text
                                  style={
                                    styles.registerModalSubmitButtonTextNew
                                  }
                                >
                                  {isProcessing
                                    ? "Registrando..."
                                    : "Registrarse"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Modal>

                      {/* Modal de Datos Personales */}
                      {activeModal === "personales" && (
                        <Modal
                          visible={true}
                          transparent={true}
                          animationType="slide"
                          onRequestClose={() => {
                            setShowExtraModal(true);
                            setActiveModal(null);
                          }}
                        >
                          <View style={styles.personalModalOverlayNew}>
                            <View style={styles.personalModalContainerNew}>
                              <View style={styles.personalModalHeaderNew}>
                                <Text style={styles.personalModalTitleNew}>
                                  DATOS PERSONALES
                                </Text>
                                <TouchableOpacity
                                  style={styles.personalModalCloseButtonNew}
                                  onPress={() => {
                                    setShowExtraModal(true);
                                    setActiveModal(null);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Icono
                                    name="close"
                                    size={24}
                                    color="#00baff"
                                  />
                                </TouchableOpacity>
                              </View>
                              <KeyboardAwareScrollView
                                style={styles.personalModalContentNew}
                                contentContainerStyle={
                                  styles.personalModalContentInnerNew
                                }
                                extraScrollHeight={50}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                              >
                                <MostrarDatos
                                  borderWidth={2}
                                  iconName="person-outline"
                                  placeholder="Nombre"
                                  value={`Nombre: ${userNombre}`}
                                  editable={false}
                                />
                                <MostrarDatos
                                  borderWidth={2}
                                  iconName="person-circle-outline"
                                  placeholder="Usuario"
                                  value={`Usuario: ${usuarioNom}`}
                                  editable={false}
                                />
                                <MostrarDatos
                                  borderWidth={2}
                                  iconName="person-outline"
                                  placeholder="Ingresa tu apellido"
                                  value={personalesData.apellido}
                                  onChangeText={(text) => {
                                    let errorMsg = "";
                                    if (!text.trim())
                                      errorMsg = "El apellido es obligatorio";
                                    setErrors((prev) => ({
                                      ...prev,
                                      apellido: errorMsg,
                                    }));
                                    setPersonalesData({
                                      ...personalesData,
                                      apellido: text,
                                    });
                                  }}
                                  error={errors.apellido}
                                  errorStyles={true}
                                />
                                <MostrarDatos
                                  iconName="mail-outline"
                                  placeholder="Ingresa tu correo"
                                  value={personalesData.correo}
                                  borderWidth={2}
                                  errorStyles={true}
                                  onChangeText={(text) => {
                                    // Validación local (sin comparar con el correo actual)
                                    let errorMsg = "";
                                    const emailRegex =
                                      /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

                                    if (!text.trim()) {
                                      errorMsg = "Campo obligatorio*";
                                    } else if (!emailRegex.test(text)) {
                                      errorMsg = "Correo no válido ";
                                    }

                                    // Establece error local
                                    setErrors((prev) => ({
                                      ...prev,
                                      correo: errorMsg,
                                    }));

                                    // Actualiza estado
                                    setPersonalesData({
                                      ...personalesData,
                                      correo: text,
                                    });

                                    // Validación remota solo si pasa la validación local
                                    if (text.trim() && emailRegex.test(text)) {
                                      validarCorreoEnServidor(text, setErrors);
                                    }
                                  }}
                                  error={errors.correo}
                                />

                                <MostrarDatos
                                  borderWidth={2}
                                  iconName="lock-closed-outline"
                                  placeholder="Ingresa una contraseña"
                                  maxLength={20}
                                  value={personalesData.contrasena}
                                  onChangeText={(text) => {
                                    let errorMsg = "";
                                    if (!text.trim()) {
                                      errorMsg = "La contraseña es obligatoria";
                                    } else if (text.length < 8) {
                                      errorMsg =
                                        "La contraseña debe tener al menos 8 caracteres";
                                    } else if (!/\d/.test(text)) {
                                      errorMsg =
                                        "La contraseña debe contener al menos un número";
                                    } else if (!/[!@#$%^&*]/.test(text)) {
                                      errorMsg =
                                        "La contraseña debe contener al menos un carácter especial (!@#$%^&*)";
                                    }
                                    setErrors((prev) => ({
                                      ...prev,
                                      contrasena: errorMsg,
                                    }));
                                    setPersonalesData({
                                      ...personalesData,
                                      contrasena: text,
                                    });
                                  }}
                                  error={errors.contrasena}
                                  errorStyles={true}
                                  secureTextEntry={secureTextEntry}
                                  onPressIcon={handleIconPress}
                                />
                              </KeyboardAwareScrollView>
                              <View style={styles.personalModalFooterNew}>
                                <TouchableOpacity
                                  style={styles.personalModalSubmitButtonNew}
                                  onPress={async () => {
                                    const datosPersonalesValidados =
                                      await validarDatosPersonales();
                                    if (datosPersonalesValidados) {
                                      setPersonalesCompletado(true);
                                      closeModal();
                                    } else {
                                      console.log(
                                        "Los datos personales contienen errores, por favor revisa."
                                      );
                                    }
                                  }}
                                  activeOpacity={0.8}
                                >
                                  <Icono
                                    name="checkmark-circle"
                                    size={20}
                                    color="#fff"
                                  />
                                  <Text
                                    style={
                                      styles.personalModalSubmitButtonTextNew
                                    }
                                  >
                                    Guardar
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </Modal>
                      )}

                      {/* Modal de Datos de la Organización */}
                      {activeModal === "organizacion" && (
                        <Modal
                          visible={true}
                          transparent={true}
                          animationType="slide"
                          onRequestClose={() => {
                            setShowExtraModal(true);
                            setActiveModal(null);
                          }}
                        >
                          <View style={styles.organizationModalOverlayNew}>
                            <View style={styles.organizationModalContainerNew}>
                              <View style={styles.organizationModalHeaderNew}>
                                <Text style={styles.organizationModalTitleNew}>
                                  DATOS ORGANIZACIÓN
                                </Text>
                                <TouchableOpacity
                                  style={styles.organizationModalCloseButtonNew}
                                  onPress={() => {
                                    setShowExtraModal(true);
                                    setActiveModal(null);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Icono
                                    name="close"
                                    size={24}
                                    color="#00baff"
                                  />
                                </TouchableOpacity>
                              </View>
                              <KeyboardAwareScrollView
                                style={styles.organizationModalContentNew}
                                contentContainerStyle={
                                  styles.organizationModalContentInnerNew
                                }
                                extraScrollHeight={50}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                              >
                                <MostrarDatos
                                  iconName="person-outline"
                                  placeholder="Ingresa el nombre de tu organización"
                                  value={organizacionData.nombreOrganizacion}
                                  borderWidth={2}
                                  RFValue2={10}
                                  onChangeText={(text) => {
                                    let errorMsg = "";
                                    if (!text.trim())
                                      errorMsg = "El nombre es obligatorio";
                                    setErrors((prev) => ({
                                      ...prev,
                                      nombreOrganizacion: errorMsg,
                                    }));
                                    setOrganizacionData({
                                      ...organizacionData,
                                      nombreOrganizacion: text,
                                    });
                                  }}
                                  error={errors.nombreOrganizacion}
                                  errorStyles={true}
                                />
                                <MostrarDatos
                                  iconName="business-outline"
                                  placeholder="Tipo de Organización"
                                  value={`Tipo de organización: ${selectedCategory}`}
                                  editable={false}
                                  borderWidth={2}
                                  RFValue2={11}
                                />
                              </KeyboardAwareScrollView>
                              <View style={styles.organizationModalFooterNew}>
                                <TouchableOpacity
                                  style={
                                    styles.organizationModalSubmitButtonNew
                                  }
                                  onPress={() => {
                                    const datosOrganzacionValidados =
                                      validarDatosOrganizacion();
                                    if (datosOrganzacionValidados) {
                                      setOrganizacionCompletado(true);
                                      closeModal();
                                    } else {
                                      console.log(
                                        "Los datos de la organizacion contienen errores, por favor revisa."
                                      );
                                    }
                                  }}
                                  activeOpacity={0.8}
                                >
                                  <Icono
                                    name="checkmark-circle"
                                    size={20}
                                    color="#fff"
                                  />
                                  <Text
                                    style={
                                      styles.organizationModalSubmitButtonTextNew
                                    }
                                  >
                                    Guardar
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </Modal>
                      )}

                      {/* Modal de Datos de Domicilio */}
                      {activeModal === "domicilio" && (
                        <Modal
                          visible={true}
                          transparent={true}
                          animationType="slide"
                          onRequestClose={() => {
                            setShowExtraModal(true);
                            setActiveModal(null);
                          }}
                        >
                          <View style={styles.addressModalOverlayNew}>
                            <View style={styles.addressModalContainerNew}>
                              <View style={styles.addressModalHeaderNew}>
                                <Text style={styles.addressModalTitleNew}>
                                  DATOS DEL DOMICILIO
                                </Text>
                                <TouchableOpacity
                                  style={styles.addressModalCloseButtonNew}
                                  onPress={() => {
                                    setShowExtraModal(true);
                                    setActiveModal(null);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Icono
                                    name="close"
                                    size={24}
                                    color="#00baff"
                                  />
                                </TouchableOpacity>
                              </View>
                              <KeyboardAwareScrollView
                                style={styles.addressModalContentNew}
                                contentContainerStyle={
                                  styles.addressModalContentInnerNew
                                }
                                extraScrollHeight={50}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                              >
                                <MostrarDatos
                                  iconName="home-outline"
                                  placeholder="Ingresa la calle de la organización"
                                  borderWidth={2}
                                  value={domicilioData.calle}
                                  RFValue2={10}
                                  onChangeText={(text) => {
                                    if (text.trim() !== "") {
                                      setErrors((prev) => ({
                                        ...prev,
                                        calle: "",
                                      }));
                                    }
                                    setDomicilioData({
                                      ...domicilioData,
                                      calle: text,
                                    });
                                  }}
                                  error={errors.calle}
                                  errorStyles={true}
                                />
                                <MostrarDatos
                                  iconName="business-outline"
                                  placeholder="Ingresa la colonia de tu organización"
                                  value={domicilioData.colonia}
                                  borderWidth={2}
                                  RFValue2={10}
                                  onChangeText={(text) => {
                                    if (text.trim() !== "") {
                                      setErrors((prev) => ({
                                        ...prev,
                                        colonia: "",
                                      }));
                                    }
                                    setDomicilioData({
                                      ...domicilioData,
                                      colonia: text,
                                    });
                                  }}
                                  error={errors.colonia}
                                  errorStyles={true}
                                />
                                <MostrarDatos
                                  iconName="location-outline"
                                  placeholder="Ingresa el CP de tu organización"
                                  keyboardType="numeric"
                                  maxLength={5}
                                  borderWidth={2}
                                  RFValue2={10}
                                  value={domicilioData.codigoPostal}
                                  onChangeText={(text) => {
                                    if (text.trim() !== "") {
                                      setErrors((prev) => ({
                                        ...prev,
                                        codigoPostal: "",
                                      }));
                                    }
                                    setDomicilioData({
                                      ...domicilioData,
                                      codigoPostal: text,
                                    });
                                  }}
                                  error={errors.codigoPostal}
                                  errorStyles={true}
                                />
                                <MostrarDatos
                                  iconName="calendar-number-outline"
                                  placeholder="Ingresa el número exterior de tu orga.."
                                  keyboardType="numeric"
                                  borderWidth={2}
                                  maxLength={5}
                                  RFValue2={10}
                                  value={domicilioData.numeroExterior}
                                  onChangeText={(text) => {
                                    if (text.trim() !== "") {
                                      setErrors((prev) => ({
                                        ...prev,
                                        numeroExterior: "",
                                      }));
                                    }
                                    setDomicilioData({
                                      ...domicilioData,
                                      numeroExterior: text,
                                    });
                                  }}
                                  error={errors.numeroExterior}
                                  errorStyles={true}
                                />
                              </KeyboardAwareScrollView>
                              <View style={styles.addressModalFooterNew}>
                                <TouchableOpacity
                                  style={styles.addressModalSubmitButtonNew}
                                  onPress={async () => {
                                    const datosDomicilioValidados =
                                      await validarDatosDomicilio();
                                    if (datosDomicilioValidados) {
                                      setDomicilioCompletado(true);
                                      closeModal();
                                    } else {
                                      console.log(
                                        "Los datos del domicilio contienen errores, por favor revisa."
                                      );
                                    }
                                  }}
                                  activeOpacity={0.8}
                                >
                                  <Icono
                                    name="checkmark-circle"
                                    size={20}
                                    color="#fff"
                                  />
                                  <Text
                                    style={
                                      styles.addressModalSubmitButtonTextNew
                                    }
                                  >
                                    Guardar
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </Modal>
                      )}
                    </View>
                  </View>
                }
                renderItem={({ item }) => {
                  // Filtrar el precio por la moneda seleccionada
                  const selectedPrice = item.prices
                    ? item.prices.find(
                        (price) => price.currency === selectedCurrency
                      )
                    : null;

                  // Obtener la suscripción activa de esta categoría (desarrollos, club, etc.)
                  const activeSubscription =
                    subscription && selectedItem
                      ? subscription[selectedItem]
                      : null;

                  // Verificamos que activeSubscription no sea null y que productId esté presente
                  const isSubscribed =
                    activeSubscription?.productId === item.id;

                  return (
                    <CardPlanesDesarrollo
                      titulo={item.name}
                      id={item.id}
                      subscription={activeSubscription?.productId ?? ""}
                      status={activeSubscription?.status ?? ""}
                      subscriptionId={activeSubscription?.subscriptionId ?? ""}
                      prices={item.prices} // Pasamos todos los precios disponibles
                      price={Number(item.precioConDescuento)}
                      // price={selectedPrice ? selectedPrice.amount : 0} // Pasamos el precio según la moneda seleccionada
                      priceId={selectedPrice ? selectedPrice.id : ""} // Enviamos el ID del precio
                      currency={selectedCurrency} // Pasamos la moneda seleccionada
                      onBuyNow={(currency, priceId, amount) =>
                        handleBuyNow(priceId, selectedItem)
                      }
                      paymentSheetEnabled={paymentSheetEnabled}
                      id_usuario={id_usuario}
                      stripeCustomer={stripeCustomer}
                      showBuyButton={
                        selectedItem === "desarrollos" ||
                        selectedItem === "club"
                      } // Aquí agregas la condición para 'desarrollos' y 'clubs'
                    />
                  );
                }}
                ListFooterComponent={
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={handleContactPress}
                    >
                      <Text style={styles.loginButtonText}>CONTÁCTANOS</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}
          </>
        )}
      </View>

      <View style={styles.containerBaner}>
        <BannerAd />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2E2E2E",
  },
  containerBaner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    alignItems: "center",
  },
  promoText: {
    textAlign: "justify",
    color: "#ffff",
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: -5,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#00baff",
    width: 200, // Establece el ancho a 205 píxeles
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainerR: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainerRe: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#00baff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalContentR: {
    backgroundColor: "rgba(255, 255, 255, 1)", // Fondo blanco translúcido
    borderRadius: 15,
    padding: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    paddingVertical: 20, // espacio simétrico arriba y abajo
    justifyContent: "space-between",
    shadowRadius: 5,
    elevation: 8, // Sombra para Android
    borderWidth: 2,
    borderColor: "#00baff",
  },
  modalContentS: {
    backgroundColor: "rgba(255, 255, 255, 1)", // Fondo blanco translúcido
    borderRadius: 15,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Sombra para Android
    borderWidth: 2,
    borderColor: "#00baff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#00baff",
  },
  list: {
    paddingBottom: "20%",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: -5, // Espacio entre opciones
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // Línea divisoria entre opciones
  },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00BAFF",
  },
  dropdownContainer: {
    position: "absolute",
    top: 40,
    right: -4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: 90,
    zIndex: 10,
    maxHeight: 75, // Ajusta la altura máxima para más opciones
  },
  scrollView: {
    maxHeight: 75,
  },
  dropdownText: {
    padding: 10,
    fontSize: 14,
    color: "#00BAFF",
  },
  flag: {
    width: 20,
    height: 15,
    marginRight: 8,
  },

  monedasContainer: {
    marginTop: -10, // Espacio superior para separación
    padding: 2, // Espaciado dentro del contenedor
    borderRadius: 10, // Bordes redondeados
    backgroundColor: "white", // Fondo suave
    justifyContent: "center", // Centra el contenido
    width: width * 0.8,
    alignSelf: "center", // Centra el contenedor en la pantalla
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#00baff", // Color del borde
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center", // Alinea los elementos en la misma línea
  },
  monedasContainer2: {
    marginTop: -10, // Espacio superior para separación
    padding: 2, // Espaciado dentro del contenedor
    borderRadius: 10, // Bordes redondeados
    backgroundColor: "white", // Fondo suave
    justifyContent: "center", // Centra el contenido
    width: width * 0.8,
    alignSelf: "center", // Centra el contenedor en la pantalla
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#00baff", // Color del borde
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center", // Alinea los elementos en la misma línea
  },
  parejasText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 30,
    height: 20,
    marginRight: 10,
  },
  currencyText: {
    fontSize: 16,
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer2: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#00baff",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white", // Color blanco para el texto
    textAlign: "center",
  },
  modalTitleM: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollView: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalText: {
    fontSize: 16,
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#00BAFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  contactIconContainer: {
    position: "absolute", // Alineación en la parte superior
    top: 40, // Ajusta la distancia desde la parte superior según sea necesario
    right: 15, // Ajusta la distancia desde el lado izquierdo
  },
  buttonContainerR: {
    marginBottom: 20,
  },
  buttonR: {
    padding: 10,
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#00baff",
    flexDirection: "row", // Añadido para alinear el ícono y el texto horizontalmente
    alignItems: "center", // Alinea el ícono y el texto verticalmente
  },
  buttonRegistro: {
    backgroundColor: "#00baff",
    width: 205, // Establece el ancho a 205 píxeles
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
  },
  buttonGuardar: {
    marginTop: -20,
  },
  buttonTextR: {
    color: "#00baff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonIconR: {
    marginRight: 10, // Espacio entre el ícono y el texto
  },
  headerContainer: {
    backgroundColor: "#00baff", // Fondo de color para el encabezado
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 25, // Espacio entre el encabezado y los botones
    shadowColor: "#000", // Sombra
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Sombra para Android
    alignItems: "center", // Centrar el título
  },
  headerContainerP: {
    backgroundColor: "#00baff", // Fondo de color para el encabezado
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 25, // Espacio entre el encabezado y los botones
    shadowColor: "#000", // Sombra
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Sombra para Android
    alignItems: "center", // Centrar el título
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white", // Color blanco para el texto
    textAlign: "center",
    // textTransform: 'uppercase',
  },
  closeIcon: {
    position: "absolute",
    top: 10, // Ajusta la posición superior
    right: 3, // Ajusta la posición a la derecha
    zIndex: 10, // Asegura que esté por encima de otros elementos
  },
  closeIconS: {
    position: "absolute",
    top: 3,
    right: 3,
    zIndex: 10,
  },
  buttonGuardarActive: {
    backgroundColor: "#00baff", // Azul cuando está completo
  },
  buttonGuardarInactive: {
    backgroundColor: "white", // blanco cuando falta info
  },
  textActive: {
    color: "white", // Texto blanco cuando está activo
  },
  textInactive: {
    color: "#00baff", // Texto azul  cuando está inactivo
  },
  buttonDisabled: {
    backgroundColor: "#00baff", // Color gris cuando está deshabilitado
  },
  juegosIcon: {
    position: "absolute",
    right: 15,
    marginTop: 65,
  },
  buttonRegistrarse: {
    alignItems: "center", // Centra el botón horizontalmente
    marginTop: 10,
    marginBottom: -20,
  },
  codigoContainer: {
    marginBottom: 10,
  },
  codigoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: -5,
  },
  codigoInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  codigoInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingRight: 40,
  },
  aplicarButton: {
    backgroundColor: "#00bfff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    marginRight: 6,
  },
  aplicarButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  codigoError: {
    color: "red",
    marginTop: -10,
  },
  codigoExito: {
    color: "green",
    marginTop: -10,
  },
  currencyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  currencyModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 300,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
  },
  currencyModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  currencyModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  currencyCloseButton: {
    padding: 4,
  },
  currencyModalContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  currencyButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  currencyRejectButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c70039",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  currencyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  currencyModalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  flag: {
    width: 30,
    height: 20,
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#838080",
  }, // Estilos para la modal de registro
  registerModalOverlayNew: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  registerModalContainerNew: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 300,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  registerModalHeaderNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  registerModalTitleNew: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  registerModalCloseButtonNew: {
    padding: 4,
  },
  registerModalContentNew: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  registerModalContentInnerNew: {
    padding: 16,
  },
  registerModalFooterNew: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  registerModalButtonNew: {
    flexDirection: "row",
    justifyContent: "left",
    alignItems: "left",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#00baff",
  },
  registerModalButtonActiveNew: {
    backgroundColor: "#00baff",
  },
  registerModalButtonTextNew: {
    color: "#00baff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  registerModalButtonTextActiveNew: {
    color: "#fff",
  },
  registerModalButtonIconNew: {
    marginRight: 8,
  },
  registerModalSubmitButtonNew: {
    backgroundColor: "#00baff",
    flexDirection: "row",
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  registerModalSubmitButtonDisabledNew: {
    backgroundColor: "#cccccc",
  },
  registerModalSubmitButtonTextNew: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Estilos para la modal de datos personales
  personalModalOverlayNew: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  personalModalContainerNew: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  personalModalHeaderNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  personalModalTitleNew: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  personalModalCloseButtonNew: {
    padding: 4,
  },
  personalModalContentNew: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  personalModalContentInnerNew: {
    padding: 16,
  },
  personalModalFooterNew: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  personalModalSubmitButtonNew: {
    backgroundColor: "#00baff",
    flexDirection: "row",
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  personalModalSubmitButtonTextNew: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Estilos para la modal de datos de organización
  organizationModalOverlayNew: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  organizationModalContainerNew: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  organizationModalHeaderNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  organizationModalTitleNew: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  organizationModalCloseButtonNew: {
    padding: 4,
  },
  organizationModalContentNew: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  organizationModalContentInnerNew: {
    padding: 16,
  },
  organizationModalFooterNew: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  organizationModalSubmitButtonNew: {
    backgroundColor: "#00baff",
    flexDirection: "row",
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  organizationModalSubmitButtonTextNew: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Estilos para la modal de datos de domicilio
  addressModalOverlayNew: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addressModalContainerNew: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00baff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addressModalHeaderNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  addressModalTitleNew: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00baff",
    textAlign: "center",
    flex: 1,
  },
  addressModalCloseButtonNew: {
    padding: 4,
  },
  addressModalContentNew: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addressModalContentInnerNew: {
    padding: 16,
  },
  addressModalFooterNew: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  addressModalSubmitButtonNew: {
    backgroundColor: "#00baff",
    flexDirection: "row",
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addressModalSubmitButtonTextNew: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Suscripciones;
