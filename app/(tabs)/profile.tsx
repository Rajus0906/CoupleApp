import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Profile screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
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

})