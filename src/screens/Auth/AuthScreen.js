import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, ImageBackground  } from 'react-native'
import React, { useState } from 'react'
//import Fonts from '../../constants/Fonts'
import LoginForm from '../InicioSesion';


export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
 
  const changeForm = () => {
    setIsLogin(!isLogin);
  }

  return (
   // <ImageBackground source={require("../../../assets/fondo.png")} style={styles.backgroundImage}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
  
        {isLogin ? <LoginForm /> : <RegisterForm />}
       
      </KeyboardAvoidingView>
  // </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ajusta la imagen para cubrir toda la pantalla
  },

});
