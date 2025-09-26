import APIManager from '../src/componentes/API/APIManager';
import * as Device from "expo-device";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("No has aceptado recibir notificaciones. Algunas funciones podrían no estar disponibles.");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "7673315a-e671-4bfa-bfec-c71705df4bc5",
      })
    ).data;
    console.log("Push Token: ", token);
  } else {
    alert("Debe usar un dispositivo físico para las notificaciones push.");
  }

  return token;
}

const guardarTokenNotification = async (token) => {
  //Guardar el token para las notificaciones
  const data = new FormData();
  data.append("token", token);
  const response = await APIManager({
    url: "Notificacion/guarda_token_usuario",
    method: "POST",
    data: data,
  });
};

export { registerForPushNotificationsAsync, guardarTokenNotification };
