import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={style.container}>
      <Text style={style.text}>I love my Wife </Text>
    </View>
  );
}

const style = StyleSheet.create ({
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

});