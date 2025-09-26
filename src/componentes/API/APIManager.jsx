import AsyncStorage from "@react-native-async-storage/async-storage";
import Peticiones from "./Peticiones";

const APIManager = async (props) => {
  const jwToken = await AsyncStorage.getItem("jwtToken");
  const respuesta = await Peticiones({ ...props, token: jwToken });
  if (respuesta?.token) {
    await AsyncStorage.setItem("jwtToken", respuesta.token);
  }
  return respuesta;
};

export default APIManager;