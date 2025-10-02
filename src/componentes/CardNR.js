import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../styles/colors";

const CardNR = ({
  imageSource,
  title,
  subtitle,
  date,
  onPress,
  showChevron = true,
  touchable = true,
}) => {
  const Container = touchable && onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={touchable ? onPress : undefined}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.rowTextIcon}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            {date && <Text style={styles.date}>{date}</Text>}
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {showChevron && (
            <Icon
              name="chevron-forward"
              size={22}
              color={"#FF9800"}
              style={styles.chevronIcon}
            />
          )}
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    alignItems: "center",
    width: "95%",
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  imageContainer: {
    width: "100%",
    height: 210,
    backgroundColor: "#FFE0B2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  textContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  rowTextIcon: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "left",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#757575",
    textAlign: "justify",
  },
  chevronIcon: {
    marginLeft: 12,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: "#666",
    textAlign: "justify",
    marginTop: 4,
  },
});

export default CardNR;
