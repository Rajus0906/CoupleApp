// Tabs provides a bottom tab navigator using Expo Router
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

// This layout defines the tab-based navigation structure
// for all screens inside this folder.

export default function TabLayout () {
    return(
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#5C4033',
                headerStyle: {
                    backgroundColor: '#ece0d1',
                },
                
                headerShadowVisible: false,
                headerTintColor: '#5C4033',
                tabBarShowLabel: false,
                tabBarStyle: {
                    paddingBottom: 10, // pushes icons downward
                    height: 65, // optional, gives breathing room
                    backgroundColor: '#ece0d1',
                },
            }}
        >
        <Tabs.Screen
         name="index"
         options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
            ),
         }}
        />
        <Tabs.Screen
        name='search'
        options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'search-sharp' : 'search-outline'} color={color} size={24} />

            ),
        }}
        
        />
        <Tabs.Screen
         name="profile"
         options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
            ),
         }}
        />
        </Tabs>
    );

}
