import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

const ClubCard = ({ imageSource, title, subtitle, onPress, children }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          defaultSource={require("../../assets/defaultClub.jpeg")}
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.rowTextIcon}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <Icon
            name="chevron-forward"
            size={22}
            color={"colors.primary"}
            style={styles.chevronIcon}
          />
        </View>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    borderColor: "colors.primary",
    borderWidth: 3,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  rowTextIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'left',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#838080',
    textAlign: 'left',
  },
  chevronIcon: {
    marginLeft: 10,
  },
});

export default ClubCard;