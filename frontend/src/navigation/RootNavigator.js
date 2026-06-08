import React, { useContext, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PickScreen } from "../screens/PickScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { MovieDetailsScreen } from "../screens/MovieDetailsScreen";
import { colors } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View, Text, Animated, Pressable } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Splash() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.primary }}>
      <ActivityIndicator />
    </View>
  );
}

function AnimatedTabButton({ children, onPress, accessibilityState, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;
  const selected = accessibilityState?.selected;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.15 : 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 150,
    }).start();
  }, [selected]);

  return (
    <Pressable {...props} onPress={onPress}>
      <Animated.View style={{ transform: [{ scale }], alignItems: "center", justifyContent: "center" }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function MoviesTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#242424",
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 30,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Browse") {
            iconName = focused ? "star" : "star-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Favorites") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Pick") {
            iconName = focused ? "shuffle" : "shuffle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Browse"
        component={HomeScreen}
        options={{ tabBarLabel: "Browse", tabBarButton: (props) => <AnimatedTabButton {...props} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: "Search", tabBarButton: (props) => <AnimatedTabButton {...props} /> }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: "Favorites", tabBarButton: (props) => <AnimatedTabButton {...props} /> }}
      />
      <Tab.Screen
        name="Pick"
        component={PickScreen}
        options={{ tabBarLabel: "Pick", tabBarButton: (props) => <AnimatedTabButton {...props} /> }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoviesTabs" component={MoviesTabs} />
      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { isBootstrapping, isSignedIn } = useContext(AuthContext);

  if (isBootstrapping) return <Splash />;

  return (
    <NavigationContainer>
      {isSignedIn ? (
        <AppStack />
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerStyle: { backgroundColor: colors.bg.primary }, headerTintColor: colors.text.primary }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log in" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}