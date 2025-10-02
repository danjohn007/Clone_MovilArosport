import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Text,
  Modal,
  TextInput,
  Platform,
  Share
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import APIManager from "../componentes/API/APIManager.jsx";
import colors from "../styles/colors.js";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MostrarDatos from '../componentes/MostrarDatosPerfil.js';
import CustomButton from '../componentes/Buttons.js';
import Titulo from '../componentes/Titulo.js'; // Importa el componente Titulo
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const CodigoDescuento = ({ visible, closeModal, id_usuario }) => {
  // const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const contraInput = useRef(null);
  const contra2Input = useRef(null);
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [actualizando, setActualizando] = useState(false);
   const [errors, setErrors] = useState({
    newPass: "",
    confirm: "",
  });

  useEffect(() => {
  if (!visible) {
    resetForm(); // cada vez que el modal se oculta, limpia
  }
}, [visible]);


  const resetForm = () => {
    setShow1(false);
    setNewPass("");
    setConfirm("");
    setErrors({ newPass: "", confirm: "" });
    setActualizando(false);
  };

const validarContraseña = (pass) => {
  if (!pass) return "Campo obligatorio*";
  if (pass.length < 5 || pass.length > 20) return "Debe tener entre 5 y 20 caracteres*";
  if (!/[a-zA-Z]/.test(pass)) return "Debe contener al menos una letra*";
  if (!/[0-9]/.test(pass)) return "Debe contener al menos un número*";
  return "";
};


  const handleNewPass = (value) => {
    setNewPass(value);
    // Validar mientras escribe
    const error = validarContraseña(value);
    setErrors((prev) => ({ ...prev, newPass: error }));
  };

  const handleConfirm = (value) => {
    setConfirm(value);
    // Validar coincidencia mientras escribe
    const error = value !== newPass ? "Las contraseñas no coinciden*" : "";
    setErrors((prev) => ({ ...prev, confirm: error }));
  };

  const Actualizar = async () => {
    setActualizando(true);

    // Validación completa al enviar
    const errorPass = validarContraseña(newPass);
    const errorConfirm = confirm !== newPass ? "Las contraseñas no coinciden*" : "";

    setErrors({ newPass: errorPass, confirm: errorConfirm });

    if (errorPass || errorConfirm) {
      setActualizando(false);
      return;
    }
    // Preparar los datos para la solicitud
    const dataNew = new FormData();
    // dataNew.append('id_usuario', id_usuario);
    dataNew.append("newPass", newPass);

  
    try {
      // Realizar la solicitud de actualización
      const response = await APIManager({
        url: `Perfil/update_password`,
        method: "POST",
        data: dataNew,
      });
  
      if (response === true) {
        Alert.alert(
          "!Éxito!",
          "!Se actualizó tu contraseña",
          [
            {
              text: "OK",
              onPress: () => {
                resetForm(); // Reinicia el formulario
                closeModal(); // Cierra el modal
              }, // Cerrar el modal en lugar de navegar
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "!Alerta!",
          "Hubo un error, verifica tu contraseña e intenta más tarde",
          [{ text: "OK", onPress: () => console.log("error editar perfil") }],
          { cancelable: false }
        );
      }
    } catch (error) {
      Alert.alert(
        "!Alerta!",
        "Hubo un problema con la solicitud, intenta más tarde",
        [{ text: "OK", onPress: () => console.log("error en la solicitud") }],
        { cancelable: false }
      );
    }
  
    setActualizando(false);
  };


const handleShareInvitation = async () => {
  try {
    const result = await Share.share({
      message: `¡Únete a Arosports! Usa mi código de invitación ** y obtén un descuento en tu suscripción.\n👉 https://tuapp.com/registro`,
    });

    if (result.action === Share.sharedAction) {
      console.log("Invitación compartida");
    }
  } catch (error) {
    console.log("Error al compartir:", error);
  }
};


  return (
    <Modal visible={visible} transparent={true} animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
         <Titulo titulo="CÓDIGO DE INVITACIÓN" />
          <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
            <Ionicons name="close-circle" size={30} color="#00bfff" />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
          <Ionicons name="close" size={28} color={colors.primary} />
        </TouchableOpacity> */}
            <KeyboardAwareScrollView
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
            
            >
{/*       
        <Text style={styles.titulo}>Cambiar Contraseña</Text> */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
Invita a tus amigos y obtén beneficios          </Text>
        </View>

  <TouchableOpacity style={styles.shareButton}
   onPress={handleShareInvitation}
   >
    <Ionicons name="share-social-outline" size={18} color="#fff" />
    <Text style={styles.shareButtonText}>Compartir mi código</Text>
  </TouchableOpacity>


        {/* Botón para actualizar */}
        {/* <TouchableOpacity
          style={styles.loginButton}
     onPress={handleShareInvitation}
          disabled={actualizando}
        >
          {actualizando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Actualizar contraseña</Text>
          )}
        </TouchableOpacity> */}
        </KeyboardAwareScrollView>
      </View>
    </View>
  </Modal>
);
};

const styles = StyleSheet.create({
modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
},
modalContainer: {
  // backgroundColor: "#fff",
  backgroundColor: 'rgba(255, 255, 255, 1)', // Fondo blanco translúcido
  borderRadius: 15,
  borderWidth: 2,
  borderColor: colors.primary,
  padding: 20,
  width: "85%",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 8,
},
closeIcon: {
   position: "absolute",
    top: 3,
    right: 3,
    zIndex: 10,
},
titulo: {
  fontSize: 20,
  fontWeight: "bold",
  color: colors.primary,
  textAlign: "center",
  marginBottom: 20,
},
instructionContainer: {
  marginBottom: 20,
},
instructionText: {
  fontSize: 14,
  color: "#333",
  marginBottom: 5,
},
inputContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F9F9F9",
  borderRadius: 10,
  paddingHorizontal: 10,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: colors.primary,
  padding: 10
},
input: {
  flex: 1,
  fontSize: 16,
  marginLeft: 10,
  color: "#333",
},
eyeIcon: {
  marginLeft: 10,
},
loginButton: {
  backgroundColor: colors.primary,
  borderRadius: 20,
  paddingVertical: 12,
  alignItems: "center",
  marginTop: 20,
  borderWidth: 2,
  borderColor: 'white',
},
loginButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},
  inputContainer: {
    width: '100%',
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    color: '#000',
    width: '100%',
    alignItems: "center",
    justifyContent:"center"
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#838080',
    fontSize: 14,
    fontFamily: 'Poppins',
    textAlignVertical: 'center', // Ayuda a centrar verticalmente en Android
  },
       errorText: {
        color: "red",
        fontSize: 12,
        marginTop: -10,
    },
    shareContainer: {
  marginTop: 15,
  alignItems: "center",
},
inviteText: {
  fontSize: 14,
  marginBottom: 5,
  color: "#333",
},
shareButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#00BFFF",
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 8,
},
shareButtonText: {
  color: "#fff",
  marginLeft: 8,
  fontWeight: "bold",
    alignItems: "center",
},

});

export default CodigoDescuento;