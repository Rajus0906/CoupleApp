//This seems to be mainly for Websites

import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() { 
    return(
        <>
            <Stack.Screen options={{title: 'How Did You Get Here?!'  }} />
            <View style={styles.container}>
                <Link href='/' style={styles.button}>
                Go Back to Home Screen!
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: '#ece0d1',
        justifyContent: "center",
        alignItems: "center",
      },
      button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#000000ff',
      },
    
});