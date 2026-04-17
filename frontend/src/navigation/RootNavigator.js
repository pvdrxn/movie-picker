import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ActivityIndicator, View } from "react-native";
import { MovieTabsNavigator } from "./MovieTabsNavigator";

const Stack = createNativeStackNavigator();

function Splash() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1220" }}>
      <ActivityIndicator />
    </View>
  );
}

export function RootNavigator() {
  const { isBootstrapping, isSignedIn } = useContext(AuthContext);

  if (isBootstrapping) return <Splash />;

  return (
    <NavigationContainer>
      {isSignedIn ? (
        <MovieTabsNavigator />
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

