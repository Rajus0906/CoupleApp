import React from 'react';
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
    return (
      <View style={styles.container}>

        {/* -- HEADER SECTION -- */}
        <View style={styles.headerContainer}>
            <Image
                source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} 
                style={styles.profilePic}
                />

            <Text style={styles.userBioText}>Movie Critic & Gamer 👾🍿 </Text>
        </View>

        {/* -- STATS SECTION -- */}
        <View style={styles.statsContainer}>

            {/* Left Side */}
            <View style={styles.statBox}>
                <Text style={styles.statNumber}> 24 </Text>
                <Text style={styles.statLabel}> Friends </Text>
            </View>

            {/* Vertical Divider Line */}
            <View style={styles.verticalDivider}/>

            {/* Right Side */}
            <View>
                <Text style={styles.statNumber}> 100 </Text>
                <Text style={styles.statLabel}> Rated </Text>
            </View>

        </View>

      </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ece0d1',
        paddingTop: 20, //adds space at the top before the border
        paddingStart:10, //adds space before the border
        alignItems: "center", //Horizontally centers the image
  },

  // ---- Header Styles ---- //
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    userNameText: {
        color: '#5C4033',
        fontSize: 17,
        fontWeight: '400', // Font style
        marginTop: 10, // Gives a tiny bit of space between the Name and Bio

  },
    userBioText: {
        color: '#8D6E63', // A lighter colour so it isn't as noticable as the name
        fontSize: 16,
        marginTop: 2, // Gives a tiny bit of space between the Name and Bio
        paddingTop: 10,
    }, 
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50, //setting this to half the width and height makes it a circle
        backgroundColor: '#ccc', //A colour just in case the image fails to load
    },

    // ---- Stats Box Style ---- //
    statsContainer: {
        flexDirection: 'row', // Makes all items sit side-by-side
        backgroundColor: '#fff',
        width: '90%', 
        padding: 20,
        borderRadius: 15,
        justifyContent: 'space-around',
        alignItems: 'center',
        //Shadow for ios
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        //Shadow for Android
        elevation: 3,
    },
    statBox: {
        alignItems: 'center',

    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5C4033'

    },
    statLabel: {
        fontSize: 12,
        color: '#8D6E63',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    verticalDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#ece0d1'

    },

})