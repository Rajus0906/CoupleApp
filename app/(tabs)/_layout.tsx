import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase'; // Make sure this path matches your project

export default function TabLayout() {
    // 1. Create a state to hold the title (Default to 'Profile' while loading)
    const [profileTitle, setProfileTitle] = useState('Profile');

    // 2. Fetch the real username when the Layout mounts
    useEffect(() => {
        const fetchUsername = async () => {
            try {
                // Get current logged-in user
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session) {
                    // Fetch their profile
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('id', session.user.id)
                        .single();
                    
                    // If we found a name, update the tab title
                    if (data?.username) {
                        setProfileTitle(data.username);
                    }
                }
            } catch (error) {
                console.log("Error fetching tab title:", error);
            }
        };

        fetchUsername();
    }, []);

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
                    paddingTop: 10, 
                    height: 70, 
                    backgroundColor: '#ece0d1',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '',
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
                    // 3. Use the state variable here instead of a hardcoded string
                    title: profileTitle, 
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
                    ),
                }}
            />
        </Tabs>
    );
}