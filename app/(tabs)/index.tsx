import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>I love my Wife </Text>
      <Link href='/profile' style={styles.button}>
        Go to Profile Page
      </Link>
    </View>
  );
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    backgroundColor: '#ece0d1',
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: '#000000ff',
    fontSize: 20,
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#000000ff',
  },

});