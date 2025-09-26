import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const initialState = {
    token: null,
    id_usuario: null,
  };

  const authReducer = (state, action) => {
    switch (action.type) {
      case 'SET_TOKEN':
        return { ...state, token: action.payload };
      case 'SET_USER':
        return { ...state, id_usuario: action.payload };
      case 'LOGOUT':
        return { ...state, token: null, id_usuario: null };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para cargar el token y el ID de usuario desde AsyncStorage
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken');
        const storedIdUsuario = await AsyncStorage.getItem('id_usuario');

        if (storedToken && storedIdUsuario) {
          // Si se encuentran los datos en AsyncStorage, establecerlos en el estado global
          dispatch({ type: 'SET_TOKEN', payload: storedToken });
          dispatch({ type: 'SET_USER', payload: parseInt(storedIdUsuario, 10) });
        }
      } catch (error) {
        console.log('Error al cargar datos desde AsyncStorage', error);
      }
    };

    loadSessionData();
  }, []);

  const setToken = async (token) => {
    try {
      await AsyncStorage.setItem('jwtToken', token);
      dispatch({ type: 'SET_TOKEN', payload: token });
    } catch (error) {
      console.log('Error al guardar el token en AsyncStorage', error);
    }
  };

  const setUserId = async (id_usuario) => {
    try {
      await AsyncStorage.setItem('id_usuario', id_usuario.toString()); // Asegúrate de almacenar como string
      dispatch({ type: 'SET_USER', payload: id_usuario });
    } catch (error) {
      console.log('Error al guardar el ID del usuario en AsyncStorage', error);
    }
  };

  // Cerrar sesión eliminando token e ID de AsyncStorage
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('id_usuario');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.log('Error al eliminar el token o ID del usuario en AsyncStorage:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        id_usuario: state.id_usuario,
        setToken,
        setUserId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe estar dentro del proveedor AuthProvider');
  }
  return context;
};
