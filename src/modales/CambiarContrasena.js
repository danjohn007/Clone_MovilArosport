import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import APIManager from "../componentes/API/APIManager.jsx";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import colors from "../styles/colors";

const CambiarContrasena = ({ visible, closeModal, id_usuario }) => {
   const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setShowNewPass(false);
    setShowConfirm(false);
    setNewPass("");
    setConfirm("");
    setErrors({ newPass: "", confirm: "" });
    setActualizando(false);
  };

  const validarContraseña = (pass) => {
    if (!pass) return "Campo obligatorio*";
    if (pass.length < 5 || pass.length > 20)
      return "Debe tener entre 5 y 20 caracteres*";
    if (!/[a-zA-Z]/.test(pass)) return "Debe contener al menos una letra*";
    if (!/[0-9]/.test(pass)) return "Debe contener al menos un número*";
    return "";
  };

  const handleNewPass = (value) => {
    setNewPass(value);
    const error = validarContraseña(value);
    setErrors((prev) => ({ ...prev, newPass: error }));
  };

  const handleConfirm = (value) => {
    setConfirm(value);
    const error = value !== newPass ? "Las contraseñas no coinciden*" : "";
    setErrors((prev) => ({ ...prev, confirm: error }));
  };

  const Actualizar = async () => {
    setActualizando(true);

    const errorPass = validarContraseña(newPass);
    const errorConfirm =
      confirm !== newPass ? "Las contraseñas no coinciden*" : "";

    setErrors({ newPass: errorPass, confirm: errorConfirm });

    if (errorPass || errorConfirm) {
      setActualizando(false);
      return;
    }

    const dataNew = new FormData();
    dataNew.append("newPass", newPass);

    try {
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
                resetForm();
                closeModal();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "!Alerta!",
          "Hubo un error, verifica tu contraseña e intenta más tarde",
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
    } catch (error) {
      Alert.alert(
        "!Alerta!",
        "Hubo un problema con la solicitud, intenta más tarde",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }

    setActualizando(false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Encabezado del modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>CAMBIAR CONTRASEÑA</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Contenido principal con scroll */}
          <KeyboardAwareScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Instrucciones */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>REQUISITOS</Text>
              <View style={styles.instructionContainer}>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                  <Text style={styles.instructionText}>
                    Entre 5 y 20 caracteres
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                  <Text style={styles.instructionText}>Al menos un número</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                  <Text style={styles.instructionText}>Al menos una letra</Text>
                </View>
              </View>
            </View>

            {/* Campo de nueva contraseña */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>NUEVA CONTRASEÑA</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.primary}
                />
                <TextInput
                  style={styles.input}
                  ref={contraInput}
                  maxLength={20}
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showNewPass}
                  value={newPass}
                  onChangeText={handleNewPass}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPass(!showNewPass)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPass ? "eye" : "eye-off"}
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPass && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={colors.error}
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorText}>{errors.newPass}</Text>
                </View>
              )}
            </View>

            {/* Campo de confirmación */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>CONFIRMAR CONTRASEÑA</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.primary}
                />
                <TextInput
                  style={styles.input}
                  ref={contra2Input}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={handleConfirm}
                  maxLength={20}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirm ? "eye" : "eye-off"}
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirm && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={colors.error}
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorText}>{errors.confirm}</Text>
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>

          {/* Footer con botón de acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                (actualizando ||
                  !newPass ||
                  !confirm ||
                  !!errors.newPass ||
                  !!errors.confirm) &&
                  styles.disabledButton,
              ]}
              onPress={Actualizar}
              disabled={
                actualizando ||
                !newPass ||
                !confirm ||
                !!errors.newPass ||
                !!errors.confirm
              }
              activeOpacity={0.8}
            >
              {actualizando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="key" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    ACTUALIZAR CONTRASEÑA
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Estilo base del modal
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
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: colors.primary,
  },

  // Encabezado
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
    color: colors.primary,
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },

  // Contenido
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Secciones
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  // Instrucciones
  instructionContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: "#838080",
    marginLeft: 8,
  },

  // Inputs
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#838080",
    marginLeft: 8,
    paddingVertical: 6,
  },
  eyeIcon: {
    marginLeft: 8,
  },

  // Botón
  actionButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    // marginBottom: 16, // Eliminar margen inferior, el footer ya tiene padding
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Footer
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },

  // Errores
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
});

export default CambiarContrasena;