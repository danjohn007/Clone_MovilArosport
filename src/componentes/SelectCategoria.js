import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Importar Picker
import APIManager from "../componentes/API/APIManager.jsx";

const SelectCategoria = ({ selectedCategoria, onChangeCategoria }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCategorias = async () => {
      try {
        const res = await APIManager({
          url: "Perfil/get_categorias",
          method: "get",
        });
        console.log("categorias", res);
        const categoriasData = res.map((categoria) => ({
          label: categoria.categoria, // Mostrar el nombre de la categoría
          value: categoria.id_categoria, // Usar el ID de la categoría
        }));
        setCategorias(categoriasData);
      } catch (error) {
        console.log("Error al obtener las categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategorias();
  }, []);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputBox}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Picker
          selectedValue={selectedCategoria} // Valor actual seleccionado (ID de la categoría como string)
          onValueChange={(value) => {
            if (value !== null) {
              onChangeCategoria(value); // Actualizar solo si no es null
            }
          }}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona una categoría" value={null} />
          {categorias.map((categoria) => (
            <Picker.Item
              key={categoria.value}
              label={categoria.label}  // Nombre de la categoría
              value={String(categoria.value)}  // Asegurarse de que el valor también sea un string
            />
          ))}
        </Picker>
        
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    marginVertical: "-5%",
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: "6%",
    borderWidth: 3,
    borderColor: colors.primary,
    padding: 10,
    marginBottom: 10,
    color: '#000',
    width: '120%',
    marginLeft: "-10%",
    marginRight: "-10%",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    color: '#838080',
    fontSize: 10,
    fontFamily: 'Poppins',
    maxHeight: 55,
    overflow: 'hidden',
    alignItems: "center",
    justifyContent: "center",
    textAlign: 'center',
    textAlignVertical: 'center',
    alignSelf: "center",
  },
});

export default SelectCategoria;
