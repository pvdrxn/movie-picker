import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, Text } from "react-native";
import { AuthContext } from "../auth/AuthContext";
import { PopularMoviesScreen } from "../screens/PopularMoviesScreen";
import { TrendingMoviesScreen } from "../screens/TrendingMoviesScreen";
import { TopRatedMoviesScreen } from "../screens/TopRatedMoviesScreen";
import { UpcomingMoviesScreen } from "../screens/UpcomingMoviesScreen";

const Tab = createBottomTabNavigator();

function HeaderSignOutButton() {
  const { signOut } = useContext(AuthContext);

  return (
    <Pressable
      onPress={signOut}
      hitSlop={10}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        paddingVertical: 6,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>Sign out</Text>
    </Pressable>
  );
}

export function MovieTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0B1220" },
        headerTintColor: "#fff",
        headerRight: () => <HeaderSignOutButton />,
        tabBarStyle: { backgroundColor: "#0B1220", borderTopColor: "rgba(255,255,255,0.12)" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
      }}
    >
      <Tab.Screen name="Popular" component={PopularMoviesScreen} options={{ title: "Popular" }} />
      <Tab.Screen name="Trending" component={TrendingMoviesScreen} options={{ title: "Trending" }} />
      <Tab.Screen name="TopRated" component={TopRatedMoviesScreen} options={{ title: "Top rated" }} />
      <Tab.Screen name="Upcoming" component={UpcomingMoviesScreen} options={{ title: "Upcoming" }} />
    </Tab.Navigator>
  );
}

