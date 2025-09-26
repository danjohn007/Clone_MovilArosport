import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const CardCanje = ({ title, points, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
       <View style={styles.imageContainer}>
              <Image source={image}  style={styles.image} resizeMode="cover" />
            </View>
     
         <View style={styles.textContainer}>
         <Text style={styles.title}>{title}</Text>
         <Text style={styles.subtitle}>{points} pts</Text>
            </View>
      {/* <Image source={image} style={styles.image} resizeMode="contain" /> */}
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  cardContainer: {
    width: '45%',
    height: 190,
    backgroundColor: 'white',
    borderRadius: 25,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },

  textContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#02B9FA',
    textAlign: 'center',
    fontWeight: 'bold',
  }, 
  imageContainer: {
    width: '100%',
    height: '53%', 
  },
  image: {
    width: '100%',
    height: '100%', 
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});

export default CardCanje;
