import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PickScreen } from "../screens/PickScreen";
import { ActivityIndicator, View, Text } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Splash() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1220" }}>
      <ActivityIndicator />
    </View>
  );
}

function MoviesTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0B1220", borderTopColor: "rgba(255,255,255,0.12)" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
      }}
    >
      <Tab.Screen
        name="Browse"
        component={HomeScreen}
        options={{ tabBarLabel: "Browse" }}
      />
      <Tab.Screen
        name="Pick"
        component={PickScreen}
        options={{ tabBarLabel: "Pick" }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isBootstrapping, isSignedIn } = useContext(AuthContext);

  if (isBootstrapping) return <Splash />;

  return (
    <NavigationContainer>
      {isSignedIn ? (
        <MoviesTabs />
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerStyle: { backgroundColor: "#0B1220" }, headerTintColor: "#fff" }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log in" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}